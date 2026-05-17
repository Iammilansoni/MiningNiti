"""
Jobs API Endpoints
Background job status tracking
"""

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.models.document import Document, DocumentStatus
from app.schemas.common import JobStatusResponse
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get status of a background processing job.
    Currently jobs are tracked via document ID.
    """
    # For now, job_id is document_id
    document = db.query(Document).filter(
        Document.id == job_id,
        Document.user_id == user_id
    ).first()
    
    if not document:
        raise NotFoundError("Job", job_id)
    
    # Map document status to job status
    status_map = {
        DocumentStatus.PENDING: "pending",
        DocumentStatus.PROCESSING: "processing",
        DocumentStatus.ANALYZING: "processing",
        DocumentStatus.COMPLETED: "completed",
        DocumentStatus.FAILED: "failed"
    }
    
    # Calculate progress based on status
    progress_map = {
        DocumentStatus.PENDING: 0,
        DocumentStatus.PROCESSING: 30,
        DocumentStatus.ANALYZING: 70,
        DocumentStatus.COMPLETED: 100,
        DocumentStatus.FAILED: 0
    }
    
    result = None
    if document.status == DocumentStatus.COMPLETED:
        result = {
            "document_id": str(document.id),
            "category": document.category.value if document.category else None,
            "safety_score": document.safety_score,
            "summary_preview": document.summary[:200] if document.summary else None
        }
    
    return JobStatusResponse(
        job_id=str(document.id),
        status=status_map.get(document.status, "unknown"),
        progress=progress_map.get(document.status, 0),
        result=result,
        error=document.processing_error,
        created_at=document.created_at,
        updated_at=document.updated_at,
        completed_at=document.processed_at
    )


@router.get("")
async def list_active_jobs(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List all active (non-completed) processing jobs.
    """
    active_docs = db.query(Document).filter(
        Document.user_id == user_id,
        Document.status.in_([
            DocumentStatus.PENDING,
            DocumentStatus.PROCESSING,
            DocumentStatus.ANALYZING
        ])
    ).order_by(Document.created_at.desc()).all()
    
    jobs = []
    for doc in active_docs:
        progress = {
            DocumentStatus.PENDING: 0,
            DocumentStatus.PROCESSING: 30,
            DocumentStatus.ANALYZING: 70
        }.get(doc.status, 0)
        
        jobs.append({
            "job_id": str(doc.id),
            "document_title": doc.title,
            "status": doc.status.value,
            "progress": progress,
            "created_at": doc.created_at.isoformat()
        })
    
    return {"jobs": jobs, "count": len(jobs)}
