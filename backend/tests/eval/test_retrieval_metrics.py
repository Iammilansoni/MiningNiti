"""
Unit tests for the retrieval metric functions.

Fast, no database, no model. A metrics module that is itself wrong makes every
downstream number meaningless, so these pin the arithmetic against hand-worked
examples.
"""

import math

import pytest

from tests.eval.retrieval_metrics import (
    aggregate,
    hit_rate_at_k,
    mean,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)

pytestmark = pytest.mark.unit


# ── hit_rate@k ─────────────────────────────────────────────────────────────────


def test_hit_rate_finds_relevant_within_k():
    assert hit_rate_at_k(["a", "b", "c"], {"c"}, k=3) == 1.0


def test_hit_rate_ignores_relevant_beyond_k():
    assert hit_rate_at_k(["a", "b", "c"], {"c"}, k=2) == 0.0


def test_hit_rate_with_no_relevant_set():
    assert hit_rate_at_k(["a"], set(), k=5) == 0.0


# ── reciprocal rank / MRR ──────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "retrieved,expected",
    [
        (["hit", "x", "y"], 1.0),
        (["x", "hit", "y"], 0.5),
        (["x", "y", "hit"], 1 / 3),
        (["x", "y", "z"], 0.0),
    ],
)
def test_reciprocal_rank_positions(retrieved, expected):
    assert reciprocal_rank(retrieved, {"hit"}) == pytest.approx(expected)


def test_reciprocal_rank_uses_first_relevant_only():
    assert reciprocal_rank(["x", "a", "b"], {"a", "b"}) == pytest.approx(0.5)


# ── recall / precision ─────────────────────────────────────────────────────────


def test_recall_counts_fraction_of_relevant_found():
    assert recall_at_k(["a", "b", "x"], {"a", "b", "c"}, k=3) == pytest.approx(2 / 3)


def test_recall_does_not_exceed_one_on_duplicates():
    assert recall_at_k(["a", "a", "a"], {"a"}, k=3) == 1.0


def test_precision_measures_noise_in_window():
    assert precision_at_k(["a", "x", "y", "z"], {"a"}, k=4) == pytest.approx(0.25)


def test_precision_of_empty_window_is_zero():
    assert precision_at_k([], {"a"}, k=5) == 0.0
    assert precision_at_k(["a"], {"a"}, k=0) == 0.0


# ── nDCG ───────────────────────────────────────────────────────────────────────


def test_ndcg_is_one_for_perfect_ranking():
    assert ndcg_at_k(["a", "b"], {"a", "b"}, k=2) == pytest.approx(1.0)


def test_ndcg_penalises_lower_placement():
    top = ndcg_at_k(["a", "x", "y"], {"a"}, k=3)
    bottom = ndcg_at_k(["x", "y", "a"], {"a"}, k=3)
    assert top == pytest.approx(1.0)
    assert bottom == pytest.approx(1 / math.log2(4))
    assert bottom < top


def test_ndcg_rewards_clustering_relevant_results_high():
    both_high = ndcg_at_k(["a", "b", "x", "y"], {"a", "b"}, k=4)
    split = ndcg_at_k(["a", "x", "y", "b"], {"a", "b"}, k=4)
    assert both_high > split


# ── aggregation ────────────────────────────────────────────────────────────────


def test_mean_of_empty_is_zero_not_error():
    assert mean([]) == 0.0


def test_aggregate_reports_every_metric():
    results = [
        {"retrieved": ["a", "x"], "relevant": {"a"}},
        {"retrieved": ["y", "b"], "relevant": {"b"}},
    ]
    metrics = aggregate(results, k=2)

    assert metrics["hit_rate@2"] == 1.0
    assert metrics["mrr"] == pytest.approx(0.75)  # (1/1 + 1/2) / 2
    assert metrics["recall@2"] == 1.0
    assert metrics["precision@2"] == pytest.approx(0.5)
    assert metrics["queries"] == 2


def test_aggregate_detects_a_dead_arm():
    """The shape a silently-broken retrieval arm produces."""
    dead = [{"retrieved": [], "relevant": {"a"}} for _ in range(4)]
    metrics = aggregate(dead, k=5)

    assert metrics["hit_rate@5"] == 0.0
    assert metrics["mrr"] == 0.0
    assert metrics["ndcg@5"] == 0.0
