"""
Classifier Agent
Document classification for mining industry categories
"""

import asyncio
import logging
from typing import Any, Dict, Optional

from app.agents.base import BaseAgent
from app.models.document import DocumentCategory

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
        # Groq decommissioned llama-3.3-70b-versatile on 2026-08-16; gpt-oss-120b
        # is their recommended replacement and is already proven on Cerebras here.
        #
        # Groq's free tier is 8K TPM / 200K TPD, the tightest budget in the
        # system. Cerebras serves the identical model at 30K TPM / 1M TPD, so a
        # 429 falls through instead of failing the whole document analysis.
        super().__init__(
            model_name="openai/gpt-oss-120b",
            provider="groq",
            fallback_model="gpt-oss-120b",
            fallback_provider="cerebras",
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
        result = await self._generate_json(prompt)

        category_str = (result.get("category") or "other").lower().strip()
        category_map = {
            "safety_protocol": DocumentCategory.SAFETY_PROTOCOL,
            "equipment_manual": DocumentCategory.EQUIPMENT_MANUAL,
            "regulatory": DocumentCategory.REGULATORY,
            "incident_report": DocumentCategory.INCIDENT_REPORT,
            "geological": DocumentCategory.GEOLOGICAL,
            "environmental": DocumentCategory.ENVIRONMENTAL,
            "training": DocumentCategory.TRAINING,
            "permit": DocumentCategory.PERMIT,
            "maintenance": DocumentCategory.MAINTENANCE,
        }

        return {
            "category": category_map.get(category_str, DocumentCategory.OTHER).value,
            "subcategory": result.get("subcategory"),
            "confidence": float(result.get("confidence") or 0.5),
            "reasoning": result.get("reasoning", ""),
        }
