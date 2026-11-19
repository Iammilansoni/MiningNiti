"""
Unit and Integration Tests for Pillar 4: Consolidating Document Parsers & OCR.

Covers:
  - BaseExtractor hierarchy and format-agnostic pagination math
  - PlainTextExtractor with resilient encoding detection
  - DocxExtractor with paragraph tracking and approximate pagination
  - ImageExtractor with standalone OCR and fallback
  - PDFExtractor with layout-aware extraction, table rendering, and pypdf fallback with OCR
  - table_to_markdown (ragged rows, escaping, empty filtering)
  - split_markdown_table (header preservation and chunk ceiling enforcement)
  - Extractor registry dispatch (get_extractor)
"""

import os
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from app.services.chunking import split_markdown_table
from app.services.extractors import (
    BaseExtractor,
    DocxExtractor,
    ExtractedDocument,
    ImageExtractor,
    PDFExtractor,
    PageContent,
    PlainTextExtractor,
    get_extractor,
)
from app.services.pdf_layout import PageExtraction, table_to_markdown


class TestBaseExtractor(unittest.TestCase):
    """Test common BaseExtractor pagination and data structures."""

    class DummyExtractor(BaseExtractor):
        def extract(self, file_path: str) -> ExtractedDocument:
            return ExtractedDocument(
                full_text="test",
                pages=[],
                total_pages=1,
                file_type="test",
            )

    def setUp(self):
        self.extractor = self.DummyExtractor()

    def test_approximate_pages_empty_text(self):
        pages = self.extractor._approximate_pages("")
        self.assertEqual(pages, [])

    def test_approximate_pages_short_text(self):
        text = "Hello mining world."
        pages = self.extractor._approximate_pages(text, chars_per_page=100)
        self.assertEqual(len(pages), 1)
        self.assertEqual(pages[0].page_number, 1)
        self.assertEqual(pages[0].text, text)
        self.assertEqual(pages[0].char_start, 0)
        self.assertEqual(pages[0].char_end, len(text))

    def test_approximate_pages_multipage(self):
        text = "A" * 7000
        pages = self.extractor._approximate_pages(text, chars_per_page=3000)
        self.assertEqual(len(pages), 3)
        self.assertEqual(pages[0].page_number, 1)
        self.assertEqual(pages[0].char_start, 0)
        self.assertEqual(pages[0].char_end, 3000)

        self.assertEqual(pages[1].page_number, 2)
        self.assertEqual(pages[1].char_start, 3000)
        self.assertEqual(pages[1].char_end, 6000)

        self.assertEqual(pages[2].page_number, 3)
        self.assertEqual(pages[2].char_start, 6000)
        self.assertEqual(pages[2].char_end, 7000)


class TestPlainTextExtractor(unittest.TestCase):
    """Test PlainTextExtractor with various encodings."""

    def setUp(self):
        self.extractor = PlainTextExtractor()

    def test_extract_utf8(self):
        content = "Safety Protocol: Check ventilation daily.\nMethane limit < 1.0%."
        with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as f:
            f.write(content)
            tmp_path = f.name

        try:
            doc = self.extractor.extract(tmp_path)
            self.assertEqual(doc.full_text, content)
            self.assertEqual(doc.file_type, "text/plain")
            self.assertEqual(doc.total_pages, 1)
            self.assertEqual(doc.word_count, len(content.split()))
            self.assertEqual(len(doc.pages), 1)
        finally:
            os.unlink(tmp_path)

    def test_extract_utf8_with_bom(self):
        content = "Regulation 101: Roof Bolting Procedures."
        with tempfile.NamedTemporaryFile("w", encoding="utf-8-sig", delete=False) as f:
            f.write(content)
            tmp_path = f.name

        try:
            doc = self.extractor.extract(tmp_path)
            self.assertEqual(doc.full_text, content)
            self.assertFalse(doc.full_text.startswith("\ufeff"))
        finally:
            os.unlink(tmp_path)


class TestDocxExtractor(unittest.TestCase):
    """Test DocxExtractor with mocked python-docx."""

    def test_extract_docx_paragraphs(self):
        mock_doc = MagicMock()
        mock_para1 = MagicMock(text="Header: DGMS Mining Circular")
        mock_para2 = MagicMock(text="All operators must wear protective gear.")
        mock_doc.paragraphs = [mock_para1, mock_para2]

        mock_docx_module = MagicMock()
        mock_docx_module.Document.return_value = mock_doc

        with patch.dict("sys.modules", {"docx": mock_docx_module}):
            extractor = DocxExtractor()
            doc = extractor.extract("dummy_file.docx")

            self.assertIn("DGMS Mining Circular", doc.full_text)
            self.assertIn("protective gear", doc.full_text)
            self.assertEqual(doc.total_pages, 1)
            self.assertEqual(len(doc.pages), 1)


class TestImageExtractor(unittest.TestCase):
    """Test ImageExtractor with OCR."""

    def test_extract_image_with_ocr(self):
        extractor = ImageExtractor()
        with patch("app.services.pdf_layout.ocr_image", return_value="Scanned Safety Checklist Page 1"):
            doc = extractor.extract("dummy_scan.png")

            self.assertEqual(doc.full_text, "Scanned Safety Checklist Page 1")
            self.assertEqual(doc.file_type, "image")
            self.assertEqual(doc.total_pages, 1)
            self.assertEqual(doc.metadata.get("ocr_pages"), 1)

    def test_extract_image_ocr_disabled(self):
        extractor = ImageExtractor()
        with patch("app.config.settings.ENABLE_OCR", False):
            doc = extractor.extract("dummy_scan.png")
            self.assertEqual(doc.full_text, "")
            self.assertEqual(doc.total_pages, 1)
            self.assertEqual(doc.metadata.get("ocr_pages"), 0)


class TestPDFExtractor(unittest.TestCase):
    """Test PDFExtractor layout and pypdf fallback paths."""

    def test_extract_with_layout_success(self):
        extractor = PDFExtractor()

        # Mock pdfplumber
        mock_page = MagicMock()
        mock_pdf = MagicMock()
        mock_pdf.pages = [mock_page]
        mock_pdf.metadata = {"/Author": "DGMS", "/Title": "Coal Mines Regulations"}
        mock_pdf.__enter__.return_value = mock_pdf

        mock_extraction = PageExtraction(
            text="Regulation Section 1\n[Table 1 on page 1]\n| Item | Val |",
            tables_found=1,
            used_ocr=False,
        )

        mock_pdfplumber_module = MagicMock()
        mock_pdfplumber_module.open.return_value = mock_pdf

        with patch.dict("sys.modules", {"pdfplumber": mock_pdfplumber_module}), \
             patch("app.services.pdf_layout.extract_page", return_value=mock_extraction):
            doc = extractor.extract("dummy.pdf")

            self.assertEqual(doc.total_pages, 1)
            self.assertIn("Regulation Section 1", doc.full_text)
            self.assertEqual(doc.metadata["tables_extracted"], 1)
            self.assertEqual(doc.metadata["author"], "DGMS")

    def test_extract_pypdf_fallback_with_ocr(self):
        extractor = PDFExtractor()

        # Mock pypdf reader where page 1 has empty text (scanned)
        mock_page = MagicMock()
        mock_page.extract_text.return_value = ""
        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]
        mock_reader.metadata = {}

        # pdfplumber raises ImportError to trigger pypdf path
        with patch.object(extractor, "_extract_with_layout", side_effect=ImportError), \
             patch("pypdf.PdfReader", return_value=mock_reader), \
             patch("app.services.pdf_layout.ocr_page", return_value="OCR Recovered Text from Scanned PDF"):
            doc = extractor.extract("scanned.pdf")

            self.assertEqual(doc.total_pages, 1)
            self.assertEqual(doc.full_text, "OCR Recovered Text from Scanned PDF")
            self.assertEqual(doc.metadata["ocr_pages"], 1)


class TestTableLayoutAndSplitting(unittest.TestCase):
    """Test table rendering to Markdown and splitting logic."""

    def test_table_to_markdown_standard(self):
        table = [
            ["Equipment", "Capacity", "Status"],
            ["CAT 777D", "100 Ton", "Operational"],
            ["P&H 1900AL", "10 m3", "Maintenance"],
        ]
        md = table_to_markdown(table)
        lines = md.splitlines()

        self.assertEqual(lines[0], "| Equipment | Capacity | Status |")
        self.assertEqual(lines[1], "| --- | --- | --- |")
        self.assertEqual(lines[2], "| CAT 777D | 100 Ton | Operational |")
        self.assertEqual(lines[3], "| P&H 1900AL | 10 m3 | Maintenance |")

    def test_table_to_markdown_ragged_rows_and_escaping(self):
        table = [
            ["Item", "Details | Notes"],
            ["Shovel", "Working\nin pit A", "Extra Column"],
        ]
        md = table_to_markdown(table)
        lines = md.splitlines()

        # Column width padded to 3
        self.assertTrue(lines[0].startswith("| Item | Details \\| Notes |"))
        self.assertIn("Working in pit A", lines[2])

    def test_table_to_markdown_empty_or_none(self):
        self.assertEqual(table_to_markdown([]), "")
        self.assertEqual(table_to_markdown([[None, None]]), "")

    def test_split_markdown_table_under_limit(self):
        block = (
            "[Table 1 on page 2]\n"
            "| Parameter | Value |\n"
            "| --- | --- |\n"
            "| Methane | 0.4% |\n"
        )
        parts = split_markdown_table(block, max_chars=1000)
        self.assertEqual(len(parts), 1)
        self.assertEqual(parts[0], block.strip())

    def test_split_markdown_table_over_limit_repeats_headers(self):
        rows = [f"| Row {i} | Value {i} |" for i in range(1, 30)]
        block = (
            "[Table 1 on page 5]\n"
            "| Col A | Col B |\n"
            "| --- | --- |\n"
            + "\n".join(rows)
        )
        # Force small max_chars to cause splitting
        parts = split_markdown_table(block, max_chars=250)
        self.assertGreater(len(parts), 1)

        # Every part must have the table header and separator
        for i, part in enumerate(parts, start=1):
            self.assertIn("| Col A | Col B |", part)
            self.assertIn("| --- | --- |", part)
            self.assertIn(f"part {i} of {len(parts)}", part)


class TestExtractorRegistry(unittest.TestCase):
    """Test MIME type dispatcher."""

    def test_get_extractor_pdf(self):
        self.assertIsInstance(get_extractor("application/pdf"), PDFExtractor)

    def test_get_extractor_docx(self):
        self.assertIsInstance(
            get_extractor("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            DocxExtractor,
        )
        self.assertIsInstance(get_extractor("application/msword"), DocxExtractor)

    def test_get_extractor_image(self):
        self.assertIsInstance(get_extractor("image/png"), ImageExtractor)
        self.assertIsInstance(get_extractor("image/jpeg"), ImageExtractor)

    def test_get_extractor_text_and_fallback(self):
        self.assertIsInstance(get_extractor("text/plain"), PlainTextExtractor)
        self.assertIsInstance(get_extractor("unknown/binary"), PlainTextExtractor)


if __name__ == "__main__":
    unittest.main()
