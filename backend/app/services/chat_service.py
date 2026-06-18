"""
Chat Service
RAG-powered conversation with context-aware answers.

Key improvements over v1:
  - pgvector native cosine similarity (single SQL query, HNSW index)
    replaces brute-force O(n) Python cosine similarity
  - Context includes page numbers, section titles, and file names
  - System prompt instructs LLM to cite [Document, Page X] in answers
  - Streaming support via generate_response_stream()
"""

import asyncio
import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

import google.generativeai as genai

from app.config import settings
from app.models.document import Document, DocumentEmbedding, DocumentStatus

logger = logging.getLogger(__name__)

# Configure Gemini once
genai.configure(api_key=settings.GEMINI_API_KEY)

# ── System Prompt ──────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are MiningNiti AI, an expert assistant specialized in the coal mining industry.

Your expertise includes:
- Mining safety regulations (MSHA, OSHA, DGMS compliance)
- Equipment operation and maintenance
- Geological and environmental analysis
- Incident investigation and prevention
- Regulatory compliance and permits

## Citation Rules (MANDATORY)
You MUST cite your sources using this exact format for every factual claim:
  [FileName, Page X]

Examples:
  "According to [Mining_site.pdf, Page 12], the ventilation requirements state..."
  "The safety manual [safety_protocol.pdf, Pages 5-6] specifies that..."
  "As per [MSHA_Regulations.pdf, Page 34], operators must..."

If a claim spans multiple pages: [FileName, Pages 12-13]
If no page is available: [FileName]

## Behavior Rules
1. ALWAYS prioritize safety information
2. ALWAYS cite the source document and page number for factual claims
3. Provide practical, actionable guidance
4. If the document context doesn't answer the question, clearly say so —
   do NOT fabricate information not found in the documents
5. Reference specific regulations when applicable
"""


class ChatService:
    """
    Chat service with RAG (Retrieval-Augmented Generation).

    Retrieval uses pgvector's native cosine similarity with HNSW index
    for sub-5ms nearest-neighbor search instead of loading all embeddings
    into Python memory.
    """

    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.embedding_model = settings.EMBEDDING_MODEL

    # ── Public API ─────────────────────────────────────────────────────────────

    async def generate_response(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Generate AI response using RAG.

        Returns:
            (response_text, sources_list)
            Sources include document name, file name, page numbers, and section title.
        """
        try:
            query_embedding = await self._get_embedding(query)
            relevant_chunks = await self._find_relevant_chunks(
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
                top_k=5,
            )

            context = self._format_context(relevant_chunks)
            prompt = self._build_prompt(query, context)

            response = self.model.generate_content(prompt)
            answer = response.text

            sources = self._build_sources(relevant_chunks[:3])
            return answer, sources

        except Exception as e:
            logger.error(f"Chat generation error: {e}", exc_info=True)
            return (
                "I apologize, but I encountered an error processing your question. Please try again.",
                [],
            )

    async def generate_response_stream(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream AI response as Server-Sent Events.

        Yields SSE-formatted strings:
          event: sources
          data: <json>

          event: token
          data: <json with text field>

          event: done
          data: <json with session metadata>
        """
        try:
            query_embedding = await self._get_embedding(query)
            relevant_chunks = await self._find_relevant_chunks(
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
                top_k=5,
            )

            # Emit sources first so the UI can render them while streaming
            sources = self._build_sources(relevant_chunks[:3])
            yield f"event: sources\ndata: {json.dumps(sources)}\n\n"

            context = self._format_context(relevant_chunks)
            prompt = self._build_prompt(query, context)

            # Stream LLM tokens
            response_stream = self.model.generate_content(prompt, stream=True)
            for chunk in response_stream:
                if chunk.text:
                    yield f"event: token\ndata: {json.dumps({'text': chunk.text})}\n\n"

            yield f"event: done\ndata: {json.dumps({'sources_count': len(sources)})}\n\n"

        except Exception as e:
            logger.error(f"Stream generation error: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    def get_mining_suggestions(self) -> List[str]:
        """Get suggested mining-related questions."""
        return [
            "What are the MSHA requirements for underground coal mines?",
            "How often should mining equipment be inspected?",
            "What are the emergency evacuation procedures?",
            "What are the ventilation requirements for coal mines?",
            "How to conduct a proper safety audit?",
        ]

    # ── Private helpers ────────────────────────────────────────────────────────

    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for query text using Gemini."""
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.embedding_model,
                content=text,
                task_type="retrieval_query",  # Use query task type (vs document)
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []

    async def _find_relevant_chunks(
        self,
        query_embedding: List[float],
        user_id: str,
        document_ids: Optional[List[str]],
        db: Session,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Find most relevant chunks using pgvector cosine similarity.

        Uses a single SQL query with the HNSW index — O(log n) instead of O(n).
        Replaces the old brute-force Python cosine similarity loop.
        """
        if not query_embedding:
            return []

        # Build parameterized query using pgvector's <=> operator (cosine distance)
        # Lower distance = higher similarity
        doc_filter = ""
        params: Dict[str, Any] = {
            "user_id": user_id,
            "top_k": top_k,
            "embedding": query_embedding,
        }

        if document_ids:
            doc_filter = "AND d.id = ANY(:doc_ids)"
            params["doc_ids"] = document_ids

        sql = text(f"""
            SELECT
                de.id,
                de.chunk_text,
                de.page_numbers,
                de.section_title,
                de.start_page,
                de.chunk_index,
                d.id AS document_id,
                d.title AS document_title,
                d.file_name,
                1 - (de.embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM document_embeddings de
            JOIN documents d ON d.id = de.document_id
            WHERE d.user_id = :user_id
              AND d.status = 'completed'
              {doc_filter}
            ORDER BY de.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """)

        try:
            rows = db.execute(sql, params).fetchall()
        except Exception as e:
            logger.error(f"pgvector query failed: {e}", exc_info=True)
            return []

        return [
            {
                "document_id": str(row.document_id),
                "document_title": row.document_title,
                "file_name": row.file_name,
                "text": row.chunk_text,
                "score": float(row.similarity),
                "page_numbers": row.page_numbers or (
                    [row.start_page] if row.start_page else []
                ),
                "section_title": row.section_title,
                "chunk_index": row.chunk_index,
            }
            for row in rows
        ]

    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        """
        Format retrieved chunks into rich context with full provenance.

        Each source block includes file name, page numbers, and section title
        so the LLM can construct accurate citations in its response.
        """
        if not chunks:
            return "No relevant document context found."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            pages = chunk.get("page_numbers", [])
            page_str = (
                f"Pages {pages[0]}–{pages[-1]}" if len(pages) > 1
                else f"Page {pages[0]}" if pages
                else "Page unknown"
            )
            section = chunk.get("section_title")
            section_str = f"\n**Section**: {section}" if section else ""

            context_parts.append(
                f"### Source {i}: {chunk['document_title']} ({chunk['file_name']})\n"
                f"**{page_str}**{section_str}\n\n"
                f"{chunk['text']}\n"
                f"---"
            )

        return "\n\n".join(context_parts)

    def _build_prompt(self, query: str, context: str) -> str:
        """Build the full RAG prompt."""
        return (
            f"{_SYSTEM_PROMPT}\n\n"
            f"## Document Context:\n{context}\n\n"
            f"## User Question:\n{query}\n\n"
            f"## Your Answer (remember to cite [FileName, Page X] for every claim):\n"
        )

    def _build_sources(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Build structured source citations for API response."""
        sources = []
        for chunk in chunks:
            pages = chunk.get("page_numbers", [])
            sources.append({
                "document_id": chunk["document_id"],
                "document_title": chunk["document_title"],
                "file_name": chunk["file_name"],
                "chunk_text": chunk["text"][:300] + ("..." if len(chunk["text"]) > 300 else ""),
                "relevance_score": round(chunk["score"], 4),
                "page_numbers": pages,
                "section_title": chunk.get("section_title"),
            })
        return sources
