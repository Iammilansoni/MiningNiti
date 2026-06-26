"""
Compliance Auditor Agent
Cross-references a regulation clause against operational document evidence
to determine compliance status (compliant / gap / missing).

Uses Gemini for the nuanced cross-referencing task that requires reasoning
across multiple evidence chunks.
"""

import logging
from typing import Any, Dict, List, Optional

from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)


class ComplianceAuditorAgent(BaseAgent):
    """
    Regulatory Compliance Auditor Agent.

    Takes a single regulation clause and a set of evidence chunks from
    operational documents, then assesses whether the operational documents
    adequately address the clause requirements.
    """

    def __init__(self):
        super().__init__(model_name="llama-3.3-70b-versatile", provider="groq")

    @property
    def system_prompt(self) -> str:
        return """You are a regulatory compliance auditor specializing in the mining industry.

Your expertise includes:
- MSHA (Mine Safety and Health Administration) regulations (30 CFR)
- OSHA safety standards (29 CFR 1910, 1926)
- DGMS (Directorate General of Mines Safety) regulations
- EPA environmental regulations for mining operations
- State-level mining regulations and permits

Your task: Given a REGULATION CLAUSE and EVIDENCE CHUNKS from operational documents,
assess whether the operational documents adequately address the clause requirements.

Assessment statuses:
- "compliant": The operational documents clearly address the regulation clause requirements
- "gap": The operational documents partially address the clause but have gaps or deficiencies
- "missing": The operational documents do not address this clause at all, or the evidence is insufficient

Be strict but fair. If the evidence is thin but directionally correct, mark as "gap" not "missing".
Only mark "compliant" if the evidence clearly and adequately addresses the clause.

Always cite specific evidence in your assessment. If no evidence is provided, mark as "missing".
"""

    async def analyze(
        self,
        text: str,
        context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Assess compliance for a single regulation clause.

        Args:
            text: The regulation clause text
            context: Must contain:
                - evidence_chunks: List of dicts with chunk_text, document_title,
                  page_numbers, relevance_score
                - clause_section: Section title from the regulation document

        Returns:
            {
                "status": "compliant" | "gap" | "missing",
                "assessment": str,
                "confidence": float (0.0-1.0),
                "recommendations": list[str],
            }
        """
        evidence_chunks: List[Dict] = (
            context.get("evidence_chunks", []) if context else []
        )
        clause_section = context.get("clause_section", "") if context else ""

        # Format evidence for the prompt
        if evidence_chunks:
            evidence_text = "\n\n".join(
                f"[Evidence {i+1}] From '{chunk.get('document_title', 'Unknown')}'"
                f" (Pages {chunk.get('page_numbers', ['?'])}, "
                f"Relevance: {chunk.get('relevance_score', 0):.0%}):\n"
                f"{chunk.get('chunk_text', '')}"
                for i, chunk in enumerate(evidence_chunks)
            )
        else:
            evidence_text = "No relevant evidence found in operational documents."

        section_hint = (
            f"\nRegulation Section: {clause_section}" if clause_section else ""
        )

        prompt = (
            "Assess compliance for the following regulation clause against "
            "the provided operational document evidence.\n\n"
            f"REGULATION CLAUSE{text}:\n{text}\n\n"
            f"{section_hint}\n\n"
            f"EVIDENCE FROM OPERATIONAL DOCUMENTS:\n{evidence_text}\n\n"
            "Respond with a JSON object:\n"
            "{\n"
            '  "status": "<compliant|gap|missing>",\n'
            '  "assessment": "<2-4 sentence explanation of compliance status, '
            'citing specific evidence where available>",\n'
            '  "confidence": <0.0-1.0>,\n'
            '  "recommendations": ["<specific actionable recommendation to close gaps>"]\n'
            "}\n"
        )

        result = await self._generate_json(prompt)

        status = (result.get("status") or "missing").lower()
        if status not in ("compliant", "gap", "missing"):
            status = "missing"

        return {
            "status": status,
            "assessment": result.get(
                "assessment",
                "Assessment could not be generated.",
            ),
            "confidence": float(result.get("confidence") or 0.5),
            "recommendations": result.get("recommendations", []),
        }
