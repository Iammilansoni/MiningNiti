"""
Pydantic Schemas
Request and response models for API validation
"""

from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    DocumentAnalysisResponse,
)
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatMessageResponse,
)
from app.schemas.analytics import (
    DashboardStats,
    DocumentAnalytics,
    SafetyAnalytics,
)
from app.schemas.common import (
    HealthResponse,
    ErrorResponse,
    PaginatedResponse,
    JobStatusResponse,
)

__all__ = [
    # Document
    "DocumentCreate",
    "DocumentResponse",
    "DocumentListResponse",
    "DocumentUploadResponse",
    "DocumentAnalysisResponse",
    # Chat
    "ChatRequest",
    "ChatResponse",
    "ChatSessionCreate",
    "ChatSessionResponse",
    "ChatMessageResponse",
    # Analytics
    "DashboardStats",
    "DocumentAnalytics",
    "SafetyAnalytics",
    # Common
    "HealthResponse",
    "ErrorResponse",
    "PaginatedResponse",
    "JobStatusResponse",
]
