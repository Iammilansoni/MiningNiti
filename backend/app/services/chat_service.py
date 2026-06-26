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
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

import google.generativeai as genai
from sqlalchemy import text
from sqlalchemy.orm import Session

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

            from app.services.llm_provider import get_groq_client

            client = get_groq_client()

            # Removed debug print that causes charmap error on Windows
            # print("DEBUG - FINAL PROMPT BEING SENT TO LLM:\n", prompt)

            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
            )
            answer = response.choices[0].message.content

            tokens_used = (
                {
                    "input": response.usage.prompt_tokens,
                    "output": response.usage.completion_tokens,
                }
                if hasattr(response, "usage")
                else None
            )

            sources = self._build_sources(relevant_chunks[:3])
            return answer, sources, tokens_used

        except Exception as e:
            logger.error(f"Chat generation error: {e}", exc_info=True)
            return (
                "I apologize, but I encountered an error processing your question. Please try again.",
                [],
                None,
            )

    async def generate_response_stream(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None,
    ) -> AsyncGenerator[str, None]:
        try:
            query_embedding = await self._get_embedding(query)
            relevant_chunks = await self._find_relevant_chunks(
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
                top_k=5,
            )

            sources = self._build_sources(relevant_chunks[:3])
            yield f"event: sources\ndata: {json.dumps(sources)}\n\n"

            context = self._format_context(relevant_chunks)
            prompt = self._build_prompt(query, context)

            from app.services.llm_provider import get_groq_client

            client = get_groq_client()

            # Removed debug print that causes charmap error on Windows
            # print("DEBUG - FINAL PROMPT BEING SENT TO LLM:\n", prompt)

            response_stream = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )

            async for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    yield f"event: token\ndata: {json.dumps({'text': chunk.choices[0].delta.content})}\n\n"

            # Groq async stream doesn't easily return usage per chunk without stream_options
            tokens_used = None
            yield f"event: done\ndata: {json.dumps({'sources_count': len(sources), 'tokens_used': tokens_used})}\n\n"

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
                output_dimensionality=768,
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
            doc_filter = "AND d.id = ANY(CAST(:doc_ids AS uuid[]))"
            params["doc_ids"] = document_ids

        sql = text(
            f"""
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
                d.file_url,
                1 - (de.embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM document_embeddings de
            JOIN documents d ON d.id = de.document_id
            WHERE d.user_id = :user_id
              AND d.status = 'COMPLETED'
              {doc_filter}
            ORDER BY de.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
        """
        )

        try:
            rows = db.execute(sql, params).fetchall()
        except Exception as e:
            logger.error(f"pgvector query failed: {e}", exc_info=True)
            db.rollback()
            return []

        return [
            {
                "document_id": str(row.document_id),
                "document_title": row.document_title,
                "file_name": row.file_name,
                "file_url": row.file_url,
                "text": row.chunk_text,
                "score": float(row.similarity),
                "page_numbers": row.page_numbers
                or ([row.start_page] if row.start_page else []),
                "section_title": row.section_title,
                "chunk_index": row.chunk_index,
            }
            for row in rows
        ]

    def _format_context(self, chunks: List[Dict[str, Any]]) -> str:
        if not chunks:
            return "No relevant document context found."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            pages = chunk.get("page_numbers", [])
            page_str = (
                f"{pages[0]}-{pages[-1]}"
                if len(pages) > 1
                else f"{pages[0]}" if pages else "unknown"
            )
            file_name = chunk.get("file_name", "unknown.pdf")
            text = chunk.get("text", "")
            section = chunk.get("section_title", "")

            # Format explicitly required for the chat agent to recognize citations:
            section_prefix = f"[{section}] " if section else ""
            context_parts.append(
                f"Context chunk {i}: {section_prefix}{text} (Source: {file_name}, Page: {page_str})"
            )

        return "\n".join(context_parts)

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
            sources.append(
                {
                    "document_id": chunk["document_id"],
                    "document_title": chunk["document_title"],
                    "file_name": chunk["file_name"],
                    "file_url": chunk.get("file_url"),
                    "chunk_text": chunk["text"][:300]
                    + ("..." if len(chunk["text"]) > 300 else ""),
                    "exact_text_chunk": chunk["text"],
                    "relevance_score": round(chunk["score"], 4),
                    "page_numbers": pages,
                    "section_title": chunk.get("section_title"),
                }
            )
        return sources
