"""
Common Schemas
Shared response models and utilities
"""

from datetime import datetime, timezone
from typing import Annotated, Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, BeforeValidator, Field

T = TypeVar("T")


def _stamp_utc_if_naive(value: Any) -> Any:
    """
    Every timestamp column in this app (TimestampMixin, ComplianceAudit,
    etc.) is stored as a naive Python datetime produced by
    ``datetime.utcnow()`` — a real UTC instant, but with no ``tzinfo``
    attached. Pydantic v2 serializes a naive datetime's ``.isoformat()``
    with no UTC offset suffix (e.g. "2026-09-11T09:23:34.701307" instead
    of "...+00:00"), and the ECMAScript Date Time String Format spec says
    an offset-less date-time string is parsed as *local* time, not UTC —
    so every browser not itself in UTC shows every timestamp in the app
    shifted by its own UTC offset. A browser in India (UTC+5:30) showed a
    compliance audit as completing "about 6 hours ago" seconds after it
    actually finished.

    This validator runs before Pydantic's own datetime parsing: it leaves
    an already-aware datetime alone, and stamps a naive one as UTC (which
    is what it always actually is here), so the value Pydantic ends up
    serializing already carries the offset. Apply the ``UtcDatetime``
    alias below to any response-schema datetime field instead of using
    ``datetime`` directly.
    """
    if isinstance(value, datetime) and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


UtcDatetime = Annotated[datetime, BeforeValidator(_stamp_utc_if_naive)]


class HealthResponse(BaseModel):
    """Health check response"""

    status: str = "healthy"
    version: str
    environment: str
    timestamp: UtcDatetime = Field(default_factory=datetime.utcnow)
    services: dict = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standard error response"""

    error: str
    code: str
    details: Optional[dict] = None
    timestamp: UtcDatetime = Field(default_factory=datetime.utcnow)


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
    created_at: UtcDatetime
    updated_at: Optional[UtcDatetime] = None
    completed_at: Optional[UtcDatetime] = None


class SuccessResponse(BaseModel):
    """Generic success response"""

    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
