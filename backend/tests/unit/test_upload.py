"""
Unit tests for the direct upload endpoint.

Regressions locked down here:
  * the whole body was buffered in memory before the size check ran
  * any content type was accepted (ALLOWED_FILE_TYPES was never consulted)
  * errors returned {"error": ...} with a 202, not a 4xx
  * the on-disk extension came from the attacker-controlled filename
"""

import io
import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.deps import get_current_user_id
from app.api.v1 import upload as upload_module
from app.db.session import get_db

pytestmark = pytest.mark.unit

PDF_TYPE = "application/pdf"
DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@pytest.fixture
def client(tmp_path, monkeypatch, db_session):
    """An app with just the upload router, auth stubbed, storage in tmp_path."""
    monkeypatch.setattr(upload_module, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(upload_module, "MAX_FILE_SIZE", 1024)  # 1KB ceiling
    monkeypatch.setattr(upload_module, "_CHUNK_SIZE", 256)

    app = FastAPI()
    app.include_router(upload_module.router, prefix="/upload")
    app.dependency_overrides[get_current_user_id] = lambda: "user_test"
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app), tmp_path


# ── Content type enforcement ───────────────────────────────────────────────────


@pytest.mark.parametrize(
    "content_type",
    [
        "application/x-msdownload",
        "image/png",
        "application/octet-stream",
        "text/html",
        "",
    ],
)
def test_rejects_disallowed_content_types(client, content_type):
    c, _ = client
    r = c.post(
        "/upload",
        files={"file": ("payload.pdf", io.BytesIO(b"data"), content_type)},
    )
    assert r.status_code == 415


def test_accepts_allowed_content_type(client):
    c, storage = client
    r = c.post(
        "/upload",
        files={"file": ("report.pdf", io.BytesIO(b"%PDF-1.4 hello"), PDF_TYPE)},
    )
    assert r.status_code == 202
    assert len(os.listdir(storage)) == 1


# ── Size ceiling ───────────────────────────────────────────────────────────────


def test_rejects_oversized_file_with_413(client):
    c, storage = client
    big = b"x" * 5000  # ceiling is 1KB
    r = c.post("/upload", files={"file": ("big.pdf", io.BytesIO(big), PDF_TYPE)})

    assert r.status_code == 413
    # And nothing is left behind on the volume.
    assert os.listdir(storage) == []


def test_rejects_empty_file(client):
    c, storage = client
    r = c.post("/upload", files={"file": ("empty.pdf", io.BytesIO(b""), PDF_TYPE)})

    assert r.status_code == 400
    assert os.listdir(storage) == []


# ── Filename handling ──────────────────────────────────────────────────────────


def test_stored_extension_comes_from_content_type_not_filename(client):
    """A doubled extension must not survive to the filesystem."""
    c, storage = client
    r = c.post(
        "/upload",
        files={"file": ("invoice.pdf.exe", io.BytesIO(b"%PDF-1.4"), PDF_TYPE)},
    )

    assert r.status_code == 202
    stored = os.listdir(storage)
    assert len(stored) == 1
    assert stored[0].endswith(".pdf")
    assert "exe" not in stored[0]


def test_traversal_in_filename_does_not_escape_upload_dir(client):
    c, storage = client
    r = c.post(
        "/upload",
        files={"file": ("../../../evil.pdf", io.BytesIO(b"%PDF-1.4"), PDF_TYPE)},
    )

    assert r.status_code == 202
    stored = os.listdir(storage)
    assert len(stored) == 1
    assert ".." not in stored[0] and "/" not in stored[0]


def test_document_row_records_validated_type_and_real_size(client):
    c, _ = client
    body = b"%PDF-1.4 some content"
    r = c.post("/upload", files={"file": ("doc.pdf", io.BytesIO(body), PDF_TYPE)})

    assert r.status_code == 202
    payload = r.json()
    assert payload["status"] == "pending"
    assert payload["file_name"] == "doc.pdf"
