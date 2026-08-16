"""
Durable object storage for uploaded documents.

Why this exists
---------------
Uploads were written to UPLOAD_DIR on the container's own filesystem. That
filesystem is ephemeral on HuggingFace Spaces: every rebuild or restart starts
from the image, so the directory comes back empty. The database rows survive
(Postgres is external), which makes the failure especially confusing — the
document still lists, still shows its analysis, and still answers questions
from its stored embeddings, right up until something needs the original bytes
again. Then:

    app.core.url_guard.UnsafeURLError: Stored file no longer exists

That is exactly what happened in production: a deploy restarted the Space,
every uploaded PDF went with it, and the next re-analysis destroyed the
document's chunks before discovering the source was gone.

The fix is to keep the bytes somewhere that outlives the container. Supabase
is already a dependency of this project for Postgres, and its Storage API is
plain HTTP, so this needs no new package — just httpx, which is already here.

Degrading gracefully
--------------------
If SUPABASE_URL / SUPABASE_SERVICE_KEY are not set, every function here
reports "not configured" and callers fall back to local disk exactly as
before. Nothing breaks; durability is simply not gained. This keeps local
development and the test suite working without cloud credentials.
"""

import logging
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# Uploads are capped at MAX_FILE_SIZE_MB, so a generous per-request timeout is
# still bounded. Cold Supabase connections occasionally take a few seconds.
_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


def is_configured() -> bool:
    """True when a durable bucket is available to store objects in."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY)


def _object_url(key: str) -> str:
    base = settings.SUPABASE_URL.rstrip("/")
    bucket = settings.SUPABASE_STORAGE_BUCKET
    return f"{base}/storage/v1/object/{bucket}/{key}"


def _headers() -> dict:
    # The service key is used rather than the anon key: this bucket is private
    # and the backend is the only thing that should read or write it.
    return {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_KEY,
    }


async def put_object(key: str, data: bytes, content_type: str) -> bool:
    """
    Store bytes under `key`. Returns True on success.

    Failure is logged and reported, never raised: an upload that reached local
    disk is still usable for the current container's lifetime, and refusing the
    whole upload because the durable copy failed would be a worse outcome than
    storing it with reduced durability.
    """
    if not is_configured():
        return False

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.post(
                _object_url(key),
                content=data,
                headers={
                    **_headers(),
                    "Content-Type": content_type,
                    # Objects are keyed by UUID and never rewritten, so an
                    # existing key means a retry of the same upload.
                    "x-upsert": "true",
                },
            )

        if response.status_code in (200, 201):
            logger.info("Stored %s in durable storage (%d bytes)", key, len(data))
            return True

        logger.error(
            "Durable storage rejected %s: %s %s",
            key,
            response.status_code,
            response.text[:200],
        )
        return False

    except Exception as exc:
        logger.error("Durable storage write failed for %s: %s", key, exc)
        return False


async def get_object(key: str) -> Optional[bytes]:
    """
    Fetch bytes for `key`, or None when unavailable.

    None covers both "not configured" and "not found", because the caller does
    the same thing in either case: fall back to local disk and, failing that,
    report the file as missing.
    """
    if not is_configured():
        return None

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.get(_object_url(key), headers=_headers())

        if response.status_code == 200:
            return response.content

        if response.status_code != 404:
            logger.error(
                "Durable storage read failed for %s: %s %s",
                key,
                response.status_code,
                response.text[:200],
            )
        return None

    except Exception as exc:
        logger.error("Durable storage read failed for %s: %s", key, exc)
        return None


async def delete_object(key: str) -> None:
    """Best-effort removal, so deleting a document does not leak storage."""
    if not is_configured():
        return

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            await client.delete(_object_url(key), headers=_headers())
    except Exception as exc:
        logger.warning("Durable storage delete failed for %s: %s", key, exc)
