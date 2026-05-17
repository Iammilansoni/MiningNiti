"""
Common Schemas
Shared response models and utilities
"""

from typing import Optional, List, Generic, TypeVar, Any
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: dict = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    code: str
    details: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int
    has_next: bool
    has_prev: bool


class JobStatusResponse(BaseModel):
    """Background job status response"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: Optional[int] = None  # 0-100
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class SuccessResponse(BaseModel):
    """Generic success response"""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
