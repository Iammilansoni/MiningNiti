"""
Retrieval quality metrics.

These score a *ranked list of retrieved ids* against a set of known-relevant
ids. They say nothing about whether the final answer was good — that is what
the faithfulness/relevancy judge in test_rag_eval.py measures. Retrieval is
scored separately because a RAG system fails in two distinct ways, and mixing
them hides which one happened:

  * retrieval failed  — the right chunk was never in the context
  * generation failed — the right chunk was there and the model ignored it

Every function takes `retrieved` (ranked, best first) and `relevant` (a set),
and returns a float in [0, 1].
"""

from __future__ import annotations

import math
from typing import Iterable, List, Sequence, Set


def hit_rate_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """
    1.0 if any relevant item appears in the top k, else 0.0.

    The bluntest useful signal: did we surface *anything* usable at all.
    Averaged over a query set this is the fraction of answerable questions.
    """
    relevant = set(relevant)
    if not relevant:
        return 0.0
    return 1.0 if any(r in relevant for r in retrieved[:k]) else 0.0


def reciprocal_rank(retrieved: Sequence[str], relevant: Iterable[str]) -> float:
    """
    1 / (rank of the first relevant item), or 0.0 if none is retrieved.

    Averaged over queries this is MRR. Sensitive to *where* the first good
    result lands, which matters because the generator weights early context
    more heavily and the reranker only sees what retrieval returned.
    """
    relevant = set(relevant)
    for i, item in enumerate(retrieved, start=1):
        if item in relevant:
            return 1.0 / i
    return 0.0


def recall_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """Fraction of all relevant items that made it into the top k."""
    relevant = set(relevant)
    if not relevant:
        return 0.0
    found = sum(1 for r in set(retrieved[:k]) if r in relevant)
    return found / len(relevant)


def precision_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """
    Fraction of the top k that is relevant.

    Low precision means the context window is being filled with noise, which
    both costs tokens and gives the model more opportunity to cite the wrong
    thing.
    """
    if k <= 0:
        return 0.0
    relevant = set(relevant)
    window = retrieved[:k]
    if not window:
        return 0.0
    return sum(1 for r in window if r in relevant) / len(window)


def ndcg_at_k(retrieved: Sequence[str], relevant: Iterable[str], k: int) -> float:
    """
    Normalised discounted cumulative gain with binary relevance.

    Unlike hit rate, this rewards putting *several* relevant chunks high up
    rather than just one — the shape you want when an answer must synthesise
    across sections.
    """
    relevant = set(relevant)
    if not relevant:
        return 0.0

    dcg = 0.0
    for i, item in enumerate(retrieved[:k], start=1):
        if item in relevant:
            dcg += 1.0 / math.log2(i + 1)

    ideal_hits = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(i + 1) for i in range(1, ideal_hits + 1))

    return dcg / idcg if idcg > 0 else 0.0


def mean(values: Iterable[float]) -> float:
    """Mean of a possibly-empty iterable, returning 0.0 rather than raising."""
    values = list(values)
    return sum(values) / len(values) if values else 0.0


def aggregate(
    results: List[dict],
    k: int,
) -> dict:
    """
    Roll per-query results into a report.

    `results` is a list of {"retrieved": [...], "relevant": {...}} dicts.
    """
    return {
        f"hit_rate@{k}": mean(
            hit_rate_at_k(r["retrieved"], r["relevant"], k) for r in results
        ),
        "mrr": mean(reciprocal_rank(r["retrieved"], r["relevant"]) for r in results),
        f"recall@{k}": mean(
            recall_at_k(r["retrieved"], r["relevant"], k) for r in results
        ),
        f"precision@{k}": mean(
            precision_at_k(r["retrieved"], r["relevant"], k) for r in results
        ),
        f"ndcg@{k}": mean(ndcg_at_k(r["retrieved"], r["relevant"], k) for r in results),
        "queries": len(results),
    }


def format_report(metrics: dict, thresholds: dict | None = None) -> str:
    """Render a metrics dict as an aligned table for CI logs."""
    thresholds = thresholds or {}
    lines = ["", f"{'metric':<16} {'value':>7}  {'min':>6}  status", "-" * 42]
    for name, value in metrics.items():
        if name == "queries":
            continue
        floor = thresholds.get(name)
        if floor is None:
            # ASCII only: CI log encodings mangle box-drawing and dashes.
            status, floor_s = "", "     -"
        else:
            status = "PASS" if value >= floor else "FAIL"
            floor_s = f"{floor:>6.3f}"
        lines.append(f"{name:<16} {value:>7.3f}  {floor_s}  {status}")
    lines.append("-" * 42)
    lines.append(f"queries evaluated: {metrics.get('queries', 0)}")
    return "\n".join(lines)
