"""
Unit Tests: Extractors
Tests for PDF, DOCX, and TXT extractors with page tracking.
"""

import os
import tempfile

import pytest

from app.services.extractors import PageContent, PlainTextExtractor


class TestPlainTextExtractor:
    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_txt_extractor_processes_content(self):
        extractor = PlainTextExtractor()
        test_content = b"This is a test document.\nIt has multiple lines.\n"

        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(test_content)
            temp_path = temp_file.name

        try:
            result = extractor.extract(temp_path)

            assert (
                result.full_text == "This is a test document.\nIt has multiple lines.\n"
            )
            assert result.total_pages == 1
            assert len(result.pages) == 1
            assert result.pages[0].page_number == 1
            assert result.pages[0].text == result.full_text
        finally:
            os.unlink(temp_path)
