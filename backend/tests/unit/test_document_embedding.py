"""
Unit tests for the document embedding path.

The regression these lock down: `_embed` used to call the blocking
genai.embed_content() directly inside a coroutine, stalling the event loop for
the entire duration of a document's ingestion.
"""

import asyncio
import time
from unittest.mock import patch

import pytest

from app.services.document_service import EMBED_BATCH_SIZE, DocumentService

pytestmark = pytest.mark.unit


def _fake_embed(model, content, task_type, output_dimensionality, **kwargs):
    """Stand-in for genai.embed_content that blocks like the real one."""
    time.sleep(0.05)
    if isinstance(content, list):
        return {"embedding": [[0.1] * 768 for _ in content]}
    return {"embedding": [0.1] * 768}


# ── The core regression ────────────────────────────────────────────────────────


async def test_embedding_does_not_block_the_event_loop():
    """
    While embeddings are in flight, an unrelated coroutine must still be
    scheduled. Before the fix this assertion failed: the loop was held for the
    whole blocking call and the ticker never advanced.
    """
    service = DocumentService()
    ticks = 0

    async def ticker():
        nonlocal ticks
        while True:
            await asyncio.sleep(0.005)
            ticks += 1

    task = asyncio.create_task(ticker())
    with patch("app.services.document_service.genai.embed_content", _fake_embed):
        await service._embed_batch(["chunk one", "chunk two"])
    task.cancel()

    assert ticks > 0, "event loop was blocked during embedding"


# ── Batching ───────────────────────────────────────────────────────────────────


async def test_batches_instead_of_one_call_per_chunk():
    service = DocumentService()
    calls = []

    def counting_embed(model, content, **kwargs):
        calls.append(content)
        return {"embedding": [[0.1] * 768 for _ in content]}

    texts = [f"chunk {i}" for i in range(250)]
    with patch("app.services.document_service.genai.embed_content", counting_embed):
        vectors = await service._embed_batch(texts)

    assert len(vectors) == 250
    # 250 chunks at batch size 100 => 3 calls, not 250.
    assert len(calls) == 3
    assert [len(c) for c in calls] == [EMBED_BATCH_SIZE, EMBED_BATCH_SIZE, 50]


async def test_results_stay_aligned_with_input_order():
    service = DocumentService()

    def indexed_embed(model, content, **kwargs):
        return {"embedding": [[float(len(t))] * 768 for t in content]}

    texts = ["a", "bb", "ccc"]
    with patch("app.services.document_service.genai.embed_content", indexed_embed):
        vectors = await service._embed_batch(texts)

    assert [v[0] for v in vectors] == [1.0, 2.0, 3.0]


# ── Degradation ────────────────────────────────────────────────────────────────


async def test_falls_back_to_per_chunk_when_batch_fails():
    """One failing batch must not lose the whole document."""
    service = DocumentService()

    def flaky(model, content, **kwargs):
        if isinstance(content, list):
            raise RuntimeError("batch endpoint unavailable")
        return {"embedding": [0.2] * 768}

    with patch("app.services.document_service.genai.embed_content", flaky):
        vectors = await service._embed_batch(["a", "b", "c"])

    assert len(vectors) == 3
    assert all(v is not None for v in vectors)


async def test_failed_chunks_become_none_not_exceptions():
    service = DocumentService()

    def always_fails(model, content, **kwargs):
        raise RuntimeError("quota exceeded")

    with patch("app.services.document_service.genai.embed_content", always_fails):
        vectors = await service._embed_batch(["a", "b"])

    assert vectors == [None, None]


async def test_rejects_shape_mismatch_from_sdk():
    """A flat vector returned for a batch request must not be zipped blindly."""
    service = DocumentService()
    calls = []

    def wrong_shape(model, content, **kwargs):
        calls.append(content)
        if isinstance(content, list):
            return {"embedding": [0.1] * 768}  # one flat vector, not N
        return {"embedding": [0.3] * 768}

    with patch("app.services.document_service.genai.embed_content", wrong_shape):
        vectors = await service._embed_batch(["a", "b"])

    # Detected the mismatch and re-embedded each chunk individually.
    assert len(vectors) == 2
    assert all(v is not None and len(v) == 768 for v in vectors)
