"""
Unit tests for startup crash recovery.

The regression: recovery reset interrupted documents to PENDING but never
re-enqueued them. Nothing in the codebase scans for PENDING rows, so those
documents were stranded until a user manually triggered re-analyze.
"""

from unittest.mock import patch

import pytest

from app.main import _recover_interrupted_work
from app.models.document import Document, DocumentStatus

pytestmark = pytest.mark.unit


def _make_doc(db, user_id, status):
    doc = Document(
        user_id=user_id,
        title="interrupted",
        file_name="interrupted.pdf",
        file_size=1024,
        file_type="application/pdf",
        file_url="storage://interrupted.pdf",
        status=status,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@pytest.fixture
def recovery_env(db_session, monkeypatch):
    """Point recovery at the test session and capture what it enqueues."""
    import contextlib

    import app.main as main_module

    @contextlib.contextmanager
    def fake_context():
        yield db_session

    monkeypatch.setattr("app.db.session.get_db_context", fake_context)

    enqueued = []
    monkeypatch.setattr(
        "app.services.queue.enqueue_document_task",
        lambda doc_id: enqueued.append(doc_id),
    )

    async def fake_compliance(audit_id):
        enqueued.append(audit_id)

    monkeypatch.setattr("app.services.queue.enqueue_compliance_task", fake_compliance)
    return enqueued


async def test_stuck_documents_are_reset_and_requeued(
    db_session, sample_user_id, recovery_env
):
    processing = _make_doc(db_session, sample_user_id, DocumentStatus.PROCESSING)
    analyzing = _make_doc(db_session, sample_user_id, DocumentStatus.ANALYZING)

    await _recover_interrupted_work()

    db_session.refresh(processing)
    db_session.refresh(analyzing)

    # Status reset...
    assert processing.status == DocumentStatus.PENDING
    assert analyzing.status == DocumentStatus.PENDING
    assert "restart" in processing.processing_error

    # ...and, crucially, actually queued for work again.
    assert set(recovery_env) == {str(processing.id), str(analyzing.id)}


async def test_completed_documents_are_left_alone(
    db_session, sample_user_id, recovery_env
):
    done = _make_doc(db_session, sample_user_id, DocumentStatus.COMPLETED)
    failed = _make_doc(db_session, sample_user_id, DocumentStatus.FAILED)

    await _recover_interrupted_work()

    db_session.refresh(done)
    db_session.refresh(failed)
    assert done.status == DocumentStatus.COMPLETED
    assert failed.status == DocumentStatus.FAILED
    assert recovery_env == []


async def test_pending_documents_are_not_double_queued(
    db_session, sample_user_id, recovery_env
):
    """Only interrupted work is requeued, not everything already waiting."""
    _make_doc(db_session, sample_user_id, DocumentStatus.PENDING)

    await _recover_interrupted_work()

    assert recovery_env == []


async def test_recovery_never_raises(db_session, sample_user_id, monkeypatch):
    """A broken recovery must not stop the application from booting."""
    import contextlib

    @contextlib.contextmanager
    def exploding_context():
        raise RuntimeError("database is on fire")
        yield  # pragma: no cover

    monkeypatch.setattr("app.db.session.get_db_context", exploding_context)

    # Must not propagate.
    await _recover_interrupted_work()
