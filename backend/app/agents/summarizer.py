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
        Generate document summary.
        
        Returns:
            {
                "summary": str,
                "key_points": List[str],
                "action_items": List[str],
                "word_count": int,
                "document_purpose": str
            }
        """
        category = context.get("category", "unknown") if context else "unknown"
        
        prompt = f"""{self.system_prompt}

Summarize this mining document:

Document Type: {category}
Document Content:
{self._truncate_text(text, 6000)}

Respond in JSON format:
{{
  "summary": "2-3 paragraph executive summary",
  "key_points": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "action_items": [
    "Action item 1 (if any)",
    "Action item 2 (if any)"
  ],
  "document_purpose": "one sentence describing document's main purpose"
}}
"""
        try:
            response = self._generate(prompt)
            result = self._parse_json(response)
            
            summary = result.get("summary", "Summary not available.")
            
            return {
                "summary": summary,
                "key_points": result.get("key_points", []),
                "action_items": result.get("action_items", []),
                "document_purpose": result.get("document_purpose", ""),
                "word_count": len(summary.split())
            }
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return {
                "summary": "Summary generation failed.",
                "key_points": [],
                "action_items": [],
                "document_purpose": "",
                "word_count": 0
            }
