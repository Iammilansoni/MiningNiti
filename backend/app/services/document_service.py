"""
Document Service
Document processing pipeline with unified multi-agent AI analysis.

Pipeline:
  1. Download file (with SSRF validation)
  2. Extract text + page boundaries via extractors.py
  3. Smart sentence-aware chunking via chunking.py
  4. Generate pgvector embeddings (stored as Vector(768))
  5. Run all 4 agents via AgentOrchestrator (parallel execution)
  6. Persist results and mark document COMPLETED
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional

import google.generativeai as genai

from app.agents.base import QuotaExceededError
from app.agents.orchestrator import AgentOrchestrator
from app.config import settings
from app.db.session import get_db_context
from app.models.document import (
    ComplianceStatus,
    Document,
    DocumentCategory,
    DocumentEmbedding,
    DocumentStatus,
)
from app.services.chunking import ChunkingService, DocumentChunk
from app.services.extractors import ExtractedDocument, download_and_extract

logger = logging.getLogger(__name__)

# Configure Gemini once at module level
genai.configure(api_key=settings.GEMINI_API_KEY)

_chunker = ChunkingService()
_orchestrator = AgentOrchestrator()

# Gemini accepts up to 100 inputs per embed_content call.
EMBED_BATCH_SIZE = 100


class DocumentService:
    """
    Document processing service.

    Uses:
    - extractors.py  → page-aware text extraction
    - chunking.py    → sentence-aware chunking with page tracking
    - orchestrator   → unified 4-agent parallel analysis
    - pgvector       → native vector storage (no brute-force cosine in Python)
    """

    def __init__(self):
        self.embedding_model = settings.EMBEDDING_MODEL

    async def process_document(self, document_id: str) -> bool:
        """
        Full document processing pipeline.

        Returns True on success, False on failure.
        """
        logger.info(f"Starting document processing: {document_id}")

        with get_db_context() as db:
            document = db.query(Document).filter(Document.id == document_id).first()

            if not document:
                logger.error(f"Document not found: {document_id}")
                return False

            try:
                # ── Step 1: Mark as processing ──────────────────────────────
                document.status = DocumentStatus.PROCESSING
                db.commit()

                # ── Step 2: Download and extract text with page tracking ────
                logger.info(f"Extracting text from: {document.file_url}")
                extracted: ExtractedDocument = await download_and_extract(
                    file_url=document.file_url,
                    file_type=document.file_type,
                )

                if not extracted.full_text.strip():
                    raise ValueError("No text content extracted from document")

                document.content = extracted.full_text
                document.word_count = extracted.word_count
                document.total_pages = extracted.total_pages
                document.page_count = extracted.total_pages  # keep backward compat
                db.commit()

                # ── Step 3: Smart sentence-aware chunking with page tracking
                logger.info(f"Chunking document ({extracted.total_pages} pages)...")
                chunks: List[DocumentChunk] = _chunker.chunk_document(
                    full_text=extracted.full_text,
                    pages=extracted.pages,
                )
                logger.info(f"Created {len(chunks)} chunks")

                # ── Step 4: Generate embeddings and persist ─────────────────
                logger.info(f"Generating embeddings for {len(chunks)} chunks...")
                vectors = await self._embed_batch([c.text for c in chunks])

                embedded = 0
                for chunk, embedding_values in zip(chunks, vectors):
                    if embedding_values is None:
                        logger.warning(
                            f"Skipping chunk {chunk.chunk_index} — embedding failed"
                        )
                        continue

                    embedded += 1
                    doc_embedding = DocumentEmbedding(
                        document_id=document.id,
                        chunk_index=chunk.chunk_index,
                        chunk_text=chunk.text,
                        embedding=embedding_values,  # stored as vector(768)
                        page_numbers=chunk.page_numbers,  # e.g. [12, 13]
                        section_title=chunk.section_title,  # e.g. "Safety Procedures"
                        start_page=(
                            chunk.page_numbers[0] if chunk.page_numbers else None
                        ),
                        end_page=chunk.page_numbers[-1] if chunk.page_numbers else None,
                        embedding_model=self.embedding_model,
                    )
                    db.add(doc_embedding)

                db.commit()
                logger.info(f"Persisted {embedded}/{len(chunks)} chunk embeddings")

                # Without embeddings the document is invisible to retrieval.
                # Marking it COMPLETED would hide a total failure behind a
                # green status in the UI.
                if chunks and embedded == 0:
                    raise ValueError(
                        "All chunk embeddings failed — document would not be "
                        "searchable"
                    )

                # ── Step 5: Run multi-agent analysis via orchestrator ────────
                document.status = DocumentStatus.ANALYZING
                db.commit()

                logger.info("Running AgentOrchestrator (4 agents)...")
                results = await _orchestrator.analyze_document(
                    text=extracted.full_text,
                    pages=extracted.pages,
                )

                # ── Step 6: Map orchestrator results to document fields ──────
                classification = results.get("classification", {})
                safety = results.get("safety", {})
                entities = results.get("entities", {})
                summary = results.get("summary", {})

                # Classification
                category_map = {
                    "safety_protocol": DocumentCategory.SAFETY_PROTOCOL,
                    "equipment_manual": DocumentCategory.EQUIPMENT_MANUAL,
                    "regulatory": DocumentCategory.REGULATORY,
                    "incident_report": DocumentCategory.INCIDENT_REPORT,
                    "geological": DocumentCategory.GEOLOGICAL,
                    "environmental": DocumentCategory.ENVIRONMENTAL,
                    "training": DocumentCategory.TRAINING,
                    "permit": DocumentCategory.PERMIT,
                    "maintenance": DocumentCategory.MAINTENANCE,
                }
                document.category = category_map.get(
                    classification.get("category"), DocumentCategory.OTHER
                )
                document.subcategory = classification.get("subcategory")
                document.classification_confidence = float(
                    classification.get("confidence", 0.5)
                )

                # Safety
                status_map = {
                    "compliant": ComplianceStatus.COMPLIANT,
                    "warning": ComplianceStatus.WARNING,
                    "violation": ComplianceStatus.VIOLATION,
                }
                document.safety_score = (
                    float(safety.get("score", 50))
                    if safety.get("score") is not None
                    else None
                )
                document.compliance_status = status_map.get(
                    safety.get("status"), ComplianceStatus.PENDING
                )
                document.hazards_detected = safety.get("hazards", [])
                document.safety_recommendations = safety.get("recommendations", [])

                # Entities & Summary
                document.entities = entities if isinstance(entities, dict) else {}
                document.summary = summary.get("summary") or (
                    "Summary unavailable — the summarizer produced no result "
                    "for this document. Click Re-analyze to try again."
                )
                document.key_points = summary.get("key_points", [])

                # ── Step 7: Mark completed ───────────────────────────────────
                #
                # One agent losing its provider (Cerebras answers an exhausted
                # account with 402) must not throw away the work of the other
                # three, so the document is COMPLETED with whatever succeeded.
                # But it must not look like a clean run either: the analysis
                # endpoint coerces entities to plain lists and drops the error
                # markers, so the reason is recorded on processing_error, which
                # DocumentResponse does expose.
                degraded = (results.get("metadata") or {}).get(
                    "degraded_sections"
                ) or {}
                if degraded:
                    details = "; ".join(
                        f"{name}: {reason}" for name, reason in degraded.items()
                    )
                    document.processing_error = (
                        f"Partial AI analysis — {len(degraded)} of 4 sections "
                        f"unavailable ({details}). Click Re-analyze to run the "
                        "missing sections."
                    )
                    logger.warning(
                        f"Document {document_id} completed with degraded "
                        f"sections: {details}"
                    )
                else:
                    document.processing_error = None

                document.status = DocumentStatus.COMPLETED
                document.processed_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(f"Document processing completed: {document_id}")
                return True

            except QuotaExceededError as qe:
                # Only the classifier can reach here: it runs before the
                # gather() that absorbs the other three agents' failures. Text
                # extraction and embeddings already succeeded, so the document
                # is searchable — mark it COMPLETED with partial data rather
                # than FAILED, so Re-analyze is offered.
                #
                # The provider is named rather than assumed. This used to say
                # "Gemini" unconditionally, which was wrong for every agent:
                # the classifier runs on Groq and the extractor and summarizer
                # on Cerebras.
                provider = getattr(qe, "provider", "") or "AI"
                logger.error(
                    f"{provider} quota exceeded during agent analysis for "
                    f"{document_id}: {qe}"
                )
                document.status = DocumentStatus.COMPLETED
                document.processing_error = (
                    f"AI analysis incomplete: {provider} quota exceeded. "
                    "Click Re-analyze to run the full analysis when quota resets."
                )
                document.summary = (
                    f"Summary unavailable — {provider} quota exceeded before "
                    "analysis could run. Click Re-analyze to generate it."
                )
                document.key_points = []
                document.processed_at = datetime.now(timezone.utc)
                db.commit()
                return False

            except Exception as e:
                logger.error(
                    f"Document processing failed: {document_id} — {e}", exc_info=True
                )
                document.status = DocumentStatus.FAILED
                document.processing_error = str(e)
                db.commit()
                return False

    async def _embed(self, text: str) -> list | None:
        """
        Generate a single embedding vector via the Gemini embedding API.

        genai.embed_content is a *blocking* HTTP call. Running it directly in a
        coroutine stalls the entire event loop — every other request served by
        this process waits. asyncio.to_thread hands it to the default executor
        so the loop stays responsive.
        """
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document",
                output_dimensionality=768,
            )
            return result["embedding"]
        except Exception as e:
            logger.warning(f"Embedding generation failed: {e}")
            return None

    async def _embed_batch(self, texts: List[str]) -> List[Optional[list]]:
        """
        Embed many chunks per API call instead of one call per chunk.

        A 200-page PDF produces several hundred chunks; at one request each
        that is several hundred round trips. Gemini accepts up to
        EMBED_BATCH_SIZE inputs per call, cutting this by two orders of
        magnitude.

        Returns a list positionally aligned with `texts`; entries are None
        where embedding failed, so the caller can skip just those chunks.
        """
        results: List[Optional[list]] = []

        for start in range(0, len(texts), EMBED_BATCH_SIZE):
            batch = texts[start : start + EMBED_BATCH_SIZE]
            results.extend(await self._embed_one_batch(batch))

        return results

    async def _embed_one_batch(self, batch: List[str]) -> List[Optional[list]]:
        """Embed one batch, degrading to per-chunk calls if the batch fails."""
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.embedding_model,
                content=batch,
                task_type="retrieval_document",
                output_dimensionality=768,
            )
            vectors = result["embedding"]

            # Guard against a shape change in the SDK: a batch request must
            # return one vector per input, not a single flat vector.
            if isinstance(vectors, list) and len(vectors) == len(batch):
                return vectors

            logger.warning(
                f"Batch embedding returned {len(vectors)} vectors for "
                f"{len(batch)} inputs — falling back to per-chunk embedding"
            )
        except Exception as e:
            logger.warning(
                f"Batch embedding failed ({e}) — falling back to per-chunk "
                f"embedding so one bad chunk cannot lose the whole document"
            )

        return [await self._embed(t) for t in batch]


# ── Background task wrapper ────────────────────────────────────────────────────


async def process_document_async(document_id: str) -> None:
    """Async wrapper used with FastAPI BackgroundTasks."""
    service = DocumentService()
    await service.process_document(document_id)
