"""
Direct File Upload Endpoint
Bypasses UploadThing CDN for regions where it's blocked.
Uploads file directly to backend and saves locally.
"""

import logging
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.audit import AuditAction, create_audit_log
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentUploadResponse

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post(
    "", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED
)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Upload a document directly (bypasses UploadThing).
    Saves file locally and triggers AI processing.
    """
    if not file.filename:
        return {"error": "No filename provided"}

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        return {"error": f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB"}

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    local_filename = f"{uuid.uuid4().hex}.{ext}"
    local_path = os.path.join(UPLOAD_DIR, local_filename)

    with open(local_path, "wb") as f:
        f.write(content)

    file_url = f"file://{os.path.abspath(local_path)}"

    document = Document(
        user_id=user_id,
        title=file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename,
        file_name=file.filename,
        file_size=len(content),
        file_type=file.content_type or "application/octet-stream",
        file_url=file_url,
        status=DocumentStatus.PENDING,
        tags=["upload"],
    )

    db.add(document)
    db.flush()

    audit = create_audit_log(
        action=AuditAction.DOCUMENT_UPLOAD.value,
        user_id=user_id,
        resource_type="document",
        resource_id=str(document.id),
        details={"file_name": file.filename, "file_size": len(content)},
    )
    db.add(audit)
    db.commit()
    db.refresh(document)

    from app.services.queue import enqueue_document_task

    enqueue_document_task(str(document.id))

    logger.info(f"Direct upload: {document.id} - {file.filename}")

    return DocumentUploadResponse(
        id=str(document.id),
        title=document.title,
        file_name=document.file_name,
        status=DocumentStatus.PENDING,
        job_id=str(document.id),
        message="Document uploaded directly. AI analysis queued.",
    )
