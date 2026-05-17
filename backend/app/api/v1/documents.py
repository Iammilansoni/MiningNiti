"""
Document API Endpoints
Document upload, management, and analysis
"""

import logging
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.api.deps import get_current_user_id, get_current_user, audit_middleware
from app.models.user import User
from app.models.document import Document, DocumentStatus, DocumentCategory, ComplianceStatus
from app.models.audit import create_audit_log, AuditAction
from app.schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    DocumentAnalysisResponse,
)
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[DocumentCategory] = None,
    status: Optional[DocumentStatus] = None,
    search: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List user's documents with filtering and pagination.
    """
    query = db.query(Document).filter(Document.user_id == user_id)
    
    # Apply filters
    if category:
        query = query.filter(Document.category == category)
    if status:
        query = query.filter(Document.status == status)
    if search:
        # Escape SQL wildcard characters to prevent injection
        escaped_search = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        safe_pattern = f"%{escaped_search}%"
        query = query.filter(
            Document.title.ilike(safe_pattern, escape='\\') |
            Document.file_name.ilike(safe_pattern, escape='\\')
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    documents = query.order_by(Document.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Calculate stats
    stats = _calculate_document_stats(db, user_id)
    
    return DocumentListResponse(
        documents=[DocumentResponse(**doc.to_dict()) for doc in documents],
        total=total,
        page=page,
        page_size=page_size,
        stats=stats
    )


@router.post("", response_model=DocumentUploadResponse)
async def create_document(
    request: DocumentCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new document from UploadThing URL.
    Triggers background processing with AI analysis.
    """
    # Create document record
    document = Document(
        user_id=user_id,
        title=request.title or request.file_name.rsplit(".", 1)[0],
        file_name=request.file_name,
        file_size=request.file_size,
        file_type=request.file_type,
        file_url=request.file_url,
        status=DocumentStatus.PENDING,
        tags=request.tags or []
    )
    
    db.add(document)
    db.flush()  # Flush to get the document.id without committing
    
    # Create audit log
    audit = create_audit_log(
        action=AuditAction.DOCUMENT_UPLOAD.value,
        user_id=user_id,
        resource_type="document",
        resource_id=str(document.id),
        details={
            "file_name": document.file_name,
            "file_size": document.file_size,
            "file_type": document.file_type
        }
    )
    db.add(audit)
    
    # Commit both document and audit atomically
    db.commit()
    db.refresh(document)
    
    # Trigger background processing
    # In production, this would use Celery
    from app.services.document_service import process_document_async
    background_tasks.add_task(process_document_async, str(document.id))
    
    logger.info(f"Document created: {document.id} - {document.title}")
    
    return DocumentUploadResponse(
        id=str(document.id),
        title=document.title,
        file_name=document.file_name,
        status=DocumentStatus.PENDING,
        job_id=str(document.id),  # Using doc ID as job ID for now
        message="Document uploaded successfully. AI analysis started."
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get document details by ID.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()
    
    if not document:
        raise NotFoundError("Document", document_id)
    
    return DocumentResponse(**document.to_dict())


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a document and all associated data.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()
    
    if not document:
        raise NotFoundError("Document", document_id)
    
    # Create audit log before deletion
    audit = create_audit_log(
        action=AuditAction.DOCUMENT_DELETE.value,
        user_id=user_id,
        resource_type="document",
        resource_id=document_id,
        details={"file_name": document.file_name}
    )
    db.add(audit)
    
    # Delete document (cascade will handle embeddings)
    db.delete(document)
    db.commit()
    
    logger.info(f"Document deleted: {document_id}")
    
    return {"success": True, "message": "Document deleted successfully"}


@router.get("/{document_id}/analysis", response_model=DocumentAnalysisResponse)
async def get_document_analysis(
    document_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get AI analysis results for a document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()
    
    if not document:
        raise NotFoundError("Document", document_id)
    
    if document.status != DocumentStatus.COMPLETED:
        return DocumentAnalysisResponse(
            document_id=str(document.id),
            status=document.status.value,
            analysis=None
        )
    
    analysis = {
        "category": document.category,
        "subcategory": document.subcategory,
        "classification_confidence": document.classification_confidence,
        "summary": document.summary,
        "key_points": document.key_points or [],
        "safety_score": document.safety_score,
        "compliance_status": document.compliance_status,
        "hazards_detected": document.hazards_detected or [],
        "safety_recommendations": document.safety_recommendations or [],
        "entities": document.entities or {}
    }
    
    return DocumentAnalysisResponse(
        document_id=str(document.id),
        status="completed",
        analysis=analysis
    )


@router.post("/{document_id}/reanalyze")
async def reanalyze_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Trigger re-analysis of a document.
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == user_id
    ).first()
    
    if not document:
        raise NotFoundError("Document", document_id)
    
    # Reset status
    document.status = DocumentStatus.PENDING
    db.commit()
    
    # Trigger reprocessing
    from app.services.document_service import process_document_async
    background_tasks.add_task(process_document_async, str(document.id))
    
    return {"success": True, "message": "Document reanalysis started"}


def _calculate_document_stats(db: Session, user_id: str) -> dict:
    """Calculate aggregated statistics for user's documents"""
    # Category distribution
    category_counts = db.query(
        Document.category,
        func.count(Document.id)
    ).filter(
        Document.user_id == user_id,
        Document.category.isnot(None)
    ).group_by(Document.category).all()
    
    by_category = {cat.value if cat else "other": count for cat, count in category_counts}
    
    # Status distribution
    status_counts = db.query(
        Document.status,
        func.count(Document.id)
    ).filter(
        Document.user_id == user_id
    ).group_by(Document.status).all()
    
    by_status = {status.value if status else "unknown": count for status, count in status_counts}
    
    # Average safety score
    avg_score = db.query(func.avg(Document.safety_score)).filter(
        Document.user_id == user_id,
        Document.safety_score.isnot(None)
    ).scalar()
    
    return {
        "by_category": by_category,
        "by_status": by_status,
        "avg_safety_score": round(avg_score, 2) if avg_score else None
    }
