"""
Audit Log Model
Enterprise compliance logging for all user actions
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import JSON, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
from sqlalchemy.dialects.postgresql import UUID

JSONB = JSON().with_variant(PG_JSONB, "postgresql")

from app.models.base import Base, UUIDMixin


class AuditAction(str, Enum):
    """Types of auditable actions"""

    # Document actions
    DOCUMENT_UPLOAD = "document.upload"
    DOCUMENT_VIEW = "document.view"
    DOCUMENT_DELETE = "document.delete"
    DOCUMENT_PROCESS = "document.process"

    # Chat actions
    CHAT_CREATE = "chat.create"
    CHAT_MESSAGE = "chat.message"
    CHAT_DELETE = "chat.delete"

    # User actions
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    USER_PROFILE_UPDATE = "user.profile_update"

    # Admin actions
    ADMIN_ACTION = "admin.action"

    # System actions
    SYSTEM_ERROR = "system.error"
    AI_ANALYSIS = "ai.analysis"


class AuditLog(Base, UUIDMixin):
    """
    Immutable audit log for enterprise compliance.
    Tracks all user actions and system events.
    """

    __tablename__ = "audit_logs"

    # Who
    user_id = Column(
        String(255), nullable=True, index=True
    )  # Nullable for system events
    user_email = Column(String(255), nullable=True)

    # What
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)  # document, chat, user
    resource_id = Column(String(255), nullable=True)

    # Details
    description = Column(Text, nullable=True)
    details = Column(JSONB, default={})
    # Example details:
    # {
    #   "file_name": "safety_manual.pdf",
    #   "file_size": 1024000,
    #   "category": "safety_protocol"
    # }

    # When
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Where
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)

    # Outcome
    success = Column(String(10), default="true")  # true, false, partial
    error_message = Column(Text, nullable=True)

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user_id}>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "description": self.description,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "success": self.success,
        }


def create_audit_log(
    action: str,
    user_id: str = None,
    user_email: str = None,
    resource_type: str = None,
    resource_id: str = None,
    description: str = None,
    details: dict = None,
    ip_address: str = None,
    user_agent: str = None,
    success: str = "true",
    error_message: str = None,
) -> AuditLog:
    """
    Factory function to create audit log entries.

    Usage:
        log = create_audit_log(
            action=AuditAction.DOCUMENT_UPLOAD.value,
            user_id=current_user.id,
            resource_type="document",
            resource_id=str(doc.id),
            details={"file_name": doc.file_name}
        )
        db.add(log)
    """
    return AuditLog(
        action=action,
        user_id=user_id,
        user_email=user_email,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent,
        success=success,
        error_message=error_message,
    )
