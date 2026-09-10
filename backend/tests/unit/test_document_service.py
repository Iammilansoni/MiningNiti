"""
Unit tests for the write-time sanitizers in document_service.py.

Regression coverage for a real production bug: an LLM agent's JSON output
does not always match the schema it was asked for (a hazard returned as a
plain string instead of the requested object, an entity list containing a
non-string item). Writing that straight through to the JSON columns used to
succeed silently — the document was marked COMPLETED — and only broke on the
next *read*, where DocumentResponse/DocumentAnalysisResult reject the
malformed shape and every endpoint touching that row (list, detail,
analysis, search) 500s from then on with no way to recover short of editing
the row directly. These sanitizers run at write time so a malformed item
degrades gracefully instead of corrupting the row.
"""

import pytest

from app.services.document_service import (
    _coerce_entities,
    _coerce_hazards,
    _coerce_str_list,
)

pytestmark = pytest.mark.unit


class TestCoerceHazards:
    def test_passes_through_well_formed_hazards(self):
        hazards = [{"type": "fire", "severity": "high", "description": "..."}]
        assert _coerce_hazards(hazards) == hazards

    def test_wraps_a_bare_string_hazard_instead_of_corrupting_the_row(self):
        # This is the exact shape that broke the /documents list endpoint:
        # the safety agent returned a plain string where a dict was expected.
        result = _coerce_hazards(["Methane accumulation risk"])
        assert result == [{"description": "Methane accumulation risk"}]

    def test_drops_none_items(self):
        assert _coerce_hazards([{"type": "fire"}, None]) == [{"type": "fire"}]

    def test_non_list_input_becomes_empty_list(self):
        assert _coerce_hazards({"not": "a list"}) == []
        assert _coerce_hazards(None) == []

    def test_mixed_shapes_are_all_normalized(self):
        result = _coerce_hazards([{"type": "fire"}, "loose ground", 42])
        assert result == [
            {"type": "fire"},
            {"description": "loose ground"},
            {"description": "42"},
        ]


class TestCoerceStrList:
    def test_passes_through_strings(self):
        assert _coerce_str_list(["a", "b"]) == ["a", "b"]

    def test_stringifies_non_string_items(self):
        assert _coerce_str_list([{"note": "x"}, 1]) == ["{'note': 'x'}", "1"]

    def test_non_list_input_becomes_empty_list(self):
        assert _coerce_str_list("not a list") == []
        assert _coerce_str_list(None) == []

    def test_drops_none_items(self):
        assert _coerce_str_list(["a", None, "b"]) == ["a", "b"]


class TestCoerceEntities:
    def test_passes_through_well_formed_entities(self):
        entities = {"equipment": ["conveyor"], "regulations": ["30 CFR 75.323"]}
        assert _coerce_entities(entities) == entities

    def test_non_string_item_in_a_value_list_is_stringified_not_dropped(self):
        # e.g. the entity extractor returns a regulation as a structured
        # object instead of a citation string.
        result = _coerce_entities({"regulations": [{"citation": "75.323"}]})
        assert result == {"regulations": ["{'citation': '75.323'}"]}

    def test_non_list_value_becomes_empty_list_not_a_type_error(self):
        result = _coerce_entities({"equipment": "conveyor"})
        assert result == {"equipment": []}

    def test_non_dict_input_becomes_empty_dict(self):
        assert _coerce_entities(["not", "a", "dict"]) == {}
        assert _coerce_entities(None) == {}
