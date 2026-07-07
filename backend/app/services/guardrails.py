"""
MiningNiti Input/Output Guardrails

Validates user queries before they reach the RAG pipeline and
verifies LLM outputs against source chunks for citation accuracy.

Used by chat endpoints to prevent prompt injection, enforce length
limits, and detect fabricated citations.
"""

import logging
import re
from typing import Any, Dict, List

from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

# ── Prompt Injection Patterns ──────────────────────────────────────────────────

_INJECTION_PATTERNS: List[str] = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?prior\s+instructions",
    r"disregard\s+(all\s+)?previous",
    r"disregard\s+(all\s+)?prior",
    r"forget\s+(all\s+)?previous",
    r"forget\s+(all\s+)?prior",
    r"you\s+are\s+now\s+",
    r"act\s+as\s+(if\s+)?(?:a\s+)?(?:new|different|another)",
    r"pretend\s+(?:you\s+are|to\s+be)\s+",
    r"system\s*:",
    r"system\s+prompt",
    r"override\s+instructions",
    r"bypass\s+(?:your\s+)?(?:rules|instructions|guidelines)",
    r"jailbreak",
    r"dan\s+mode",
    r"do\s+anything\s+now",
    r"output\s+(?:your\s+)?(?:system|initial)\s+(?:prompt|message)",
    r"reveal\s+(?:your\s+)?(?:system|initial)\s+prompt",
    r"what\s+(?:are|is)\s+your\s+(?:system|initial)\s+(?:prompt|message|instructions)",
    r"repeat\s+(?:your\s+)?(?:system|initial)\s+(?:prompt|message)",
    r"translate\s+(?:your\s+)?(?:system|initial)\s+(?:prompt|message)",
    r"print\s+(?:your\s+)?(?:system|initial)\s+(?:prompt|message)",
    r"show\s+(?:me\s+)?(?:your\s+)?(?:system|initial)\s+(?:prompt|message)",
]

_COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in _INJECTION_PATTERNS]

# ── Citation Extraction ────────────────────────────────────────────────────────

_CITATION_PATTERN = re.compile(r"\[(\d+)\]")


class MiningGuardrails:
    """
    Input and output guardrails for the RAG chat pipeline.

    validate_input: Detects prompt injection and enforces character limits.
    verify_citations: Checks that numbered citations in LLM output map to
                      actual source chunks.
    """

    MAX_QUERY_LENGTH: int = 1500

    @staticmethod
    def validate_input(query: str) -> str:
        """
        Validate a user query before it enters the RAG pipeline.

        Checks:
          1. Empty or whitespace-only query → 422
          2. Exceeds MAX_QUERY_LENGTH → 422
          3. Matches known prompt injection patterns → 403

        Args:
            query: Raw user query string.

        Returns:
            The stripped, validated query.

        Raises:
            HTTPException 422: If query is empty or too long.
            HTTPException 403: If prompt injection is detected.
        """
        if not query or not query.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Query cannot be empty",
            )

        query = query.strip()

        if len(query) > MiningGuardrails.MAX_QUERY_LENGTH:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Query exceeds maximum length of {MiningGuardrails.MAX_QUERY_LENGTH} characters",
            )

        for pattern in _COMPILED_PATTERNS:
            if pattern.search(query):
                logger.warning(
                    f"Prompt injection detected: matched pattern '{pattern.pattern}' "
                    f"in query: {query[:100]}..."
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your query contains content that cannot be processed",
                )

        return query

    @staticmethod
    def verify_citations(
        llm_output: str, source_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verify that numbered citations in the LLM output reference existing chunks.

        Extracts all [N] patterns from the output text and checks whether each
        index N (1-based) corresponds to a valid position in source_chunks.

        Args:
            llm_output: The raw text response from the LLM.
            source_chunks: The list of retrieved context chunks sent to the LLM.

        Returns:
            Dict with keys:
              - valid (bool): True if all citations map to existing chunks.
              - citations_found (list[int]): All cited indices found.
              - invalid_citations (list[int]): Indices that don't map to chunks.
              - total_chunks (int): Length of source_chunks list.
        """
        matches = _CITATION_PATTERN.findall(llm_output)
        citations_found = [int(m) for m in matches]

        if not citations_found:
            return {
                "valid": True,
                "citations_found": [],
                "invalid_citations": [],
                "total_chunks": len(source_chunks),
            }

        max_index = len(source_chunks)
        invalid = [c for c in citations_found if c < 1 or c > max_index]

        return {
            "valid": len(invalid) == 0,
            "citations_found": citations_found,
            "invalid_citations": invalid,
            "total_chunks": max_index,
        }
