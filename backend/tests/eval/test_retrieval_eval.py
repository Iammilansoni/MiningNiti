"""
Retrieval quality evaluation against the golden set.

This measures the real retrieval pipeline — hybrid_search (pgvector + full-text
via RRF) followed by the cross-encoder reranker — and fails the build if
quality regresses below the configured floors.

Embeddings come from a small local sentence-transformers model rather than the
Gemini API, so the suite is deterministic and needs no API keys in CI. That is
a deliberate trade: it does not measure how good Gemini's embeddings are, it
measures whether the *pipeline* still works. Those are different questions, and
this is the one that catches regressions.

The regression it exists to catch already happened once: the lexical arm used
pg_trgm whole-string similarity, scored ~0.13 against a 0.30 threshold, and
returned zero rows for every query — so RRF silently fused one list with
nothing for the entire life of the feature. Nothing failed.

Measured finding — aggregate metrics alone do NOT catch that
------------------------------------------------------------
Stubbing the lexical arm to return [] and re-running this suite against a
130-chunk corpus leaves every aggregate metric unchanged: hit_rate@5 1.000,
MRR 1.000, nDCG@5 0.968. The cross-encoder reranker fully compensates, because
dense retrieval still surfaces the right chunk inside the top-20 over-fetch and
the reranker promotes it to the top.

Two consequences, both deliberate in the design below:

  1. Aggregate scores cannot be the only gate. The direct guards
     (test_lexical_arm_returns_rows, test_citation_lookalikes_are_distinguished)
     assert the lexical arm returns rows at all — they are what actually fail
     when it breaks, and they do.

  2. On this corpus the lexical arm currently contributes no measurable lift
     over vector+rerank. That is real information about the architecture, not
     a gap in the tests. It says the hybrid arm earns its keep on recall for
     queries the reranker never sees candidates for — which needs a larger and
     harder corpus to demonstrate than is reasonable to run in CI.

Requires PostgreSQL with pgvector + migration 003. Run with:
    pytest tests/eval/test_retrieval_eval.py -v -m retrieval
"""

from __future__ import annotations

import asyncio
import os
import uuid
from typing import Dict, List

import pytest

from tests.eval.golden_set import FULL_CORPUS, QUERIES, Query
from tests.eval.retrieval_metrics import aggregate, format_report

pytestmark = [pytest.mark.retrieval, pytest.mark.slow]

# Local, offline, deterministic. 384 dims, zero-padded to the 768-dim column —
# zero padding leaves cosine similarity mathematically unchanged.
EVAL_EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TARGET_DIM = 768

TOP_K = 5

# Quality floors. Set below current measured values so ordinary noise does not
# fail the build, but high enough that a broken retrieval arm does. Raise them
# as the pipeline improves — that is the point of having them in version
# control.
THRESHOLDS: Dict[str, float] = {
    f"hit_rate@{TOP_K}": 0.90,
    "mrr": 0.75,
    f"recall@{TOP_K}": 0.85,
    f"ndcg@{TOP_K}": 0.75,
}

# Per-category floors. These catch one query class degrading while the blended
# average stays healthy — not the same thing as proving an arm is alive.
ARM_HIT_RATE_FLOOR = {
    "lexical": 0.90,
    "semantic": 0.75,
    "mixed": 0.90,
}


# ── Fixtures ───────────────────────────────────────────────────────────────────


def _require_postgres() -> str:
    url = os.getenv("DATABASE_URL", "")
    if "postgres" not in url:
        pytest.skip("Retrieval eval requires PostgreSQL with pgvector")
    return url


@pytest.fixture(scope="module")
def embedder():
    st = pytest.importorskip("sentence_transformers")
    return st.SentenceTransformer(EVAL_EMBED_MODEL)


def _embed(embedder, texts: List[str]) -> List[List[float]]:
    """Embed and zero-pad to the column width."""
    vectors = embedder.encode(texts, normalize_embeddings=True)
    padded = []
    for v in vectors:
        v = list(map(float, v))
        padded.append(v + [0.0] * (TARGET_DIM - len(v)))
    return padded


@pytest.fixture(scope="module")
def seeded_corpus(embedder):
    """Load the golden corpus into PostgreSQL, and clean up afterwards."""
    _require_postgres()

    from app.db.session import SessionLocal
    from app.models.document import Document, DocumentEmbedding, DocumentStatus
    from app.models.user import User

    db = SessionLocal()
    user_id = f"eval_user_{uuid.uuid4().hex[:8]}"
    db.add(User(clerk_user_id=user_id, is_active=True))
    db.commit()

    vectors = _embed(embedder, [c.text for c in FULL_CORPUS])

    # One Document per source file, chunks attached to the right one.
    by_document: Dict[str, Document] = {}
    chunk_lookup: Dict[str, str] = {}  # embedding row id -> golden chunk id

    for chunk, vector in zip(FULL_CORPUS, vectors):
        if chunk.document not in by_document:
            doc = Document(
                user_id=user_id,
                title=chunk.document,
                file_name=chunk.document,
                file_size=1024,
                file_type="application/pdf",
                file_url=f"storage://{chunk.document}",
                status=DocumentStatus.COMPLETED,
            )
            db.add(doc)
            db.commit()
            db.refresh(doc)
            by_document[chunk.document] = doc

        row = DocumentEmbedding(
            document_id=by_document[chunk.document].id,
            chunk_index=len(chunk_lookup),
            chunk_text=chunk.text,
            embedding=vector,
            page_numbers=[chunk.page],
            section_title=chunk.id,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        chunk_lookup[str(row.id)] = chunk.id

    yield {"user_id": user_id, "db": db, "lookup": chunk_lookup}

    # Documents must be gone and committed before the user row, or the
    # documents_user_id_fkey constraint rejects the delete.
    for doc in by_document.values():
        db.delete(doc)
    db.commit()

    db.query(User).filter(User.clerk_user_id == user_id).delete()
    db.commit()
    db.close()


def _retrieve(seeded, embedder, query: str, top_k: int = TOP_K) -> List[str]:
    """Run the real pipeline and map results back to golden chunk ids."""
    from app.services.hybrid_search import hybrid_search
    from app.services.reranker import rerank

    query_vector = _embed(embedder, [query])[0]

    candidates = asyncio.run(
        hybrid_search(
            query_text=query,
            query_embedding=query_vector,
            db=seeded["db"],
            user_id=seeded["user_id"],
            top_k=20,
        )
    )
    if candidates:
        candidates = rerank(query=query, chunks=candidates, top_k=top_k)

    return [
        seeded["lookup"][c["id"]] for c in candidates if c["id"] in seeded["lookup"]
    ]


def _evaluate(seeded, embedder, queries: List[Query]) -> List[dict]:
    return [
        {
            "question": q.question,
            "kind": q.kind,
            "retrieved": _retrieve(seeded, embedder, q.question),
            "relevant": set(q.relevant),
        }
        for q in queries
    ]


# ── The eval ───────────────────────────────────────────────────────────────────


@pytest.fixture(scope="module")
def evaluation(seeded_corpus, embedder):
    return _evaluate(seeded_corpus, embedder, QUERIES)


def test_overall_retrieval_quality(evaluation):
    """Aggregate metrics must clear the configured floors."""
    metrics = aggregate(evaluation, k=TOP_K)
    print(format_report(metrics, THRESHOLDS))

    failures = [
        f"{name}={metrics[name]:.3f} < {floor:.3f}"
        for name, floor in THRESHOLDS.items()
        if metrics[name] < floor
    ]
    assert not failures, "Retrieval quality regressed: " + "; ".join(failures)


@pytest.mark.parametrize("kind", sorted(ARM_HIT_RATE_FLOOR))
def test_quality_by_query_category(evaluation, kind):
    """
    End-to-end quality per query category, scored separately.

    Note what this does and does not do. It catches a category degrading —
    e.g. paraphrase queries collapsing after an embedding model change — which
    a single blended average would mask. It does NOT prove the lexical arm is
    working: see the module docstring, the reranker compensates for a dead arm
    well enough that these stay at 1.000. The direct guards below are what
    cover that.
    """
    subset = [r for r in evaluation if r["kind"] == kind]
    assert subset, f"No {kind} queries in the golden set"

    metrics = aggregate(subset, k=TOP_K)
    observed = metrics[f"hit_rate@{TOP_K}"]
    floor = ARM_HIT_RATE_FLOOR[kind]

    missed = [
        r["question"]
        for r in subset
        if not (set(r["retrieved"][:TOP_K]) & r["relevant"])
    ]

    assert observed >= floor, (
        f"{kind} hit_rate@{TOP_K}={observed:.3f} < {floor:.3f}. " f"Missed: {missed}"
    )


def test_lexical_arm_returns_rows(seeded_corpus):
    """
    Direct guard on the exact defect that shipped: the lexical query returning
    an empty list for a query whose terms are verbatim in the corpus.
    """
    from app.services.hybrid_search import fulltext_search

    hits = fulltext_search(
        query_text="30 CFR 75.323 methane return air split",
        db=seeded_corpus["db"],
        user_id=seeded_corpus["user_id"],
        top_k=10,
    )
    assert hits, (
        "Lexical search returned nothing for terms present verbatim in the "
        "corpus — the inverted index or migration 003 is missing."
    )
    assert seeded_corpus["lookup"][hits[0]["id"]] == "ventilation-methane-limits"


def test_citation_lookalikes_are_distinguished(seeded_corpus):
    """
    30 CFR 75.323 and 30 CFR 75.400 embed almost identically. Only the lexical
    arm can tell them apart, so this is the sharpest test that it contributes.
    """
    from app.services.hybrid_search import fulltext_search

    for citation, expected in [
        ("30 CFR 75.323", "ventilation-methane-limits"),
        ("30 CFR 75.400", "ventilation-accumulation"),
    ]:
        hits = fulltext_search(
            query_text=citation,
            db=seeded_corpus["db"],
            user_id=seeded_corpus["user_id"],
            top_k=5,
        )
        assert hits, f"No lexical hit for {citation}"
        top = seeded_corpus["lookup"][hits[0]["id"]]
        assert top == expected, f"{citation} ranked {top} first, expected {expected}"
