"""
Unit Tests: ChatService
Tests for context-aware RAG answer generation.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

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
    """Tests for _build_user_message and system prompt."""

    @pytest.mark.unit
    def test_prompt_includes_system_prompt(self):
        """System prompt contains citation instructions."""
        from app.services.chat_service import _SYSTEM_PROMPT

        assert "Citation" in _SYSTEM_PROMPT or "cite" in _SYSTEM_PROMPT.lower()

    @pytest.mark.unit
    def test_prompt_includes_query(self):
        """User message includes the user's question."""
        from app.services.chat_service import ChatService

        service = ChatService()
        query = "What are the methane limits?"
        msg = service._build_user_message(query, "Context here")
        assert query in msg

    @pytest.mark.unit
    def test_prompt_includes_context(self):
        """User message includes the document context."""
        from app.services.chat_service import ChatService

        service = ChatService()
        context = "Source 1: Mining_site.pdf, Page 12"
        msg = service._build_user_message("question?", context)
        assert context in msg

    @pytest.mark.unit
    def test_prompt_includes_file_citation_format(self):
        """User message references page citation format."""
        from app.services.chat_service import ChatService

        service = ChatService()
        msg = service._build_user_message("question?", "context")
        assert "Page" in msg or "page" in msg


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


class TestConversationHistory:
    """Tests for multi-turn conversation memory.

    Prior turns are replayed to the model so follow-ups resolve against what
    was already discussed. These guard the two failure modes that make history
    worse than no history: replaying the live question as its own context, and
    opening the replay on a dangling assistant turn.
    """

    @staticmethod
    def _rows(*pairs):
        """Build fake ChatMessage rows, newest first (query order)."""
        rows = []
        for role, content in pairs:
            row = MagicMock()
            row.role = role
            row.content = content
            rows.append(row)
        return rows

    @staticmethod
    def _db_returning(rows):
        db = MagicMock()
        chain = db.query.return_value.filter.return_value.order_by.return_value
        chain.limit.return_value.all.return_value = rows
        return db

    @pytest.mark.unit
    def test_history_is_chronological(self):
        """Rows arrive newest-first from the DB and must be replayed oldest-first."""
        from app.services.chat_service import ChatService

        db = self._db_returning(
            self._rows(
                ("assistant", "Methane must stay below 1%."),
                ("user", "What are the methane limits?"),
            )
        )
        history = ChatService.load_session_history(db, "session-1")

        assert [m["role"] for m in history] == ["user", "assistant"]
        assert history[0]["content"] == "What are the methane limits?"

    @pytest.mark.unit
    def test_history_never_starts_on_assistant_turn(self):
        """A dangling answer with no question is dropped from the front."""
        from app.services.chat_service import ChatService

        db = self._db_returning(
            self._rows(
                ("assistant", "Newest answer."),
                ("user", "Newest question."),
                (
                    "assistant",
                    "Orphaned answer whose question fell outside the window.",
                ),
            )
        )
        history = ChatService.load_session_history(db, "session-1")

        assert history[0]["role"] == "user"
        assert all("Orphaned" not in m["content"] for m in history)

    @pytest.mark.unit
    def test_char_budget_trims_oldest_first(self):
        """The budget retains the most recent turns, not the oldest."""
        from app.services.chat_service import ChatService

        db = self._db_returning(
            self._rows(
                ("user", "recent"),
                ("assistant", "x" * 500),
                ("user", "ancient"),
            )
        )
        history = ChatService.load_session_history(db, "session-1", max_chars=50)

        contents = [m["content"] for m in history]
        assert "recent" in contents
        assert "ancient" not in contents

    @pytest.mark.unit
    def test_turn_cap_is_passed_to_query(self):
        """max_turns bounds the DB query rather than being applied after."""
        from app.services.chat_service import ChatService

        db = self._db_returning([])
        ChatService.load_session_history(db, "session-1", max_turns=4)

        limit = db.query.return_value.filter.return_value.order_by.return_value.limit
        limit.assert_called_once_with(4)

    @pytest.mark.unit
    def test_db_failure_degrades_to_stateless(self):
        """History is an enhancement; a DB error must not break the chat."""
        from app.services.chat_service import ChatService

        db = MagicMock()
        db.query.side_effect = RuntimeError("connection lost")

        assert ChatService.load_session_history(db, "session-1") == []

    @pytest.mark.unit
    def test_blank_and_system_rows_are_skipped(self):
        """Empty content and non user/assistant roles never reach the model."""
        from app.services.chat_service import ChatService

        db = self._db_returning(
            self._rows(
                ("user", "Real question."),
                ("system", "internal note"),
                ("assistant", "   "),
            )
        )
        history = ChatService.load_session_history(db, "session-1")

        assert history == [{"role": "user", "content": "Real question."}]

    @pytest.mark.unit
    def test_messages_place_history_between_system_and_query(self):
        """System prompt first, prior turns next, live question last."""
        from app.services.chat_service import ChatService

        history = [
            {"role": "user", "content": "What are the methane limits?"},
            {"role": "assistant", "content": "Below 1%."},
        ]
        messages = ChatService()._build_messages(
            "What about surface mines?", "CTX", history
        )

        assert messages[0]["role"] == "system"
        assert messages[1:3] == history
        assert messages[-1]["role"] == "user"
        assert "What about surface mines?" in messages[-1]["content"]

    @pytest.mark.unit
    def test_context_rides_only_on_the_live_turn(self):
        """Retrieved context must not be restated on historical turns."""
        from app.services.chat_service import ChatService

        history = [{"role": "user", "content": "Earlier question."}]
        messages = ChatService()._build_messages(
            "Now what?", "UNIQUE_CTX_MARKER", history
        )

        carrying = [m for m in messages if "UNIQUE_CTX_MARKER" in m["content"]]
        assert len(carrying) == 1
        assert carrying[0] is messages[-1]

    @pytest.mark.unit
    def test_no_history_yields_system_plus_query_only(self):
        """Behaviour with an empty history is unchanged from the stateless path."""
        from app.services.chat_service import ChatService

        messages = ChatService()._build_messages("A question.", "CTX", None)

        assert len(messages) == 2
        assert [m["role"] for m in messages] == ["system", "user"]


class TestRetrievalQueryExpansion:
    """Tests for _build_retrieval_query.

    Generation gets full history, so retrieval must too — otherwise a
    follow-up embeds to almost nothing and the reranker has no good
    candidates to pick from.
    """

    @pytest.mark.unit
    def test_dependent_followup_is_expanded(self):
        """A short follow-up inherits the previous user turn for retrieval."""
        from app.services.chat_service import ChatService

        history = [
            {"role": "user", "content": "What are the methane limits underground?"},
            {"role": "assistant", "content": "Below 1%."},
        ]
        expanded = ChatService._build_retrieval_query(
            "What about surface mines?", history
        )

        assert "methane limits underground" in expanded
        assert "What about surface mines?" in expanded

    @pytest.mark.unit
    def test_self_contained_question_is_untouched(self):
        """A long, standalone question must not be polluted with prior context."""
        from app.services.chat_service import ChatService

        history = [{"role": "user", "content": "What are the methane limits?"}]
        query = (
            "Describe in full the statutory ventilation survey obligations that "
            "apply to an underground coal mine operator under 30 CFR 75.323."
        )

        assert ChatService._build_retrieval_query(query, history) == query

    @pytest.mark.unit
    def test_first_turn_has_nothing_to_expand_from(self):
        """With no history the query passes through unchanged."""
        from app.services.chat_service import ChatService

        assert ChatService._build_retrieval_query("Short one?", []) == "Short one?"
