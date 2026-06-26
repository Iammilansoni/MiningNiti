"""
MiningNiti Enterprise Backend
FastAPI Application Entry Point

AI-Powered Document Intelligence for the Coal Mining Industry
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.v1 import api_router
from app.config import settings
from app.core.exceptions import MiningNitiException
from app.db.session import check_db_connection, init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Suppress SQLAlchemy's extremely verbose SQL echo in debug mode —
# it drowns out real application logs. Set to WARNING to only see errors.
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.dialects").setLevel(logging.WARNING)
# Also suppress httpcore connection-level debug spam
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    import asyncio

    from app.services.queue import compliance_worker, document_worker

    worker_task = asyncio.create_task(document_worker())
    compliance_worker_task = asyncio.create_task(compliance_worker())

    # Check database connection
    if check_db_connection():
        logger.info("Database connection verified")
        # Auto-create tables on startup (idempotent)
        try:
            init_db()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.warning(f"Database table creation warning: {e}")

        # Recovery: reset documents stuck in transient states from a previous crash/restart
        try:
            from app.db.session import get_db_context
            from app.models.document import Document, DocumentStatus

            with get_db_context() as db:
                stuck_docs = (
                    db.query(Document)
                    .filter(Document.status.in_(["processing", "analyzing"]))
                    .all()
                )
                if stuck_docs:
                    for doc in stuck_docs:
                        doc.status = DocumentStatus.PENDING
                        doc.processing_error = "Reset after server restart"
                    db.commit()
                    logger.info(
                        f"Recovery: reset {len(stuck_docs)} stuck document(s) to PENDING"
                    )
                else:
                    logger.info("Recovery: no stuck documents found")
        except Exception as e:
            logger.warning(f"Document recovery warning: {e}")

        # Recovery: reset compliance audits stuck in running state
        try:
            from app.models.compliance import AuditStatus, ComplianceAudit

            with get_db_context() as db:
                stuck_audits = (
                    db.query(ComplianceAudit)
                    .filter(ComplianceAudit.status.in_(["running"]))
                    .all()
                )
                if stuck_audits:
                    for audit in stuck_audits:
                        audit.status = AuditStatus.PENDING
                        audit.processing_error = "Reset after server restart"
                    db.commit()
                    logger.info(
                        f"Recovery: reset {len(stuck_audits)} stuck audit(s) to PENDING"
                    )
        except Exception as e:
            logger.warning(f"Audit recovery warning: {e}")
    else:
        logger.warning("Database connection failed - some features may not work")

    yield

    # Shutdown
    logger.info("Shutting down application")
    worker_task.cancel()
    compliance_worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    try:
        await compliance_worker_task
    except asyncio.CancelledError:
        pass


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
## MiningNiti - AI Document Intelligence for Mining

Enterprise-grade document processing and AI chat platform 
specifically designed for the coal mining industry.

### Features
- 📄 **Smart Document Processing** - Upload PDF, DOCX, TXT with AI analysis
- 🤖 **Multi-Agent AI** - Classification, Safety Analysis, Entity Extraction
- 💬 **RAG Chat** - Context-aware conversations with document citations
- 📊 **Analytics Dashboard** - Safety metrics, compliance tracking
- 🔒 **Enterprise Security** - JWT auth, audit logging

### AI Agents
1. **Classifier Agent** - Categorizes mining documents
2. **Safety Analyzer** - Detects hazards and compliance issues
3. **Entity Extractor** - Extracts equipment, chemicals, regulations
4. **Summarizer** - Creates executive summaries
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

# CORS Configuration
_EXTRA_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + _EXTRA_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers


def _get_cors_headers(request: Request) -> dict:
    """
    Build CORS headers to attach to error responses.
    This is needed because FastAPI's HTTPBearer can short-circuit before
    CORSMiddleware has a chance to add Access-Control-Allow-Origin headers,
    causing the browser to report a CORS error instead of the real auth error.
    """
    origin = request.headers.get("origin", "")
    allowed_origins = settings.CORS_ORIGINS + _EXTRA_ORIGINS
    if origin in allowed_origins or any(
        origin.endswith(o.lstrip("*")) for o in allowed_origins if "*" in o
    ):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    return {}


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with CORS headers so auth failures are visible to the browser"""
    headers = {**(exc.headers or {}), **_get_cors_headers(request)}
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


@app.exception_handler(MiningNitiException)
async def miningniti_exception_handler(request: Request, exc: MiningNitiException):
    """Handle custom application exceptions"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.message,
            "code": exc.code,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat(),
        },
        headers=_get_cors_headers(request),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation failed",
            "code": "VALIDATION_ERROR",
            "details": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
        },
        headers=_get_cors_headers(request),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_SERVER_ERROR",
            "timestamp": datetime.utcnow().isoformat(),
        },
        headers=_get_cors_headers(request),
    )


# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint (without /api/v1 prefix for health checks)
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - application info"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI Document Intelligence for Mining Industry",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }


@app.get("/health", tags=["Root"])
async def health():
    """Quick health check for load balancers"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
