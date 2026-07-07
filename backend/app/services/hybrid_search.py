"""
Hybrid Search Service

Combines pgvector cosine similarity (semantic) with pg_trgm
trigram similarity (keyword/BM25) using Reciprocal Rank Fusion.

This catches both:
  - Semantic matches: "how to prevent methane explosions"
  - Keyword matches: "30 CFR 75.323", "Caterpillar D11"

Both search paths use the same PostgreSQL database — no external
services needed.
"""

import logging
from collections import defaultdict
from typing import Any, Dict, List, Optional

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

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings

logger = logging.getLogger(__name__)


async def vector_search(
    query_embedding: List[float],
    db: Session,
    user_id: str,
    document_ids: Optional[List[str]] = None,
    top_k: int = 20,
) -> List[Dict[str, Any]]:
    """
    Pure pgvector cosine similarity search.
    Returns chunks ranked by vector distance.
    """
    doc_filter = ""
    params: Dict[str, Any] = {
        "user_id": user_id,
        "embedding": query_embedding,
        "top_k": top_k,
        "threshold": settings.SIMILARITY_THRESHOLD,
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
          AND (1 - (de.embedding <=> CAST(:embedding AS vector))) >= :threshold
        ORDER BY de.embedding <=> CAST(:embedding AS vector)
        LIMIT :top_k
    """
    )

    try:
        rows = db.execute(sql, params).fetchall()
    except Exception as e:
        logger.error(f"Vector search failed: {e}", exc_info=True)
        db.rollback()
        return []

    return [
        {
            "id": str(row.id),
            "text": row.chunk_text,
            "page_numbers": row.page_numbers
            or ([row.start_page] if row.start_page else []),
            "section_title": row.section_title,
            "chunk_index": row.chunk_index,
            "document_id": str(row.document_id),
            "document_title": row.document_title,
            "file_name": row.file_name,
            "file_url": row.file_url,
            "score": float(row.similarity),
        }
        for row in rows
    ]


def bm25_search(
    query_text: str,
    db: Session,
    user_id: str,
    document_ids: Optional[List[str]] = None,
    top_k: int = 20,
) -> List[Dict[str, Any]]:
    """
    PostgreSQL pg_trgm similarity search (keyword/BM25 equivalent).
    Catches exact and partial string matches that vector search misses.
    """
    doc_filter = ""
    params: Dict[str, Any] = {
        "user_id": user_id,
        "query_text": query_text,
        "top_k": top_k,
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
            similarity(de.chunk_text, :query_text) AS bm25_score
        FROM document_embeddings de
        JOIN documents d ON d.id = de.document_id
        WHERE d.user_id = :user_id
          AND d.status = 'COMPLETED'
          {doc_filter}
          AND de.chunk_text % :query_text
        ORDER BY bm25_score DESC
        LIMIT :top_k
    """
    )

    try:
        rows = db.execute(sql, params).fetchall()
    except Exception as e:
        # pg_trgm extension might not be available — fall back gracefully
        logger.warning(f"BM25 search failed (pg_trgm may be unavailable): {e}")
        db.rollback()
        return []

    return [
        {
            "id": str(row.id),
            "text": row.chunk_text,
            "page_numbers": row.page_numbers
            or ([row.start_page] if row.start_page else []),
            "section_title": row.section_title,
            "chunk_index": row.chunk_index,
            "document_id": str(row.document_id),
            "document_title": row.document_title,
            "file_name": row.file_name,
            "file_url": row.file_url,
            "score": float(row.bm25_score),
        }
        for row in rows
    ]


def reciprocal_rank_fusion(
    list_a: List[Dict[str, Any]],
    list_b: List[Dict[str, Any]],
    k: int = None,
) -> List[Dict[str, Any]]:
    """
    Reciprocal Rank Fusion (RRF) combines two ranked lists.

    RRF_score(d) = sum(1 / (k + rank_i(d))) for each list

    Args:
        list_a: First ranked list (e.g., vector search results)
        list_b: Second ranked list (e.g., BM25 results)
        k: RRF constant (higher = less rank influence, default from config)

    Returns:
        Merged list sorted by RRF score (descending)
    """
    if k is None:
        k = settings.RRF_K

    scores = defaultdict(float)
    all_items = {}

    for rank, item in enumerate(list_a):
        item_id = item["id"]
        scores[item_id] += 1.0 / (k + rank + 1)
        all_items[item_id] = item

    for rank, item in enumerate(list_b):
        item_id = item["id"]
        scores[item_id] += 1.0 / (k + rank + 1)
        if item_id not in all_items:
            all_items[item_id] = item

    ranked = sorted(scores.items(), key=lambda x: -x[1])
    return [all_items[item_id] for item_id, _ in ranked]


@traceable(name="miningniti.retrieval.hybrid_search")
async def hybrid_search(
    query_text: str,
    query_embedding: List[float],
    db: Session,
    user_id: str,
    document_ids: Optional[List[str]] = None,
    top_k: int = None,
) -> List[Dict[str, Any]]:
    """
    Hybrid search combining vector similarity + pg_trgm BM25 via RRF.

    Flow:
    1. Run vector search (pgvector cosine) → list A
    2. Run BM25 search (pg_trgm) → list B
    3. Combine via Reciprocal Rank Fusion
    4. Return top_k fused results

    If hybrid search is disabled or BM25 fails, falls back to vector-only.
    """
    if top_k is None:
        top_k = settings.RERANK_OVER_FETCH

    # Always run vector search
    vector_results = await vector_search(
        query_embedding=query_embedding,
        db=db,
        user_id=user_id,
        document_ids=document_ids,
        top_k=top_k,
    )

    if not settings.ENABLE_HYBRID_SEARCH:
        return vector_results

    # Run BM25 search (may fail if pg_trgm unavailable)
    bm25_results = bm25_search(
        query_text=query_text,
        db=db,
        user_id=user_id,
        document_ids=document_ids,
        top_k=top_k,
    )

    if not bm25_results:
        # BM25 returned nothing — fall back to vector-only
        return vector_results

    # Fuse results
    fused = reciprocal_rank_fusion(vector_results, bm25_results)

    logger.debug(
        f"Hybrid search: {len(vector_results)} vector + "
        f"{len(bm25_results)} BM25 → {len(fused)} fused"
    )

    return fused[:top_k]
