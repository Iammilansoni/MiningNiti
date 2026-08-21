"""
Chat Service
RAG-powered conversation with production-grade retrieval pipeline.

Pipeline: Query → Embed → Hybrid Search (Vector + BM25) → Rerank → LLM

Key improvements over v1:
  - Hybrid search: pgvector cosine + pg_trgm BM25 via Reciprocal Rank Fusion
  - Cross-encoder reranking: ms-marco-MiniLM-L-6-v2 for precise relevance
  - Similarity threshold: filters irrelevant chunks before context formatting
  - System prompt as system role: proper LLM message structure
  - Context includes page numbers, section titles, and file names
  - Streaming support via generate_response_stream()
"""

import asyncio
import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

try:
    from langsmith import traceable

    _HAS_LANGSMITH = True
except ImportError:
    _HAS_LANGSMITH = False

    def traceable(func=None, **kwargs):  # type: ignore[misc]
        """No-op fallback when langsmith is not installed."""
        if func is not None:
            return func
        return lambda f: f


import google.generativeai as genai
from sqlalchemy.orm import Session

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini once
genai.configure(api_key=settings.GEMINI_API_KEY)

# Groq decommissioned llama-3.3-70b-versatile on 2026-08-16. gpt-oss-120b is the
# recommended replacement: 131k context (up from 128k) and the same family the
# entity extractor and summarizer already run on Cerebras.
#
# Exported because every caller that records `model_used` must name the model
# that actually generated the text. Three call sites previously hardcoded Gemini
# names here while generation ran on Groq, so the stored provenance was false.
CHAT_MODEL = "openai/gpt-oss-120b"

# ── System Prompt ──────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """You are MiningNiti AI, an expert assistant specialized in the coal mining industry.

## CRITICAL RULES
1. ONLY cite documents that appear in the "Document Context" section below.
   NEVER invent, guess, or fabricate document names that are not provided in the context.
2. ONLY use the exact file names and page numbers shown in the context chunks.
3. If the context does not contain enough information to answer, say:
   "Based on the available documents, I cannot find specific information about this topic."
4. NEVER make up facts, regulations, or details not found in the provided context.

## Citation Format
Cite using the exact file name and page from the context:
  [FileName.pdf, Page X]

Example (if the context shows "Source: acts_1948.pdf, Page: 5"):
  "As per [acts_1948.pdf, Page 5], the act provides for..."

If a claim spans multiple pages:
  [acts_1948.pdf, Pages 1-3]

## Behavior Rules
1. ALWAYS prioritize safety information
2. ALWAYS cite the source document and page number for factual claims
3. Provide practical, actionable guidance
4. If the document context doesn't answer the question, clearly say so
5. Reference specific regulations when applicable
"""


class ChatService:
    """
    Chat service with production RAG pipeline.

    Retrieval flow:
      1. Embed query via Gemini text-embedding-004
      2. Hybrid search: pgvector cosine similarity + pg_trgm BM25
      3. Reciprocal Rank Fusion to merge results
      4. Cross-encoder reranking for precise relevance scoring
      5. Top-K chunks formatted as context for LLM
      6. System prompt as system role for proper instruction following
    """

    def __init__(self):
        # No Gemini GenerativeModel here: generation runs on Groq (CHAT_MODEL).
        # A `self.model` was constructed on every init and never read.
        self.embedding_model = settings.EMBEDDING_MODEL

    # ── Public API ─────────────────────────────────────────────────────────────

    @traceable(name="miningniti.chat.generate_response")
    async def generate_response(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Tuple[str, List[Dict[str, Any]], Optional[Dict[str, int]]]:
        try:
            retrieval_query = self._build_retrieval_query(query, history or [])
            query_embedding = await self._get_embedding(retrieval_query)
            relevant_chunks = await self._retrieve_chunks(
                query=retrieval_query,
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
            )

            context = self._format_context(relevant_chunks)

            from app.services.llm_provider import get_groq_client

            client = get_groq_client()

            response = await client.chat.completions.create(
                model=CHAT_MODEL,
                messages=self._build_messages(query, context, history),
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

    @traceable(name="miningniti.chat.generate_response_stream")
    async def generate_response_stream(
        self,
        query: str,
        user_id: str,
        document_ids: Optional[List[str]] = None,
        db: Session = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> AsyncGenerator[str, None]:
        try:
            retrieval_query = self._build_retrieval_query(query, history or [])
            query_embedding = await self._get_embedding(retrieval_query)
            relevant_chunks = await self._retrieve_chunks(
                query=retrieval_query,
                query_embedding=query_embedding,
                user_id=user_id,
                document_ids=document_ids,
                db=db,
            )

            sources = self._build_sources(relevant_chunks[:3])
            yield f"event: sources\ndata: {json.dumps(sources)}\n\n"

            context = self._format_context(relevant_chunks)

            from app.services.llm_provider import get_groq_client

            client = get_groq_client()

            response_stream = await client.chat.completions.create(
                model=CHAT_MODEL,
                messages=self._build_messages(query, context, history),
                stream=True,
            )

            async for chunk in response_stream:
                if chunk.choices[0].delta.content:
                    yield f"event: token\ndata: {json.dumps({'text': chunk.choices[0].delta.content})}\n\n"

            tokens_used = None
            yield f"event: done\ndata: {json.dumps({'sources_count': len(sources), 'tokens_used': tokens_used})}\n\n"

        except Exception as e:
            logger.error(f"Stream generation error: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

    # ── Conversation Memory ───────────────────────────────────────────────────

    @staticmethod
    def load_session_history(
        db: Session,
        session_id: Any,
        max_turns: Optional[int] = None,
        max_chars: Optional[int] = None,
    ) -> List[Dict[str, str]]:
        """Load recent prior turns for a session, oldest-first, ready to replay.

        Call this BEFORE persisting the incoming user message. Both chat
        endpoints add the new user row to the session early (one commits it
        immediately), and SQLAlchemy autoflush would otherwise pull that row
        into this query — the model would see the current question twice, once
        as history and once as the live turn.

        Bounded by turn count and an approximate char budget. Trimming walks
        backwards from the newest message and stops on the first message that
        would breach the budget, so the retained window is always a contiguous
        recent slice rather than a sampling of the conversation.
        """
        from app.models.chat import ChatMessage

        max_turns = max_turns or settings.CHAT_HISTORY_MAX_TURNS
        max_chars = max_chars or settings.CHAT_HISTORY_MAX_CHARS

        try:
            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == session_id)
                .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
                .limit(max_turns)
                .all()
            )
        except Exception as e:
            # History is an enhancement, never a precondition. A failure here
            # must degrade to a stateless answer, not break the chat.
            logger.warning(f"Could not load session history: {e}")
            return []

        history: List[Dict[str, str]] = []
        budget = max_chars
        for row in rows:  # newest → oldest
            content = (row.content or "").strip()
            if not content or row.role not in ("user", "assistant"):
                continue
            if len(content) > budget:
                break
            budget -= len(content)
            history.append({"role": row.role, "content": content})

        history.reverse()  # back to chronological order

        # Never open the replay on an assistant turn: a dangling answer with no
        # question reads as the model talking to itself and measurably degrades
        # follow-up quality.
        while history and history[0]["role"] == "assistant":
            history.pop(0)

        return history

    @staticmethod
    def _build_retrieval_query(query: str, history: List[Dict[str, str]]) -> str:
        """Expand a follow-up into something retrievable on its own.

        Retrieval sees only the raw question, so "what about surface mines?"
        embeds to almost nothing useful and the reranker has no good candidates
        to choose from — the generation half would have full history while the
        retrieval half stayed blind.

        This is deliberately a cheap string heuristic rather than an LLM
        condensation call: it costs nothing, adds no latency to every turn, and
        cannot fail. A dependent-looking follow-up is prefixed with the previous
        user turn purely for embedding and lexical matching; the prompt the
        model actually answers is untouched.
        """
        if not history:
            return query

        stripped = query.strip().lower()
        looks_dependent = len(stripped) < 60 or stripped.startswith(
            (
                "what about",
                "and ",
                "but ",
                "how about",
                "why",
                "what if",
                "does it",
                "do they",
                "is it",
                "are they",
                "which one",
                "that ",
                "those ",
                "it ",
                "they ",
                "then ",
                "also",
                "same",
            )
        )
        if not looks_dependent:
            return query

        prior_user = next(
            (m["content"] for m in reversed(history) if m["role"] == "user"), None
        )
        if not prior_user:
            return query

        return f"{prior_user}\n{query}"

    def _build_messages(
        self,
        query: str,
        context: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> List[Dict[str, str]]:
        """Assemble the LLM message list: system, prior turns, then this turn.

        Retrieved context rides on the final user message only. Restating it on
        every historical turn would multiply the prompt by the history depth and
        let stale context compete with the chunks retrieved for the live
        question — the citation rules in the system prompt must bind against
        the current context, not an older one.
        """
        messages: List[Dict[str, str]] = [{"role": "system", "content": _SYSTEM_PROMPT}]
        if history:
            messages.extend(history)
        messages.append(
            {"role": "user", "content": self._build_user_message(query, context)}
        )
        return messages

    def get_mining_suggestions(self) -> List[str]:
        """Get suggested mining-related questions."""
        return [
            "What are the MSHA requirements for underground coal mines?",
            "How often should mining equipment be inspected?",
            "What are the emergency evacuation procedures?",
            "What are the ventilation requirements for coal mines?",
            "How to conduct a proper safety audit?",
        ]

    # ── Retrieval Pipeline ────────────────────────────────────────────────────

    async def _retrieve_chunks(
        self,
        query: str,
        query_embedding: List[float],
        user_id: str,
        document_ids: Optional[List[str]],
        db: Session,
    ) -> List[Dict[str, Any]]:
        """
        Production RAG retrieval pipeline:
          1. Hybrid search (vector + BM25) → over-fetch candidates
          2. Cross-encoder rerank → precise top-K
        """
        if not query_embedding:
            return []

        # Step 1: Hybrid search (over-fetch for reranking)
        from app.services.hybrid_search import hybrid_search

        candidates = await hybrid_search(
            query_text=query,
            query_embedding=query_embedding,
            db=db,
            user_id=user_id,
            document_ids=document_ids,
            top_k=settings.RERANK_OVER_FETCH,
        )

        if not candidates:
            return []

        # Step 2: Cross-encoder reranking
        if settings.ENABLE_RERANKING and len(candidates) > settings.RERANK_TOP_K:
            from app.services.reranker import rerank

            candidates = rerank(
                query=query,
                chunks=candidates,
                top_k=settings.RERANK_TOP_K,
            )

        return candidates

    # ── Embedding ─────────────────────────────────────────────────────────────

    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding for query text using Gemini."""
        try:
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.embedding_model,
                content=text,
                task_type="retrieval_query",
                output_dimensionality=768,
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []

    # ── Context Formatting ────────────────────────────────────────────────────

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

            section_prefix = f"[{section}] " if section else ""
            context_parts.append(
                f"Context chunk {i}: {section_prefix}{text} (Source: {file_name}, Page: {page_str})"
            )

        return "\n".join(context_parts)

    def _build_user_message(self, query: str, context: str) -> str:
        """Build the user message with context and query."""
        return (
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
                    "relevance_score": round(
                        chunk.get("rerank_score", chunk.get("score", 0.0)), 4
                    ),
                    "page_numbers": pages,
                    "section_title": chunk.get("section_title"),
                }
            )
        return sources
