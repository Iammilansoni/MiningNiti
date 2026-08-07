"""
Unit tests for the SSRF / local-file-disclosure guard.

These cover the attack classes that were previously reachable through
POST /api/v1/documents with an attacker-controlled file_url.
"""

import os

import pytest

from app.core.url_guard import (
    UnsafeURLError,
    build_storage_url,
    is_internal_storage_url,
    resolve_storage_path,
    validate_public_url,
)

pytestmark = pytest.mark.unit


# ── Scheme rejection ───────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "url",
    [
        "file:///etc/passwd",
        "file://C:/Windows/win.ini",
        "gopher://127.0.0.1:6379/_INFO",
        "ftp://internal.example.com/secrets",
        "data:text/plain;base64,aGk=",
        "http://example.com/doc.pdf",  # plaintext http is not allowed either
    ],
)
def test_rejects_non_https_schemes(url):
    with pytest.raises(UnsafeURLError):
        validate_public_url(url)


def test_rejects_embedded_credentials():
    with pytest.raises(UnsafeURLError):
        validate_public_url("https://user:pass@example.com/doc.pdf")


def test_rejects_missing_hostname():
    with pytest.raises(UnsafeURLError):
        validate_public_url("https:///doc.pdf")


# ── Private / metadata address rejection ───────────────────────────────────────


@pytest.mark.parametrize(
    "url",
    [
        "https://169.254.169.254/latest/meta-data/",  # AWS/GCP metadata
        "https://127.0.0.1/admin",
        "https://localhost/admin",
        "https://10.0.0.5/internal",
        "https://192.168.1.1/router",
        "https://172.16.0.1/internal",
        "https://100.64.0.1/cgnat",
        "https://0.0.0.0/",
        "https://[::1]/admin",
        "https://[::ffff:169.254.169.254]/latest/meta-data/",  # v4-mapped bypass
    ],
)
def test_rejects_non_public_addresses(url):
    with pytest.raises(UnsafeURLError):
        validate_public_url(url)


def test_allows_public_address():
    # A literal public IP needs no DNS and is stable for tests.
    assert validate_public_url("https://1.1.1.1/doc.pdf").startswith("https://1.1.1.1")


# ── Storage path confinement ───────────────────────────────────────────────────


def test_storage_url_roundtrip(tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    target = tmp_path / "abc123.pdf"
    target.write_bytes(b"%PDF-1.4")

    resolved = resolve_storage_path(build_storage_url("abc123.pdf"))
    assert os.path.realpath(resolved) == os.path.realpath(str(target))


@pytest.mark.parametrize(
    "key",
    [
        "../../../etc/passwd",
        "..%2f..%2fetc%2fpasswd",
        "subdir/../../outside.txt",
    ],
)
def test_storage_path_rejects_traversal(tmp_path, monkeypatch, key):
    from app.config import settings

    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    with pytest.raises(UnsafeURLError):
        resolve_storage_path(build_storage_url(key))


def test_storage_path_rejects_absolute_outside_root(tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    outside = tmp_path.parent / "outside.txt"
    outside.write_text("secret")

    with pytest.raises(UnsafeURLError):
        resolve_storage_path(f"file://{outside}")


def test_missing_stored_file_is_rejected(tmp_path, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    with pytest.raises(UnsafeURLError):
        resolve_storage_path(build_storage_url("nope.pdf"))


# ── Routing predicate ──────────────────────────────────────────────────────────


def test_internal_storage_url_detection():
    assert is_internal_storage_url("storage://abc.pdf")
    assert is_internal_storage_url("file:///app/uploads/abc.pdf")
    assert not is_internal_storage_url("https://example.com/abc.pdf")
