"""
Compliance Service
Runs compliance audits by cross-referencing regulation document clauses
against operational document evidence using pgvector similarity search
and the ComplianceAuditorAgent.

Pipeline:
  1. Load audit record + regulation doc + operational docs
  2. Extract regulation clauses from regulation doc embeddings
  3. For each clause: pgvector cosine search → top-K evidence chunks
  4. ComplianceAuditorAgent assesses each clause (parallel, capped)
  5. Persist results, compute aggregate stats, mark audit COMPLETED
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agents.base import QuotaExceededError
from app.agents.compliance_auditor import ComplianceAuditorAgent
from app.config import settings
from app.db.session import get_db_context
from app.models.compliance import AuditStatus, ComplianceAudit, ComplianceMatrixRow
from app.models.document import Document, DocumentEmbedding

logger = logging.getLogger(__name__)

# Max concurrent LLM calls to avoid rate limits
_MAX_CONCURRENT_ASSESSMENTS = 5
# Top-K evidence chunks per clause (after reranking)
_TOP_K = 5
# Over-fetch count for reranking
_OVER_FETCH = 15
# Relevance threshold for evidence chunks
_RELEVANCE_THRESHOLD = 0.30


class ComplianceService:
    """
    Compliance audit execution service.

    Uses pgvector cosine similarity to find operational document evidence
    for each regulation clause, then runs ComplianceAuditorAgent assessments.
    """

    def __init__(self):
        self.agent = ComplianceAuditorAgent()
        self._semaphore = asyncio.Semaphore(_MAX_CONCURRENT_ASSESSMENTS)

    async def run_audit(self, audit_id: str) -> bool:
        """
        Execute a full compliance audit.

        Returns True on success, False on failure.
        """
        logger.info(f"Starting compliance audit: {audit_id}")

        with get_db_context() as db:
            audit = (
                db.query(ComplianceAudit).filter(ComplianceAudit.id == audit_id).first()
            )

            if not audit:
                logger.error(f"Audit not found: {audit_id}")
                return False

            try:
                # ── Step 1: Mark as running ─────────────────────────────
                audit.status = AuditStatus.RUNNING
                db.commit()

                # ── Step 2: Load regulation doc embeddings (clauses) ────
                reg_doc = (
                    db.query(Document)
                    .filter(Document.id == audit.regulation_doc_id)
                    .first()
                )
                if not reg_doc or reg_doc.status.value != "completed":
                    raise ValueError(
                        f"Regulation document not ready: {audit.regulation_doc_id}"
                    )

                reg_embeddings = (
                    db.query(DocumentEmbedding)
                    .filter(DocumentEmbedding.document_id == reg_doc.id)
                    .order_by(DocumentEmbedding.chunk_index)
                    .all()
                )
                if not reg_embeddings:
                    raise ValueError(
                        "Regulation document has no embeddings. "
                        "Ensure it was fully processed before auditing."
                    )

                audit.total_clauses = len(reg_embeddings)
                db.commit()

                logger.info(
                    f"Audit {audit_id}: {len(reg_embeddings)} regulation clauses "
                    f"to assess against {len(audit.operational_doc_ids)} operational docs"
                )

                # ── Step 3: Assess each clause ──────────────────────────
                operational_doc_ids = [
                    str(d) for d in (audit.operational_doc_ids or [])
                ]

                results = await self._assess_clauses(
                    db=db,
                    audit_id=audit_id,
                    user_id=audit.user_id,
                    clauses=reg_embeddings,
                    operational_doc_ids=operational_doc_ids,
                )

                # ── Step 4: Persist matrix rows ─────────────────────────
                compliant_count = 0
                gap_count = 0
                missing_count = 0

                for i, result in enumerate(results):
                    status = result.get("status", "missing")
                    if status == "compliant":
                        compliant_count += 1
                    elif status == "gap":
                        gap_count += 1
                    else:
                        missing_count += 1

                    row = ComplianceMatrixRow(
                        audit_id=audit.id,
                        clause_index=i,
                        clause_text=result.get("clause_text", ""),
                        section_title=result.get("section_title"),
                        status=status,
                        assessment=result.get("assessment", ""),
                        confidence=result.get("confidence", 0.5),
                        evidence_chunks=result.get("evidence_chunks", []),
                        recommendations=result.get("recommendations", []),
                    )
                    db.add(row)

                # ── Step 5: Compute aggregate stats ─────────────────────
                total = len(results)
                audit.compliant_count = compliant_count
                audit.gap_count = gap_count
                audit.missing_count = missing_count
                audit.processed_clauses = total
                audit.overall_score = round(
                    (compliant_count / total * 100) if total > 0 else 0, 1
                )

                # ── Step 6: Mark completed ──────────────────────────────
                audit.status = AuditStatus.COMPLETED
                audit.completed_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(
                    f"Compliance audit completed: {audit_id} — "
                    f"Score: {audit.overall_score}%, "
                    f"Compliant: {compliant_count}, Gaps: {gap_count}, "
                    f"Missing: {missing_count}"
                )
                return True

            except QuotaExceededError as qe:
                logger.error(f"Quota exceeded during audit {audit_id}: {qe}")
                audit.status = AuditStatus.COMPLETED
                audit.processing_error = (
                    "AI analysis incomplete: API quota exceeded. "
                    "Partial results saved. Re-run when quota resets."
                )
                audit.completed_at = datetime.now(timezone.utc)
                db.commit()
                return False

            except Exception as e:
                logger.error(
                    f"Compliance audit failed: {audit_id} — {e}", exc_info=True
                )
                audit.status = AuditStatus.FAILED
                audit.processing_error = str(e)
                db.commit()
                return False

    async def _assess_clauses(
        self,
        db: Session,
        audit_id: str,
        user_id: str,
        clauses: List[DocumentEmbedding],
        operational_doc_ids: List[str],
    ) -> List[Dict]:
        """
        Assess all clauses in parallel with semaphore-capped concurrency.

        Returns a list of result dicts (one per clause, in order).
        """
        results: List[Optional[Dict]] = [None] * len(clauses)

        async def assess_one(index: int, clause: DocumentEmbedding):
            async with self._semaphore:
                try:
                    # Hybrid search for evidence + rerank
                    evidence = await self._find_evidence(
                        db=db,
                        user_id=user_id,
                        query_embedding=clause.embedding,
                        operational_doc_ids=operational_doc_ids,
                        clause_text=clause.chunk_text,
                    )

                    # Run agent assessment
                    result = await self.agent.analyze(
                        text=clause.chunk_text,
                        context={
                            "evidence_chunks": evidence,
                            "clause_section": clause.section_title or "",
                        },
                    )

                    results[index] = {
                        "clause_text": clause.chunk_text,
                        "section_title": clause.section_title,
                        "status": result.get("status", "missing"),
                        "assessment": result.get("assessment", ""),
                        "confidence": result.get("confidence", 0.5),
                        "evidence_chunks": evidence,
                        "recommendations": result.get("recommendations", []),
                    }

                    # Update progress counter
                    with get_db_context() as progress_db:
                        progress_audit = (
                            progress_db.query(ComplianceAudit)
                            .filter(ComplianceAudit.id == audit_id)
                            .first()
                        )
                        if progress_audit:
                            progress_audit.processed_clauses = sum(
                                1 for r in results if r is not None
                            )
                            progress_db.commit()

                except Exception as e:
                    logger.error(
                        f"Clause {index} assessment failed: {e}", exc_info=True
                    )
                    results[index] = {
                        "clause_text": clause.chunk_text,
                        "section_title": clause.section_title,
                        "status": "missing",
                        "assessment": f"Assessment failed: {str(e)}",
                        "confidence": 0.0,
                        "evidence_chunks": [],
                        "recommendations": [],
                    }

        # Launch all clause assessments
        tasks = [assess_one(i, clause) for i, clause in enumerate(clauses)]
        await asyncio.gather(*tasks, return_exceptions=True)

        # Fill any remaining None slots (shouldn't happen but safety net)
        for i, r in enumerate(results):
            if r is None:
                results[i] = {
                    "clause_text": clauses[i].chunk_text,
                    "section_title": clauses[i].section_title,
                    "status": "missing",
                    "assessment": "Assessment did not complete.",
                    "confidence": 0.0,
                    "evidence_chunks": [],
                    "recommendations": [],
                }

        return results

    async def _find_evidence(
        self,
        db: Session,
        user_id: str,
        query_embedding: list,
        operational_doc_ids: List[str],
        clause_text: str = "",
    ) -> List[Dict]:
        """
        Hybrid search for evidence chunks from operational documents.

        Pipeline: pgvector cosine + pg_trgm BM25 → RRF → cross-encoder rerank
        """
        if not operational_doc_ids:
            return []

        # Step 1: Hybrid search (over-fetch for reranking)
        from app.services.hybrid_search import hybrid_search

        candidates = await hybrid_search(
            query_text=clause_text,
            query_embedding=query_embedding,
            db=db,
            user_id=user_id,
            document_ids=operational_doc_ids,
            top_k=_OVER_FETCH,
        )

        # Step 2: Rerank if we have more candidates than needed
        if settings.ENABLE_RERANKING and len(candidates) > _TOP_K:
            from app.services.reranker import rerank

            candidates = rerank(
                query=clause_text,
                chunks=candidates,
                top_k=_TOP_K,
                text_key="text",
            )
        else:
            candidates = candidates[:_TOP_K]

        return [
            {
                "chunk_text": c["text"],
                "document_title": c["document_title"],
                "page_numbers": c.get("page_numbers", []),
                "section_title": c.get("section_title"),
                "relevance_score": round(c.get("rerank_score", c.get("score", 0.0)), 4),
            }
            for c in candidates
        ]


# ── Background task wrapper ────────────────────────────────────────────────────


async def run_compliance_audit_async(audit_id: str) -> None:
    """Async wrapper used with the compliance task queue."""
    service = ComplianceService()
    await service.run_audit(audit_id)
