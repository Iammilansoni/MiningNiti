"""
Base Agent
Abstract base class for all mining intelligence agents.

Improvements over v1:
  - JSON mode via response_mime_type (no more regex JSON extraction)
  - Retry with exponential backoff (3 retries), respecting Gemini retry_delay
  - Processes full document via pages, not truncated to 3000 chars
  - Confidence score required in all agent outputs
  - Proper QuotaExceededError raised (no more silent empty-dict returns)
"""

import asyncio
import logging
import re
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
    temperature=0.1,  # Low temperature for consistent structured output
    top_p=0.95,
)

_MAX_RETRIES = 3
_RETRY_BASE_DELAY = 2.0  # seconds — minimum delay between retries
_MAX_RETRY_DELAY = 120.0  # seconds — cap for retry_delay parsed from API response


class QuotaExceededError(RuntimeError):
    """Raised when the Gemini API quota / rate-limit is exhausted."""


def _parse_retry_delay(err_str: str) -> Optional[float]:
    """
    Extract the suggested retry_delay (in seconds) from a Gemini 429 error
    message.  The error body contains a line like:
        retry_delay { seconds: 31 }
    Returns None if no delay can be parsed.
    """
    match = re.search(r"retry_delay\s*\{\s*seconds:\s*(\d+)", err_str)
    if match:
        return min(float(match.group(1)), _MAX_RETRY_DELAY)
    # Fallback: look for "Please retry in X.Xs"
    match2 = re.search(r"retry in (\d+\.?\d*)s", err_str)
    if match2:
        return min(float(match2.group(1)), _MAX_RETRY_DELAY)
    return None


class BaseAgent(ABC):
    """
    Abstract base class for mining document intelligence agents.

    Each agent is responsible for a specific analysis task:
    - Classification
    - Safety Analysis
    - Entity Extraction
    - Summarization
    """

    def __init__(
        self,
        model_name: str = None,
        provider: str = "gemini",
        fallback_model: str = None,
        fallback_provider: str = None,
    ):
        self.provider = provider
        self.model_name = model_name or settings.GEMINI_MODEL
        self.name = self.__class__.__name__

        # Fallback config (e.g. Cerebras when Groq is rate-limited)
        self.fallback_model = fallback_model
        self.fallback_provider = fallback_provider
        self._fallback_client = None
        self._using_fallback = False

        if self.fallback_provider and self.fallback_model:
            self._init_fallback_client()

        self._init_client()

    def _init_client(self):
        """Initialize the primary provider client."""
        if self.provider == "gemini":
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config=_JSON_GENERATION_CONFIG,
            )
        elif self.provider == "groq":
            from app.services.llm_provider import get_groq_client

            self.client = get_groq_client()
        elif self.provider == "mistral":
            from app.services.llm_provider import get_mistral_client

            self.client = get_mistral_client()
        elif self.provider == "cerebras":
            from app.services.llm_provider import get_cerebras_client

            self.client = get_cerebras_client()

    def _init_fallback_client(self):
        """Initialize the fallback provider client."""
        if self.fallback_provider == "cerebras":
            from app.services.llm_provider import get_cerebras_client

            self._fallback_client = get_cerebras_client()
        elif self.fallback_provider == "groq":
            from app.services.llm_provider import get_groq_client

            self._fallback_client = get_groq_client()
        elif self.fallback_provider == "mistral":
            from app.services.llm_provider import get_mistral_client

            self._fallback_client = get_mistral_client()
        logger.info(
            f"{self.name}: Fallback configured — {self.fallback_provider}/{self.fallback_model}"
        )

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

    # ── Generation with retry + fallback ───────────────────────────────────────

    async def _call_openai_compat(self, client, model: str, prompt: str) -> str:
        """Call an OpenAI-compatible provider and return text response."""
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        return response.choices[0].message.content or ""

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        """
        Generate structured JSON output with retry and automatic provider fallback.

        Primary provider is tried first. On 429/rate-limit errors, if a fallback
        is configured (e.g. Cerebras when Groq is rate-limited), the request
        is retried on the fallback provider before raising QuotaExceededError.
        """
        import json

        last_error: Optional[Exception] = None
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                full_prompt = f"{self.system_prompt}\n\n{prompt}"

                if self.provider == "gemini":
                    response = await asyncio.to_thread(
                        self.model.generate_content,
                        full_prompt,
                    )
                    text_response = getattr(response, "text", "")
                elif self.provider in ["groq", "mistral", "cerebras"]:
                    text_response = await self._call_openai_compat(
                        self.client, self.model_name, prompt
                    )

                try:
                    return json.loads(text_response)
                except (json.JSONDecodeError, AttributeError) as parse_err:
                    logger.warning(
                        f"{self.name} attempt {attempt}: JSON parse failed — {parse_err}. "
                        f"Raw response: {text_response[:200]}"
                    )
                    last_error = parse_err
                    delay = _RETRY_BASE_DELAY * (2 ** (attempt - 1))
                    await asyncio.sleep(delay)
                    continue

            except Exception as e:
                last_error = e
                err_str = str(e)

                is_quota = (
                    "429" in err_str
                    or "rate_limit" in err_str.lower()
                    or "quota" in err_str.lower()
                    or "RESOURCE_EXHAUSTED" in err_str
                )

                if is_quota:
                    # Try fallback provider if available and not already using it
                    if (
                        self._fallback_client
                        and self.fallback_model
                        and not self._using_fallback
                    ):
                        logger.warning(
                            f"{self.name}: Primary provider rate-limited. "
                            f"Falling back to {self.fallback_provider}/{self.fallback_model}"
                        )
                        try:
                            text_response = await self._call_openai_compat(
                                self._fallback_client, self.fallback_model, prompt
                            )
                            result = json.loads(text_response)
                            self._using_fallback = True
                            return result
                        except Exception as fb_err:
                            logger.error(f"{self.name}: Fallback also failed: {fb_err}")
                            # Fall through to raise QuotaExceededError

                    # Parse the suggested wait time from the error body
                    suggested_delay = _parse_retry_delay(err_str)

                    if attempt < _MAX_RETRIES and suggested_delay is not None:
                        logger.warning(
                            f"{self.name}: Quota/rate-limit hit (attempt {attempt}/{_MAX_RETRIES}). "
                            f"Waiting {suggested_delay}s..."
                        )
                        await asyncio.sleep(suggested_delay)
                        continue

                    logger.error(f"{self.name}: All providers exhausted — {e}")
                    raise QuotaExceededError(
                        f"Rate limit exceeded for {self.name}. "
                        "Please try again later."
                    ) from e

                # Transient non-quota error — exponential backoff
                delay = _RETRY_BASE_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    f"{self.name} attempt {attempt}/{_MAX_RETRIES} failed: {e}. "
                    f"Retrying in {delay}s..."
                )
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
        return head + "\n\n[... middle of document omitted for analysis ...]\n\n" + tail

    # ── Kept for backward compatibility ───────────────────────────────────────

    def _parse_json(self, text: str) -> Dict[str, Any]:
        """Legacy JSON parser — kept for any subclass that still needs it."""
        import json
        import re

        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(line for line in lines if not line.startswith("```"))
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
