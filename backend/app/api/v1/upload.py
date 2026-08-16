"""
Direct File Upload Endpoint
Bypasses UploadThing CDN for regions where it's blocked.
Uploads file directly to backend and saves locally.
"""

import logging
import os
import uuid
from datetime import datetime

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.config import settings
from app.core.url_guard import build_storage_url
from app.db.session import get_db
from app.models.audit import AuditAction, create_audit_log
from app.models.document import Document, DocumentStatus
from app.schemas.document import DocumentUploadResponse

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = settings.UPLOAD_DIR
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024

# Body is streamed in chunks of this size so a large upload never has to be
# held in memory in full.
_CHUNK_SIZE = 1024 * 1024  # 1MB

# On-disk extension is chosen from the validated content type, so a filename
# like "invoice.pdf.exe" cannot influence what lands on the volume.
_EXTENSION_FOR_TYPE = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
}


@router.post(
    "", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED
)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Upload a document directly and queue it for AI processing.

    The body is streamed to disk with a hard size ceiling rather than buffered
    in memory, and the declared content type must be one this service can
    actually parse.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided",
        )

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{content_type or 'unknown'}'. "
                f"Allowed: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            ),
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # The extension is derived from the validated content type, never from the
    # user-supplied filename — the filename is attacker-controlled and only
    # kept for display.
    ext = _EXTENSION_FOR_TYPE.get(content_type, "bin")
    local_filename = f"{uuid.uuid4().hex}.{ext}"
    local_path = os.path.join(UPLOAD_DIR, local_filename)

    # Stream to disk in fixed-size chunks. Reading the whole body first (the
    # previous behaviour) let a client pin arbitrary bytes in RAM before the
    # size check ever ran.
    file_size = 0
    try:
        with open(local_path, "wb") as f:
            while chunk := await file.read(_CHUNK_SIZE):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=(
                            f"File too large. Max size: "
                            f"{settings.MAX_FILE_SIZE_MB}MB"
                        ),
                    )
                f.write(chunk)

        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty",
            )
    except Exception:
        # Never leave a partial or oversized file behind on the volume.
        try:
            os.unlink(local_path)
        except OSError:
            pass
        raise

    # Mirror the bytes into durable storage. UPLOAD_DIR is on the container
    # filesystem, which is wiped on every restart in the deployed environment,
    # so the local copy alone is a cache rather than storage. A failure here is
    # logged and tolerated: the upload still works for this container's
    # lifetime, and rejecting it outright would be a worse outcome than storing
    # it with reduced durability.
    from app.services import object_storage

    if object_storage.is_configured():
        with open(local_path, "rb") as f:
            stored = await object_storage.put_object(
                local_filename, f.read(), content_type
            )
        if not stored:
            logger.warning(
                "Upload %s is on local disk only and will not survive a "
                "restart: durable storage write failed.",
                local_filename,
            )
    else:
        logger.warning(
            "Durable storage is not configured; upload %s will be lost when "
            "the container restarts. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
            local_filename,
        )

    # Internal storage reference — resolved only against UPLOAD_DIR. Storing a
    # bare key rather than an absolute path keeps the row portable across
    # containers and gives the SSRF guard a value it can safely confine.
    file_url = build_storage_url(local_filename)

    document = Document(
        user_id=user_id,
        title=(
            file.filename.rsplit(".", 1)[0] if "." in file.filename else file.filename
        ),
        file_name=file.filename,
        file_size=file_size,
        file_type=content_type,
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
        details={"file_name": file.filename, "file_size": file_size},
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
