"""
Celery Tasks
Background processing tasks for document analysis
"""

import logging
import asyncio
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.workers.tasks.process_document_task",
    max_retries=3,
    default_retry_delay=30,
)
def process_document_task(self, document_id: str):
    """
    Celery task for processing a document with AI agents.
    Runs the async document processing pipeline in a sync context.

    Args:
        document_id: UUID string of the document to process
    """
    logger.info(f"Starting Celery task for document: {document_id}")

    try:
        # Run the async processing pipeline in a new event loop
        from app.services.document_service import DocumentService

        async def _run():
            service = DocumentService()
            return await service.process_document(document_id)

        result = asyncio.run(_run())

        if result:
            logger.info(f"Document processed successfully: {document_id}")
        else:
            logger.error(f"Document processing returned False: {document_id}")

        return {"document_id": document_id, "success": result}

    except Exception as exc:
        logger.error(f"Celery task failed for document {document_id}: {exc}")
        raise self.retry(exc=exc)
