"""
Hybrid Search Service

Combines pgvector cosine similarity (semantic) with PostgreSQL full-text
search (lexical) using Reciprocal Rank Fusion.

This catches both:
  - Semantic matches: "how to prevent methane explosions"
  - Lexical matches:  "30 CFR 75.323", "Caterpillar D11"

Both search paths use the same PostgreSQL database — no external
services needed.

History worth knowing: the lexical arm previously used pg_trgm's `%` operator,
comparing whole-string trigram similarity between a ~1000 character chunk and
a short question. That scores ~0.13 against pg_trgm's 0.30 default threshold,
so it returned zero rows for every query and RRF spent the entire life of the
feature fusing one list with nothing. It is now a real inverted index — see
migration 003 and tests/eval/test_retrieval_eval.py.
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
from app.models.document import DocumentStatus, db_status

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
        "doc_status": db_status(DocumentStatus.COMPLETED),
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
          AND d.status = :doc_status
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


# Turns free text into an OR-ed tsquery over its own lexemes.
#
# The obvious constructions do not work for question-shaped input:
# plainto_tsquery and websearch_to_tsquery both AND every term, so
# "What are the methane limits under 30 CFR 75.323?" requires the chunk to
# contain "limit" as well as "methane" — and the regulation text says
# "less than 1.0 percent" instead. Measured against a real corpus, the AND
# form returned zero rows for exactly the query it should have nailed.
#
# ORing the lexemes lets ts_rank_cd do the discriminating instead of the
# matcher: the correct chunk scored 0.60 against 0.10 for a near miss.
#
# quote_literal() on each lexeme is what makes this injection-safe against
# tsquery's own operator syntax — '&', '|', '!', '<->' and ':*A' in user input
# are reduced to ordinary quoted lexemes rather than parsed as operators.
# A query of only stopwords yields NULL, and `chunk_tsv @@ NULL` is NULL, so
# the search correctly returns nothing instead of raising.
_OR_TSQUERY = """
    (SELECT to_tsquery('english', string_agg(quote_literal(lex), ' | '))
     FROM unnest(tsvector_to_array(to_tsvector('english', :query_text))) AS lex)
"""


def fulltext_search(
    query_text: str,
    db: Session,
    user_id: str,
    document_ids: Optional[List[str]] = None,
    top_k: int = 20,
) -> List[Dict[str, Any]]:
    """
    PostgreSQL full-text lexical search over the chunk_tsv inverted index.

    Complements dense retrieval by catching the things embeddings are worst
    at: exact identifiers and rare tokens such as "30 CFR 75.323",
    "Caterpillar D11", or a specific chemical name.

    Ranked with ts_rank_cd (cover density), which favours chunks where the
    query terms occur close together. This is not BM25 — true BM25 needs an
    extension like pg_search; the name is accurate on purpose.
    """
    doc_filter = ""
    params: Dict[str, Any] = {
        "user_id": user_id,
        "query_text": query_text,
        "top_k": top_k,
        "doc_status": db_status(DocumentStatus.COMPLETED),
    }

    if document_ids:
        doc_filter = "AND d.id = ANY(CAST(:doc_ids AS uuid[]))"
        params["doc_ids"] = document_ids

    sql = text(
        f"""
        WITH q AS (SELECT {_OR_TSQUERY} AS tsq)
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
            ts_rank_cd(de.chunk_tsv, q.tsq) AS lexical_score
        FROM document_embeddings de
        JOIN documents d ON d.id = de.document_id
        CROSS JOIN q
        WHERE d.user_id = :user_id
          AND d.status = :doc_status
          {doc_filter}
          AND de.chunk_tsv @@ q.tsq
        ORDER BY lexical_score DESC
        LIMIT :top_k
    """
    )

    try:
        rows = db.execute(sql, params).fetchall()
    except Exception as e:
        # Most likely the chunk_tsv column is missing because migration 003
        # has not been applied. Degrade to vector-only rather than 500.
        logger.warning(f"Full-text search failed (is migration 003 applied?): {e}")
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
            "score": float(row.lexical_score),
        }
        for row in rows
    ]


# Backwards-compatible alias: the old name described an implementation that
# was never BM25 and never returned rows.
bm25_search = fulltext_search


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
    Hybrid search combining dense vector similarity with lexical full-text
    search via Reciprocal Rank Fusion.

    Flow:
    1. Vector search (pgvector cosine)      → list A — semantic similarity
    2. Full-text search (ts_rank_cd + GIN)  → list B — exact terms, identifiers
    3. Combine via Reciprocal Rank Fusion
    4. Return top_k fused results

    Falls back to vector-only if hybrid is disabled or the lexical side is
    unavailable (e.g. migration 003 not yet applied).
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

    lexical_results = fulltext_search(
        query_text=query_text,
        db=db,
        user_id=user_id,
        document_ids=document_ids,
        top_k=top_k,
    )

    if not lexical_results:
        # Nothing matched lexically (or the index is missing) — vector-only.
        return vector_results

    # Fuse results
    fused = reciprocal_rank_fusion(vector_results, lexical_results)

    logger.debug(
        f"Hybrid search: {len(vector_results)} vector + "
        f"{len(lexical_results)} lexical → {len(fused)} fused"
    )

    return fused[:top_k]
