"""
Chat Models
Chat sessions and messages with RAG context
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base, UUIDMixin, TimestampMixin


class ChatSession(Base, UUIDMixin, TimestampMixin):
    """
    Chat session for grouping related messages.
    Each session maintains context for the conversation.
    """
    
    __tablename__ = "chat_sessions"
    
    # Owner
    user_id = Column(String(255), ForeignKey("users.clerk_user_id"), nullable=False, index=True)
    
    # Session info
    title = Column(String(500), nullable=False, default="New Chat")
    
    # Context - selected documents for this session
    document_context = Column(JSONB, default=list)  # List of document IDs
    
    # Custom prompt if set
    system_prompt = Column(Text, nullable=True)
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")
    
    @property
    def message_count(self) -> int:
        return len(self.messages)
    
    def __repr__(self):
        return f"<ChatSession {self.title[:30]}...>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "title": self.title,
            "message_count": self.message_count,
            "document_context": self.document_context,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ChatMessage(Base, UUIDMixin):
    """
    Individual chat message with RAG source citations.
    """
    
    __tablename__ = "chat_messages"
    
    # Parent session
    session_id = Column(
        UUID(as_uuid=True),
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Message content
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    
    # RAG sources - documents/chunks used for this response
    sources = Column(JSONB, default=[])
    # Structure:
    # [
    #   {
    #     "document_id": "uuid",
    #     "document_title": "Safety Manual",
    #     "chunk_text": "...",
    #     "relevance_score": 0.95,
    #     "page": 5
    #   }
    # ]
    
    # AI metadata
    model_used = Column(String(100), nullable=True)
    tokens_used = Column(JSONB, nullable=True)  # {"input": 100, "output": 50}
    response_time_ms = Column(Integer, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    
    def __repr__(self):
        return f"<ChatMessage {self.role}: {self.content[:30]}...>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "role": self.role,
            "content": self.content,
            "sources": self.sources,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
