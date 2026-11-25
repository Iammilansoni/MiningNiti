"""
Unit Tests for Pillar 1: Agent Execution with Pydantic Structured Outputs
Tests that ClassifierAgent, SafetyAnalyzerAgent, EntityExtractorAgent, and SummarizerAgent
correctly process LLM outputs through their Pydantic schemas.
"""

import json
import os
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure test runs even if optional packages are not installed globally in Python 3.14
for mod in ["google.generativeai", "openai"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("GROQ_API_KEY", "test-key")
os.environ.setdefault("MISTRAL_API_KEY", "test-key")
os.environ.setdefault("CLERK_JWKS_URL", "https://clerk.test/.well-known/jwks.json")

from app.schemas.agents import (
    ClassifierOutput,
    EntityExtractorOutput,
    SafetyAnalyzerOutput,
    SummarizerOutput,
)


class TestAgentExecution(unittest.IsolatedAsyncioTestCase):
    """Test agent analysis methods with mocked LLM outputs."""

    async def test_classifier_agent_valid_output(self):
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        mock_data = {
            "category": "safety_protocol",
            "subcategory": "ventilation",
            "confidence": 0.92,
            "reasoning": "Contains safety instructions.",
        }
        with patch.object(
            agent, "_generate_structured", new_callable=AsyncMock
        ) as mock_gen:
            mock_gen.return_value = ClassifierOutput.model_validate(mock_data)
            result = await agent.analyze("Sample mining document content")

        self.assertEqual(result["category"], "safety_protocol")
        self.assertEqual(result["subcategory"], "ventilation")
        self.assertEqual(result["confidence"], 0.92)
        self.assertIn("safety instructions", result["reasoning"])

    async def test_classifier_agent_unknown_category(self):
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        mock_data = {
            "category": "invalid_nonexistent_category",
            "confidence": 0.4,
            "reasoning": "Ambiguous",
        }
        with patch.object(
            agent, "_generate_structured", new_callable=AsyncMock
        ) as mock_gen:
            mock_gen.return_value = ClassifierOutput.model_validate(mock_data)
            result = await agent.analyze("Sample mining document content")

        self.assertEqual(result["category"], "other")

    async def test_safety_analyzer_agent_valid_output(self):
        from app.agents.safety_analyzer import SafetyAnalyzerAgent

        agent = SafetyAnalyzerAgent()
        mock_data = {
            "score": 88.0,
            "status": "compliant",
            "confidence": 0.85,
            "hazards": [
                {
                    "type": "methane",
                    "severity": "medium",
                    "description": "Ventilation check required",
                    "regulation": "30 CFR 75.323",
                }
            ],
            "recommendations": ["Conduct weekly inspections"],
            "summary": "Generally compliant.",
        }
        with patch.object(
            agent, "_generate_structured", new_callable=AsyncMock
        ) as mock_gen:
            mock_gen.return_value = SafetyAnalyzerOutput.model_validate(mock_data)
            result = await agent.analyze("Sample safety document")

        self.assertEqual(result["score"], 88.0)
        self.assertEqual(result["status"], "compliant")
        self.assertEqual(len(result["hazards"]), 1)
        self.assertEqual(result["hazards"][0]["type"], "methane")
        self.assertIn("inspections", result["recommendations"][0])

    async def test_safety_analyzer_agent_string_hazard_coercion(self):
        from app.agents.safety_analyzer import SafetyAnalyzerAgent

        agent = SafetyAnalyzerAgent()
        mock_data = {"hazards": ["Loose rock on highwall"]}
        with patch.object(
            agent, "_generate_structured", new_callable=AsyncMock
        ) as mock_gen:
            mock_gen.return_value = SafetyAnalyzerOutput.model_validate(mock_data)
            result = await agent.analyze("Sample safety document")

        self.assertEqual(len(result["hazards"]), 1)
        self.assertEqual(result["hazards"][0]["description"], "Loose rock on highwall")

    async def test_entity_extractor_agent_valid_and_deduplication(self):
        from app.agents.entity_extractor import EntityExtractorAgent

        agent = EntityExtractorAgent()
        mock_data = {
            "equipment": ["Caterpillar D11", "caterpillar d11", "Joy Miner"],
            "chemicals": ["Methane"],
            "locations": ["Pit A"],
            "personnel": ["Operator"],
            "dates": ["2026-01-01"],
            "regulations": ["MSHA 30 CFR"],
        }
        with patch.object(agent, "_generate_json", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = mock_data
            result = await agent.analyze("Sample document")

        self.assertEqual(len(result["equipment"]), 2)
        self.assertEqual(result["entity_count"], 7)

    async def test_entity_extractor_agent_empty_response(self):
        from app.agents.entity_extractor import EntityExtractorAgent

        agent = EntityExtractorAgent()
        with patch.object(agent, "_generate_json", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = {}
            result = await agent.analyze("Sample document")

        self.assertEqual(result["status"], "error")
        self.assertEqual(result["entity_count"], 0)
        self.assertEqual(result["equipment"], [])

    async def test_summarizer_agent_valid_output(self):
        from app.agents.summarizer import SummarizerAgent

        agent = SummarizerAgent()
        mock_data = {
            "summary": "This is an executive summary of the safety report.",
            "key_points": ["First point", "Second point"],
            "action_items": ["Inspect unit 1"],
            "document_purpose": "Audit summary",
            "confidence": 0.9,
        }
        with patch.object(agent, "_generate_json", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = mock_data
            result = await agent.analyze("Sample document")

        self.assertEqual(
            result["summary"], "This is an executive summary of the safety report."
        )
        self.assertEqual(len(result["key_points"]), 2)
        self.assertEqual(result["word_count"], 9)

    async def test_summarizer_agent_empty_response(self):
        from app.agents.summarizer import SummarizerAgent

        agent = SummarizerAgent()
        with patch.object(agent, "_generate_json", new_callable=AsyncMock) as mock_gen:
            mock_gen.return_value = {}
            result = await agent.analyze("Sample document")

        self.assertEqual(result["status"], "error")
        self.assertIn("unavailable", result["summary"])


if __name__ == "__main__":
    unittest.main()
