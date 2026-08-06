"""
MiningNiti Enterprise Backend
FastAPI Application Entry Point

AI-Powered Document Intelligence for the Coal Mining Industry
"""

import logging
import re
from contextlib import asynccontextmanager
from datetime import datetime, timezone

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
from app.core.url_guard import UnsafeURLError
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


# Arbitrary but fixed key so every replica contends for the same lock.
_RECOVERY_LOCK_KEY = 8712_2024


async def _recover_interrupted_work() -> None:
    """
    Requeue work that was in flight when the process last died.

    Two things were previously wrong here:

    1. Rows were reset to PENDING but never re-enqueued. Nothing scans for
       PENDING documents — enqueue_document_task() is only called from the
       upload/create/reanalyze endpoints — so "recovered" documents sat at
       pending forever and needed a manual re-analyze.

    2. With more than one worker process, every replica ran recovery
       concurrently and would requeue the same rows N times. A Postgres
       advisory lock now elects a single recoverer; the others skip.
    """
    from sqlalchemy import text

    from app.db.session import get_db_context
    from app.models.compliance import AuditStatus, ComplianceAudit
    from app.models.document import Document, DocumentStatus
    from app.services.queue import enqueue_compliance_task, enqueue_document_task

    # Advisory locks are a PostgreSQL feature. On SQLite (unit tests) there is
    # only ever one process, so the election is unnecessary.
    try:
        with get_db_context() as db:
            # Ask the session we actually got, not the module-level engine —
            # they can differ (tests inject a SQLite session while DATABASE_URL
            # points at PostgreSQL), and issuing pg_try_advisory_lock against
            # the wrong backend fails the whole recovery.
            use_lock = db.get_bind().dialect.name == "postgresql"

            if use_lock:
                acquired = db.execute(
                    text("SELECT pg_try_advisory_lock(:key)"),
                    {"key": _RECOVERY_LOCK_KEY},
                ).scalar()

                if not acquired:
                    logger.info("Recovery: another worker holds the lock, skipping")
                    return

            try:
                stuck_docs = (
                    db.query(Document)
                    .filter(
                        Document.status.in_(
                            [DocumentStatus.PROCESSING, DocumentStatus.ANALYZING]
                        )
                    )
                    .all()
                )
                doc_ids = [str(doc.id) for doc in stuck_docs]
                for doc in stuck_docs:
                    doc.status = DocumentStatus.PENDING
                    doc.processing_error = "Reset after server restart"

                stuck_audits = (
                    db.query(ComplianceAudit)
                    .filter(ComplianceAudit.status == AuditStatus.RUNNING)
                    .all()
                )
                audit_ids = [str(a.id) for a in stuck_audits]
                for audit in stuck_audits:
                    audit.status = AuditStatus.PENDING
                    audit.processing_error = "Reset after server restart"

                db.commit()
            finally:
                if use_lock:
                    db.execute(
                        text("SELECT pg_advisory_unlock(:key)"),
                        {"key": _RECOVERY_LOCK_KEY},
                    )

        # Requeue only after the reset is durably committed, so a crash here
        # leaves rows in PENDING for the next startup rather than in a state
        # no one will pick up.
        for document_id in doc_ids:
            enqueue_document_task(document_id)
        for audit_id in audit_ids:
            await enqueue_compliance_task(audit_id)

        if doc_ids or audit_ids:
            logger.info(
                f"Recovery: requeued {len(doc_ids)} document(s) and "
                f"{len(audit_ids)} audit(s) interrupted by the last restart"
            )
        else:
            logger.info("Recovery: nothing was interrupted")

    except Exception as e:
        # Recovery is best-effort; a failure here must not stop the app booting.
        logger.warning(f"Recovery failed: {e}", exc_info=True)


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

        await _recover_interrupted_work()
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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS. Exact origins go in allow_origins; patterns (Vercel previews) go in
# allow_origin_regex — Starlette does NOT expand '*' inside allow_origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)


# Exception Handlers


def _get_cors_headers(request: Request) -> dict:
    """
    Build CORS headers for the *unhandled* exception path only.

    Responses from FastAPI's normal exception handlers pass back out through
    CORSMiddleware, which attaches the headers itself — duplicating that logic
    here is how the two implementations drifted apart in the first place. But
    the catch-all Exception handler is installed in ServerErrorMiddleware,
    which sits *outside* CORSMiddleware, so a 500 would otherwise reach the
    browser with no CORS headers and surface as a misleading CORS error.
    """
    origin = request.headers.get("origin", "")
    if not origin:
        return {}

    allowed = origin in settings.CORS_ORIGINS
    if not allowed and settings.CORS_ORIGIN_REGEX:
        allowed = bool(re.fullmatch(settings.CORS_ORIGIN_REGEX, origin))

    if allowed:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Vary": "Origin",
        }
    return {}


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions. CORSMiddleware attaches the CORS headers."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers or None,
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
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(UnsafeURLError)
async def unsafe_url_exception_handler(request: Request, exc: UnsafeURLError):
    """A URL was rejected by the SSRF guard — that is a client error, not a bug."""
    logger.warning(f"Blocked unsafe URL request: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": str(exc),
            "code": "UNSAFE_URL",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
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
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    # This handler runs outside CORSMiddleware, so the headers are added by hand.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_SERVER_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat(),
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
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
