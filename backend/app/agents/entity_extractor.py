"""
Entity Extractor Agent
Mining-specific Named Entity Recognition
"""

import logging
from typing import Any, Dict, Optional, List

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
    
    async def analyze(self, text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Extract named entities from document.
        
        Returns:
            {
                "equipment": List[str],
                "chemicals": List[str],
                "locations": List[str],
                "personnel": List[str],
                "dates": List[str],
                "regulations": List[str],
                "entity_count": int
            }
        """
        prompt = f"""{self.system_prompt}

Extract entities from this mining document:

{self._truncate_text(text, 5000)}

Respond in JSON format:
{{
  "equipment": ["equipment name 1", "equipment name 2"],
  "chemicals": ["chemical 1", "chemical 2"],
  "locations": ["location 1", "location 2"],
  "personnel": ["person/role 1", "person/role 2"],
  "dates": ["date 1", "date 2"],
  "regulations": ["regulation 1", "regulation 2"]
}}

Notes:
- List each unique entity only once
- Use exact text from document when possible
- For personnel, prefer roles over names for privacy
- Include regulation citations in standard format (e.g., "30 CFR 75.400")
"""
        try:
            response = self._generate(prompt)
            result = self._parse_json(response)
            
            entities = {
                "equipment": self._deduplicate(result.get("equipment", [])),
                "chemicals": self._deduplicate(result.get("chemicals", [])),
                "locations": self._deduplicate(result.get("locations", [])),
                "personnel": self._deduplicate(result.get("personnel", [])),
                "dates": self._deduplicate(result.get("dates", [])),
                "regulations": self._deduplicate(result.get("regulations", []))
            }
            
            # Calculate total entity count
            entity_count = sum(len(v) for v in entities.values())
            entities["entity_count"] = entity_count
            
            return entities
            
        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return {
                "equipment": [],
                "chemicals": [],
                "locations": [],
                "personnel": [],
                "dates": [],
                "regulations": [],
                "entity_count": 0
            }
    
    def _deduplicate(self, items: List[str]) -> List[str]:
        """Remove duplicates while preserving order"""
        seen = set()
        result = []
        for item in items:
            if item and item.lower() not in seen:
                seen.add(item.lower())
                result.append(item)
        return result
