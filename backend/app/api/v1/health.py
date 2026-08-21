"""
Health Check Endpoints
System health and status monitoring
"""

import asyncio
import time
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import check_db_connection, get_db
from app.schemas.common import HealthResponse

router = APIRouter()

# ── Provider liveness ─────────────────────────────────────────────────────────
#
# /health used to report the AI subsystem as "configured" purely because API
# keys were present. That is not a health check: in production Cerebras was
# returning 402 payment_required on every call while /health still said
# "healthy", and only /health/providers — which nothing polls — knew.
#
# So both endpoints now share the real ping below. The constraints that kept
# the pings out of /health are handled rather than avoided:
#
#   * Cost — the result is memoised in-process for _PROVIDER_CACHE_TTL seconds,
#     so the keepalive cron (every 30 min) and any load-balancer probe cost at
#     most one ping per provider per minute, and bursts of probes cost nothing.
#   * Latency — probes run concurrently under a hard timeout; a hung provider
#     is reported as failed instead of hanging the endpoint.
#
# The cheap static probe used by the Dockerfile HEALTHCHECK is the plain
# /health in app/main.py. It stays free of network calls on purpose.

_PROVIDER_PING_TIMEOUT = 4.0  # seconds — per provider, hard ceiling
_PROVIDER_CACHE_TTL = 60.0  # seconds — memoise the whole result set

_provider_cache: Dict[str, Any] = {"checked_at_monotonic": None, "result": None}
_provider_lock = asyncio.Lock()


async def _probe(name: str, client, model: str, api_key: str) -> Dict[str, Any]:
    """
    Call one provider with a 1-token request and report what happened.

    Never raises: a probe failure is a result, not an error.
    """
    if not api_key:
        return {"model": model, "ok": False, "error": "API key not configured"}

    try:
        resp = await asyncio.wait_for(
            client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
            ),
            timeout=_PROVIDER_PING_TIMEOUT,
        )
        return {
            "model": model,
            "ok": True,
            "finish_reason": resp.choices[0].finish_reason,
        }
    except asyncio.TimeoutError:
        # A provider that cannot answer a 1-token request inside the timeout
        # cannot serve a document analysis either. Treat it as down.
        return {
            "model": model,
            "ok": False,
            "error": f"timed out after {_PROVIDER_PING_TIMEOUT}s",
        }
    except Exception as e:
        # The message carries the useful part — an unknown model id reads
        # very differently from an auth failure, a 402 or a rate limit.
        return {"model": model, "ok": False, "error": str(e)[:300]}


async def check_providers(use_cache: bool = True) -> Dict[str, Any]:
    """
    Liveness of every LLM provider this backend actually calls.

    Returns ``{"status": "ok"|"degraded", "checked_at": iso8601,
    "providers": {name: {"model", "ok", ...}}, "cached": bool}``.

    Shared by /health and /health/providers so there is exactly one definition
    of "is the AI working".
    """
    from app.services.chat_service import CHAT_MODEL
    from app.services.llm_provider import get_cerebras_client, get_groq_client

    now = time.monotonic()
    if use_cache:
        checked_at = _provider_cache["checked_at_monotonic"]
        if checked_at is not None and (now - checked_at) < _PROVIDER_CACHE_TTL:
            return {**_provider_cache["result"], "cached": True}

    async with _provider_lock:
        # Re-check under the lock: while we waited, a concurrent probe may
        # have filled the cache. Without this, a burst of simultaneous probes
        # would each fire their own round of provider calls.
        now = time.monotonic()
        if use_cache:
            checked_at = _provider_cache["checked_at_monotonic"]
            if checked_at is not None and (now - checked_at) < _PROVIDER_CACHE_TTL:
                return {**_provider_cache["result"], "cached": True}

        targets = [
            ("groq", get_groq_client(), CHAT_MODEL, settings.GROQ_API_KEY),
            (
                "cerebras",
                get_cerebras_client(),
                "gpt-oss-120b",
                settings.CEREBRAS_API_KEY,
            ),
        ]

        probed = await asyncio.gather(*(_probe(*t) for t in targets))
        results = {name: outcome for (name, *_), outcome in zip(targets, probed)}

        result = {
            "status": "ok" if all(r["ok"] for r in results.values()) else "degraded",
            "checked_at": datetime.utcnow().isoformat(),
            "providers": results,
        }
        _provider_cache["result"] = result
        _provider_cache["checked_at_monotonic"] = time.monotonic()

    return {**result, "cached": False}


def _summarise_providers(provider_result: Dict[str, Any]) -> str:
    """One-line, human-readable rendering of the provider probe for services.ai."""
    failed = [
        f"{name} ({info.get('error', 'unknown error')})"
        for name, info in provider_result["providers"].items()
        if not info["ok"]
    ]
    if not failed:
        return "healthy"
    return "degraded: " + "; ".join(failed)


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - basic health check"""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
    )


@router.get("/health", response_model=HealthResponse)
async def health_check(response: Response, db: Session = Depends(get_db)):
    """
    Detailed health check with service status.

    Checks the database, the optional Redis cache, and — for real, not by
    inspecting environment variables — whether the LLM providers answer.

    Status semantics:
      * ``healthy``   — database up, every provider answering.
      * ``degraded``  — database up, at least one provider failing. Still 200:
        the keepalive cron and load-balancer probes treat non-200 as "restart
        the Space", and a provider quota problem is not fixed by a restart.
      * ``unhealthy`` — database unreachable. Returns 503.

    Redis being ``not_configured`` never changes the overall status. It is an
    optional cache and is deliberately unset in production.
    """
    services: Dict[str, Any] = {
        "database": "unknown",
        "redis": "unknown",
        "ai": "unknown",
    }

    # Check database
    db_ok = False
    try:
        from sqlalchemy import text

        db.execute(text("SELECT 1"))
        services["database"] = "healthy"
        db_ok = True
    except Exception as e:
        services["database"] = f"unhealthy: {str(e)}"

    # Check Redis (if configured)
    r = None
    try:
        import redis

        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        services["redis"] = "healthy"
    except Exception:
        services["redis"] = "not_configured"
    finally:
        if r is not None:
            r.close()

    # AI providers — a real 1-token call per provider, memoised for 60s and
    # bounded by a timeout so this endpoint stays fast and cheap.
    provider_result = await check_providers()
    services["ai"] = _summarise_providers(provider_result)
    services["ai_providers"] = provider_result["providers"]
    services["ai_checked_at"] = provider_result["checked_at"]

    if not db_ok:
        overall = "unhealthy"
        response.status_code = 503
    elif provider_result["status"] != "ok":
        overall = "degraded"
    else:
        overall = "healthy"

    return HealthResponse(
        status=overall,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        services=services,
    )


@router.get("/health/providers")
async def provider_check(fresh: bool = False):
    """
    Actually call each LLM provider with a minimal request.

    This answers the question that matters after a model migration: does the
    model id this backend is configured with still exist and still serve us?

    That gap is not theoretical. Groq decommissioned llama-3.3-70b-versatile
    while it was hardcoded on both chat paths, and nothing — not the health
    check, not the test suite, which mocks every provider — could tell the
    difference between a working model and a retired one.

    Shares its result with /health through a 60s in-process cache. Pass
    ``?fresh=true`` to bypass the cache and force a live round of pings.
    """
    return await check_providers(use_cache=not fresh)
