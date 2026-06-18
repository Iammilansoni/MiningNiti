"""
Summarizer Agent
Document summarization for mining documents
"""

import logging
from typing import Any, Dict, Optional, List

from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)


class SummarizerAgent(BaseAgent):
    """
    Document Summarization Agent.
    
    Creates concise, actionable summaries of mining documents:
    - Executive summary
    - Key points extraction
    - Action items identification
    """
    
    @property
    def system_prompt(self) -> str:
        return """You are a document summarization agent for the mining industry.

Create clear, actionable summaries that:
- Highlight critical information first
- Focus on safety-relevant content
- Identify action items and deadlines
- Use plain language accessible to all mining personnel
- Preserve technical accuracy

Summary structure:
1. Executive Summary: 2-3 paragraphs covering main purpose and findings
2. Key Points: 5-7 bullet points of most important information
3. Action Items: Any required actions or follow-ups (if applicable)

Prioritize:
- Safety information
- Compliance requirements
- Deadlines and schedules
- Equipment status
- Personnel responsibilities
"""
    
    async def analyze(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate document summary and key points.

        Returns:
            {
                "summary": str,
                "key_points": List[str],
                "action_items": List[str],
                "document_purpose": str,
                "confidence": float
            }
        """
        category = context.get("category", "unknown") if context else "unknown"

        prompt = f"""Summarize this mining document clearly and concisely.

Document Type: {category}
Document content ({len(text)} chars total, showing up to 15000):
{self._prepare_text(text)}

Respond with a JSON object:
{{
  "summary": "<2-3 paragraph executive summary covering main purpose and findings>",
  "key_points": [
    "<Key point 1>",
    "<Key point 2>",
    "<Key point 3>",
    "<Key point 4>",
    "<Key point 5>"
  ],
  "action_items": ["<required action or follow-up if any>"],
  "document_purpose": "<one sentence describing the document's main purpose>",
  "confidence": <0.0-1.0>
}}
"""
        result = await self._generate_json(prompt)

        summary = result.get("summary") or "Summary not available."
        return {
            "summary": summary,
            "key_points": result.get("key_points", []),
            "action_items": result.get("action_items", []),
            "document_purpose": result.get("document_purpose", ""),
            "confidence": float(result.get("confidence") or 0.7),
            "word_count": len(summary.split()),
        }
