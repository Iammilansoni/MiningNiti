"""
Agent Orchestrator
Coordinates multi-agent document analysis pipeline.

Improvements over v1:
  - Accepts pages parameter from extractor for future per-page analysis
  - Runs safety/entity/summary in parallel after classification
  - Adds per-agent timing metrics
  - All agents use JSON mode (no regex) + exponential backoff retry
"""

import logging
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from app.agents.classifier import ClassifierAgent
from app.agents.safety_analyzer import SafetyAnalyzerAgent
from app.agents.entity_extractor import EntityExtractorAgent
from app.agents.summarizer import SummarizerAgent

logger = logging.getLogger(__name__)


class AgentOrchestrator:
    """
    Multi-Agent Orchestrator for Document Intelligence.

    Execution order:
    1. ClassifierAgent   — runs first (result feeds category context to others)
    2. SafetyAnalyzerAgent  ┐
    3. EntityExtractorAgent ├── run in parallel after classification
    4. SummarizerAgent      ┘
    """

    def __init__(self):
        self.classifier = ClassifierAgent()
        self.safety_analyzer = SafetyAnalyzerAgent()
        self.entity_extractor = EntityExtractorAgent()
        self.summarizer = SummarizerAgent()

    async def analyze_document(
        self,
        text: str,
        pages: Optional[List] = None,
    ) -> Dict[str, Any]:
        """
        Run full multi-agent analysis pipeline on document.

        Args:
            text: Full document text
            pages: Per-page content from extractor (reserved for future per-page analysis)

        Returns:
            {
                "classification": {...},
                "safety": {...},
                "entities": {...},
                "summary": {...},
                "metadata": {...}
            }
        """
        start_time = datetime.now(timezone.utc)
        logger.info("Starting multi-agent document analysis")

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
            logger.info("Running parallel agents (Safety, Entity, Summary)...")
            t1 = datetime.now(timezone.utc)

            safety, entities, summary = await asyncio.gather(
                self.safety_analyzer.analyze(text, context),
                self.entity_extractor.analyze(text, context),
                self.summarizer.analyze(text, context),
                return_exceptions=True,
            )

            agent_timings["parallel_agents_ms"] = int(
                (datetime.now(timezone.utc) - t1).total_seconds() * 1000
            )

            # Handle per-agent exceptions gracefully
            if isinstance(safety, Exception):
                logger.error(f"SafetyAnalyzerAgent failed: {safety}")
                safety = {
                    "error": str(safety),
                    "score": None,
                    "status": "pending",
                    "hazards": [],
                    "recommendations": [],
                }

            if isinstance(entities, Exception):
                logger.error(f"EntityExtractorAgent failed: {entities}")
                entities = {
                    "error": str(entities),
                    "equipment": [],
                    "chemicals": [],
                    "locations": [],
                    "personnel": [],
                    "dates": [],
                    "regulations": [],
                }

            if isinstance(summary, Exception):
                logger.error(f"SummarizerAgent failed: {summary}")
                summary = {
                    "error": str(summary),
                    "summary": "Analysis failed.",
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
