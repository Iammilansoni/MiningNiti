"""
Unit Tests for Pillar 1: Pydantic Structured Agent Outputs
Verifies that all agent schemas parse valid data and gracefully handle malformed LLM responses.
"""

import unittest

from app.schemas.agents import (
    ClassifierOutput,
    EntityExtractorOutput,
    HazardItem,
    SafetyAnalyzerOutput,
    SummarizerOutput,
)
from app.schemas.document import ComplianceStatus, DocumentCategory


class TestClassifierSchema(unittest.TestCase):
    def test_valid_classification(self):
        data = {
            "category": "safety_protocol",
            "subcategory": "ventilation",
            "confidence": 0.95,
            "reasoning": "Standard operating procedure for mine airflow.",
        }
        output = ClassifierOutput.model_validate(data)
        self.assertEqual(output.category, "safety_protocol")
        self.assertEqual(output.subcategory, "ventilation")
        self.assertEqual(output.confidence, 0.95)
        self.assertIn("airflow", output.reasoning)

    def test_case_insensitive_category(self):
        data = {"category": "  REGULATORY  "}
        output = ClassifierOutput.model_validate(data)
        self.assertEqual(output.category, "regulatory")

    def test_unknown_category_fallback(self):
        data = {"category": "completely_unknown_category_123"}
        output = ClassifierOutput.model_validate(data)
        self.assertEqual(output.category, "other")

    def test_missing_fields_defaults(self):
        output = ClassifierOutput.model_validate({})
        self.assertEqual(output.category, "other")
        self.assertEqual(output.confidence, 0.5)
        self.assertIsNone(output.subcategory)


class TestSafetyAnalyzerSchema(unittest.TestCase):
    def test_valid_safety_analysis(self):
        data = {
            "score": 85.5,
            "status": "compliant",
            "confidence": 0.9,
            "hazards": [
                {
                    "type": "methane",
                    "severity": "high",
                    "description": "Gas build-up detected",
                    "regulation": "30 CFR 75.323",
                }
            ],
            "recommendations": ["Increase exhaust ventilation"],
            "summary": "Overall safe with isolated methane concern.",
        }
        output = SafetyAnalyzerOutput.model_validate(data)
        self.assertEqual(output.score, 85.5)
        self.assertEqual(output.status, "compliant")
        self.assertEqual(len(output.hazards), 1)
        self.assertIsInstance(output.hazards[0], HazardItem)
        self.assertEqual(output.hazards[0].severity, "high")

    def test_coerces_string_hazard_to_hazard_item(self):
        """Crucial test: prevents DocumentResponse crashes when LLM outputs plain strings."""
        data = {
            "hazards": [
                "Unsecured conveyor belt near section B",
                {"type": "fire", "description": "Missing extinguisher"},
            ]
        }
        output = SafetyAnalyzerOutput.model_validate(data)
        self.assertEqual(len(output.hazards), 2)
        self.assertEqual(
            output.hazards[0].description, "Unsecured conveyor belt near section B"
        )
        self.assertEqual(output.hazards[1].type, "fire")

    def test_empty_or_malformed_input(self):
        output = SafetyAnalyzerOutput.model_validate({})
        self.assertEqual(output.score, 50.0)
        self.assertEqual(output.status, "pending")
        self.assertEqual(output.hazards, [])


class TestEntityExtractorSchema(unittest.TestCase):
    def test_valid_and_deduplicated_entities(self):
        data = {
            "equipment": ["Caterpillar D11", "caterpillar d11", "Haul Truck"],
            "chemicals": ["Methane (CH4)"],
            "locations": ["Mine Section 4"],
            "personnel": ["Safety Officer"],
            "dates": ["2026-03-01"],
            "regulations": ["30 CFR 75.400"],
        }
        output = EntityExtractorOutput.model_validate(data)
        # Should deduplicate "caterpillar d11" regardless of case
        self.assertEqual(len(output.equipment), 2)
        self.assertEqual(output.equipment, ["Caterpillar D11", "Haul Truck"])
        self.assertEqual(output.entity_count, 7)

    def test_empty_entities(self):
        output = EntityExtractorOutput.model_validate({})
        self.assertEqual(output.equipment, [])
        self.assertEqual(output.entity_count, 0)


class TestSummarizerSchema(unittest.TestCase):
    def test_valid_summary(self):
        data = {
            "summary": "This is a brief executive summary of mining safety.",
            "key_points": ["Point 1", "Point 2"],
            "action_items": ["Action 1"],
            "document_purpose": "Safety compliance",
            "confidence": 0.88,
        }
        output = SummarizerOutput.model_validate(data)
        self.assertTrue(output.summary.startswith("This is a brief"))
        self.assertEqual(len(output.key_points), 2)
        self.assertEqual(output.word_count, 9)

    def test_empty_summary_fallback(self):
        output = SummarizerOutput.model_validate({})
        self.assertEqual(output.summary, "Summary not available.")
        self.assertEqual(output.word_count, 3)
        self.assertEqual(output.confidence, 0.7)


if __name__ == "__main__":
    unittest.main()
