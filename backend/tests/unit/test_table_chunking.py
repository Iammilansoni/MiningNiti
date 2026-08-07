"""
Unit tests for table-aware chunking.

The defect these lock down: a Markdown table contains no sentence-ending
punctuation, so the sentence splitter treats an entire table as one "sentence"
and _group_into_chunks emitted it whole regardless of size. Measured before the
fix, a 400-row table produced a single 14,703-character chunk — roughly twice
gemini-embedding-001's input limit, so most of the table was silently truncated
and never indexed, and what survived was one vector averaging 400 unrelated
rows.
"""

import pytest

from app.config import settings
from app.services.chunking import ChunkingService, split_markdown_table
from app.services.extractors import PageContent

pytestmark = pytest.mark.unit


def make_table(n_rows: int, label: str = "[Table 1 on page 5]") -> str:
    rows = [f"| {h} ft | {36 + h} in | 4.0 ft | Resin |" for h in range(n_rows)]
    return (
        f"{label}\n"
        "| Mining Height | Bolt Length | Spacing | Support |\n"
        "| --- | --- | --- | --- |\n" + "\n".join(rows)
    )


def chunk(text: str, page: int = 5):
    pages = [PageContent(page_number=page, text=text, char_start=0, char_end=len(text))]
    return ChunkingService().chunk_document(full_text=text, pages=pages)


# ── The core defect ────────────────────────────────────────────────────────────


def test_large_table_no_longer_becomes_one_giant_chunk():
    chunks = chunk(make_table(400))
    assert len(chunks) > 1
    for c in chunks:
        assert len(c.text) <= settings.MAX_CHUNK_CHARS


def test_no_rows_are_lost_when_splitting():
    """Splitting must not drop data — that would be worse than the bug."""
    n = 400
    chunks = chunk(make_table(n))
    recovered = sum(c.text.count("| Resin |") for c in chunks)
    assert recovered == n


def test_every_part_repeats_the_header():
    """A bare row of numbers is not an answer without its column names."""
    chunks = chunk(make_table(400))
    for c in chunks:
        assert "| Mining Height | Bolt Length | Spacing | Support |" in c.text
        assert "| --- | --- | --- | --- |" in c.text


def test_parts_are_labelled_so_partial_lists_are_not_read_as_complete():
    chunks = chunk(make_table(400))
    labels = [
        ln for c in chunks for ln in c.text.splitlines() if ln.startswith("[Table")
    ]
    assert len(labels) == len(chunks)
    assert "part 1 of" in labels[0]
    # Well-formed brackets, not "[Table 1 on page 5 (part 1 of 2]"
    for label in labels:
        assert label.startswith("[") and label.endswith("]")
        assert label.count("[") == 1 and label.count("]") == 1


def test_row_column_relationship_survives_the_split():
    """The value must still be readable as belonging to its row and column."""
    chunks = chunk(make_table(400))
    holder = next(c for c in chunks if "| 300 ft | 336 in |" in c.text)
    assert "| Mining Height | Bolt Length |" in holder.text


# ── Behaviour that must not change ─────────────────────────────────────────────


def test_small_table_is_left_alone():
    chunks = chunk(make_table(20))
    assert len(chunks) == 1
    assert "part 1 of" not in chunks[0].text  # no spurious part labels


def test_prose_only_document_is_unaffected():
    prose = " ".join(f"Sentence number {i} about mine ventilation." for i in range(40))
    before = ChunkingService().chunk_document(
        full_text=prose,
        pages=[
            PageContent(page_number=1, text=prose, char_start=0, char_end=len(prose))
        ],
    )
    assert before
    for c in before:
        assert len(c.text) <= settings.MAX_CHUNK_CHARS


def test_table_caption_is_kept_with_the_table():
    """
    A one-line caption is below the minimum-words filter, so emitting it
    separately would discard it. It must ride with the first part.
    """
    caption = "Roof bolt patterns shall conform to the schedule below."
    chunks = chunk(f"{caption}\n\n{make_table(400)}")
    assert caption in chunks[0].text


def test_long_prose_before_a_table_is_split_separately():
    long_prose = " ".join(
        f"Ventilation requirement number {i} applies to all working sections."
        for i in range(120)
    )
    chunks = chunk(f"{long_prose}\n\n{make_table(200)}")
    assert len(chunks) > 2
    for c in chunks:
        assert len(c.text) <= settings.MAX_CHUNK_CHARS
    # Both kinds of content survived.
    assert any("Ventilation requirement" in c.text for c in chunks)
    assert sum(c.text.count("| Resin |") for c in chunks) == 200


def test_table_without_a_label_still_splits():
    rows = [f"| {h} | {h * 2} |" for h in range(600)]
    table = "| A | B |\n| --- | --- |\n" + "\n".join(rows)
    chunks = chunk(table)
    assert len(chunks) > 1
    for c in chunks:
        assert "| A | B |" in c.text
        assert len(c.text) <= settings.MAX_CHUNK_CHARS


def test_short_table_chunks_are_not_dropped_by_min_words_filter():
    """Tables are exempt from the tiny-fragment filter — the data matters."""
    tiny = "[Table 1 on page 2]\n| A | B |\n| --- | --- |\n| 1 | 2 |"
    chunks = chunk(tiny)
    assert chunks, "a small table must not be discarded as a fragment"
    assert "| 1 | 2 |" in chunks[0].text


# ── The infinite loop this work uncovered ──────────────────────────────────────


def test_oversized_sentence_after_prose_terminates():
    """
    Regression: _group_into_chunks used to spin forever here.

    A Markdown table has no sentence boundaries, so it merges into the
    preceding sentence and produces one "sentence" larger than chunk_size.
    The old loop flushed, restored a non-empty overlap, and re-tested the same
    oversized sentence without advancing — appending chunks until memory ran
    out. Ingestion of any document with prose followed by a large table hung
    permanently.
    """
    prose = " ".join(
        f"Ventilation requirement number {i} applies to all sections."
        for i in range(120)
    )
    table = "| A | B |\n| --- | --- |\n" + "\n".join(
        f"| {h} | {h * 2} |" for h in range(200)
    )

    chunks = chunk(f"{prose}\n\n{table}")

    assert chunks
    assert len(chunks) < 100, "runaway chunk count suggests the loop is spinning"
    for c in chunks:
        assert len(c.text) <= settings.MAX_CHUNK_CHARS


def test_single_oversized_sentence_alone_terminates():
    huge = "word " * 5000  # one 5000-word "sentence", no boundaries
    chunks = chunk(huge)
    assert chunks
    for c in chunks:
        assert len(c.text) <= settings.MAX_CHUNK_CHARS


def test_repeated_identical_sentences_get_distinct_offsets():
    """
    The old code looked sentences back up with list.index(), which returns the
    first match — so a repeated sentence attributed later chunks to the wrong
    character offset, and therefore the wrong page.
    """
    repeated = "The mine foreman shall record the reading. " * 200
    pages = [
        PageContent(page_number=1, text=repeated[:2000], char_start=0, char_end=2000),
        PageContent(
            page_number=2,
            text=repeated[2000:],
            char_start=2000,
            char_end=len(repeated),
        ),
    ]
    chunks = ChunkingService().chunk_document(full_text=repeated, pages=pages)

    assert len(chunks) > 1
    starts = [c.char_start for c in chunks]
    assert starts == sorted(starts), "chunk offsets must advance monotonically"
    assert len(set(starts)) > 1, "all chunks collapsed onto the same offset"


# ── split_markdown_table directly ──────────────────────────────────────────────


def test_split_returns_table_unchanged_when_it_fits():
    table = make_table(5)
    assert split_markdown_table(table, max_chars=10_000) == [table.strip()]


def test_split_handles_malformed_table_without_raising():
    assert split_markdown_table("", 1000) == []
    assert split_markdown_table("| only a header |", 1000) == ["| only a header |"]


def test_every_part_stays_within_budget():
    parts = split_markdown_table(make_table(500), max_chars=2000)
    assert len(parts) > 1
    for p in parts:
        assert len(p) <= 2000


def test_oversized_single_row_is_emitted_rather_than_dropped():
    """A row wider than the budget cannot be split further — keep it anyway."""
    wide = "| " + "x" * 3000 + " |"
    table = f"| A |\n| --- |\n{wide}"
    parts = split_markdown_table(table, max_chars=500)
    assert any("x" * 3000 in p for p in parts)
