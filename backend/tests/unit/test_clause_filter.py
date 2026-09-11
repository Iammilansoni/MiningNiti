"""
Unit tests for the regulation clause relevance filter.

Fixtures below are lifted verbatim from clauses that actually produced a
misleading "missing"/"gap" result in two real compliance audits — Coal Mines
Regulation 2017 (1.8% score) and Explosives Rules 2008 (0% score) — both
dominated by definitions/masthead clauses no operational document could ever
satisfy. See clause_filter.py's module docstring for the full story.
"""

import pytest

from app.services.clause_filter import is_substantive_clause

pytestmark = pytest.mark.unit


class TestExcludesDefinitionsClauses:
    def test_definitions_heading_is_excluded(self):
        # From the CMR 2017 audit — scored "missing" against every
        # operational document, because a definitions clause has nothing
        # for an operational document to "comply with".
        text = (
            "Definitions.- (1) In these regulations, unless the context "
            'otherwise requires, - (a) "abandoned mine" means...'
        )
        assert is_substantive_clause(text) is False

    def test_dense_glossary_entries_are_excluded_even_without_heading(self):
        # From the Explosives Rules 2008 audit — a chunk boundary landed
        # mid-glossary, so it has no "Definitions" heading of its own but
        # is still pure "X means Y" entries.
        text = (
            "initiating explosion included in the list of authorised "
            "explosives referred to in within the tube; or rule 6 and "
            "published by the Central Government from time (ii) fitted with "
            "wires or other device for that to time in the Official Gazette; "
            'purpose and sealed; (31) "magazine" means a building or '
            "structure (other explosives, the charge being so designed as "
            "than an explosives manufacturing building) intended for to "
            "produce an explosion that would storage of explosives, "
            "specially constructed in accordance or of a constructed and "
            "charged or other explosive design and approved by the Chief "
            "Controller; charge and includes and record relay connector; "
            '(32) "manufactured fireworks" means low hazard (19) "display '
            'fireworks" means a group of explosive contrivance containing '
            "explosive or combination authorised manufactured fireworks "
            "assembled at site, solely of different classes, namely, Class "
            "1 or Class 2 or Class 3 or for the purpose of display."
        )
        assert is_substantive_clause(text) is False

    def test_lone_definition_entry_closing_a_definitions_chapter_is_excluded(self):
        # From the follow-up CMR 2017 audit (3 operational documents
        # combined) — a chunk boundary landed on the very last entry of a
        # long alphabetically-enumerated definitions list, "(zzm)", plus
        # the standard closing catch-all sentence. Only one "X means Y"
        # match appears in this chunk — below the density threshold in
        # test_dense_glossary_entries_are_excluded_even_without_heading —
        # so this needs the catch-all sentence to be caught.
        text = (
            "obtaining coal; (zzm) “working place” means any place in "
            "a mine to which any person has lawful access. (2) Words and "
            "expressions used in these regulations and not defined herein "
            "but defined in the Act or the rules made thereunder shall "
            "have the meanings respectively assigned to them therein."
        )
        assert is_substantive_clause(text) is False

    def test_definitions_catchall_sentence_alone_is_excluded(self):
        text = (
            "Words and expressions used in this Act and not defined shall "
            "have the meaning assigned to them in the Mines Act, 1952."
        )
        assert is_substantive_clause(text) is False

    def test_one_incidental_means_clause_is_not_excluded(self):
        # A genuinely substantive clause that happens to define one term
        # inline should still be scored — only dense glossary blocks are
        # structurally excluded.
        text = (
            'Notice of dangerous occurrence.- (1) Where "fire" means an '
            "uncontrolled combustion event, the owner, agent or manager "
            "shall report it to the Regional Inspector within 24 hours "
            "and take immediate steps to extinguish it and safeguard "
            "persons in the affected area."
        )
        assert is_substantive_clause(text) is True


class TestExcludesGazetteBoilerplate:
    def test_gazette_masthead_is_excluded(self):
        # From the Explosives Rules 2008 audit — scored "missing" at 92%
        # confidence for a pure publication masthead.
        text = (
            "164 THE GAZETTE OF INDIA : EXTRAORDINARY [PART II—SEC. 3(i)] "
            "MINISTRY OF COMMERCE AND INDUSTRY (Department of Industrial "
            "Policy and Promotion) NOTIFICATION"
        )
        assert is_substantive_clause(text) is False

    def test_registration_number_masthead_is_excluded(self):
        text = (
            "REGISTERED NO. D. L.-33004/99 THE GAZETTE OF INDIA "
            "EXTRAORDINARY PART II—Section 3—Sub-section (i) PUBLISHED "
            "BY AUTHORITY"
        )
        assert is_substantive_clause(text) is False

    def test_single_incidental_mention_is_not_excluded(self):
        # A substantive clause mentioning "Ministry of Coal" once in
        # passing should not be excluded — boilerplate detection requires
        # multiple masthead-pattern hits.
        text = (
            "Every mine shall maintain a ventilation plan approved by the "
            "Regional Inspector and shall submit it to the Ministry of "
            "Coal annually for review, along with methane monitoring "
            "records for the preceding twelve months."
        )
        assert is_substantive_clause(text) is True


class TestExcludesTableOfContents:
    def test_arrangement_of_sections_is_excluded(self):
        text = (
            "THE EXPLOSIVES ACT, 1884 __________ ARRANGEMENT OF SECTIONS "
            "__________ SECTIONS 1. Short title. Local extent. 2. "
            "Commencement. 3. [Repealed.]. 4. Definitions."
        )
        assert is_substantive_clause(text) is False


class TestIncludesSubstantiveClauses:
    def test_methane_monitoring_clause_is_included(self):
        # A genuine, checkable operational requirement — exactly the kind
        # of clause the audit exists to assess.
        text = (
            "Methane monitoring is required under 30 CFR 75.323. When "
            "methane reaches 1.0 percent in a return air split, changes "
            "or adjustments shall be made to the ventilation system to "
            "reduce the concentration of methane to less than 1.0 percent."
        )
        assert is_substantive_clause(text) is True

    def test_blasting_procedure_clause_is_included(self):
        text = (
            "No person shall fire a shot unless all persons not directly "
            "engaged in the blasting operation have been withdrawn to a "
            "safe distance and a warning signal has been sounded."
        )
        assert is_substantive_clause(text) is True

    def test_licensing_procedure_clause_is_included(self):
        # Genuinely out of scope for a blasting SOP (examination-board
        # procedure), but not structurally excluded — the filter only
        # targets definitions/masthead/TOC, not topical relevance. This
        # should still reach the LLM and be scored "missing" honestly.
        text = (
            "Board of Mining Examination.- (1) For the purpose of these "
            "regulations, there shall be constituted a Board consisting "
            "of a Chairman and not less than four other members appointed "
            "by the Central Government."
        )
        assert is_substantive_clause(text) is True


class TestEdgeCases:
    def test_empty_string_is_excluded(self):
        assert is_substantive_clause("") is False

    def test_whitespace_only_is_excluded(self):
        assert is_substantive_clause("   \n\t  ") is False

    def test_none_like_falsy_is_excluded(self):
        assert is_substantive_clause(None) is False  # type: ignore[arg-type]
