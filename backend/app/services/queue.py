"""
Serverless Task Queue
Lightweight in-memory queue for document processing.
"""

import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Single global queue for the server process
_task_queue: Optional[asyncio.Queue] = None


def get_queue() -> asyncio.Queue:
    global _task_queue
    if _task_queue is None:
        _task_queue = asyncio.Queue()
    return _task_queue


async def document_worker():
    """Background worker that processes documents sequentially/concurrently."""
    from app.services.document_service import process_document_async

    queue = get_queue()
    logger.info("Document worker started.")

    while True:
        try:
            document_id = await queue.get()
            logger.info(f"Worker picked up document: {document_id}")

            try:
                # We await the document processing.
                # Concurrency is handled internally by Orchestrator or we can spawn tasks here.
                # Since DocumentService is async, we can just await it directly or create a task.
                asyncio.create_task(process_document_async(document_id))
            except Exception as e:
                logger.error(
                    f"Worker failed dispatching document {document_id}: {e}",
                    exc_info=True,
                )
            finally:
                queue.task_done()

        except asyncio.CancelledError:
            logger.info("Document worker cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in document worker loop: {e}", exc_info=True)
            await asyncio.sleep(1)


def enqueue_document_task(document_id: str):
    """Adds a document to the queue without blocking."""
    queue = get_queue()
    try:
        queue.put_nowait(document_id)
        logger.info(f"Document {document_id} enqueued.")
    except asyncio.QueueFull:
        logger.error(f"Failed to enqueue document {document_id}: Queue is full")


# ── Compliance Audit Queue ─────────────────────────────────────────────────────

_compliance_queue: Optional[asyncio.Queue] = None


def get_compliance_queue() -> asyncio.Queue:
    global _compliance_queue
    if _compliance_queue is None:
        _compliance_queue = asyncio.Queue()
    return _compliance_queue


async def compliance_worker():
    """Background worker that processes compliance audits."""
    from app.services.compliance_service import run_compliance_audit_async

    queue = get_compliance_queue()
    logger.info("Compliance worker started.")

    while True:
        try:
            audit_id = await queue.get()
            logger.info(f"Compliance worker picked up audit: {audit_id}")

            try:
                asyncio.create_task(run_compliance_audit_async(audit_id))
            except Exception as e:
                logger.error(
                    f"Worker failed dispatching audit {audit_id}: {e}", exc_info=True
                )
            finally:
                queue.task_done()

        except asyncio.CancelledError:
            logger.info("Compliance worker cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in compliance worker loop: {e}", exc_info=True)
            await asyncio.sleep(1)


async def enqueue_compliance_task(audit_id: str):
    """Adds a compliance audit to the queue without blocking."""
    queue = get_compliance_queue()
    try:
        queue.put_nowait(audit_id)
        logger.info(f"Compliance audit {audit_id} enqueued.")
    except asyncio.QueueFull:
        logger.error(f"Failed to enqueue audit {audit_id}: Queue is full")
