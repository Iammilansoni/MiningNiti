"""
Unit Tests: Extractors
Tests for PDF, DOCX, and TXT extractors with page tracking.
"""

import pytest
from app.services.extractors import ExtractorFactory, PDFExtractor, TXTExtractor, PageContent
import tempfile
import os

class TestExtractorFactory:
    @pytest.mark.unit
    def test_factory_returns_pdf_extractor(self):
        extractor = ExtractorFactory.get_extractor("application/pdf")
        assert isinstance(extractor, PDFExtractor)

    @pytest.mark.unit
    def test_factory_returns_txt_extractor(self):
        extractor = ExtractorFactory.get_extractor("text/plain")
        assert isinstance(extractor, TXTExtractor)
        
    @pytest.mark.unit
    def test_factory_raises_error_for_unsupported(self):
        with pytest.raises(ValueError):
            ExtractorFactory.get_extractor("image/jpeg")

class TestTXTExtractor:
    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_txt_extractor_processes_content(self):
        extractor = TXTExtractor()
        test_content = b"This is a test document.\nIt has multiple lines.\n"
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(test_content)
            temp_path = temp_file.name
            
        try:
            result = await extractor.extract(temp_path)
            
            assert result.full_text == "This is a test document.\nIt has multiple lines.\n"
            assert result.total_pages == 1
            assert len(result.pages) == 1
            assert result.pages[0].page_number == 1
            assert result.pages[0].text == result.full_text
        finally:
            os.unlink(temp_path)
