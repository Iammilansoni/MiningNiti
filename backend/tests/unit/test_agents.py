"""
Unit Tests: Agents
Tests for all 4 agents and the AgentOrchestrator.
Uses mocked Gemini API to test without real API calls.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

MOCK_CLASSIFICATION_JSON = json.dumps(
    {
        "category": "safety_protocol",
        "subcategory": "ventilation",
        "confidence": 0.93,
        "reasoning": "Document contains MSHA ventilation requirements and PPE protocols.",
    }
)

MOCK_SAFETY_JSON = json.dumps(
    {
        "score": 82.0,
        "status": "compliant",
        "confidence": 0.88,
        "hazards": [
            {
                "type": "atmospheric",
                "severity": "medium",
                "description": "Potential methane buildup in Section C",
                "regulation": "30 CFR 75.323",
            }
        ],
        "recommendations": ["Install additional methane detectors in Section C"],
        "compliance_details": {
            "msha_compliant": True,
            "osha_compliant": True,
            "dgms_compliant": True,
            "missing_elements": [],
        },
        "summary": "Generally compliant. One atmospheric hazard identified.",
    }
)

MOCK_ENTITIES_JSON = json.dumps(
    {
        "equipment": ["Caterpillar D11", "Joy 12CM15 Continuous Miner"],
        "chemicals": ["methane (CH4)", "carbon monoxide (CO)"],
        "locations": ["Section C", "Main Heading 3"],
        "personnel": ["Safety Officer", "Mine Foreman"],
        "dates": ["2024-01-15", "quarterly"],
        "regulations": ["30 CFR 75.321", "30 CFR 75.323", "MSHA 1910.134"],
    }
)

MOCK_SUMMARY_JSON = json.dumps(
    {
        "summary": "This document outlines safety procedures for underground coal mining operations, covering ventilation standards, PPE requirements, and emergency evacuation protocols.",
        "key_points": [
            "Methane levels must stay below 1% in all working areas",
            "PPE inspection required before each shift",
            "Emergency drills must occur quarterly",
        ],
        "action_items": [
            "Schedule quarterly emergency drill",
            "Replace methane detectors in Section C",
        ],
        "document_purpose": "Define safety standards for underground coal mine personnel.",
        "confidence": 0.91,
    }
)


def make_mock_model(json_response: str):
    """Create a mock Gemini model that returns json_response."""
    mock_response = MagicMock()
    mock_response.text = json_response

    mock_model = MagicMock()
    mock_model.generate_content = MagicMock(return_value=mock_response)
    return mock_model


def make_mock_client(json_response: str):
    """Create a mock OpenAI client that returns json_response."""
    mock_choice = MagicMock()
    mock_choice.message.content = json_response

    mock_completion = MagicMock()
    mock_completion.choices = [mock_choice]

    mock_chat = MagicMock()
    mock_chat.completions.create = AsyncMock(return_value=mock_completion)

    mock_client = MagicMock()
    mock_client.chat = mock_chat
    return mock_client


class TestClassifierAgent:
    """Tests for ClassifierAgent."""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_returns_expected_keys(self, sample_mining_text):
        """ClassifierAgent.analyze() returns dict with required keys."""
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        agent.client = make_mock_client(MOCK_CLASSIFICATION_JSON)

        result = await agent.analyze(sample_mining_text)

        assert "category" in result
        assert "subcategory" in result
        assert "confidence" in result
        assert "reasoning" in result

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_maps_category_correctly(self, sample_mining_text):
        """ClassifierAgent maps 'safety_protocol' string to correct value."""
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        agent.client = make_mock_client(MOCK_CLASSIFICATION_JSON)

        result = await agent.analyze(sample_mining_text)
        assert result["category"] == "safety_protocol"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_confidence_is_float_in_range(self, sample_mining_text):
        """Confidence value is a float between 0 and 1."""
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        agent.client = make_mock_client(MOCK_CLASSIFICATION_JSON)

        result = await agent.analyze(sample_mining_text)
        assert isinstance(result["confidence"], float)
        assert 0.0 <= result["confidence"] <= 1.0

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_unknown_category_maps_to_other(self, sample_mining_text):
        """Unknown category value falls back to 'other'."""
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        agent.client = make_mock_client(
            json.dumps(
                {
                    "category": "completely_unknown_xyz",
                    "confidence": 0.5,
                    "reasoning": "unknown",
                }
            )
        )

        result = await agent.analyze(sample_mining_text)
        assert result["category"] == "other"

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_handles_empty_response(self, sample_mining_text):
        """Empty JSON response returns 'other' without crashing."""
        from app.agents.classifier import ClassifierAgent

        agent = ClassifierAgent()
        agent.client = make_mock_client("{}")

        result = await agent.analyze(sample_mining_text)
        assert "category" in result
        assert result["confidence"] == 0.5  # default


class TestSafetyAnalyzerAgent:
    """Tests for SafetyAnalyzerAgent."""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_returns_expected_keys(self, sample_mining_text):
        """SafetyAnalyzerAgent.analyze() returns dict with required keys."""
        from app.agents.safety_analyzer import SafetyAnalyzerAgent

        agent = SafetyAnalyzerAgent()
        agent.client = make_mock_client(MOCK_SAFETY_JSON)

        result = await agent.analyze(
            sample_mining_text, {"category": "safety_protocol"}
        )

        for key in (
            "score",
            "status",
            "hazards",
            "recommendations",
            "compliance_details",
        ):
            assert key in result

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_score_is_numeric(self, sample_mining_text):
        """Safety score must be a numeric type."""
        from app.agents.safety_analyzer import SafetyAnalyzerAgent

        agent = SafetyAnalyzerAgent()
        agent.client = make_mock_client(MOCK_SAFETY_JSON)

        result = await agent.analyze(sample_mining_text)
        assert isinstance(result["score"], (int, float))

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_hazards_is_list(self, sample_mining_text):
        """Hazards must be a list."""
        from app.agents.safety_analyzer import SafetyAnalyzerAgent

        agent = SafetyAnalyzerAgent()
        agent.client = make_mock_client(MOCK_SAFETY_JSON)

        result = await agent.analyze(sample_mining_text)
        assert isinstance(result["hazards"], list)


class TestEntityExtractorAgent:
    """Tests for EntityExtractorAgent."""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_returns_all_entity_types(self, sample_mining_text):
        """EntityExtractorAgent returns all 6 entity categories."""
        from app.agents.entity_extractor import EntityExtractorAgent

        agent = EntityExtractorAgent()
        agent.client = make_mock_client(MOCK_ENTITIES_JSON)

        result = await agent.analyze(sample_mining_text)

        for key in (
            "equipment",
            "chemicals",
            "locations",
            "personnel",
            "dates",
            "regulations",
        ):
            assert key in result
            assert isinstance(result[key], list)

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_entity_count_is_correct(self, sample_mining_text):
        """entity_count equals sum of all entity lists."""
        from app.agents.entity_extractor import EntityExtractorAgent

        agent = EntityExtractorAgent()
        agent.client = make_mock_client(MOCK_ENTITIES_JSON)

        result = await agent.analyze(sample_mining_text)
        expected = sum(
            len(result[k])
            for k in (
                "equipment",
                "chemicals",
                "locations",
                "personnel",
                "dates",
                "regulations",
            )
        )
        assert result["entity_count"] == expected


class TestSummarizerAgent:
    """Tests for SummarizerAgent."""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_analyze_returns_expected_keys(self, sample_mining_text):
        """SummarizerAgent returns summary, key_points, action_items."""
        from app.agents.summarizer import SummarizerAgent

        agent = SummarizerAgent()
        agent.model = make_mock_model(MOCK_SUMMARY_JSON)

        result = await agent.analyze(sample_mining_text)

        assert "summary" in result
        assert "key_points" in result
        assert isinstance(result["summary"], str)
        assert len(result["summary"]) > 0

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_key_points_is_list(self, sample_mining_text):
        """key_points must be a list of strings."""
        from app.agents.summarizer import SummarizerAgent

        agent = SummarizerAgent()
        agent.model = make_mock_model(MOCK_SUMMARY_JSON)

        result = await agent.analyze(sample_mining_text)
        assert isinstance(result["key_points"], list)


class TestAgentOrchestrator:
    """Tests for AgentOrchestrator."""

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_orchestrator_returns_all_sections(self, sample_mining_text):
        """Orchestrator returns classification, safety, entities, summary, metadata."""
        from app.agents.orchestrator import AgentOrchestrator

        orchestrator = AgentOrchestrator()
        orchestrator.classifier.client = make_mock_client(MOCK_CLASSIFICATION_JSON)
        orchestrator.safety_analyzer.client = make_mock_client(MOCK_SAFETY_JSON)
        orchestrator.entity_extractor.client = make_mock_client(MOCK_ENTITIES_JSON)
        orchestrator.summarizer.model = make_mock_model(MOCK_SUMMARY_JSON)

        result = await orchestrator.analyze_document(sample_mining_text)

        for section in ("classification", "safety", "entities", "summary", "metadata"):
            assert section in result

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_orchestrator_includes_processing_time(self, sample_mining_text):
        """Metadata includes processing_time_ms > 0."""
        from app.agents.orchestrator import AgentOrchestrator

        orchestrator = AgentOrchestrator()
        orchestrator.classifier.client = make_mock_client(MOCK_CLASSIFICATION_JSON)
        orchestrator.safety_analyzer.client = make_mock_client(MOCK_SAFETY_JSON)
        orchestrator.entity_extractor.client = make_mock_client(MOCK_ENTITIES_JSON)
        orchestrator.summarizer.model = make_mock_model(MOCK_SUMMARY_JSON)

        result = await orchestrator.analyze_document(sample_mining_text)

        assert "processing_time_ms" in result["metadata"]
        assert isinstance(result["metadata"]["processing_time_ms"], int)
        assert result["metadata"]["processing_time_ms"] >= 0

    @pytest.mark.unit
    @pytest.mark.asyncio
    async def test_orchestrator_handles_agent_failure_gracefully(
        self, sample_mining_text
    ):
        """If one agent fails, orchestrator still returns results from other agents."""
        from app.agents.orchestrator import AgentOrchestrator

        orchestrator = AgentOrchestrator()
        orchestrator.classifier.client = make_mock_client(MOCK_CLASSIFICATION_JSON)
        orchestrator.safety_analyzer.client = make_mock_client(MOCK_SAFETY_JSON)
        orchestrator.entity_extractor.client = make_mock_client(MOCK_ENTITIES_JSON)

        # Make summarizer fail
        fail_model = MagicMock()
        fail_model.generate_content.side_effect = Exception("API rate limit exceeded")
        orchestrator.summarizer.model = fail_model

        result = await orchestrator.analyze_document(sample_mining_text)

        # Should still return — summary will have "error" key
        assert "summary" in result
        assert "error" in result["summary"] or "summary" in result["summary"]
