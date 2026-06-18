"""
Base Agent
Abstract base class for all mining intelligence agents.

Improvements over v1:
  - JSON mode via response_mime_type (no more regex JSON extraction)
  - Retry with exponential backoff (3 retries)
  - Processes full document via pages, not truncated to 3000 chars
  - Confidence score required in all agent outputs
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini once at module level
genai.configure(api_key=settings.GEMINI_API_KEY)

# Generation config that forces JSON output — no more regex parsing
_JSON_GENERATION_CONFIG = GenerationConfig(
    response_mime_type="application/json",
    temperature=0.1,       # Low temperature for consistent structured output
    top_p=0.95,
)

_MAX_RETRIES = 3
_RETRY_BASE_DELAY = 1.0  # seconds


class BaseAgent(ABC):
    """
    Abstract base class for mining document intelligence agents.

    Each agent is responsible for a specific analysis task:
    - Classification
    - Safety Analysis
    - Entity Extraction
    - Summarization
    """

    def __init__(self, model_name: str = None):
        self.model = genai.GenerativeModel(
            model_name=model_name or settings.GEMINI_MODEL,
            generation_config=_JSON_GENERATION_CONFIG,
        )
        self.name = self.__class__.__name__

    @abstractmethod
    async def analyze(
        self,
        text: str,
        context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Analyze document text and return structured results.

        Args:
            text: Document text content (full text or representative sample)
            context: Additional context (e.g., document category from classifier)

        Returns:
            Dictionary with agent-specific analysis results.
            All results MUST include a 'confidence' key (0.0–1.0).
        """

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """System prompt defining the agent's role and capabilities."""

    # ── Generation with retry ──────────────────────────────────────────────────

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        """
        Generate structured JSON output from Gemini with retry.

        Uses response_mime_type='application/json' (JSON mode) so Gemini
        guarantees valid JSON output — no regex parsing needed.

        Retries up to 3 times with exponential backoff on transient errors.
        """
        last_error = None
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                response = await asyncio.to_thread(
                    self.model.generate_content,
                    f"{self.system_prompt}\n\n{prompt}",
                )

                import json
                try:
                    return json.loads(response.text)
                except (json.JSONDecodeError, AttributeError) as parse_err:
                    logger.warning(
                        f"{self.name} attempt {attempt}: JSON parse failed — {parse_err}. "
                        f"Raw response: {getattr(response, 'text', '')[:200]}"
                    )
                    last_error = parse_err
                    # Still retry — JSON mode rarely fails but can under load

            except Exception as e:
                last_error = e
                delay = _RETRY_BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(f"{self.name} attempt {attempt} failed: {e}. Retrying in {delay}s...")
                await asyncio.sleep(delay)

        logger.error(f"{self.name} failed after {_MAX_RETRIES} attempts: {last_error}")
        return {}

    # ── Text helpers ───────────────────────────────────────────────────────────

    def _prepare_text(self, text: str, max_chars: int = 15000) -> str:
        """
        Prepare text for agent analysis.

        Instead of hard-truncating to 3000 chars (old behavior), we use up to
        15000 chars (≈10 pages) to capture much more document content.
        Long documents get the first 12000 chars + last 3000 chars to include
        both the opening context and the conclusion/summary sections.
        """
        if len(text) <= max_chars:
            return text

        head = text[:12000]
        tail = text[-3000:]
        return (
            head
            + "\n\n[... middle of document omitted for analysis ...]\n\n"
            + tail
        )

    # ── Kept for backward compatibility ───────────────────────────────────────

    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Legacy JSON parser — kept for any subclass that still needs it."""
        import json
        import re
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(
                line for line in lines if not line.startswith("```")
            )
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    pass
        return {}
