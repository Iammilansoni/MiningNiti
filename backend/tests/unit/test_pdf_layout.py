"""
Unit tests for layout-aware PDF extraction.

Two capabilities are covered:
  * tables survive extraction as Markdown instead of being flattened into an
    unreadable run of cell values
  * pages with no extractable text are routed to OCR, within a budget, and
    degrade quietly when Tesseract is absent
"""

import os
from unittest.mock import patch

import pytest

from app.services.pdf_layout import PageExtraction, extract_page, table_to_markdown

pytestmark = pytest.mark.unit


# ── Table rendering ────────────────────────────────────────────────────────────


def test_table_renders_as_markdown_with_header_separator():
    md = table_to_markdown([["Height", "Bolt"], ["4 ft", "36 in"], ["6 ft", "48 in"]])
    lines = md.splitlines()
    assert lines[0] == "| Height | Bolt |"
    assert lines[1] == "| --- | --- |"
    assert lines[2] == "| 4 ft | 36 in |"


def test_row_column_relationship_is_preserved():
    """The whole point: a value must stay associated with its row and column."""
    md = table_to_markdown(
        [
            ["Mining Height", "Bolt Length"],
            ["under 4 ft", "36 in"],
            ["6 to 8 ft", "60 in"],
        ]
    )
    # The 60 in row must be readable as belonging to 6 to 8 ft.
    assert "| 6 to 8 ft | 60 in |" in md


def test_none_cells_become_empty_not_the_string_none():
    md = table_to_markdown([["A", "B"], ["x", None]])
    assert "None" not in md
    assert "| x |  |" in md


def test_ragged_rows_are_padded():
    md = table_to_markdown([["A", "B", "C"], ["1"], ["1", "2"]])
    for line in md.splitlines():
        assert line.count("|") == 4


def test_embedded_pipes_cannot_break_the_table():
    md = table_to_markdown([["Header"], ["a | b"]])
    assert r"a \| b" in md


def test_embedded_newlines_are_flattened():
    md = table_to_markdown([["Header"], ["line1\nline2"]])
    assert "line1 line2" in md
    assert len(md.splitlines()) == 3


def test_fully_empty_rows_are_dropped():
    md = table_to_markdown([["A", "B"], ["", ""], ["1", "2"]])
    assert len(md.splitlines()) == 3  # header, separator, one data row


def test_empty_table_returns_empty_string():
    assert table_to_markdown([]) == ""
    assert table_to_markdown([["", ""]]) == ""


# ── Page extraction / OCR routing ──────────────────────────────────────────────


class FakePage:
    def __init__(self, text="", tables=None):
        self._text = text
        self._tables = tables or []

    def extract_text(self):
        return self._text

    def extract_tables(self):
        return self._tables


def test_text_page_is_not_sent_to_ocr():
    page = FakePage(text="x" * 500)
    with patch("app.services.pdf_layout.ocr_page") as ocr:
        result = extract_page(page, "f.pdf", 1, ocr_budget=[10])
    ocr.assert_not_called()
    assert not result.used_ocr


def test_scanned_page_is_sent_to_ocr():
    """A page yielding nothing is the signature of a scan."""
    page = FakePage(text="")
    with patch("app.services.pdf_layout.ocr_page", return_value="RECOVERED TEXT"):
        result = extract_page(page, "f.pdf", 3, ocr_budget=[10])
    assert result.used_ocr
    assert "RECOVERED TEXT" in result.text


def test_ocr_budget_is_consumed_and_enforced():
    page = FakePage(text="")
    budget = [2]
    with patch("app.services.pdf_layout.ocr_page", return_value="TEXT"):
        assert extract_page(page, "f.pdf", 1, budget).used_ocr
        assert extract_page(page, "f.pdf", 2, budget).used_ocr
        # Budget exhausted — third scanned page is not OCR'd.
        assert not extract_page(page, "f.pdf", 3, budget).used_ocr
    assert budget == [0]


def test_ocr_failure_degrades_quietly():
    """No Tesseract binary must not raise — the document still ingests."""
    page = FakePage(text="")
    with patch("app.services.pdf_layout.ocr_page", return_value=""):
        result = extract_page(page, "f.pdf", 1, ocr_budget=[5])
    assert result.used_ocr is False
    assert result.text == ""


def test_ocr_supplements_rather_than_replaces_sparse_text():
    page = FakePage(text="Figure 4.")
    with patch("app.services.pdf_layout.ocr_page", return_value="scanned body"):
        result = extract_page(page, "f.pdf", 1, ocr_budget=[5])
    assert "Figure 4." in result.text
    assert "scanned body" in result.text


def test_tables_are_appended_and_labelled_with_page():
    page = FakePage(text="Prose here.", tables=[[["A", "B"], ["1", "2"]]])
    result = extract_page(page, "f.pdf", 7, ocr_budget=[5])
    assert "Prose here." in result.text
    assert "[Table 1 on page 7]" in result.text
    assert "| A | B |" in result.text
    assert result.tables_found == 1


def test_table_extraction_error_does_not_fail_the_page():
    class Exploding(FakePage):
        def extract_tables(self):
            raise RuntimeError("malformed table object")

    result = extract_page(Exploding(text="Prose"), "f.pdf", 1, ocr_budget=[5])
    assert result.text == "Prose"
    assert result.tables_found == 0


def test_table_can_rescue_a_page_from_being_treated_as_scanned():
    """A page that is only a table has little prose but is not a scan."""
    big_table = [["Col"] * 4] + [[f"v{i}{j}" for j in range(4)] for i in range(12)]
    page = FakePage(text="", tables=[big_table])
    with patch("app.services.pdf_layout.ocr_page") as ocr:
        result = extract_page(page, "f.pdf", 1, ocr_budget=[5])
    ocr.assert_not_called()
    assert result.tables_found == 1


# ── End-to-end against a real PDF ──────────────────────────────────────────────

FIXTURE = os.path.join(
    os.path.dirname(__file__), "..", "fixtures", "roof_control_table.pdf"
)


@pytest.mark.skipif(not os.path.exists(FIXTURE), reason="fixture PDF not built")
def test_real_pdf_table_survives_extraction():
    pytest.importorskip("pdfplumber")
    from app.services.extractors import PDFExtractor

    doc = PDFExtractor().extract(FIXTURE)

    assert "| Mining Height | Bolt Length | Spacing | Support Type |" in doc.full_text
    assert "| 6 to 8 ft | 60 in | 3.5 ft | Mechanical |" in doc.full_text
    assert doc.metadata["tables_extracted"] == 1


@pytest.mark.skipif(not os.path.exists(FIXTURE), reason="fixture PDF not built")
def test_pypdf_fallback_loses_the_table_structure():
    """
    Documents the regression this replaces: the old path cannot answer
    "what bolt length for 6 to 8 ft?" because the association is gone.
    """
    from app.services.extractors import PDFExtractor

    text = PDFExtractor()._extract_with_pypdf(FIXTURE).full_text
    assert "| 6 to 8 ft | 60 in |" not in text
