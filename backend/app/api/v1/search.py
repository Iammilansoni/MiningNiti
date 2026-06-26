"""
Semantic Search API Endpoint
Natural language search across all user documents using pgvector.

Supports:
  - Query: free-text natural language
  - Filters: category, date range
  - Relevance threshold: filters out low-quality matches
  - Results grouped by document with page-level provenance
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Optional

import google.generativeai as genai
from fastapi import APIRouter, Depends
from fastapi import Query as FastAPIQuery
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.config import settings
from app.db.session import get_db
from app.models.document import DocumentCategory

logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Gemini for embeddings
genai.configure(api_key=settings.GEMINI_API_KEY)

# Minimum similarity score to return a result (0-1, higher = more strict)
RELEVANCE_THRESHOLD = 0.35


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
    Semantic search across all user documents using vector similarity.

    Returns chunks ranked by relevance, grouped by document.
    Uses pgvector HNSW index for sub-5ms nearest-neighbor search.

    Example queries:
      - "ventilation rules for underground mines"
      - "emergency evacuation procedures"
      - "equipment maintenance schedule"
      - "MSHA regulations compliance"
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

    # Build dynamic filters
    category_filter = ""
    params = {
        "user_id": user_id,
        "embedding": embedding,
        "limit": limit,
        "threshold": RELEVANCE_THRESHOLD,
    }

    if category:
        category_filter = "AND d.category = :category"
        params["category"] = category

    # pgvector cosine similarity search with relevance threshold
    sql = text(
        f"""
        SELECT
            de.id AS chunk_id,
            de.chunk_text,
            de.page_numbers,
            de.section_title,
            de.start_page,
            de.chunk_index,
            d.id AS document_id,
            d.title AS document_title,
            d.file_name,
            d.category,
            d.safety_score,
            d.created_at,
            1 - (de.embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM document_embeddings de
        JOIN documents d ON d.id = de.document_id
        WHERE d.user_id = :user_id
          AND d.status = 'completed'
          {category_filter}
          AND (1 - (de.embedding <=> CAST(:embedding AS vector))) >= :threshold
        ORDER BY de.embedding <=> CAST(:embedding AS vector)
        LIMIT :limit
    """
    )

    try:
        rows = db.execute(sql, params).fetchall()
    except Exception as e:
        logger.error(f"Semantic search query failed: {e}", exc_info=True)
        return {"query": q, "results": [], "total": 0, "error": "Search failed"}

    # Format results
    results = []
    for row in rows:
        pages = row.page_numbers or ([row.start_page] if row.start_page else [])
        page_str = (
            f"Pages {pages[0]}–{pages[-1]}"
            if len(pages) > 1
            else f"Page {pages[0]}" if pages else "Unknown page"
        )
        results.append(
            {
                "chunk_id": str(row.chunk_id),
                "document_id": str(row.document_id),
                "document_title": row.document_title,
                "file_name": row.file_name,
                "category": row.category,
                "safety_score": row.safety_score,
                "chunk_text": row.chunk_text,
                "section_title": row.section_title,
                "page_numbers": pages,
                "page_label": page_str,
                "relevance_score": round(float(row.similarity), 4),
                "relevance_percent": round(float(row.similarity) * 100, 1),
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
