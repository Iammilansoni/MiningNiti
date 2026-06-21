"""
Custom Prompt Model
User-defined AI prompts for specialized mining document analysis
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class CustomPrompt(Base, UUIDMixin, TimestampMixin):
    """
    User-defined custom prompts for AI analysis.
    Allows users to save specialized prompts for safety reviews,
    compliance checks, equipment inspections, etc.
    """

    __tablename__ = "custom_prompts"

    # Owner
    user_id = Column(String(255), ForeignKey("users.clerk_user_id"), nullable=False, index=True)

    # Prompt info
    name = Column(String(255), nullable=False)
    prompt_text = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    # Category/type for UI grouping
    category = Column(String(100), nullable=True)  # e.g., "safety", "compliance", "equipment"

    # Whether this is a default/system prompt
    is_default = Column(Boolean, default=False, nullable=False)

    # Usage tracking
    use_count = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="custom_prompts")

    def __repr__(self):
        return f"<CustomPrompt {self.name}>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "name": self.name,
            "prompt": self.prompt_text,
            "description": self.description,
            "category": self.category,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
