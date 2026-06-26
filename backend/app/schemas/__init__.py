"""
Pydantic Schemas
Request and response models for API validation
"""

from app.schemas.analytics import DashboardStats, DocumentAnalytics, SafetyAnalytics
from app.schemas.chat import (
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.schemas.common import (
    ErrorResponse,
    HealthResponse,
    JobStatusResponse,
    PaginatedResponse,
)
from app.schemas.document import (
    DocumentAnalysisResponse,
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUploadResponse,
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
