"""
Cross-Encoder Reranking Service

After initial vector/BM25 retrieval returns candidate chunks,
a cross-encoder model reads the query + each chunk together
and produces a true semantic relevance score.

This catches cases where cosine similarity ranks a less-relevant
chunk higher than a more-relevant one.

Model: cross-encoder/ms-marco-MiniLM-L-6-v2
  - Trained on MS MARCO passage ranking
  - ~80M params, runs on CPU in ~50ms per batch of 20
  - Free, no API key needed
"""

import logging
from typing import List

from app.config import settings

logger = logging.getLogger(__name__)

_model = None


def _get_model():
    """Lazy-load the cross-encoder model (loaded once, cached globally)."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import CrossEncoder

            logger.info(f"Loading reranker model: {settings.RERANK_MODEL}")
            _model = CrossEncoder(settings.RERANK_MODEL)
            logger.info("Reranker model loaded successfully")
        except ImportError:
            logger.error(
                "sentence-transformers not installed. "
                "Install with: pip install sentence-transformers"
            )
            raise
    return _model


def rerank(
    query: str,
    chunks: List[dict],
    top_k: int = None,
    text_key: str = "text",
) -> List[dict]:
    """
    Rerank chunks by cross-encoder relevance score.

    Args:
        query: The user's search query
        chunks: List of chunk dicts, each must have `text_key` field
        top_k: Number of top chunks to return (default: settings.RERANK_TOP_K)
        text_key: Key in chunk dict containing the text to score

    Returns:
        Top-k chunks sorted by cross-encoder score (descending).
        Each chunk gets an added `rerank_score` field.
    """
    if not chunks:
        return []

    if top_k is None:
        top_k = settings.RERANK_TOP_K

    # If only 1 chunk, no reranking needed
    if len(chunks) <= top_k:
        for c in chunks:
            c["rerank_score"] = c.get("score", 0.0)
        return chunks

    model = _get_model()

    # Build query-document pairs for cross-encoder
    pairs = [(query, chunk[text_key]) for chunk in chunks]

    try:
        scores = model.predict(pairs)
    except Exception as e:
        logger.error(f"Reranking failed: {e}", exc_info=True)
        # Fall back to original ordering
        for c in chunks:
            c["rerank_score"] = c.get("score", 0.0)
        return chunks[:top_k]

    # Attach rerank scores and sort
    for chunk, score in zip(chunks, scores):
        chunk["rerank_score"] = float(score)

    chunks.sort(key=lambda c: c["rerank_score"], reverse=True)

    reranked = chunks[:top_k]
    logger.debug(
        f"Reranked {len(chunks)} chunks → top {top_k} "
        f"(best score: {reranked[0]['rerank_score']:.4f})"
    )
    return reranked
