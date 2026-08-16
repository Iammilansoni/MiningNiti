"""
Health Check Endpoints
System health and status monitoring
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import check_db_connection, get_db
from app.schemas.common import HealthResponse

router = APIRouter()


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
async def health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with service status.
    Checks database connectivity and other services.
    """
    services = {"database": "unknown", "redis": "unknown", "ai": "unknown"}

    # Check database
    try:
        from sqlalchemy import text

        db.execute(text("SELECT 1"))
        services["database"] = "healthy"
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

    # AI providers.
    #
    # This is deliberately a configuration check, not a liveness check. The
    # previous version called genai.configure() and reported "healthy", which
    # proved nothing: configure() makes no network call and validates no key,
    # so it reported healthy with a garbage key and never touched Groq,
    # Cerebras or Mistral at all. A model this backend could no longer call
    # would still have shown green.
    #
    # It stays shallow because the keepalive workflow pings this endpoint on a
    # schedule and Groq's free tier allows only 8K tokens/minute — burning that
    # on health checks would starve real traffic. Use /health/providers to
    # actually call the providers.
    missing = [
        name
        for name, key in (
            ("gemini", settings.GEMINI_API_KEY),
            ("groq", settings.GROQ_API_KEY),
            ("cerebras", settings.CEREBRAS_API_KEY),
            ("mistral", settings.MISTRAL_API_KEY),
        )
        if not key
    ]
    services["ai"] = (
        "configured" if not missing else f"missing keys: {','.join(missing)}"
    )

    # Overall status
    overall = "healthy"
    if services["database"] != "healthy":
        overall = "degraded"

    return HealthResponse(
        status=overall,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        services=services,
    )


@router.get("/health/providers")
async def provider_check():
    """
    Actually call each LLM provider with a minimal request.

    /health only reports whether keys are present. This endpoint answers the
    question that matters after a model migration: does the model id this
    backend is configured with still exist and still serve us?

    That gap is not theoretical. Groq decommissioned llama-3.3-70b-versatile
    while it was hardcoded on both chat paths, and nothing — not the health
    check, not the test suite, which mocks every provider — could tell the
    difference between a working model and a retired one.

    Not wired into /health on purpose: this spends real tokens, and the
    keepalive workflow polls /health on a schedule. Call it by hand after a
    deploy or a model change.
    """
    from app.services.chat_service import CHAT_MODEL

    results: dict = {}

    async def _probe(name: str, client, model: str) -> None:
        try:
            resp = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
            )
            results[name] = {
                "model": model,
                "ok": True,
                "finish_reason": resp.choices[0].finish_reason,
            }
        except Exception as e:
            # The message carries the useful part — an unknown model id reads
            # very differently from an auth failure or a rate limit.
            results[name] = {"model": model, "ok": False, "error": str(e)[:300]}

    from app.services.llm_provider import get_cerebras_client, get_groq_client

    await _probe("groq", get_groq_client(), CHAT_MODEL)
    await _probe("cerebras", get_cerebras_client(), "gpt-oss-120b")

    all_ok = all(r["ok"] for r in results.values())
    return {
        "status": "ok" if all_ok else "degraded",
        "checked_at": datetime.utcnow().isoformat(),
        "providers": results,
    }
