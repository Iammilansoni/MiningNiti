"""
Compliance Audit Schemas
Pydantic v2 models for compliance audit API request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ComplianceAuditCreate(BaseModel):
    """Request body for creating a new compliance audit."""

    title: str = Field(..., min_length=1, max_length=500)
    regulation_doc_id: UUID
    operational_doc_ids: List[UUID] = Field(..., min_length=1)


class ComplianceMatrixRowResponse(BaseModel):
    """A single clause assessment in the compliance matrix."""

    id: UUID
    clause_index: int
    clause_text: str
    section_title: Optional[str] = None
    status: str  # compliant | gap | missing
    assessment: str
    confidence: float
    evidence_chunks: Optional[list] = None
    recommendations: Optional[list] = None

    model_config = {"from_attributes": True}


class ComplianceAuditResponse(BaseModel):
    """Compliance audit summary (without matrix rows)."""

    id: UUID
    title: str
    regulation_doc_id: UUID
    operational_doc_ids: Optional[list] = None
    status: str
    total_clauses: Optional[int] = None
    processed_clauses: int = 0
    compliant_count: Optional[int] = None
    gap_count: Optional[int] = None
    missing_count: Optional[int] = None
    overall_score: Optional[float] = None
    processing_error: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ComplianceAuditDetailResponse(ComplianceAuditResponse):
    """Full audit detail including all matrix rows."""

    rows: List[ComplianceMatrixRowResponse] = []


class ComplianceAuditListResponse(BaseModel):
    """Paginated list of compliance audits."""

    audits: List[ComplianceAuditResponse]
    total: int
