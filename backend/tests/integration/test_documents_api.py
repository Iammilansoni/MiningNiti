"""
Integration Tests: Documents API
Tests for document CRUD endpoints.
"""

import pytest
from fastapi.testclient import TestClient


class TestDocumentList:
    """GET /api/v1/documents"""

    @pytest.mark.integration
    def test_list_documents_returns_200(self, client: TestClient):
        """List endpoint returns HTTP 200."""
        response = client.get("/api/v1/documents")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_list_documents_has_pagination(self, client: TestClient):
        """Response has pagination fields."""
        response = client.get("/api/v1/documents")
        data = response.json()
        assert "documents" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data

    @pytest.mark.integration
    def test_list_documents_empty_for_new_user(self, client: TestClient):
        """New user has 0 documents."""
        response = client.get("/api/v1/documents")
        data = response.json()
        assert data["total"] == 0
        assert data["documents"] == []

    @pytest.mark.integration
    def test_list_documents_with_completed_doc(self, client: TestClient, sample_document):
        """Lists documents after one is created."""
        response = client.get("/api/v1/documents")
        data = response.json()
        assert data["total"] == 1
        assert data["documents"][0]["title"] == "Test Mining Safety Protocol"

    @pytest.mark.integration
    def test_list_documents_pagination(self, client: TestClient):
        """Pagination parameters are respected."""
        response = client.get("/api/v1/documents?page=1&page_size=5")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    @pytest.mark.integration
    def test_list_documents_search_filter(self, client: TestClient, sample_document):
        """Search by title works."""
        response = client.get("/api/v1/documents?search=Mining")
        data = response.json()
        assert data["total"] >= 1

    @pytest.mark.integration
    def test_list_documents_no_match_search(self, client: TestClient, sample_document):
        """Search with no match returns 0."""
        response = client.get("/api/v1/documents?search=xyznonexistent123")
        data = response.json()
        assert data["total"] == 0


class TestGetDocument:
    """GET /api/v1/documents/{id}"""

    @pytest.mark.integration
    def test_get_document_returns_200(self, client: TestClient, sample_document):
        """Get by ID returns HTTP 200."""
        response = client.get(f"/api/v1/documents/{sample_document.id}")
        assert response.status_code == 200

    @pytest.mark.integration
    def test_get_document_has_correct_data(self, client: TestClient, sample_document):
        """Returned document has correct fields."""
        response = client.get(f"/api/v1/documents/{sample_document.id}")
        data = response.json()
        assert data["id"] == str(sample_document.id)
        assert data["title"] == "Test Mining Safety Protocol"
        assert data["file_name"] == "mining_safety.pdf"

    @pytest.mark.integration
    def test_get_nonexistent_document_returns_404(self, client: TestClient):
        """Non-existent document ID returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/documents/{fake_id}")
        assert response.status_code == 404


class TestDeleteDocument:
    """DELETE /api/v1/documents/{id}"""

    @pytest.mark.integration
    def test_delete_document_returns_200(self, client: TestClient, sample_document):
        """Delete returns HTTP 200 with success message."""
        response = client.delete(f"/api/v1/documents/{sample_document.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.integration
    def test_delete_makes_document_not_found(self, client: TestClient, sample_document):
        """After deletion, GET returns 404."""
        doc_id = str(sample_document.id)
        client.delete(f"/api/v1/documents/{doc_id}")
        response = client.get(f"/api/v1/documents/{doc_id}")
        assert response.status_code == 404

    @pytest.mark.integration
    def test_delete_nonexistent_returns_404(self, client: TestClient):
        """Deleting non-existent document returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/api/v1/documents/{fake_id}")
        assert response.status_code == 404


class TestDocumentAnalysis:
    """GET /api/v1/documents/{id}/analysis"""

    @pytest.mark.integration
    def test_get_analysis_for_completed_document(self, client: TestClient, sample_document):
        """Analysis endpoint returns analysis data for completed document."""
        response = client.get(f"/api/v1/documents/{sample_document.id}/analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["document_id"] == str(sample_document.id)
        assert data["status"] == "completed"
        assert data["analysis"] is not None
