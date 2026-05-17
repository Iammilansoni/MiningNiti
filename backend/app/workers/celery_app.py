"""
Celery Application
Background task queue for async document processing
"""

import logging
from celery import Celery

from app.config import settings

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "miningniti",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.tasks.process_document_task": {"queue": "documents"},
    },
)


@celery_app.task(name="app.workers.tasks.health_check")
def health_check():
    """Simple health check task"""
    return {"status": "ok"}
