"""
Entity Extractor Agent
Mining-specific Named Entity Recognition
"""

import logging
from typing import Any, Dict, List, Optional

from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)


class EntityExtractorAgent(BaseAgent):
    """
    Named Entity Recognition Agent for Mining Documents.

    Extracts mining-specific entities:
    - Equipment names and models
    - Chemical compounds and gases
    - Mine locations and sections
    - Personnel and roles
    - Dates and schedules
    - Regulatory references
    """

    def __init__(self):
        # Cerebras: 1M tokens/day free, 2600+ TPS, 60K TPM — better for high-volume extraction than Groq
        super().__init__(model_name="gpt-oss-120b", provider="cerebras")

    @property
    def system_prompt(self) -> str:
        return """You are a named entity extraction agent specialized in mining documents.

Extract the following entity types:

1. EQUIPMENT
   - Mining machinery (excavators, haul trucks, drills)
   - Brand names and models (Caterpillar D11, Komatsu PC8000)
   - Equipment IDs and serial numbers
   - Tools and instruments

2. CHEMICALS
   - Gases (methane, CO, H2S, oxygen)
   - Minerals and ores
   - Explosives and blasting agents
   - Dust types (coal dust, silica)
   - Hazardous substances

3. LOCATIONS
   - Mine names
   - Sections and portals
   - Underground levels
   - Surface areas
   - Geographic coordinates

4. PERSONNEL
   - Names (anonymize if needed)
   - Roles (Safety Officer, Foreman, Engineer)
   - Departments and teams
   - Certifications

5. DATES
   - Specific dates
   - Deadlines
   - Scheduled events
   - Time periods

6. REGULATIONS
   - MSHA regulations (30 CFR citations)
   - OSHA standards
   - EPA requirements
   - State regulations
   - Company policies

Be precise and avoid duplicates. Extract exactly as written in the document.
"""

    async def analyze(
        self, text: str, context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Extract named entities from document.

        Returns dict with keys: equipment, chemicals, locations, personnel,
        dates, regulations (all List[str]), entity_count (int)
        """
        prompt = f"""Extract all mining-specific named entities from this document.

Document content ({len(text)} chars total, showing up to 15000):
{self._prepare_text(text)}

Respond with a JSON object:
{{
  "equipment": ["<equipment name or model>"],
  "chemicals": ["<chemical compound, gas, or mineral>"],
  "locations": ["<mine name, section, or area>"],
  "personnel": ["<role or name>"],
  "dates": ["<date or time period>"],
  "regulations": ["<e.g. 30 CFR 75.400, OSHA 1910.134>"]
}}

Notes:
- List each unique entity only once
- Use exact text from document
- For personnel, prefer roles over names for privacy
- Include regulation citations in standard format
"""
        result = await self._generate_json(prompt)

        entities = {
            "equipment": self._deduplicate(result.get("equipment", [])),
            "chemicals": self._deduplicate(result.get("chemicals", [])),
            "locations": self._deduplicate(result.get("locations", [])),
            "personnel": self._deduplicate(result.get("personnel", [])),
            "dates": self._deduplicate(result.get("dates", [])),
            "regulations": self._deduplicate(result.get("regulations", [])),
        }
        entities["entity_count"] = sum(len(v) for v in entities.values())
        return entities

    def _deduplicate(self, items: List[str]) -> List[str]:
        """Remove duplicates while preserving order"""
        seen = set()
        result = []
        for item in items:
            if item and item.lower() not in seen:
                seen.add(item.lower())
                result.append(item)
        return result
