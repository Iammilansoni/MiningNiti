"""
Classifier Agent
Document classification for mining industry categories
"""

import asyncio
import logging
from typing import Any, Dict, Optional

from app.agents.base import BaseAgent, get_secondary_provider
from app.schemas.agents import ClassifierOutput

logger = logging.getLogger(__name__)


class ClassifierAgent(BaseAgent):
    """
    Document Classification Agent.

    Categorizes mining documents into predefined categories:
    - Safety protocols
    - Equipment manuals
    - Regulatory documents
    - Incident reports
    - Geological reports
    - Environmental reports
    - Training materials
    - Permits
    - Maintenance logs
    """

    def __init__(self):
        # Groq's free tier (~8K TPM) is tight; fall back to NVIDIA NIM
        # when rate-limited (if configured).
        secondary = get_secondary_provider()
        super().__init__(
            model_name="openai/gpt-oss-120b",
            provider="groq",
            fallback_model=secondary[1] if secondary else None,
            fallback_provider=secondary[0] if secondary else None,
        )

    @property
    def system_prompt(self) -> str:
        return """You are a document classification agent specialized in the mining industry.

Your task is to analyze documents and classify them into the appropriate category based on their content, structure, and purpose.

Categories:
1. safety_protocol - Safety procedures, guidelines, emergency protocols
2. equipment_manual - Equipment operation guides, maintenance manuals
3. regulatory - MSHA, OSHA, EPA regulations, compliance documents
4. incident_report - Accident reports, incident investigations, near-miss reports
5. geological - Drill logs, assay reports, geological surveys, core samples
6. environmental - Environmental impact assessments, monitoring reports
7. training - Training materials, certifications, competency assessments
8. permit - Mining permits, licenses, applications
9. maintenance - Maintenance schedules, repair logs, equipment inspections
10. other - Documents that don't fit other categories

Consider:
- Document structure and formatting
- Key terminology and language used
- Purpose and intended audience
- Regulatory references
"""

    async def analyze(
        self, text: str, context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Classify document into mining category.

        Returns:
            {
                "category": str (DocumentCategory value),
                "subcategory": str,
                "confidence": float (0-1),
                "reasoning": str
            }
        """
        prompt = f"""Analyze this mining document and classify it.

Document content ({len(text)} chars total, showing up to 15000):
{self._prepare_text(text)}

Respond with a JSON object:
{{
  "category": "<one of: safety_protocol|equipment_manual|regulatory|incident_report|geological|environmental|training|permit|maintenance|other>",
  "subcategory": "<more specific type if applicable, else null>",
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation of classification decision>"
}}
"""
        output = await self._generate_structured(prompt, ClassifierOutput)
        return output.model_dump()
