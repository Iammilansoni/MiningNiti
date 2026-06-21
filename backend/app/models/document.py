"""
Document Models
Document storage, classification, and embeddings
"""

import uuid
from enum import Enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.models.base import Base, UUIDMixin, TimestampMixin


class DocumentCategory(str, Enum):
    """Mining document categories for classification"""
    SAFETY_PROTOCOL = "safety_protocol"
    EQUIPMENT_MANUAL = "equipment_manual"
    REGULATORY = "regulatory"
    INCIDENT_REPORT = "incident_report"
    GEOLOGICAL = "geological"
    ENVIRONMENTAL = "environmental"
    TRAINING = "training"
    PERMIT = "permit"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class DocumentStatus(str, Enum):
    """Document processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class ComplianceStatus(str, Enum):
    """Safety compliance status"""
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    PENDING = "pending"
    NOT_APPLICABLE = "not_applicable"


class Document(Base, UUIDMixin, TimestampMixin):
    """
    Document model with AI-enhanced metadata.
    Stores file info, classification, safety analysis, and extracted entities.
    """
    
    __tablename__ = "documents"
    
    # Owner
    user_id = Column(String(255), ForeignKey("users.clerk_user_id"), nullable=False, index=True)
    
    # File information
    title = Column(String(500), nullable=False)
    file_name = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    file_type = Column(String(100), nullable=False)  # MIME type
    file_url = Column(Text, nullable=False)
    
    # Processing status
    status = Column(
        SQLEnum(DocumentStatus),
        default=DocumentStatus.PENDING,
        nullable=False,
        index=True
    )
    processing_error = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    
    # Extracted content
    content = Column(Text, nullable=True)  # Full text content
    page_count = Column(Integer, nullable=True)   # deprecated alias — use total_pages
    total_pages = Column(Integer, nullable=True)  # authoritative page count from extractor
    word_count = Column(Integer, nullable=True)
    
    # AI Classification
    category = Column(
        SQLEnum(DocumentCategory),
        default=DocumentCategory.OTHER,
        nullable=True,
        index=True
    )
    subcategory = Column(String(100), nullable=True)
    classification_confidence = Column(Float, nullable=True)  # 0.0 - 1.0
    
    # AI Summary
    summary = Column(Text, nullable=True)  # AI-generated summary
    key_points = Column(JSONB, nullable=True)  # List of key points
    
    # Safety Analysis
    safety_score = Column(Float, nullable=True)  # 0-100
    compliance_status = Column(
        SQLEnum(ComplianceStatus),
        default=ComplianceStatus.PENDING,
        nullable=True
    )
    hazards_detected = Column(JSONB, nullable=True)  # List of hazards
    safety_recommendations = Column(JSONB, nullable=True)
    
    # Named Entity Recognition
    entities = Column(JSONB, nullable=True)
    # Structure:
    # {
    #   "equipment": ["Caterpillar D11", "Komatsu PC8000"],
    #   "chemicals": ["methane", "coal dust"],
    #   "locations": ["Mine Site A", "Section 4B"],
    #   "personnel": ["John Smith", "Safety Team"],
    #   "dates": ["2024-01-15", "Q1 2024"],
    #   "regulations": ["MSHA 30 CFR 75.400", "OSHA 1910.134"]
    # }
    
    # Extra Metadata
    extra_metadata = Column("metadata", JSONB, default=dict)
    tags = Column(JSONB, default=list)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    embeddings = relationship("DocumentEmbedding", back_populates="document", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Document {self.title[:50]}...>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": str(self.id),
            "title": self.title,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "file_url": self.file_url,
            "status": self.status.value if self.status else None,
            "category": self.category.value if self.category else None,
            "subcategory": self.subcategory,
            "classification_confidence": self.classification_confidence,
            "summary": self.summary,
            "key_points": self.key_points,
            "safety_score": self.safety_score,
            "compliance_status": self.compliance_status.value if self.compliance_status else None,
            "hazards_detected": self.hazards_detected,
            "entities": self.entities,
            "page_count": self.page_count,
            "word_count": self.word_count,
            "created_at": self.created_at.replace(tzinfo=timezone.utc).isoformat() if self.created_at else None,
            "processed_at": self.processed_at.replace(tzinfo=timezone.utc).isoformat() if self.processed_at else None,
        "total_pages": self.total_pages or self.page_count,
        }


class DocumentEmbedding(Base, UUIDMixin):
    """
    Vector embeddings for document chunks.
    Used for semantic search and RAG.

    The embedding column uses pgvector's native Vector(768) type with an
    HNSW index (see migration 001) for sub-5ms approximate nearest-neighbor
    search instead of brute-force Python cosine similarity.
    """
    
    __tablename__ = "document_embeddings"
    
    # Parent document
    document_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Chunk information
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)

    # Vector embedding — native pgvector type with HNSW index (see migration 001)
    # Replaces the old JSONB column for 10-100x faster similarity search.
    embedding = Column(Vector(768), nullable=False)
    embedding_model = Column(String(100), default="text-embedding-004")

    # Context metadata — powers context-aware answers with page citations
    section_title = Column(String(500), nullable=True)  # e.g. "Safety Procedures"
    page_numbers = Column(JSONB, nullable=True)          # e.g. [12, 13] — pages this chunk spans

    # Legacy page columns (kept for backward compat, use page_numbers instead)
    start_page = Column(Integer, nullable=True)
    end_page = Column(Integer, nullable=True)

    extra_metadata = Column("metadata", JSONB, default=dict)
    
    # Relationships
    document = relationship("Document", back_populates="embeddings")
    
    def __repr__(self):
        return f"<DocumentEmbedding doc={self.document_id} chunk={self.chunk_index}>"
