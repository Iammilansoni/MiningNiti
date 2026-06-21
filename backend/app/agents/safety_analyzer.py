"""
Safety Analyzer Agent
Mining safety compliance and hazard detection.

Uses JSON mode (response_mime_type=application/json) + retry for reliable output.
Processes up to 15000 chars of document content (vs 5000 in v1).
"""

import logging
from typing import Any, Dict, Optional, List

from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)


class SafetyAnalyzerAgent(BaseAgent):
    """
    Safety Compliance Analysis Agent.

    Analyzes mining documents for:
    - MSHA/OSHA/DGMS compliance issues
    - Safety hazards and risks
    - Missing safety requirements
    - Recommendations for improvement
    """

    @property
    def system_prompt(self) -> str:
        return """You are a mining safety compliance analysis agent.

Your expertise includes:
- MSHA (Mine Safety and Health Administration) regulations
- OSHA safety standards
- DGMS (Directorate General of Mines Safety) regulations
- Underground and surface mining safety
- Equipment safety requirements
- Emergency response protocols
- Ventilation and air quality standards
- Ground control and stability
- Electrical safety in mining
- Personal protective equipment (PPE)
- Hazardous materials handling

Analyze documents for:
1. Compliance with regulations
2. Potential safety hazards
3. Missing safety procedures
4. Risk factors
5. Areas needing improvement

Be thorough but practical. Focus on actionable findings.
"""

    async def analyze(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze document for safety compliance and hazards.

        Returns:
            {
                "score": float (0-100),
                "status": str ("compliant"|"warning"|"violation"),
                "hazards": List[Dict],
                "recommendations": List[str],
                "compliance_details": Dict,
                "confidence": float (0-1),
                "reasoning": Dict (explainability layer)
            }
        """
        category = context.get("category", "unknown") if context else "unknown"

        prompt = (
            "Analyze this mining document for safety compliance and hazards.\n\n"
            f"Document Type: {category}\n"
            f"Document content ({len(text)} chars total, showing up to 15000):\n"
            f"{self._prepare_text(text)}\n\n"
            "Evaluate and respond with a JSON object:\n"
            "{\n"
            "  \"score\": <0-100 overall safety score>,\n"
            "  \"status\": \"<compliant|warning|violation>\",\n"
            "  \"confidence\": <0.0-1.0>,\n"
            "  \"hazards\": [\n"
            "    {\n"
            "      \"type\": \"<hazard category>\",\n"
            "      \"severity\": \"<low|medium|high|critical>\",\n"
            "      \"description\": \"<specific hazard details>\",\n"
            "      \"regulation\": \"<relevant MSHA/OSHA/DGMS regulation if applicable>\"\n"
            "    }\n"
            "  ],\n"
            "  \"recommendations\": [\"<specific actionable recommendation>\"],\n"
            "  \"compliance_details\": {\n"
            "    \"msha_compliant\": <true|false>,\n"
            "    \"osha_compliant\": <true|false>,\n"
            "    \"dgms_compliant\": <true|false>,\n"
            "    \"missing_elements\": [\"<missing safety element>\"]\n"
            "  },\n"
            "  \"reasoning\": {\n"
            "    \"score_explanation\": \"<1-2 sentence explanation of why this specific score was assigned>\",\n"
            "    \"positive_factors\": [\"<safety elements that contributed positively to the score>\"],\n"
            "    \"negative_factors\": [\"<safety gaps or issues that reduced the score>\"],\n"
            "    \"evidence\": [\n"
            "      {\"text\": \"<exact quote or paraphrase from document>\", \"factor\": \"<positive|negative>\", \"impact\": \"<explanation>\"}\n"
            "    ]\n"
            "  },\n"
            "  \"summary\": \"<brief safety assessment summary>\"\n"
            "}\n\n"
            "Scoring guide:\n"
            "  80-100: Compliant, minimal concerns\n"
            "  60-79:  Generally compliant with warnings\n"
            "  40-59:  Significant concerns, needs attention\n"
            "  0-39:   Critical issues or violations present\n"
        )

        result = await self._generate_json(prompt)

        return {
            "score": float(result.get("score") or 50),
            "status": (result.get("status") or "pending").lower(),
            "confidence": float(result.get("confidence") or 0.5),
            "hazards": result.get("hazards", []),
            "recommendations": result.get("recommendations", []),
            "compliance_details": result.get("compliance_details", {}),
            "reasoning": result.get("reasoning", {
                "score_explanation": "",
                "positive_factors": [],
                "negative_factors": [],
                "evidence": [],
            }),
            "summary": result.get("summary", ""),
        }

