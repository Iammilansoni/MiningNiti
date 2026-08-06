"""
Smart Document Chunking Service
Sentence-aware text chunking with page number and section tracking.

Replaces the crude word-count split (text.split()) with:
  - Sentence-boundary detection (no mid-sentence breaks)
  - Per-chunk page number list (e.g. [12, 13])
  - Section/heading detection from document structure
  - Configurable overlap to preserve cross-boundary context
"""

import logging
import re
from dataclasses import dataclass, field
from typing import List, Optional

from app.config import settings
from app.services.extractors import PageContent

logger = logging.getLogger(__name__)


# ── Data structures ────────────────────────────────────────────────────────────


@dataclass
class DocumentChunk:
    """A single text chunk with full provenance metadata."""

    chunk_index: int
    text: str
    page_numbers: List[int]  # Pages this chunk spans, e.g. [12, 13]
    section_title: Optional[str]  # Nearest detected heading, e.g. "Safety Procedures"
    char_start: int = 0  # Character offset in full_text
    char_end: int = 0


# ── Heading detection patterns ─────────────────────────────────────────────────

# Matches ALL-CAPS lines (≥4 chars), numbered sections (1.2.3), or markdown headings
_HEADING_PATTERNS = [
    re.compile(r"^#{1,4}\s+(.+)$", re.MULTILINE),  # Markdown headings
    re.compile(
        r"^(\d+(?:\.\d+)*)\s+([A-Z][^\n]{3,60})$", re.MULTILINE
    ),  # Numbered: "1.2 Section"
    re.compile(r"^([A-Z][A-Z\s\-]{4,60})$", re.MULTILINE),  # ALL-CAPS headings
]

# Sentence boundary: period/question/exclamation followed by space and capital (or end)
_SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])\s+(?=[A-Z\"])")


# ── Markdown table handling ────────────────────────────────────────────────────
#
# Tables arrive from pdf_layout.py as Markdown, optionally preceded by a
# "[Table 1 on page 7]" label. They need separate treatment from prose for one
# concrete reason: a Markdown table contains no sentence-ending punctuation, so
# the sentence splitter treats an entire table as a single sentence and
# _group_into_chunks emits it whole no matter how large it is.
#
# Measured before this fix: a 400-row table became one 14,703-character chunk.
# That is roughly twice gemini-embedding-001's ~2048 token input limit, so most
# of the table was silently truncated and never indexed at all. What did get
# embedded was a single vector averaging 400 unrelated rows, which matches
# nothing specifically.
#
# The fix splits long tables by rows and repeats the header on every part, so
# each part stands alone: "| 6 to 8 ft | 60 in |" is only meaningful next to
# "| Mining Height | Bolt Length |".

_TABLE_LABEL = re.compile(r"^\[Table [^\]]*\]$")

# Prose shorter than this immediately before a table is treated as its caption
# and kept with the table rather than emitted as a standalone fragment.
_LEAD_IN_MAX_CHARS = 400

_TABLE_BLOCK = re.compile(
    r"(?:^\[Table [^\]]*\][ \t]*\n)?"  # optional "[Table 1 on page 7]" label
    r"^\|.*\|[ \t]*\n"  # header row
    r"^\|[\s\-:|]+\|[ \t]*\n"  # ---|--- separator row
    r"(?:^\|.*\|[ \t]*(?:\n|$))*",  # data rows
    re.MULTILINE,
)


def split_markdown_table(block: str, max_chars: int) -> List[str]:
    """
    Split one Markdown table into parts that each fit within max_chars.

    Every part repeats the label, header row and separator, so a part retrieved
    on its own is still readable — a bare row of numbers is not an answer.
    Parts are labelled "(part i of n)" so the model can tell a split table from
    a complete one and does not report a partial list as exhaustive.

    A table already within the limit is returned unchanged, so small tables
    keep their existing single-chunk behaviour.
    """
    lines = [ln for ln in block.strip().splitlines() if ln.strip()]
    if not lines:
        return []

    label = None
    if _TABLE_LABEL.match(lines[0].strip()):
        label = lines[0].strip()
        lines = lines[1:]

    # Need at least a header, a separator and one data row to be worth splitting.
    if len(lines) < 3:
        return [block.strip()]

    header, separator, rows = lines[0], lines[1], lines[2:]

    if len(block) <= max_chars:
        return [block.strip()]

    def preamble(part_no: int, total: int) -> List[str]:
        head = []
        if label:
            # "[Table 1 on page 7]" -> "[Table 1 on page 7, part 2 of 3]"
            head.append(
                f"{label[:-1]}, part {part_no} of {total}]" if total > 1 else label
            )
        head.extend([header, separator])
        return head

    # Two passes: the first packs rows to learn the part count, the second
    # rebuilds with accurate "part i of n" labels. Without this the label would
    # have to be written before the total is known.
    def pack(total_hint: int) -> List[List[str]]:
        groups: List[List[str]] = []
        current: List[str] = []
        budget = max_chars - len("\n".join(preamble(total_hint, total_hint))) - 1

        for row in rows:
            row_len = len(row) + 1
            if current and sum(len(r) + 1 for r in current) + row_len > budget:
                groups.append(current)
                current = []
            current.append(row)
        if current:
            groups.append(current)
        return groups

    groups = pack(1)
    groups = pack(max(len(groups), 1))  # re-pack with the real label width
    total = len(groups)

    return [
        "\n".join(preamble(i, total) + group) for i, group in enumerate(groups, start=1)
    ]


class ChunkingService:
    """
    Sentence-aware document chunker with page number tracking.

    Algorithm:
    1. Split full text into sentences using regex boundary detection
    2. Group sentences into chunks respecting max token size
    3. Track which pages each chunk spans using char offsets
    4. Detect section headings and annotate each chunk with nearest heading
    5. Add configurable word overlap between adjacent chunks
    """

    def __init__(
        self,
        chunk_size: int = None,  # words per chunk
        chunk_overlap: int = None,  # words of overlap
        min_chunk_words: int = 20,  # skip chunks smaller than this
    ):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE  # default: 1000
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP  # default: 200
        self.min_chunk_words = min_chunk_words

    # ── Public API ─────────────────────────────────────────────────────────────

    def chunk_document(
        self,
        full_text: str,
        pages: List[PageContent],
    ) -> List[DocumentChunk]:
        """
        Split a document into annotated chunks.

        Args:
            full_text: Complete document text
            pages: Per-page content from extractor (for page number mapping)

        Returns:
            List of DocumentChunk objects with page_numbers and section_title
        """
        if not full_text.strip():
            return []

        # Build page offset map: char_offset → page_number
        page_map = self._build_page_map(pages)

        # Extract section headings with their char positions
        headings = self._extract_headings(full_text)

        # Split into sentences
        sentences = self._split_sentences(full_text)

        if not sentences:
            return []

        # Group sentences into word-count-bounded chunks with overlap
        raw_chunks = self._group_into_chunks(sentences, full_text)

        # Enforce the hard character ceiling that CHUNK_SIZE cannot: tables are
        # a single "sentence" and would otherwise be emitted at any size.
        raw_chunks = self._enforce_size_ceiling(raw_chunks)

        # Annotate each chunk with page numbers and section title
        chunks: List[DocumentChunk] = []
        for idx, (chunk_text, char_start, char_end) in enumerate(raw_chunks):
            # Table parts are exempt from the minimum-words filter: a short
            # lookup table is meaningful even at a handful of words, and
            # dropping it would lose the data entirely.
            if len(chunk_text.split()) < self.min_chunk_words and "|" not in chunk_text:
                continue  # Skip tiny fragments

            page_nums = self._get_page_numbers(char_start, char_end, page_map)
            section = self._get_section_title(char_start, headings)

            chunks.append(
                DocumentChunk(
                    chunk_index=idx,
                    text=chunk_text.strip(),
                    page_numbers=page_nums,
                    section_title=section,
                    char_start=char_start,
                    char_end=char_end,
                )
            )

        logger.info(
            f"Chunked document: {len(sentences)} sentences → {len(chunks)} chunks "
            f"(size={self.chunk_size} words, overlap={self.chunk_overlap} words)"
        )
        return chunks

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _enforce_size_ceiling(self, raw_chunks: List[tuple]) -> List[tuple]:
        """
        Break any chunk that exceeds MAX_CHUNK_CHARS.

        Runs as a post-pass rather than being folded into sentence grouping so
        that prose chunking behaviour is completely unchanged — only oversized
        chunks are touched, and in practice those are the table ones.

        A chunk may hold prose *and* a table, because the sentence splitter
        does not break on ".\\n\\n[Table 1 on page 7]" (the following character
        is '[', not a capital letter). Prose and table parts are therefore
        separated here and emitted in document order.

        All parts inherit the source chunk's char offsets. Page attribution
        stays correct — every part came from that same span — at the cost of
        page ranges being no narrower than the original chunk's.
        """
        max_chars = settings.MAX_CHUNK_CHARS
        result: List[tuple] = []

        for chunk_text, char_start, char_end in raw_chunks:
            if len(chunk_text) <= max_chars:
                result.append((chunk_text, char_start, char_end))
                continue

            for part in self._split_oversized(chunk_text, max_chars):
                result.append((part, char_start, char_end))

        return result

    def _split_oversized(self, text: str, max_chars: int) -> List[str]:
        """Split one oversized chunk into table parts and prose parts."""
        parts: List[str] = []
        cursor = 0

        for match in _TABLE_BLOCK.finditer(text):
            prose = text[cursor : match.start()].strip()
            lead_in = ""

            if prose:
                if len(prose) <= _LEAD_IN_MAX_CHARS:
                    # A short line before a table is almost always its
                    # caption ("Roof bolt patterns shall conform to the
                    # schedule below."). On its own it is under the
                    # minimum-words filter and would be discarded, so it rides
                    # with the first part of the table it introduces.
                    lead_in = prose
                else:
                    parts.extend(self._split_plain_text(prose, max_chars))

            table_budget = max_chars - (len(lead_in) + 2 if lead_in else 0)
            table_parts = split_markdown_table(match.group(0), table_budget)

            if lead_in and table_parts:
                table_parts[0] = f"{lead_in}\n\n{table_parts[0]}"

            parts.extend(table_parts)
            cursor = match.end()

        trailing = text[cursor:].strip()
        if trailing:
            parts.extend(self._split_plain_text(trailing, max_chars))

        # No table found — the chunk is just a very long run of prose.
        return parts or self._split_plain_text(text, max_chars)

    def _split_plain_text(self, text: str, max_chars: int) -> List[str]:
        """
        Hard-split prose that has no usable sentence boundaries.

        Breaks on whitespace so words stay intact. Only reached for text the
        sentence splitter already failed to divide, so there is no better
        boundary available.
        """
        text = text.strip()
        if len(text) <= max_chars:
            return [text] if text else []

        parts: List[str] = []
        current: List[str] = []
        length = 0

        for word in text.split():
            if current and length + len(word) + 1 > max_chars:
                parts.append(" ".join(current))
                current, length = [], 0
            current.append(word)
            length += len(word) + 1

        if current:
            parts.append(" ".join(current))
        return parts

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences using regex boundary detection."""
        # Replace common abbreviations that fool period detection
        text = re.sub(
            r"\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|No|Vol|Fig)\.", r"\1<ABBR>", text
        )

        # Split on sentence boundaries
        raw_sentences = _SENTENCE_BOUNDARY.split(text)

        # Restore abbreviation dots
        sentences = [
            s.replace("<ABBR>", ".").strip() for s in raw_sentences if s.strip()
        ]
        return sentences

    def _group_into_chunks(
        self,
        sentences: List[str],
        full_text: str,
    ) -> List[tuple]:
        """
        Group sentences into chunks respecting chunk_size with overlap.

        Returns list of (chunk_text, char_start, char_end) tuples.
        """
        chunks = []
        # Indices into `sentences`, not the strings themselves. Looking the
        # strings back up with sentences.index() was O(n) per flush and
        # returned the *first* match, so a document containing the same
        # sentence twice attributed the chunk to the wrong character offset —
        # and therefore the wrong page.
        current: List[int] = []
        current_word_count = 0

        # Precompute sentence char offsets in full_text
        sentence_offsets = self._compute_sentence_offsets(sentences, full_text)

        def flush(indices: List[int]) -> None:
            if not indices:
                return
            char_start = sentence_offsets[indices[0]][0]
            char_end = sentence_offsets[indices[-1]][1]
            chunks.append(
                (" ".join(sentences[j] for j in indices), char_start, char_end)
            )

        i = 0
        while i < len(sentences):
            word_count = len(sentences[i].split())

            # A single sentence larger than chunk_size can never be packed.
            # It must be emitted on its own AND i must advance, or the loop
            # below spins forever: the else-branch flushes, restores a
            # non-empty overlap, and re-tests the same oversized sentence
            # against the same budget. That hung ingestion permanently on any
            # document with prose followed by a large table, because a
            # Markdown table has no sentence boundaries and merges into the
            # preceding sentence.
            if word_count > self.chunk_size:
                flush(current)
                # Deliberately no overlap here — carrying sentences forward
                # would recreate the non-empty state that caused the spin.
                current, current_word_count = [], 0
                flush([i])
                i += 1
                continue

            if current_word_count + word_count <= self.chunk_size:
                current.append(i)
                current_word_count += word_count
                i += 1
                continue

            # Chunk is full: emit it and carry an overlap into the next one.
            flush(current)
            current = self._get_overlap_indices(current, sentences, self.chunk_overlap)
            current_word_count = sum(len(sentences[j].split()) for j in current)

            # Guard against a pathological overlap that leaves no room for the
            # next sentence, which would stall progress again.
            if current_word_count + word_count > self.chunk_size:
                flush(current)
                current, current_word_count = [], 0

        flush(current)
        return chunks

    def _get_overlap_indices(
        self, indices: List[int], sentences: List[str], target_words: int
    ) -> List[int]:
        """Return the tail sentence indices totalling approximately target_words."""
        result: List[int] = []
        word_count = 0
        for idx in reversed(indices):
            wc = len(sentences[idx].split())
            if word_count + wc > target_words:
                break
            result.insert(0, idx)
            word_count += wc
        return result

    def _compute_sentence_offsets(
        self, sentences: List[str], full_text: str
    ) -> List[tuple]:
        """Find (start, end) char offsets of each sentence in full_text."""
        offsets = []
        search_from = 0
        for sentence in sentences:
            # Find the sentence in full text starting from last known position
            idx = full_text.find(sentence[:30], search_from)  # match on first 30 chars
            if idx == -1:
                idx = search_from
            end = idx + len(sentence)
            offsets.append((idx, end))
            search_from = max(search_from, idx + 1)
        return offsets

    def _build_page_map(self, pages: List[PageContent]) -> List[tuple]:
        """Build sorted list of (char_start, char_end, page_number) for binary search."""
        return [
            (p.char_start, p.char_end, p.page_number)
            for p in sorted(pages, key=lambda p: p.char_start)
        ]

    def _get_page_numbers(
        self, char_start: int, char_end: int, page_map: List[tuple]
    ) -> List[int]:
        """Return all page numbers that a chunk's char range overlaps."""
        page_nums = []
        for p_start, p_end, page_num in page_map:
            # Overlap condition
            if p_start < char_end and p_end > char_start:
                page_nums.append(page_num)
        return sorted(set(page_nums)) or [1]

    def _extract_headings(self, text: str) -> List[tuple]:
        """
        Extract (char_position, heading_text) from document.
        Looks for ALL-CAPS lines, numbered sections, and markdown headings.
        """
        headings = []
        for pattern in _HEADING_PATTERNS:
            for match in pattern.finditer(text):
                heading_text = match.group(0).strip()
                # Clean up heading text
                heading_text = re.sub(r"^#+\s*", "", heading_text)  # Remove markdown #
                heading_text = re.sub(
                    r"^\d+(?:\.\d+)*\s*", "", heading_text
                )  # Remove numbering
                if 3 <= len(heading_text) <= 100:
                    headings.append((match.start(), heading_text))

        # Sort by position
        headings.sort(key=lambda h: h[0])
        return headings

    def _get_section_title(
        self, char_start: int, headings: List[tuple]
    ) -> Optional[str]:
        """Return the most recent heading before char_start."""
        result = None
        for pos, title in headings:
            if pos <= char_start:
                result = title
            else:
                break
        return result
