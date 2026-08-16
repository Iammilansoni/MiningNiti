"""
Unit tests for the agent analysis cache.

The important behaviour here is not "does it store things" — it is that the
cache refuses to store failed or partial analyses. That refusal is what makes
re-analysing a rate-limited document actually re-run the agents instead of
serving the cached failure back forever.
"""

import json

import pytest

from app.services import analysis_cache

pytestmark = [pytest.mark.unit, pytest.mark.uses_cache]


class FakeRedis:
    """Minimal in-memory stand-in for the bits of redis-py the cache uses."""

    def __init__(self, fail=False):
        self.store = {}
        self.fail = fail
        self.setex_calls = 0

    def get(self, key):
        if self.fail:
            raise ConnectionError("redis down")
        return self.store.get(key)

    def setex(self, key, ttl, value):
        if self.fail:
            raise ConnectionError("redis down")
        self.setex_calls += 1
        self.store[key] = value

    def delete(self, key):
        if self.fail:
            raise ConnectionError("redis down")
        return 1 if self.store.pop(key, None) is not None else 0


@pytest.fixture
def fake_redis(monkeypatch):
    client = FakeRedis()
    monkeypatch.setattr(analysis_cache, "_client", client)
    return client


def _complete_result():
    return {
        "classification": {"category": "safety_protocol", "confidence": 0.9},
        "safety": {"score": 80, "hazards": []},
        "entities": {"equipment": ["conveyor"]},
        "summary": {"summary": "A summary", "key_points": []},
        "metadata": {"processing_time_ms": 1200},
    }


# ── Keying ────────────────────────────────────────────────────────────────────


class TestCacheKey:
    def test_same_text_same_key(self):
        assert analysis_cache.cache_key("hello") == analysis_cache.cache_key("hello")

    def test_different_text_different_key(self):
        assert analysis_cache.cache_key("hello") != analysis_cache.cache_key("world")

    def test_key_includes_pipeline_version(self):
        # A model or prompt change must strand old entries rather than serve them.
        assert analysis_cache.PIPELINE_VERSION in analysis_cache.cache_key("hello")


# ── Round trip ────────────────────────────────────────────────────────────────


class TestRoundTrip:
    def test_stores_and_returns_complete_analysis(self, fake_redis):
        text = "mining safety document"
        result = _complete_result()

        assert analysis_cache.set_cached_analysis(text, result) is True
        assert analysis_cache.get_cached_analysis(text) == result

    def test_miss_returns_none(self, fake_redis):
        assert analysis_cache.get_cached_analysis("never seen") is None

    def test_invalidate_removes_entry(self, fake_redis):
        text = "doc"
        analysis_cache.set_cached_analysis(text, _complete_result())

        assert analysis_cache.invalidate(text) is True
        assert analysis_cache.get_cached_analysis(text) is None


# ── Refusing to cache failures (the part that matters) ────────────────────────


class TestRejectsBadResults:
    def test_does_not_cache_top_level_error(self, fake_redis):
        assert analysis_cache.set_cached_analysis("t", {"error": "boom"}) is False
        assert fake_redis.setex_calls == 0

    def test_does_not_cache_failed_metadata(self, fake_redis):
        result = _complete_result()
        result["metadata"]["failed"] = True

        assert analysis_cache.set_cached_analysis("t", result) is False

    def test_does_not_cache_quota_exceeded_agent(self, fake_redis):
        result = _complete_result()
        result["summary"] = {
            "error": "rate limited",
            "quota_exceeded": True,
            "status": "quota_exceeded",
            "summary": "",
        }

        assert analysis_cache.set_cached_analysis("t", result) is False

    def test_does_not_cache_missing_section(self, fake_redis):
        result = _complete_result()
        del result["entities"]

        assert analysis_cache.set_cached_analysis("t", result) is False

    def test_does_not_cache_empty_result(self, fake_redis):
        assert analysis_cache.set_cached_analysis("t", {}) is False

    def test_caches_not_applicable_safety_bypass(self, fake_redis):
        """The orchestrator's category-based safety bypass is a real result."""
        result = _complete_result()
        result["safety"] = {
            "status": "not_applicable",
            "score": None,
            "hazards": [],
            "recommendations": ["bypassed"],
        }

        assert analysis_cache.set_cached_analysis("t", result) is True


# ── Degrading safely ──────────────────────────────────────────────────────────


class TestDegradesGracefully:
    def test_no_redis_configured_is_a_noop(self, monkeypatch):
        monkeypatch.setattr(analysis_cache, "_client", None)

        assert analysis_cache.get_cached_analysis("t") is None
        assert analysis_cache.set_cached_analysis("t", _complete_result()) is False
        assert analysis_cache.invalidate("t") is False

    def test_redis_errors_do_not_propagate(self, monkeypatch):
        """A cache outage must never fail a document that analysed fine."""
        monkeypatch.setattr(analysis_cache, "_client", FakeRedis(fail=True))

        assert analysis_cache.get_cached_analysis("t") is None
        assert analysis_cache.set_cached_analysis("t", _complete_result()) is False
        assert analysis_cache.invalidate("t") is False

    def test_corrupt_entry_is_ignored(self, fake_redis):
        fake_redis.store[analysis_cache.cache_key("t")] = "not json{{"

        assert analysis_cache.get_cached_analysis("t") is None

    def test_empty_text_is_not_cached(self, fake_redis):
        assert analysis_cache.get_cached_analysis("") is None
        assert analysis_cache.set_cached_analysis("", _complete_result()) is False
