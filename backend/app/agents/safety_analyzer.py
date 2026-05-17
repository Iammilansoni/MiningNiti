"""
Safety Analyzer Agent
Mining safety compliance and hazard detection
"""

import logging
from typing import Any, Dict, Optional, List

from app.agents.base import BaseAgent
from app.models.document import ComplianceStatus

logger = logging.getLogger(__name__)


class SafetyAnalyzerAgent(BaseAgent):
    """
    Safety Compliance Analysis Agent.
    
    Analyzes mining documents for:
    - MSHA/OSHA compliance issues
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
                "status": ComplianceStatus,
                "hazards": List[Dict],
                "recommendations": List[str],
                "compliance_details": Dict
            }
        """
        category = context.get("category", "unknown") if context else "unknown"
        
        prompt = f"""{self.system_prompt}

Analyze this mining document for safety compliance and hazards.

Document Type: {category}
Document Content:
{self._truncate_text(text, 5000)}

Evaluate and provide:
1. Safety Score (0-100): Overall safety level
   - 80-100: Compliant, minimal concerns
   - 60-79: Generally compliant with warnings
   - 40-59: Significant concerns, needs attention
   - 0-39: Critical issues, violations present

2. Compliance Status: "compliant", "warning", or "violation"

3. Hazards: List specific hazards found

4. Recommendations: Actionable safety improvements

Respond in JSON format:
{{
  "score": 0-100,
  "status": "compliant|warning|violation",
  "hazards": [
    {{
      "type": "hazard category",
      "severity": "low|medium|high|critical",
      "description": "specific hazard details",
      "regulation": "relevant MSHA/OSHA regulation if applicable"
    }}
  ],
  "recommendations": [
    "specific actionable recommendation"
  ],
  "compliance_details": {{
    "msha_compliant": true/false,
    "osha_compliant": true/false,
    "missing_elements": ["list of missing safety elements"]
  }},
  "summary": "brief safety assessment summary"
}}
"""
        try:
            response = self._generate(prompt)
            result = self._parse_json(response)
            
            # Map status
            status_str = result.get("status", "pending").lower()
            status_map = {
                "compliant": ComplianceStatus.COMPLIANT,
                "warning": ComplianceStatus.WARNING,
                "violation": ComplianceStatus.VIOLATION
            }
            
            return {
                "score": float(result.get("score", 50)),
                "status": status_map.get(status_str, ComplianceStatus.PENDING),
                "hazards": result.get("hazards", []),
                "recommendations": result.get("recommendations", []),
                "compliance_details": result.get("compliance_details", {}),
                "summary": result.get("summary", "")
            }
            
        except Exception as e:
            logger.error(f"Safety analysis failed: {e}")
            return {
                "score": None,
                "status": ComplianceStatus.PENDING,
                "hazards": [],
                "recommendations": [],
                "compliance_details": {},
                "summary": f"Analysis failed: {str(e)}"
            }
