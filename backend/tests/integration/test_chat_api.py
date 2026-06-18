"""
Integration Tests: Chat API
Tests for chat session CRUD and message flow.
"""

import pytest
from fastapi.testclient import TestClient


class TestChatSessions:
    """Chat session CRUD tests."""

    @pytest.mark.integration
    def test_list_sessions_returns_200(self, client: TestClient):
        """List sessions returns HTTP 200."""
        response = client.get("/api/v1/chat/sessions")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_list_sessions_empty_for_new_user(self, client: TestClient):
        """New user has no chat sessions."""
        response = client.get("/api/v1/chat/sessions")
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    @pytest.mark.integration
    def test_create_session_returns_201_or_200(self, client: TestClient):
        """Creating a session returns success status."""
        response = client.post("/api/v1/chat/sessions", json={
            "title": "Test Mining Chat",
            "document_ids": []
        })
        assert response.status_code in (200, 201)

    @pytest.mark.integration
    def test_create_session_has_required_fields(self, client: TestClient):
        """Created session has id, title, message_count."""
        response = client.post("/api/v1/chat/sessions", json={"title": "Test Session"})
        data = response.json()
        assert "id" in data
        assert "title" in data
        assert "message_count" in data
        assert data["title"] == "Test Session"
        assert data["message_count"] == 0

    @pytest.mark.integration
    def test_get_session_returns_200(self, client: TestClient, sample_chat_session):
        """Get session by ID returns HTTP 200."""
        response = client.get(f"/api/v1/chat/sessions/{sample_chat_session.id}")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_get_session_has_messages_list(self, client: TestClient, sample_chat_session):
        """Session detail response includes messages list."""
        response = client.get(f"/api/v1/chat/sessions/{sample_chat_session.id}")
        data = response.json()
        assert "messages" in data
        assert isinstance(data["messages"], list)

    @pytest.mark.integration
    def test_get_nonexistent_session_returns_404(self, client: TestClient):
        """Non-existent session ID returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/chat/sessions/{fake_id}")
        assert response.status_code == 404

    @pytest.mark.integration
    def test_update_session_title(self, client: TestClient, sample_chat_session):
        """PATCH session updates title."""
        response = client.patch(
            f"/api/v1/chat/sessions/{sample_chat_session.id}",
            json={"title": "Updated Title"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"

    @pytest.mark.integration
    def test_delete_session_returns_200(self, client: TestClient, sample_chat_session):
        """Delete session returns success."""
        response = client.delete(f"/api/v1/chat/sessions/{sample_chat_session.id}")
        assert response.status_code == 200
        assert response.json()["success"] is True

    @pytest.mark.integration
    def test_delete_makes_session_not_found(self, client: TestClient, sample_chat_session):
        """After deletion, GET returns 404."""
        session_id = str(sample_chat_session.id)
        client.delete(f"/api/v1/chat/sessions/{session_id}")
        response = client.get(f"/api/v1/chat/sessions/{session_id}")
        assert response.status_code == 404


class TestSendMessage:
    """Tests for the /chat/send endpoint."""

    @pytest.mark.integration
    def test_send_creates_new_session_when_no_session_id(self, client: TestClient):
        """Sending without session_id creates a new session."""
        from unittest.mock import AsyncMock, patch

        with patch("app.services.chat_service.ChatService.generate_response", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = (
                "According to [Mining_site.pdf, Page 12], methane limits are below 1%.",
                []
            )
            response = client.post("/api/v1/chat/send", json={
                "content": "What are the methane limits?",
                "include_sources": True
            })

        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "message" in data

    @pytest.mark.integration
    def test_send_message_has_assistant_role(self, client: TestClient):
        """AI response message has role='assistant'."""
        from unittest.mock import AsyncMock, patch

        with patch("app.services.chat_service.ChatService.generate_response", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = ("Test answer with [doc.pdf, Page 5] citation.", [])
            response = client.post("/api/v1/chat/send", json={
                "content": "Test question",
            })

        data = response.json()
        assert data["message"]["role"] == "assistant"

    @pytest.mark.integration
    def test_send_message_with_existing_session(self, client: TestClient, sample_chat_session):
        """Sending with existing session_id appends to that session."""
        from unittest.mock import AsyncMock, patch

        with patch("app.services.chat_service.ChatService.generate_response", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = ("Response text.", [])
            response = client.post("/api/v1/chat/send", json={
                "content": "Question about mining",
                "session_id": str(sample_chat_session.id),
            })

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == str(sample_chat_session.id)
