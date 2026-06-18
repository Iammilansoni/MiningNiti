"""
Unit Tests: ChatService
Tests for context-aware RAG answer generation.
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


SAMPLE_CHUNKS = [
    {
        "document_id": "doc-001",
        "document_title": "Mining Safety Protocol",
        "file_name": "Mining_site.pdf",
        "text": "All underground coal mines must maintain methane levels below 1% per 30 CFR 75.323.",
        "score": 0.95,
        "page_numbers": [12, 13],
        "section_title": "Ventilation Requirements",
        "chunk_index": 3,
    },
    {
        "document_id": "doc-001",
        "document_title": "Mining Safety Protocol",
        "file_name": "Mining_site.pdf",
        "text": "Personal protective equipment must be inspected before each shift.",
        "score": 0.78,
        "page_numbers": [22],
        "section_title": "PPE Requirements",
        "chunk_index": 8,
    },
]


class TestContextFormatting:
    """Tests for _format_context method."""

    @pytest.mark.unit
    def test_format_context_includes_file_name(self):
        """Formatted context includes the file name."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = service._format_context(SAMPLE_CHUNKS)
        assert "Mining_site.pdf" in context

    @pytest.mark.unit
    def test_format_context_includes_page_numbers(self):
        """Formatted context includes page number information."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = service._format_context(SAMPLE_CHUNKS)
        assert "12" in context or "Page" in context

    @pytest.mark.unit
    def test_format_context_includes_section_title(self):
        """Formatted context includes section title."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = service._format_context(SAMPLE_CHUNKS)
        assert "Ventilation Requirements" in context

    @pytest.mark.unit
    def test_format_context_empty_returns_fallback(self):
        """Empty chunks returns a no-context fallback string."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = service._format_context([])
        assert "No relevant" in context or len(context) > 0

    @pytest.mark.unit
    def test_format_multi_page_shows_range(self):
        """Multi-page chunk shows Pages X-Y format."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = service._format_context([SAMPLE_CHUNKS[0]])  # pages [12, 13]
        assert "12" in context
        assert "13" in context


class TestBuildSources:
    """Tests for _build_sources method."""

    @pytest.mark.unit
    def test_build_sources_returns_list(self):
        """_build_sources returns a list."""
        from app.services.chat_service import ChatService
        service = ChatService()
        sources = service._build_sources(SAMPLE_CHUNKS)
        assert isinstance(sources, list)
        assert len(sources) == len(SAMPLE_CHUNKS)

    @pytest.mark.unit
    def test_build_sources_has_required_keys(self):
        """Each source dict has all required keys."""
        from app.services.chat_service import ChatService
        service = ChatService()
        sources = service._build_sources(SAMPLE_CHUNKS)
        for source in sources:
            assert "document_id" in source
            assert "document_title" in source
            assert "file_name" in source
            assert "page_numbers" in source
            assert "relevance_score" in source
            assert "chunk_text" in source

    @pytest.mark.unit
    def test_build_sources_page_numbers_preserved(self):
        """Page numbers from chunks are preserved in source output."""
        from app.services.chat_service import ChatService
        service = ChatService()
        sources = service._build_sources(SAMPLE_CHUNKS)
        assert sources[0]["page_numbers"] == [12, 13]
        assert sources[1]["page_numbers"] == [22]

    @pytest.mark.unit
    def test_build_sources_chunk_text_truncated(self):
        """Long chunk text is truncated to 300 chars."""
        from app.services.chat_service import ChatService
        service = ChatService()
        long_chunk = SAMPLE_CHUNKS[0].copy()
        long_chunk["text"] = "x" * 1000
        sources = service._build_sources([long_chunk])
        assert len(sources[0]["chunk_text"]) <= 310  # 300 + "..."

    @pytest.mark.unit
    def test_build_sources_empty_input(self):
        """Empty input returns empty list."""
        from app.services.chat_service import ChatService
        service = ChatService()
        sources = service._build_sources([])
        assert sources == []


class TestBuildPrompt:
    """Tests for _build_prompt method."""

    @pytest.mark.unit
    def test_prompt_includes_system_prompt(self):
        """Generated prompt includes the system prompt with citation instructions."""
        from app.services.chat_service import ChatService
        service = ChatService()
        prompt = service._build_prompt("What is ventilation?", "Some context")
        assert "Citation" in prompt or "cite" in prompt.lower()

    @pytest.mark.unit
    def test_prompt_includes_query(self):
        """Generated prompt includes the user's question."""
        from app.services.chat_service import ChatService
        service = ChatService()
        query = "What are the methane limits?"
        prompt = service._build_prompt(query, "Context here")
        assert query in prompt

    @pytest.mark.unit
    def test_prompt_includes_context(self):
        """Generated prompt includes the document context."""
        from app.services.chat_service import ChatService
        service = ChatService()
        context = "Source 1: Mining_site.pdf, Page 12"
        prompt = service._build_prompt("question?", context)
        assert context in prompt

    @pytest.mark.unit
    def test_prompt_includes_file_citation_format(self):
        """System prompt instructs LLM to use [FileName, Page X] format."""
        from app.services.chat_service import ChatService
        service = ChatService()
        prompt = service._build_prompt("question?", "context")
        assert "Page" in prompt or "page" in prompt


class TestGetMiningeSuggestions:
    """Tests for get_mining_suggestions."""

    @pytest.mark.unit
    def test_suggestions_is_nonempty_list(self):
        """Returns a non-empty list of suggestion strings."""
        from app.services.chat_service import ChatService
        service = ChatService()
        suggestions = service.get_mining_suggestions()
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        for s in suggestions:
            assert isinstance(s, str)
