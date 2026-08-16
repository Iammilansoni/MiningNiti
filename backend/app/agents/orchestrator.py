"""
Agent Orchestrator
Coordinates multi-agent document analysis pipeline.

Behaviour:
  - Classifier runs first; its category is passed as context to the other three,
    which then run concurrently via asyncio.gather
  - Completed analyses are cached by content hash (see services/analysis_cache)
  - Per-agent timing metrics are recorded in the result metadata
  - All agents use JSON mode (no regex parsing)
  - Retry and provider fallback live in BaseAgent._generate_json, not here
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


# NOTE: retries live in BaseAgent._generate_json, not here.
#
# This module used to wrap every agent call in a second exponential-backoff
# decorator. Because BaseAgent already retries 3 times with its own doubling
# delays, the two layers multiplied: one rate-limited agent could make 9 API
# attempts and sleep through several minutes of compounding backoff before
# failing, leaving the document stuck in ANALYZING the whole time.
#
# BaseAgent's retry is also the better one — it parses the provider's suggested
# `retry_delay` instead of guessing, and falls back to a second provider before
# giving up. So the outer layer is gone and the inner one is authoritative.


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
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """
        Run full multi-agent analysis pipeline on document.

        Results for identical text are cached, so re-processing the same
        content costs nothing. Pass use_cache=False to force a fresh run.
        """
        # Imported here, not at module scope: app.services.__init__ imports
        # document_service, which imports this module. Same pattern the rest of
        # the codebase uses to break that cycle.
        from app.services import analysis_cache

        start_time = datetime.now(timezone.utc)
        logger.info("Starting multi-agent document analysis")

        # Identical text has already been through these agents — skip all four
        # LLM calls. Only complete, successful analyses are ever stored, so a
        # document that previously failed still gets a real retry here.
        if use_cache:
            cached = analysis_cache.get_cached_analysis(text)
            if cached is not None:
                logger.info("Analysis cache hit — skipping all agents")
                cached.setdefault("metadata", {})["cache_hit"] = True
                return cached

        agent_timings: Dict[str, int] = {}

        try:
            # ── Step 1: Classification (feeds category context to other agents) ──
            t0 = datetime.now(timezone.utc)
            logger.info("Running ClassifierAgent...")

            classification = await self.classifier.analyze(text)
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

            async def _run_entities():
                return await self.entity_extractor.analyze(text, context)

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
                    "summary": "Analysis failed — the summarizer's provider rate-limited this request. Please try again later.",
                    "key_points": [],
                }

            total_ms = int(
                (datetime.now(timezone.utc) - start_time).total_seconds() * 1000
            )
            logger.info(f"Multi-agent analysis completed in {total_ms}ms")

            results = {
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
                    "cache_hit": False,
                },
            }

            # Partial results (a rate-limited agent) are rejected by the cache,
            # so a later retry re-runs them rather than serving the failure.
            if use_cache:
                analysis_cache.set_cached_analysis(text, results)

            return results

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
