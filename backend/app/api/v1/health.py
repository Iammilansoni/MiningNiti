"""
Health Check Endpoints
System health and status monitoring
"""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db, check_db_connection
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - basic health check"""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow()
    )


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Session = Depends(get_db)):
    """
    Detailed health check with service status.
    Checks database connectivity and other services.
    """
    services = {
        "database": "unknown",
        "redis": "unknown",
        "ai": "unknown"
    }
    
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
    
    # Check AI service (Gemini)
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        services["ai"] = "healthy"
    except Exception:
        services["ai"] = "not_configured"
    
    # Overall status
    overall = "healthy"
    if services["database"] != "healthy":
        overall = "degraded"
    
    return HealthResponse(
        status=overall,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        services=services
    )
