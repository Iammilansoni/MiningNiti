"""
RAG Evaluation Tests — Gemini-powered (no external eval services)

Uses your existing Gemini API key to judge faithfulness and relevancy.
No DeepEval, no OpenAI, no Confident AI required.

Run:
    pytest tests/eval/test_rag_eval.py -v -m synthetic    # quick, no DB
    pytest tests/eval/test_rag_eval.py -v -m live          # full pipeline, needs DB
    pytest tests/eval/test_rag_eval.py -v                   # both
"""

import asyncio
import json
import logging
import re

import pytest

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# GEMINI JUDGE — uses your existing Gemini key to score answers
# ═══════════════════════════════════════════════════════════════════════════════


def _gemini_judge(query: str, answer: str, context_chunks: list[str]) -> dict:
    """
    Ask Gemini to score the answer on faithfulness and relevancy.

    Returns:
        {"faithfulness": float, "relevancy": float, "reason": str}
    """
    import google.generativeai as genai
    from app.config import settings

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    context_text = "\n---\n".join(
        f"[Chunk {i}]: {chunk}" for i, chunk in enumerate(context_chunks, 1)
    )

    judge_prompt = f"""You are an evaluation judge for a RAG (Retrieval-Augmented Generation) system.

## User Question
{query}

## Retrieved Context Chunks
{context_text}

## AI Answer
{answer}

## Your Task
Evaluate the AI answer on two dimensions and return ONLY valid JSON:

1. **Faithfulness** (0.0 to 1.0): Does every claim in the answer come ONLY from the retrieved context? Score 1.0 if all claims are grounded. Score 0.0 if the answer makes up facts not in the context.

2. **Relevancy** (0.0 to 1.0): Does the answer actually address the user's question? Score 1.0 if it directly answers. Score 0.0 if it's off-topic.

Return JSON only, no other text:
{{"faithfulness": 0.0, "relevancy": 0.0, "reason": "brief explanation"}}"""

    response = model.generate_content(judge_prompt)
    raw = response.text.strip()

    # Extract JSON from response (handle markdown code blocks)
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())

    return {"faithfulness": 0.0, "relevancy": 0.0, "reason": f"Failed to parse judge output: {raw[:200]}"}


# ═══════════════════════════════════════════════════════════════════════════════
# PART 1 — SYNTHETIC TESTS (no DB, instant)
# ═══════════════════════════════════════════════════════════════════════════════

_QUERY = (
    "What are the standard safety illumination requirements "
    "for underground coal mine haulage roads?"
)

_RETRIEVED_CONTEXT = [
    "Underground coal mine haulage roads shall be maintained in a condition "
    "affording safe passage. Illumination levels on haulage roads must meet "
    "the minimum standards prescribed in the Coal Mines Regulations 2017, "
    "Schedule IV.",

    "Regulation 115 of CMR 2017 specifies that every underground road used "
    "for haulage shall be provided with adequate lighting at all junctions, "
    "loading points, and switches. Minimum illumination of 10 lux is "
    "required at the floor level of main haulage roads.",

    "Mine operators must conduct regular inspections of all electrical "
    "lighting systems on haulage roads. Defective lighting must be "
    "repaired within 24 hours of reporting.",
]

_LLM_OUTPUT = (
    "According to Regulation 115 of the Coal Mines Regulations 2017, "
    "underground coal mine haulage roads must maintain a minimum illumination "
    "level of 10 lux at floor level on main haulage roads. Junctions, loading "
    "points, and switches also require adequate lighting. Defective lighting "
    "must be repaired within 24 hours of reporting."
)

_THRESHOLD = 0.70


@pytest.mark.synthetic
class TestSyntheticFaithfulness:
    """Does the LLM ground its answer in the provided context?"""

    def test_faithfulness_above_threshold(self):
        scores = _gemini_judge(_QUERY, _LLM_OUTPUT, _RETRIEVED_CONTEXT)
        assert scores["faithfulness"] >= _THRESHOLD, (
            f"Faithfulness {scores['faithfulness']:.2f} < {_THRESHOLD}. "
            f"Reason: {scores['reason']}"
        )


@pytest.mark.synthetic
class TestSyntheticRelevancy:
    """Does the LLM answer actually address the question?"""

    def test_relevancy_above_threshold(self):
        scores = _gemini_judge(_QUERY, _LLM_OUTPUT, _RETRIEVED_CONTEXT)
        assert scores["relevancy"] >= _THRESHOLD, (
            f"Relevancy {scores['relevancy']:.2f} < {_THRESHOLD}. "
            f"Reason: {scores['reason']}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# PART 2 — LIVE PIPELINE TESTS (needs PostgreSQL + API keys)
# ═══════════════════════════════════════════════════════════════════════════════

_LIVE_QUERIES = [
    "What are the MSHA requirements for underground coal mine ventilation?",
    "How often should mining equipment be inspected for safety compliance?",
    "What are the emergency evacuation procedures for coal mines?",
]


def _get_embedding_sync(text: str) -> list[float]:
    import google.generativeai as genai
    from app.config import settings

    genai.configure(api_key=settings.GEMINI_API_KEY)
    result = genai.embed_content(
        model=settings.EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
        output_dimensionality=768,
    )
    return result["embedding"]


def _get_llm_answer_sync(query: str, context_chunks: list[dict]) -> str:
    from app.services.llm_provider import get_groq_client
    from app.services.chat_service import _SYSTEM_PROMPT

    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        pages = chunk.get("page_numbers", [])
        page_str = f"{pages[0]}" if pages else "unknown"
        file_name = chunk.get("file_name", "unknown.pdf")
        context_parts.append(
            f"Context chunk {i}: {chunk['text']} (Source: {file_name}, Page: {page_str})"
        )
    context = "\n".join(context_parts)

    user_msg = (
        f"## Document Context:\n{context}\n\n"
        f"## User Question:\n{query}\n\n"
        f"## Your Answer (cite [FileName, Page X] for every claim):\n"
    )

    client = get_groq_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
    )
    return response.choices[0].message.content


@pytest.mark.live
class TestLiveRAGPipeline:
    """End-to-end RAG evaluation against the real database."""

    @pytest.mark.parametrize("query", _LIVE_QUERIES, ids=lambda q: q[:50])
    def test_pipeline_faithfulness(self, query: str):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        from app.config import settings

        query_embedding = _get_embedding_sync(query)

        engine = create_engine(settings.DATABASE_URL)
        with Session(engine) as db:
            from app.services.hybrid_search import hybrid_search
            chunks = asyncio.get_event_loop().run_until_complete(
                hybrid_search(
                    query_text=query,
                    query_embedding=query_embedding,
                    db=db,
                    user_id="eval-test-user",
                    top_k=5,
                )
            )

        if not chunks:
            pytest.skip("No documents in DB — upload documents first")

        answer = _get_llm_answer_sync(query, chunks)
        retrieval_context = [c["text"] for c in chunks]

        scores = _gemini_judge(query, answer, retrieval_context)

        assert scores["faithfulness"] >= _THRESHOLD, (
            f"Pipeline faithfulness {scores['faithfulness']:.2f} < {_THRESHOLD} "
            f"for: {query[:60]}... Reason: {scores['reason']}"
        )

    @pytest.mark.parametrize("query", _LIVE_QUERIES, ids=lambda q: q[:50])
    def test_pipeline_relevancy(self, query: str):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session
        from app.config import settings

        query_embedding = _get_embedding_sync(query)

        engine = create_engine(settings.DATABASE_URL)
        with Session(engine) as db:
            from app.services.hybrid_search import hybrid_search
            chunks = asyncio.get_event_loop().run_until_complete(
                hybrid_search(
                    query_text=query,
                    query_embedding=query_embedding,
                    db=db,
                    user_id="eval-test-user",
                    top_k=5,
                )
            )

        if not chunks:
            pytest.skip("No documents in DB — upload documents first")

        answer = _get_llm_answer_sync(query, chunks)
        retrieval_context = [c["text"] for c in chunks]

        scores = _gemini_judge(query, answer, retrieval_context)

        assert scores["relevancy"] >= _THRESHOLD, (
            f"Pipeline relevancy {scores['relevancy']:.2f} < {_THRESHOLD} "
            f"for: {query[:60]}... Reason: {scores['reason']}"
        )
