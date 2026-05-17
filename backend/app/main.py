"""
MiningNiti Enterprise Backend
FastAPI Application Entry Point

AI-Powered Document Intelligence for the Coal Mining Industry
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.api.v1 import api_router
from app.db.session import init_db, check_db_connection
from app.core.exceptions import MiningNitiException

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Check database connection
    if check_db_connection():
        logger.info("Database connection verified")
        # Auto-create tables on startup (idempotent)
        try:
            init_db()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.warning(f"Database table creation warning: {e}")
    else:
        logger.warning("Database connection failed - some features may not work")

    yield

    # Shutdown
    logger.info("Shutting down application")


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
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(MiningNitiException)
async def miningniti_exception_handler(request: Request, exc: MiningNitiException):
    """Handle custom application exceptions"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": exc.message,
            "code": exc.code,
            "details": exc.details,
            "timestamp": datetime.utcnow().isoformat()
        }
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
            "timestamp": datetime.utcnow().isoformat()
        }
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
            "timestamp": datetime.utcnow().isoformat()
        }
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
        "health": f"{settings.API_V1_PREFIX}/health"
    }


@app.get("/health", tags=["Root"])
async def health():
    """Quick health check for load balancers"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
