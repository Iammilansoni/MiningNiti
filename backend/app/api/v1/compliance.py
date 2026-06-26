"""
Compliance Audit API Endpoints
Regulatory compliance auto-auditor: cross-references operational documents
against regulatory documents to produce per-clause compliance matrices.
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.audit import AuditAction, create_audit_log
from app.models.compliance import AuditStatus, ComplianceAudit, ComplianceMatrixRow
from app.models.document import Document, DocumentCategory, DocumentStatus
from app.schemas.compliance import (
    ComplianceAuditCreate,
    ComplianceAuditDetailResponse,
    ComplianceAuditListResponse,
    ComplianceAuditResponse,
    ComplianceMatrixRowResponse,
)
from app.services.queue import enqueue_compliance_task

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/audits", response_model=ComplianceAuditListResponse)
async def list_audits(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """List all compliance audits for the current user."""
    offset = (page - 1) * page_size

    query = (
        db.query(ComplianceAudit)
        .filter(ComplianceAudit.user_id == user_id)
        .order_by(ComplianceAudit.created_at.desc())
    )

    total = query.count()
    audits = query.offset(offset).limit(page_size).all()

    return ComplianceAuditListResponse(
        audits=[ComplianceAuditResponse.model_validate(a) for a in audits],
        total=total,
    )


@router.post(
    "/audits",
    response_model=ComplianceAuditResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_audit(
    data: ComplianceAuditCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create and trigger a new compliance audit."""
    # Validate regulation document exists and belongs to user
    reg_doc = (
        db.query(Document)
        .filter(
            Document.id == data.regulation_doc_id,
            Document.user_id == user_id,
        )
        .first()
    )
    if not reg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Regulation document not found",
        )
    if reg_doc.status != DocumentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Regulation document must be fully processed before auditing",
        )

    # Validate operational documents
    op_doc_ids = [str(d) for d in data.operational_doc_ids]
    op_docs = (
        db.query(Document)
        .filter(
            Document.id.in_(op_doc_ids),
            Document.user_id == user_id,
        )
        .all()
    )

    if len(op_docs) != len(op_doc_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more operational documents not found",
        )

    for doc in op_docs:
        if doc.status != DocumentStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document '{doc.title}' must be fully processed first",
            )

    # Create audit record
    audit = ComplianceAudit(
        user_id=user_id,
        title=data.title,
        regulation_doc_id=data.regulation_doc_id,
        operational_doc_ids=op_doc_ids,
        status=AuditStatus.PENDING,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    # Audit log
    log = create_audit_log(
        user_id=user_id,
        action=AuditAction.DOCUMENT_UPLOAD,
        resource_type="compliance_audit",
        resource_id=str(audit.id),
        details={"title": data.title, "regulation_doc": str(data.regulation_doc_id)},
    )
    db.add(log)
    db.commit()

    # Enqueue for background processing
    await enqueue_compliance_task(str(audit.id))

    logger.info(
        f"Compliance audit created: {audit.id} — "
        f"reg_doc={data.regulation_doc_id}, op_docs={len(op_doc_ids)}"
    )

    return ComplianceAuditResponse.model_validate(audit)


@router.get("/audits/{audit_id}", response_model=ComplianceAuditDetailResponse)
async def get_audit(
    audit_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a compliance audit with full matrix rows."""
    audit = (
        db.query(ComplianceAudit)
        .filter(
            ComplianceAudit.id == audit_id,
            ComplianceAudit.user_id == user_id,
        )
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found",
        )

    rows = (
        db.query(ComplianceMatrixRow)
        .filter(ComplianceMatrixRow.audit_id == audit.id)
        .order_by(ComplianceMatrixRow.clause_index)
        .all()
    )

    return ComplianceAuditDetailResponse(
        **ComplianceAuditResponse.model_validate(audit).model_dump(),
        rows=[ComplianceMatrixRowResponse.model_validate(r) for r in rows],
    )


@router.delete("/audits/{audit_id}")
async def delete_audit(
    audit_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a compliance audit and all its matrix rows."""
    audit = (
        db.query(ComplianceAudit)
        .filter(
            ComplianceAudit.id == audit_id,
            ComplianceAudit.user_id == user_id,
        )
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found",
        )

    audit_title = audit.title
    db.delete(audit)
    db.commit()

    log = create_audit_log(
        user_id=user_id,
        action=AuditAction.DOCUMENT_DELETE,
        resource_type="compliance_audit",
        resource_id=str(audit_id),
        details={"title": audit_title},
    )
    db.add(log)
    db.commit()

    return {"message": "Audit deleted"}


@router.get("/audits/{audit_id}/export")
async def export_audit(
    audit_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Export audit results as structured JSON."""
    audit = (
        db.query(ComplianceAudit)
        .filter(
            ComplianceAudit.id == audit_id,
            ComplianceAudit.user_id == user_id,
        )
        .first()
    )

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit not found",
        )

    rows = (
        db.query(ComplianceMatrixRow)
        .filter(ComplianceMatrixRow.audit_id == audit.id)
        .order_by(ComplianceMatrixRow.clause_index)
        .all()
    )

    return {
        "audit": audit.to_dict(),
        "matrix": [
            {
                "clause_index": r.clause_index,
                "clause_text": r.clause_text,
                "section_title": r.section_title,
                "status": r.status,
                "assessment": r.assessment,
                "confidence": r.confidence,
                "evidence_chunks": r.evidence_chunks or [],
                "recommendations": r.recommendations or [],
            }
            for r in rows
        ],
    }
