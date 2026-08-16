"""
Tests for automatic `users` row provisioning.

documents, chat_sessions, compliance_audits and prompts all foreign-key to
users.clerk_user_id. A valid Clerk JWT does not imply that row exists — Clerk
owns identity and this table only mirrors it — so a user who has never been
provisioned could read fine while every write died on a foreign key violation
and surfaced as a bare 500.

The API test client overrides get_current_user_id entirely, so nothing in the
suite exercised this path. These tests target the provisioning helper directly.
"""

import pytest
from sqlalchemy import text

from app.api.deps import _ensure_user_row
from app.models.user import User

pytestmark = pytest.mark.unit


class TestEnsureUserRow:
    def test_creates_row_when_missing(self, db_session):
        uid = "user_brand_new_123"
        assert db_session.query(User).filter(User.clerk_user_id == uid).first() is None

        _ensure_user_row(db_session, uid)

        user = db_session.query(User).filter(User.clerk_user_id == uid).first()
        assert user is not None
        assert user.is_active is True

    def test_is_idempotent(self, db_session):
        uid = "user_repeat_456"

        _ensure_user_row(db_session, uid)
        _ensure_user_row(db_session, uid)
        _ensure_user_row(db_session, uid)

        rows = db_session.query(User).filter(User.clerk_user_id == uid).all()
        assert len(rows) == 1

    def test_does_not_disturb_an_existing_row(self, db_session):
        uid = "user_existing_789"
        db_session.add(User(clerk_user_id=uid, is_active=True, email="a@b.com"))
        db_session.commit()

        _ensure_user_row(db_session, uid)

        user = db_session.query(User).filter(User.clerk_user_id == uid).first()
        assert user.email == "a@b.com", "existing profile data must be preserved"

    def test_distinct_users_get_distinct_rows(self, db_session):
        _ensure_user_row(db_session, "user_aaa")
        _ensure_user_row(db_session, "user_bbb")

        ids = {
            u.clerk_user_id
            for u in db_session.query(User)
            .filter(User.clerk_user_id.in_(["user_aaa", "user_bbb"]))
            .all()
        }
        assert ids == {"user_aaa", "user_bbb"}


class TestForeignKeyIsSatisfied:
    """The point of provisioning: a dependent write must succeed afterwards."""

    def test_document_insert_succeeds_after_provisioning(self, db_session):
        from app.models.document import Document, DocumentStatus

        uid = "user_uploads_doc"
        _ensure_user_row(db_session, uid)

        # Enforce FKs on SQLite, which ignores them unless asked.
        db_session.execute(text("PRAGMA foreign_keys=ON"))

        doc = Document(
            user_id=uid,
            title="Ventilation Plan",
            file_name="vent.pdf",
            file_size=1024,
            file_type="application/pdf",
            file_url="storage://abc.pdf",
            status=DocumentStatus.PENDING,
        )
        db_session.add(doc)
        db_session.commit()

        assert doc.id is not None
        assert db_session.query(Document).filter(Document.user_id == uid).count() == 1
