"""
Unit tests for the five surgical bug fixes:
  1. Re-analyze skips re-extraction/re-embedding when content & embeddings exist
     and clears stale embeddings before partial retries.
  2. Streaming chat (/chat/stream) injects session_id into the done event and
     persists the assistant turn before emitting done.
  3. Document.to_dict() exposes processing_error, safety_recommendations, and tags.
  4. ComplianceService excludes quota/error clauses from missing_count/score and
     batches progress counter commits.
  5. Document deletion cleans durable + local storage and image uploads receive
     proper file extensions instead of .bin.
"""

import contextlib
import io
import json
import os
import tempfile
import unittest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

try:
    import pytest

    pytestmark = pytest.mark.unit
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("GROQ_API_KEY", "test-key")
os.environ.setdefault("MISTRAL_API_KEY", "test-key")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.com/.well-known/jwks.json")

from app.agents.base import QuotaExceededError
from app.api.deps import get_current_user_id
from app.api.v1 import upload as upload_module
from app.api.v1.chat_stream import stream_chat
from app.api.v1.documents import delete_document, reanalyze_document
from app.db.session import get_db
from app.models import audit, chat, compliance, document, prompt, user  # noqa: F401
from app.models.base import Base
from app.models.chat import ChatMessage, ChatSession
from app.models.compliance import AuditStatus, ComplianceAudit, ComplianceMatrixRow
from app.models.document import Document, DocumentEmbedding, DocumentStatus
from app.models.user import User
from app.schemas.chat import ChatRequest
from app.schemas.document import DocumentResponse
from app.services.compliance_service import ComplianceService
from app.services.document_service import DocumentService
from app.services.extractors import ExtractedDocument, PageContent


class _DBTestMixin:
    """Shared in-memory SQLite session setup for unit tests."""

    def _init_db(self):
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()
        self.user = User(
            clerk_user_id="user_fix_test_001",
            email="fixes@miningniti.ai",
        )
        self.db.add(self.user)
        self.db.commit()

    def _teardown_db(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)

    @contextlib.contextmanager
    def _fake_db_context(self):
        yield self.db


class TestReanalyzeAndDocumentSerialization(
    _DBTestMixin, unittest.IsolatedAsyncioTestCase
):
    def setUp(self):
        self._init_db()

    def tearDown(self):
        self._teardown_db()

    def test_document_to_dict_exposes_error_recommendations_and_tags(self):
        doc = Document(
            user_id=self.user.clerk_user_id,
            title="Ventilation SOP",
            file_name="ventilation.pdf",
            file_size=2048,
            file_type="application/pdf",
            file_url="storage://vent.pdf",
            status=DocumentStatus.COMPLETED,
            processing_error="Partial AI analysis — safety unavailable",
            safety_recommendations=["Inspect auxiliary fans every shift"],
            tags=["dgms", "ventilation"],
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        payload = doc.to_dict()
        self.assertEqual(
            payload["processing_error"], "Partial AI analysis — safety unavailable"
        )
        self.assertEqual(
            payload["safety_recommendations"], ["Inspect auxiliary fans every shift"]
        )
        self.assertEqual(payload["tags"], ["dgms", "ventilation"])

        # Matches DocumentResponse contract
        validated = DocumentResponse(**payload)
        self.assertEqual(validated.processing_error, doc.processing_error)
        self.assertEqual(validated.safety_recommendations, doc.safety_recommendations)

    async def test_reanalyze_endpoint_clears_processing_error(self):
        doc = Document(
            user_id=self.user.clerk_user_id,
            title="Failed Doc",
            file_name="failed.pdf",
            file_size=1024,
            file_type="application/pdf",
            file_url="storage://failed.pdf",
            status=DocumentStatus.FAILED,
            processing_error="Old failure",
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        with patch("app.services.queue.enqueue_document_task") as mock_enqueue:
            res = await reanalyze_document(
                document_id=doc.id,
                user_id=self.user.clerk_user_id,
                db=self.db,
            )

        self.db.refresh(doc)
        self.assertTrue(res["success"])
        self.assertEqual(doc.status, DocumentStatus.PENDING)
        self.assertIsNone(doc.processing_error)
        mock_enqueue.assert_called_once_with(str(doc.id))

    async def test_process_document_skips_reembedding_when_content_and_vectors_exist(
        self,
    ):
        doc = Document(
            user_id=self.user.clerk_user_id,
            title="Existing Doc",
            file_name="existing.pdf",
            file_size=1024,
            file_type="application/pdf",
            file_url="storage://existing.pdf",
            status=DocumentStatus.PENDING,
            content="Stored text about coal dust suppression per 30 CFR 75.400.",
            total_pages=3,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        existing_emb = DocumentEmbedding(
            document_id=doc.id,
            chunk_index=0,
            chunk_text="Stored text about coal dust suppression.",
            embedding=[0.1] * 768,
            page_numbers=[1],
        )
        self.db.add(existing_emb)
        self.db.commit()

        mock_analysis = {
            "classification": {
                "category": "safety_protocol",
                "subcategory": "dust",
                "confidence": 0.91,
            },
            "safety": {
                "score": 88.0,
                "status": "compliant",
                "hazards": [],
                "recommendations": ["Maintain rock dusting schedule"],
            },
            "entities": {"regulations": ["30 CFR 75.400"]},
            "summary": {
                "summary": "Dust suppression protocol.",
                "key_points": ["Rock dusting required"],
            },
            "metadata": {"degraded_sections": {}},
        }

        service = DocumentService()
        with (
            patch(
                "app.services.document_service.get_db_context",
                self._fake_db_context,
            ),
            patch(
                "app.services.document_service.download_and_extract",
                new_callable=AsyncMock,
            ) as mock_extract,
            patch.object(service, "_embed_batch", new_callable=AsyncMock) as mock_embed,
            patch(
                "app.services.document_service._orchestrator.analyze_document",
                new_callable=AsyncMock,
                return_value=mock_analysis,
            ) as mock_analyze,
        ):
            ok = await service.process_document(str(doc.id))

        self.assertTrue(ok)
        mock_extract.assert_not_called()
        mock_embed.assert_not_called()
        mock_analyze.assert_awaited_once_with(text=doc.content)
        self.assertEqual(
            self.db.query(DocumentEmbedding)
            .filter(DocumentEmbedding.document_id == doc.id)
            .count(),
            1,
        )
        self.db.refresh(doc)
        self.assertEqual(doc.status, DocumentStatus.COMPLETED)
        self.assertEqual(doc.summary, "Dust suppression protocol.")

    async def test_process_document_clears_orphan_embeddings_when_content_missing(self):
        doc = Document(
            user_id=self.user.clerk_user_id,
            title="Stale Embeddings Doc",
            file_name="stale.pdf",
            file_size=1024,
            file_type="application/pdf",
            file_url="storage://stale.pdf",
            status=DocumentStatus.PENDING,
            content=None,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        self.db.add(
            DocumentEmbedding(
                document_id=doc.id,
                chunk_index=0,
                chunk_text="Old orphan chunk",
                embedding=[0.2] * 768,
            )
        )
        self.db.commit()

        extracted = ExtractedDocument(
            full_text="Fresh text content with enough words " * 8,
            pages=[PageContent(page_number=1, text="Fresh text content", char_end=300)],
            total_pages=1,
            file_type="application/pdf",
        )
        mock_analysis = {
            "classification": {"category": "other", "confidence": 0.8},
            "safety": {"score": None, "status": "not_applicable", "hazards": []},
            "entities": {},
            "summary": {"summary": "Fresh summary.", "key_points": []},
            "metadata": {"degraded_sections": {}},
        }

        service = DocumentService()
        with (
            patch(
                "app.services.document_service.get_db_context",
                self._fake_db_context,
            ),
            patch(
                "app.services.document_service.download_and_extract",
                new_callable=AsyncMock,
                return_value=extracted,
            ),
            patch.object(
                service,
                "_embed_batch",
                new_callable=AsyncMock,
                return_value=[[0.5] * 768],
            ),
            patch(
                "app.services.document_service._orchestrator.analyze_document",
                new_callable=AsyncMock,
                return_value=mock_analysis,
            ),
        ):
            ok = await service.process_document(str(doc.id))

        self.assertTrue(ok)
        rows = (
            self.db.query(DocumentEmbedding)
            .filter(DocumentEmbedding.document_id == doc.id)
            .all()
        )
        self.assertEqual(len(rows), 1)
        self.assertNotEqual(rows[0].chunk_text, "Old orphan chunk")


class TestStreamingMultiTurnSession(_DBTestMixin, unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self._init_db()

    def tearDown(self):
        self._teardown_db()

    async def test_stream_injects_session_id_into_done_and_preserves_multiturn(self):
        captured_histories = []

        async def mock_stream(*args, **kwargs):
            captured_histories.append(kwargs.get("history", []))
            yield f"event: sources\ndata: {json.dumps([])}\n\n"
            yield f"event: token\ndata: {json.dumps({'text': 'Methane limit is 1%.'})}\n\n"
            yield f"event: done\ndata: {json.dumps({'sources_count': 0, 'tokens_used': None})}\n\n"

        # Turn 1: no session_id -> new session created & returned in done event
        req1 = ChatRequest(content="What is the methane limit?", include_sources=True)
        with patch(
            "app.services.chat_service.ChatService.generate_response_stream",
            side_effect=mock_stream,
        ):
            resp1 = await stream_chat(
                request=req1, user_id=self.user.clerk_user_id, db=self.db
            )
            events1 = [chunk async for chunk in resp1.body_iterator]

        done_event = next(e for e in events1 if e.startswith("event: done\n"))
        done_payload = json.loads(done_event.split("data: ", 1)[1].strip())
        self.assertIn("session_id", done_payload)
        returned_session_id = done_payload["session_id"]

        # Assistant reply must already be committed when done arrives
        persisted = (
            self.db.query(ChatMessage)
            .filter(ChatMessage.session_id == uuid.UUID(returned_session_id))
            .all()
        )
        self.assertEqual(len(persisted), 2)

        # Turn 2: pass returned session_id -> history contains Turn 1 user + assistant
        req2 = ChatRequest(
            content="What about surface mines?",
            session_id=returned_session_id,
            include_sources=True,
        )
        with patch(
            "app.services.chat_service.ChatService.generate_response_stream",
            side_effect=mock_stream,
        ):
            resp2 = await stream_chat(
                request=req2, user_id=self.user.clerk_user_id, db=self.db
            )
            _ = [chunk async for chunk in resp2.body_iterator]

        self.assertEqual(captured_histories[0], [])
        self.assertEqual(
            captured_histories[1],
            [
                {"role": "user", "content": "What is the methane limit?"},
                {"role": "assistant", "content": "Methane limit is 1%."},
            ],
        )


class TestComplianceQuotaAndBatchProgress(
    _DBTestMixin, unittest.IsolatedAsyncioTestCase
):
    def setUp(self):
        self._init_db()

    def tearDown(self):
        self._teardown_db()

    async def test_quota_error_marks_clause_error_and_excludes_from_score(self):
        reg_doc = Document(
            user_id=self.user.clerk_user_id,
            title="CMR 2017",
            file_name="cmr.pdf",
            file_size=4096,
            file_type="application/pdf",
            file_url="storage://cmr.pdf",
            status=DocumentStatus.COMPLETED,
        )
        self.db.add(reg_doc)
        self.db.commit()
        self.db.refresh(reg_doc)

        clause_texts = [
            "Clause 1: Adequate ventilation must be maintained in every underground district.",
            "Clause 2: Flameproof electrical apparatus shall be inspected weekly.",
            "Clause 3: Every shaft shall be fitted with an emergency signalling system.",
            'Definitions: "approved" means approved by the Chief Inspector; '
            '"board" means the Board of Mining; "mine" means any excavation.',
            "Clause 5: Roof support plans shall be reviewed monthly.",
            "Clause 6: Auxiliary fans shall have fireproof ducting.",
        ]
        for idx, text in enumerate(clause_texts):
            self.db.add(
                DocumentEmbedding(
                    document_id=reg_doc.id,
                    chunk_index=idx,
                    chunk_text=text,
                    embedding=[0.1] * 768,
                    section_title=f"Sec {idx + 1}",
                )
            )
        self.db.commit()

        audit_row = ComplianceAudit(
            user_id=self.user.clerk_user_id,
            title="Quota Test Audit",
            regulation_doc_id=reg_doc.id,
            operational_doc_ids=[],
            status=AuditStatus.PENDING,
        )
        self.db.add(audit_row)
        self.db.commit()
        self.db.refresh(audit_row)

        async def mock_analyze(text: str, context=None):
            if "Clause 2" in text:
                raise QuotaExceededError("429 rate_limit", provider="groq")
            if "Clause 3" in text:
                return {
                    "status": "gap",
                    "assessment": "Partial coverage.",
                    "confidence": 0.7,
                    "recommendations": ["Add signalling checklist"],
                }
            return {
                "status": "compliant",
                "assessment": "Covered in SOP.",
                "confidence": 0.9,
                "recommendations": [],
            }

        service = ComplianceService()
        progress_commits = 0
        orig_commit = self.db.commit

        def tracking_commit():
            nonlocal progress_commits
            # Count intermediate progress commits (while audit is still RUNNING)
            if audit_row.status == AuditStatus.RUNNING and audit_row.processed_clauses:
                progress_commits += 1
            orig_commit()

        with (
            patch(
                "app.services.compliance_service.get_db_context",
                self._fake_db_context,
            ),
            patch.object(
                service, "_find_evidence", new_callable=AsyncMock, return_value=[]
            ),
            patch.object(service.agent, "analyze", side_effect=mock_analyze),
            patch.object(self.db, "commit", side_effect=tracking_commit),
        ):
            ok = await service.run_audit(str(audit_row.id))

        self.db.refresh(audit_row)
        self.assertFalse(ok)
        self.assertEqual(audit_row.status, AuditStatus.COMPLETED)
        self.assertEqual(audit_row.compliant_count, 3)
        self.assertEqual(audit_row.gap_count, 1)
        self.assertEqual(audit_row.missing_count, 0)
        self.assertEqual(audit_row.not_applicable_count, 1)
        # 3 compliant / (3 compliant + 1 gap + 0 missing) = 75.0%
        self.assertEqual(audit_row.overall_score, 75.0)
        self.assertIn("quota exceeded on 1 clause(s)", audit_row.processing_error)
        # 6 clauses with interval 5 -> flushed at clause 5 and clause 6 (2, not 6)
        self.assertEqual(progress_commits, 2)

        matrix_rows = (
            self.db.query(ComplianceMatrixRow)
            .filter(ComplianceMatrixRow.audit_id == audit_row.id)
            .order_by(ComplianceMatrixRow.clause_index)
            .all()
        )
        self.assertEqual(len(matrix_rows), 6)
        self.assertEqual(matrix_rows[1].status, "error")
        self.assertEqual(matrix_rows[3].status, "not_applicable")


class TestDeletionCleanupAndImageUpload(_DBTestMixin, unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self._init_db()

    def tearDown(self):
        self._teardown_db()

    async def test_delete_document_cleans_durable_and_local_storage(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            key = "deadbeef1234.png"
            local_file = os.path.join(tmpdir, key)
            with open(local_file, "wb") as f:
                f.write(b"fake-png-bytes")

            doc = Document(
                user_id=self.user.clerk_user_id,
                title="Mine Map",
                file_name="mine_map.png",
                file_size=14,
                file_type="image/png",
                file_url=f"storage://{key}",
                status=DocumentStatus.COMPLETED,
            )
            self.db.add(doc)
            self.db.commit()
            self.db.refresh(doc)

            with (
                patch("app.core.url_guard.settings.UPLOAD_DIR", tmpdir),
                patch(
                    "app.services.object_storage.delete_object",
                    new_callable=AsyncMock,
                ) as mock_del,
            ):
                res = await delete_document(
                    document_id=doc.id,
                    user_id=self.user.clerk_user_id,
                    db=self.db,
                )

            self.assertTrue(res["success"])
            mock_del.assert_awaited_once_with(key)
            self.assertFalse(os.path.exists(local_file))

    async def test_delete_document_skips_storage_cleanup_for_external_url(self):
        doc = Document(
            user_id=self.user.clerk_user_id,
            title="Remote Doc",
            file_name="remote.pdf",
            file_size=100,
            file_type="application/pdf",
            file_url="https://example.com/remote.pdf",
            status=DocumentStatus.COMPLETED,
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)

        with patch(
            "app.services.object_storage.delete_object",
            new_callable=AsyncMock,
        ) as mock_del:
            res = await delete_document(
                document_id=doc.id,
                user_id=self.user.clerk_user_id,
                db=self.db,
            )

        self.assertTrue(res["success"])
        mock_del.assert_not_called()

    def test_upload_image_uses_real_extension_instead_of_bin(self):
        user_id = self.user.clerk_user_id
        with tempfile.TemporaryDirectory() as tmpdir:
            app = FastAPI()
            app.include_router(upload_module.router, prefix="/upload")
            app.dependency_overrides[get_current_user_id] = lambda: user_id
            app.dependency_overrides[get_db] = lambda: self.db
            client = TestClient(app)

            with (
                patch.object(upload_module, "UPLOAD_DIR", tmpdir),
                patch.object(upload_module, "MAX_FILE_SIZE", 1024 * 1024),
                patch("app.services.queue.enqueue_document_task"),
            ):
                r_png = client.post(
                    "/upload",
                    files={
                        "file": (
                            "diagram.png",
                            io.BytesIO(b"\x89PNG\r\n\x1a\n"),
                            "image/png",
                        )
                    },
                )
                r_jpg = client.post(
                    "/upload",
                    files={
                        "file": (
                            "hazard.jpg",
                            io.BytesIO(b"\xff\xd8\xff\xe0"),
                            "image/jpeg",
                        )
                    },
                )

            self.assertEqual(r_png.status_code, 202)
            self.assertEqual(r_jpg.status_code, 202)
            files = sorted(os.listdir(tmpdir))
            self.assertEqual(len(files), 2)
            self.assertTrue(any(f.endswith(".png") for f in files))
            self.assertTrue(any(f.endswith(".jpg") for f in files))
            self.assertFalse(any(f.endswith(".bin") for f in files))


if __name__ == "__main__":
    unittest.main()
