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

        # Annotate each chunk with page numbers and section title
        chunks: List[DocumentChunk] = []
        for idx, (chunk_text, char_start, char_end) in enumerate(raw_chunks):
            if len(chunk_text.split()) < self.min_chunk_words:
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
        current_sentences: List[str] = []
        current_word_count = 0

        # Precompute sentence char offsets in full_text
        sentence_offsets = self._compute_sentence_offsets(sentences, full_text)

        i = 0
        while i < len(sentences):
            sentence = sentences[i]
            word_count = len(sentence.split())

            if current_word_count + word_count <= self.chunk_size:
                current_sentences.append(sentence)
                current_word_count += word_count
                i += 1
            else:
                if current_sentences:
                    # Save current chunk
                    start_idx = sentences.index(current_sentences[0])
                    end_idx = sentences.index(current_sentences[-1])
                    char_start = sentence_offsets[start_idx][0]
                    char_end = sentence_offsets[end_idx][1]
                    chunks.append((" ".join(current_sentences), char_start, char_end))

                    # Build overlap: keep last N words worth of sentences
                    overlap_sentences = self._get_overlap_sentences(
                        current_sentences, self.chunk_overlap
                    )
                    current_sentences = overlap_sentences
                    current_word_count = sum(len(s.split()) for s in current_sentences)
                else:
                    # Single sentence is longer than chunk_size — add it anyway
                    char_start, char_end = sentence_offsets[i]
                    chunks.append((sentence, char_start, char_end))
                    i += 1

        # Don't forget the last chunk
        if current_sentences:
            start_idx = sentences.index(current_sentences[0])
            end_idx = sentences.index(current_sentences[-1])
            char_start = sentence_offsets[start_idx][0]
            char_end = sentence_offsets[end_idx][1]
            chunks.append((" ".join(current_sentences), char_start, char_end))

        return chunks

    def _get_overlap_sentences(
        self, sentences: List[str], target_words: int
    ) -> List[str]:
        """Return the tail sentences that total approximately target_words words."""
        result = []
        word_count = 0
        for sentence in reversed(sentences):
            wc = len(sentence.split())
            if word_count + wc > target_words:
                break
            result.insert(0, sentence)
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
