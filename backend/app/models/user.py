"""
User Model
User profile and organization management
"""

import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
from sqlalchemy.dialects.postgresql import UUID

JSONB = JSON().with_variant(PG_JSONB, "postgresql")
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    """
    User model linked to Clerk authentication.
    Stores user profile and preferences.
    """

    __tablename__ = "users"

    # Clerk integration
    clerk_user_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)

    # Profile
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)

    # Organization/Company (for enterprise)
    company_name = Column(String(255), nullable=True)
    company_role = Column(
        String(100), nullable=True
    )  # Safety Officer, Engineer, Manager

    # Mining-specific
    industry_focus = Column(JSONB, nullable=True)  # ["coal", "underground", "surface"]
    mine_sites = Column(JSONB, nullable=True)  # Associated mine sites

    # Preferences
    preferences = Column(JSONB, default={})

    # Status
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    documents = relationship(
        "Document", back_populates="user", cascade="all, delete-orphan"
    )
    chat_sessions = relationship(
        "ChatSession", back_populates="user", cascade="all, delete-orphan"
    )
    custom_prompts = relationship(
        "CustomPrompt", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email or self.clerk_user_id}>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "clerk_user_id": self.clerk_user_id,
            "email": self.email,
            "full_name": self.full_name,
            "company_name": self.company_name,
            "company_role": self.company_role,
            "industry_focus": self.industry_focus,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
