"""
Analysis result cache.

Running the document pipeline costs four LLM calls against free-tier budgets —
Groq allows 8K tokens/minute and 200K/day — so analysing the same content twice
is the most expensive avoidable thing the system does. Re-uploading a file,
re-queuing after a restart, and demoing the same PDF repeatedly all hit it.

Entries are keyed by a hash of the extracted text plus a pipeline version, so
the cache is content-addressed: identical text always maps to the same entry,
and changing a model or prompt makes every old entry unreachable without a
manual flush.

Redis is optional everywhere in this project. When it is not configured, every
function here degrades to a no-op and the pipeline runs exactly as before.
"""

import hashlib
import json
import logging
from typing import Any, Dict, Optional

import redis

from app.config import settings

logger = logging.getLogger(__name__)

# Bump this whenever an agent's model, prompt, or output shape changes.
# Old entries become unreachable rather than being served as stale analysis.
PIPELINE_VERSION = "v1-gpt-oss-120b"

_KEY_PREFIX = "analysis"
_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 days

# The agent sections a complete analysis must contain before it is worth storing.
_REQUIRED_SECTIONS = ("classification", "safety", "entities", "summary")

# Mirrors the optional-Redis pattern used in app/api/v1/analytics.py.
try:
    _client = redis.Redis.from_url(
        settings.REDIS_URL, decode_responses=True, socket_timeout=1
    )
except Exception:
    _client = None


def cache_key(text: str) -> str:
    """
    Content-addressed key for a document's analysis.

    Hashes the text itself rather than a document ID: two users uploading the
    same regulation should share one analysis, and a re-upload of an identical
    file should hit the same entry.
    """
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"{_KEY_PREFIX}:{PIPELINE_VERSION}:{digest}"


def _is_cacheable(results: Dict[str, Any]) -> bool:
    """
    Only complete, successful analyses are worth storing.

    Caching a failure would be actively harmful: the document would be stuck
    with a broken analysis for the full TTL, and re-analysing — which is exactly
    what a user does after a quota error — would keep returning the same
    failure instead of retrying. This is why no cache-bypass flag is needed on
    the reanalyze path.
    """
    if not results or results.get("error"):
        return False

    if results.get("metadata", {}).get("failed"):
        return False

    for section in _REQUIRED_SECTIONS:
        value = results.get(section)
        if not isinstance(value, dict):
            return False
        # Agents that failed or were rate-limited carry an error marker; the
        # orchestrator's "not_applicable" safety bypass is a real result.
        if value.get("error") or value.get("quota_exceeded"):
            return False
        if value.get("status") in ("error", "quota_exceeded"):
            return False

    return True


def get_cached_analysis(text: str) -> Optional[Dict[str, Any]]:
    """Return a previously cached analysis for this text, or None."""
    if _client is None or not text:
        return None

    try:
        raw = _client.get(cache_key(text))
    except Exception as e:
        logger.warning(f"Analysis cache read failed, running agents: {e}")
        return None

    if not raw:
        return None

    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError) as e:
        logger.warning(f"Analysis cache entry was not valid JSON, ignoring: {e}")
        return None


def set_cached_analysis(text: str, results: Dict[str, Any]) -> bool:
    """
    Store a completed analysis. Returns True if it was written.

    Never raises: a cache failure must not fail a document that analysed fine.
    """
    if _client is None or not text:
        return False

    if not _is_cacheable(results):
        logger.debug("Analysis incomplete or failed — not caching")
        return False

    try:
        _client.setex(cache_key(text), _TTL_SECONDS, json.dumps(results))
        return True
    except Exception as e:
        logger.warning(f"Analysis cache write failed: {e}")
        return False


def invalidate(text: str) -> bool:
    """Drop the cached analysis for this text, if any."""
    if _client is None or not text:
        return False

    try:
        return bool(_client.delete(cache_key(text)))
    except Exception as e:
        logger.warning(f"Analysis cache invalidate failed: {e}")
        return False
