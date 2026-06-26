"""
Compliance Audit Models
Regulatory compliance auto-auditor: cross-references operational documents
against regulatory documents (MSHA/OSHA/EPA/DGMS) to produce per-clause
compliance matrices with citations.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import JSON, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB
from sqlalchemy.dialects.postgresql import UUID

JSONB = JSON().with_variant(PG_JSONB, "postgresql")
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class AuditStatus(str, Enum):
    """Compliance audit processing status"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ComplianceAudit(Base, UUIDMixin, TimestampMixin):
    """
    A compliance audit that cross-references one regulatory document
    against a set of operational documents.
    """

    __tablename__ = "compliance_audits"

    # Owner
    user_id = Column(
        String(255),
        ForeignKey("users.clerk_user_id"),
        nullable=False,
        index=True,
    )

    title = Column(String(500), nullable=False)

    # The regulatory document being audited against
    regulation_doc_id = Column(
        UUID(as_uuid=True),
        ForeignKey("documents.id"),
        nullable=False,
    )

    # List of operational document UUIDs being audited
    operational_doc_ids = Column(JSONB, nullable=False, default=list)

    # Status
    status = Column(
        SQLEnum(AuditStatus),
        default=AuditStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Aggregate stats
    total_clauses = Column(Integer, nullable=True)
    processed_clauses = Column(Integer, default=0, nullable=False)
    compliant_count = Column(Integer, nullable=True)
    gap_count = Column(Integer, nullable=True)
    missing_count = Column(Integer, nullable=True)
    overall_score = Column(Float, nullable=True)  # 0-100

    processing_error = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    rows = relationship(
        "ComplianceMatrixRow",
        back_populates="audit",
        cascade="all, delete-orphan",
    )
    regulation_doc = relationship(
        "Document",
        foreign_keys=[regulation_doc_id],
    )

    def __repr__(self):
        return f"<ComplianceAudit {self.title[:50]}... status={self.status.value}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "regulation_doc_id": str(self.regulation_doc_id),
            "operational_doc_ids": [str(d) for d in (self.operational_doc_ids or [])],
            "status": self.status.value if self.status else None,
            "total_clauses": self.total_clauses,
            "processed_clauses": self.processed_clauses,
            "compliant_count": self.compliant_count,
            "gap_count": self.gap_count,
            "missing_count": self.missing_count,
            "overall_score": self.overall_score,
            "processing_error": self.processing_error,
            "completed_at": (
                self.completed_at.replace(tzinfo=timezone.utc).isoformat()
                if self.completed_at
                else None
            ),
            "created_at": (
                self.created_at.replace(tzinfo=timezone.utc).isoformat()
                if self.created_at
                else None
            ),
        }


class ComplianceMatrixRow(Base, UUIDMixin):
    """
    A single row in the compliance matrix: one regulation clause
    assessed against operational document evidence.
    """

    __tablename__ = "compliance_matrix_rows"

    audit_id = Column(
        UUID(as_uuid=True),
        ForeignKey("compliance_audits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    clause_index = Column(Integer, nullable=False)
    clause_text = Column(Text, nullable=False)
    section_title = Column(String(500), nullable=True)

    # compliant | gap | missing
    status = Column(String(50), nullable=False)
    assessment = Column(Text, nullable=False)  # LLM explanation
    confidence = Column(Float, nullable=False)  # 0.0-1.0

    # Evidence chunks that informed the assessment
    evidence_chunks = Column(JSONB, nullable=True)
    # Structure: [{"chunk_text": "...", "document_title": "...",
    #              "page_numbers": [12,13], "relevance_score": 0.87}]

    recommendations = Column(JSONB, nullable=True)  # list of strings

    # Relationship
    audit = relationship("ComplianceAudit", back_populates="rows")

    def __repr__(self):
        return f"<ComplianceMatrixRow clause={self.clause_index} status={self.status}>"
