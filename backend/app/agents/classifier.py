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
    
    async def analyze(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Classify document into mining category.
        
        Returns:
            {
                "category": DocumentCategory,
                "subcategory": str,
                "confidence": float (0-1),
                "reasoning": str
            }
        """
        prompt = f"""{self.system_prompt}

Analyze this document and classify it:

{self._truncate_text(text, 4000)}

Respond in JSON format:
{{
  "category": "category_name",
  "subcategory": "specific type if applicable",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of classification decision"
}}
"""
        try:
            response = await asyncio.to_thread(self._generate, prompt)
            result = self._parse_json(response)
            
            # Map string to enum
            category_str = result.get("category", "other").lower()
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
                "other": DocumentCategory.OTHER
            }
            
            return {
                "category": category_map.get(category_str, DocumentCategory.OTHER),
                "subcategory": result.get("subcategory"),
                "confidence": float(result.get("confidence", 0.5)),
                "reasoning": result.get("reasoning", "")
            }
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            return {
                "category": DocumentCategory.OTHER,
                "subcategory": None,
                "confidence": 0.0,
                "reasoning": f"Classification failed: {str(e)}"
            }
