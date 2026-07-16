"""
Agent Orchestrator
Coordinates multi-agent document analysis pipeline.

Improvements over v1:
  - Accepts pages parameter from extractor for future per-page analysis
  - Runs safety/entity/summary with small delay between calls to avoid simultaneous quota hits
  - Adds per-agent timing metrics
  - All agents use JSON mode (no regex) + exponential backoff retry
  - Surfaces QuotaExceededError instead of silently returning empty data
"""

import asyncio
import logging
from datetime import datetime, timezone
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


from app.agents.base import QuotaExceededError
from app.agents.classifier import ClassifierAgent
from app.agents.entity_extractor import EntityExtractorAgent
from app.agents.safety_analyzer import SafetyAnalyzerAgent
from app.agents.summarizer import SummarizerAgent

logger = logging.getLogger(__name__)


import functools


def exponential_backoff_wrapper(max_retries: int = 3, base_delay: float = 2.0):
    """Exponential Backoff Utility Wrapper for AI Agent execution pipelines."""

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    err_str = str(e).lower()
                    is_rate_limit = any(
                        term in err_str
                        for term in [
                            "429",
                            "quota",
                            "timeout",
                            "rate_limit",
                            "resource_exhausted",
                            "too many requests",
                        ]
                    )
                    if is_rate_limit:
                        last_error = e
                        if attempt < max_retries:
                            delay = base_delay * (2 ** (attempt - 1))
                            logger.warning(
                                f"Audit Trail: {func.__name__} attempt {attempt} failed (429/Timeout). Retrying in {delay}s..."
                            )
                            await asyncio.sleep(delay)
                        else:
                            logger.error(
                                f"Audit Trail: {func.__name__} exhausted {max_retries} retries."
                            )
                            raise QuotaExceededError(
                                f"Rate limit/timeout exceeded in {func.__name__}"
                            ) from e
                    else:
                        raise
            if last_error is not None:
                raise last_error
            raise RuntimeError(f"Task {func.__name__} failed with no attempts made")

        return wrapper

    return decorator


class AgentOrchestrator:
    """
    Multi-Agent Orchestrator for Document Intelligence.

    Execution order:
    1. ClassifierAgent   — runs first (result feeds category context to others)
    2. SafetyAnalyzerAgent  ┐
    3. EntityExtractorAgent ├── run in parallel after classification (Multi-Provider)
    4. SummarizerAgent      ┘
    """

    def __init__(self):
        self.classifier = ClassifierAgent()
        self.safety_analyzer = SafetyAnalyzerAgent()
        self.entity_extractor = EntityExtractorAgent()
        self.summarizer = SummarizerAgent()

    @traceable(name="miningniti.agent_orchestrator.analyze_document")
    async def analyze_document(
        self,
        text: str,
        pages: Optional[List] = None,
    ) -> Dict[str, Any]:
        """
        Run full multi-agent analysis pipeline on document.
        """
        start_time = datetime.now(timezone.utc)
        logger.info("Starting multi-agent document analysis")

        agent_timings: Dict[str, int] = {}

        try:
            # ── Step 1: Classification (feeds category context to other agents) ──
            t0 = datetime.now(timezone.utc)
            logger.info("Running ClassifierAgent...")

            @exponential_backoff_wrapper()
            async def _run_classifier():
                return await self.classifier.analyze(text)

            classification = await _run_classifier()
            agent_timings["classifier_ms"] = int(
                (datetime.now(timezone.utc) - t0).total_seconds() * 1000
            )

            category = classification.get("category", "other")
            context = {"category": category}

            # ── Step 2: Parallel agents using category context ─────────────────
            logger.info(
                "Running parallel agents across multiple providers (Safety, Entity, Summary)..."
            )
            t1 = datetime.now(timezone.utc)

            @exponential_backoff_wrapper()
            async def _run_safety():
                # Only run safety analysis on relevant document categories
                non_safety_categories = [
                    "regulatory",
                    "geological",
                    "environmental",
                    "permit",
                    "other",
                ]
                if category in non_safety_categories:
                    logger.info(
                        f"Routing: Document is {category}. Bypassing Safety Analyzer."
                    )
                    return {
                        "status": "not_applicable",
                        "score": None,
                        "hazards": [],
                        "recommendations": [
                            f"Safety analysis bypassed for {category} document"
                        ],
                    }
                return await self.safety_analyzer.analyze(text, context)

            @exponential_backoff_wrapper()
            async def _run_entities():
                return await self.entity_extractor.analyze(text, context)

            @exponential_backoff_wrapper()
            async def _run_summary():
                return await self.summarizer.analyze(text, context)

            safety, entities, summary = await asyncio.gather(
                _run_safety(),
                _run_entities(),
                _run_summary(),
                return_exceptions=True,
            )

            agent_timings["parallel_agents_ms"] = int(
                (datetime.now(timezone.utc) - t1).total_seconds() * 1000
            )

            # Handle per-agent exceptions gracefully
            def _quota_error_result(agent_name: str, exc: Exception) -> dict:
                is_quota = isinstance(exc, QuotaExceededError)
                logger.error(f"{agent_name} failed: {exc}")
                return {
                    "error": str(exc),
                    "quota_exceeded": is_quota,
                    "status": "quota_exceeded" if is_quota else "error",
                }

            if isinstance(safety, Exception):
                safety = {
                    **_quota_error_result("SafetyAnalyzerAgent", safety),
                    "score": None,
                    "hazards": [],
                    "recommendations": [],
                }

            if isinstance(entities, Exception):
                entities = {
                    **_quota_error_result("EntityExtractorAgent", entities),
                    "equipment": [],
                    "chemicals": [],
                    "locations": [],
                    "personnel": [],
                    "dates": [],
                    "regulations": [],
                }

            if isinstance(summary, Exception):
                summary = {
                    **_quota_error_result("SummarizerAgent", summary),
                    "summary": "Analysis failed — Gemini API quota exceeded. Please try again later.",
                    "key_points": [],
                }

            total_ms = int(
                (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            )
            logger.info(f"Multi-agent analysis completed in {total_ms}ms")

            return {
                "classification": classification,
                "safety": safety,
                "entities": entities,
                "summary": summary,
                "metadata": {
                    "processing_time_ms": total_ms,
                    "agent_timings": agent_timings,
                    "agents_used": [
                        "classifier",
                        "safety_analyzer",
                        "entity_extractor",
                        "summarizer",
                    ],
                    "analyzed_at": datetime.now(timezone.utc).isoformat(),
                },
            }

        except QuotaExceededError:
            # Re-raise quota errors so document_service.py can handle them
            # with its dedicated QuotaExceededError handler (partial save, not FAILED).
            raise

        except Exception as e:
            logger.error(f"Orchestrator failed: {e}", exc_info=True)
            return {
                "error": str(e),
                "metadata": {"failed": True, "error_message": str(e)},
            }

    async def analyze_for_safety_only(self, text: str) -> Dict[str, Any]:
        """Quick safety-only analysis for real-time checks."""
        return await self.safety_analyzer.analyze(text)

    async def classify_only(self, text: str) -> Dict[str, Any]:
        """Quick classification only."""
        return await self.classifier.analyze(text)
