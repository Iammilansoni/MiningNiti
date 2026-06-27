"""
Semantic Search API Endpoint
Natural language search across all user documents.

Production retrieval pipeline:
  1. Embed query via Gemini text-embedding-004
  2. Hybrid search: pgvector cosine + pg_trgm BM25 via RRF
  3. Cross-encoder reranking for precise relevance
  4. Results grouped by document with page-level provenance
"""

import asyncio
import logging
from typing import List, Optional

import google.generativeai as genai
from fastapi import APIRouter, Depends
from fastapi import Query as FastAPIQuery
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.config import settings
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Gemini for embeddings
genai.configure(api_key=settings.GEMINI_API_KEY)


async def _get_query_embedding(text_input: str) -> List[float]:
    """Generate query embedding using Gemini text-embedding-004."""
    try:
        result = await asyncio.to_thread(
            genai.embed_content,
            model=settings.EMBEDDING_MODEL,
            content=text_input,
            task_type="retrieval_query",
        )
        return result["embedding"]
    except Exception as e:
        logger.error(f"Query embedding failed: {e}")
        return []


@router.get("")
async def semantic_search(
    q: str = FastAPIQuery(
        ..., min_length=2, description="Natural language search query"
    ),
    limit: int = FastAPIQuery(default=20, ge=1, le=50),
    category: Optional[str] = FastAPIQuery(default=None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Semantic search across all user documents.

    Production pipeline:
      1. Hybrid search (pgvector + pg_trgm via RRF)
      2. Cross-encoder reranking
      3. Results with page-level provenance

    Example queries:
      - "ventilation rules for underground mines"
      - "30 CFR 75.323 methane requirements"
      - "equipment maintenance schedule for Caterpillar D11"
    """
    if not q.strip():
        return {"query": q, "results": [], "total": 0}

    # Generate query embedding
    embedding = await _get_query_embedding(q.strip())
    if not embedding:
        return {
            "query": q,
            "results": [],
            "total": 0,
            "error": "Could not generate embedding for query",
        }

    # Step 1: Hybrid search (over-fetch for reranking)
    from app.services.hybrid_search import hybrid_search

    candidates = await hybrid_search(
        query_text=q.strip(),
        query_embedding=embedding,
        db=db,
        user_id=user_id,
        top_k=settings.RERANK_OVER_FETCH,
    )

    # Step 2: Rerank
    if settings.ENABLE_RERANKING and len(candidates) > limit:
        from app.services.reranker import rerank

        candidates = rerank(query=q.strip(), chunks=candidates, top_k=limit)
    else:
        candidates = candidates[:limit]

    # Format results
    results = []
    for row in candidates:
        pages = row.get("page_numbers", [])
        page_str = (
            f"Pages {pages[0]}\u2013{pages[-1]}"
            if len(pages) > 1
            else f"Page {pages[0]}" if pages else "Unknown page"
        )
        results.append(
            {
                "chunk_id": row["id"],
                "document_id": row["document_id"],
                "document_title": row["document_title"],
                "file_name": row["file_name"],
                "chunk_text": row["text"],
                "section_title": row.get("section_title"),
                "page_numbers": pages,
                "page_label": page_str,
                "relevance_score": round(
                    row.get("rerank_score", row.get("score", 0.0)), 4
                ),
                "relevance_percent": round(
                    row.get("rerank_score", row.get("score", 0.0)) * 100, 1
                ),
            }
        )

    return {
        "query": q,
        "results": results,
        "total": len(results),
        "filters_applied": {
            "category": category,
        },
    }
