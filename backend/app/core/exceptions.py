"""
Custom Exception Classes
Enterprise-grade error handling with proper HTTP status codes
"""

from typing import Any, Dict, Optional

from fastapi import HTTPException, status


class MiningNitiException(Exception):
    """Base exception for all MiningNiti errors"""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(HTTPException):
    """Raised when authentication fails"""

    def __init__(self, detail: str = "Authentication failed"):
        import logging

        logging.getLogger("app.core.exceptions").warning(
            f"AuthenticationError raised: {detail}"
        )
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class AuthorizationError(HTTPException):
    """Raised when user lacks permission"""

    def __init__(self, detail: str = "Permission denied"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundError(HTTPException):
    """Raised when resource is not found"""

    def __init__(self, resource: str = "Resource", resource_id: str = ""):
        detail = f"{resource} not found"
        if resource_id:
            detail = f"{resource} with id '{resource_id}' not found"
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ValidationError(HTTPException):
    """Raised when request validation fails"""

    def __init__(
        self, detail: str = "Validation failed", errors: Optional[list] = None
    ):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": detail, "errors": errors or []},
        )


class DocumentProcessingError(MiningNitiException):
    """Raised when document processing fails"""

    def __init__(self, message: str, document_id: Optional[str] = None):
        super().__init__(
            message=message,
            code="DOCUMENT_PROCESSING_ERROR",
            details={"document_id": document_id} if document_id else {},
        )


class AIServiceError(MiningNitiException):
    """Raised when AI service (Gemini) fails"""

    def __init__(self, message: str, service: str = "gemini"):
        super().__init__(
            message=message, code="AI_SERVICE_ERROR", details={"service": service}
        )


class RateLimitError(HTTPException):
    """Raised when rate limit is exceeded"""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )


class JobNotFoundError(NotFoundError):
    """Raised when background job is not found"""

    def __init__(self, job_id: str):
        super().__init__(resource="Job", resource_id=job_id)


class SafetyViolationError(MiningNitiException):
    """Raised when safety compliance check fails critically"""

    def __init__(self, message: str, violations: list):
        super().__init__(
            message=message, code="SAFETY_VIOLATION", details={"violations": violations}
        )
