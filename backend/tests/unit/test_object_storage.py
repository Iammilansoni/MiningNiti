"""
Unit tests for durable upload storage.

These exist because of a production incident. Uploads were written only to
UPLOAD_DIR, which lives on the container filesystem. HuggingFace Spaces
restarts the container on every deploy and the filesystem comes back as it was
baked into the image — empty — while the Postgres rows describing those files
survive. A document therefore kept listing, kept showing its analysis and kept
answering questions from its stored embeddings, right up until something asked
for the original bytes:

    app.core.url_guard.UnsafeURLError: Stored file no longer exists

A re-analysis then destroyed the document's chunks before discovering the
source was gone, which turned a recoverable situation into data loss.
"""

import os

import pytest

from app.core.url_guard import UnsafeURLError, storage_key_from_url
from app.services import object_storage

pytestmark = pytest.mark.unit


# ── Key extraction ─────────────────────────────────────────────────────────────


def test_storage_key_from_storage_url():
    assert storage_key_from_url("storage://abc123.pdf") == "abc123.pdf"


def test_storage_key_from_legacy_file_url():
    """Older rows hold an absolute path; only the basename is a usable key."""
    assert storage_key_from_url("file:///app/uploads/abc123.pdf") == "abc123.pdf"


def test_storage_key_rejects_external_url():
    with pytest.raises(UnsafeURLError):
        storage_key_from_url("https://example.com/abc123.pdf")


def test_storage_key_rejects_empty_key():
    with pytest.raises(UnsafeURLError):
        storage_key_from_url("storage://")


# ── Configuration gating ───────────────────────────────────────────────────────


def test_not_configured_without_credentials(monkeypatch):
    monkeypatch.setattr(object_storage.settings, "SUPABASE_URL", "")
    monkeypatch.setattr(object_storage.settings, "SUPABASE_SERVICE_KEY", "")
    assert object_storage.is_configured() is False


def test_not_configured_with_only_a_url(monkeypatch):
    """A URL without a key cannot authenticate, so it is not usable."""
    monkeypatch.setattr(
        object_storage.settings, "SUPABASE_URL", "https://x.supabase.co"
    )
    monkeypatch.setattr(object_storage.settings, "SUPABASE_SERVICE_KEY", "")
    assert object_storage.is_configured() is False


def test_configured_with_both(monkeypatch):
    monkeypatch.setattr(
        object_storage.settings, "SUPABASE_URL", "https://x.supabase.co"
    )
    monkeypatch.setattr(object_storage.settings, "SUPABASE_SERVICE_KEY", "svc-key")
    assert object_storage.is_configured() is True


@pytest.mark.asyncio
async def test_unconfigured_calls_are_inert(monkeypatch):
    """
    With no credentials the module must not attempt any network call, so local
    development and CI keep working exactly as before.
    """
    monkeypatch.setattr(object_storage.settings, "SUPABASE_URL", "")
    monkeypatch.setattr(object_storage.settings, "SUPABASE_SERVICE_KEY", "")

    assert await object_storage.put_object("k.pdf", b"data", "application/pdf") is False
    assert await object_storage.get_object("k.pdf") is None
    await object_storage.delete_object("k.pdf")  # must not raise


# ── Recovery after the local copy is lost ──────────────────────────────────────


@pytest.mark.asyncio
async def test_missing_local_file_is_restored_from_durable_storage(
    monkeypatch, tmp_path
):
    """The exact scenario that lost a document in production."""
    from app.services import extractors

    monkeypatch.setattr(extractors.settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(object_storage, "is_configured", lambda: True)

    async def fake_get(key):
        assert key == "abc123.pdf"
        return b"%PDF-1.4 recovered"

    monkeypatch.setattr(object_storage, "get_object", fake_get)

    data = await extractors._restore_from_durable_storage(
        "storage://abc123.pdf", max_bytes=1024
    )

    assert data == b"%PDF-1.4 recovered"
    # The local cache is repopulated so the next read does not go over the wire.
    assert (tmp_path / "abc123.pdf").read_bytes() == b"%PDF-1.4 recovered"


@pytest.mark.asyncio
async def test_missing_everywhere_reports_the_original_failure(monkeypatch, tmp_path):
    from app.services import extractors

    monkeypatch.setattr(extractors.settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(object_storage, "is_configured", lambda: True)

    async def fake_get(key):
        return None

    monkeypatch.setattr(object_storage, "get_object", fake_get)

    with pytest.raises(UnsafeURLError, match="no longer exists"):
        await extractors._restore_from_durable_storage(
            "storage://gone.pdf", max_bytes=1024
        )


@pytest.mark.asyncio
async def test_unconfigured_recovery_explains_how_to_fix_it(monkeypatch, tmp_path):
    """
    An operator reading this error should learn why the file vanished and what
    to set so it stops happening, not just that it is absent.
    """
    from app.services import extractors

    monkeypatch.setattr(extractors.settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(object_storage, "is_configured", lambda: False)

    with pytest.raises(UnsafeURLError) as exc:
        await extractors._restore_from_durable_storage(
            "storage://gone.pdf", max_bytes=1024
        )

    message = str(exc.value)
    assert "SUPABASE_URL" in message
    assert "restart" in message


@pytest.mark.asyncio
async def test_oversized_restored_file_is_rejected(monkeypatch, tmp_path):
    """The size cap must hold on the recovery path too, not just on upload."""
    from app.services import extractors

    monkeypatch.setattr(extractors.settings, "UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr(object_storage, "is_configured", lambda: True)

    async def fake_get(key):
        return b"x" * 5000

    monkeypatch.setattr(object_storage, "get_object", fake_get)

    with pytest.raises(UnsafeURLError, match="maximum allowed size"):
        await extractors._restore_from_durable_storage(
            "storage://big.pdf", max_bytes=1024
        )

    assert not os.path.exists(tmp_path / "big.pdf")
