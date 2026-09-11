"""
Regulation clause relevance filter.

Indian gazette-style regulations front-load long "Definitions" chapters and
carry administrative boilerplate (gazette mastheads, tables of contents) that
make up a large fraction of any full regulation document once it is chunked
into embeddings. None of that is something an operational document could
ever "comply with" — a definitions clause has no operational requirement to
satisfy — so scoring it as "missing" against every operational document
manufactures a near-zero compliance score regardless of how well the
operational document actually addresses the regulation's substantive
requirements.

Two real audits hit this: Coal Mines Regulation 2017 (121 pages) scored
1.8% (1/56 compliant), and Explosives Rules 2008 (163 pages) scored 0%
(0/50) against the same operational document — both dominated by clauses
whose "evidence" was that the operational SOP didn't restate legal
definitions for terms like "detonating fuse" or "ANFO". The LLM's reasoning
on those clauses was correct; the clauses themselves were the wrong thing to
score compliance against.

This filter runs before the (expensive) evidence search + LLM assessment
call, so clauses that are pure definitions/administrative boilerplate
short-circuit to "not_applicable" instead of being scored compliant/gap/
missing. It is a heuristic, not a classifier: it only excludes a clause on a
strong, specific structural signal, and is deliberately biased toward
sending a clause to the LLM when uncertain — the cost of a false negative
(an irrelevant clause gets scored, adding noise) is much lower than a false
positive (a real requirement gets silently excluded from the audit).

This does NOT attempt topical relevance filtering (e.g. "this clause is
about examination-board certification, unrelated to a ventilation plan").
That is a legitimate gap — an operational document not covering an
in-scope-but-unrelated clause is still correctly "missing" — but is a
much harder problem than structural exclusion and is out of scope here.
"""

import re
from typing import Final

# "X" means Y; pattern common to Indian regulation Definitions chapters —
# e.g. '"detonating fuse" means a cord containing...'
_DEFINITION_ENTRY: Final = re.compile(r'["“][^"”]{2,80}["”]\s+means\b', re.IGNORECASE)

# A clause opening with "Definitions" as its heading.
_DEFINITIONS_HEADING: Final = re.compile(r"^\s*definitions[.\-—\s]", re.IGNORECASE)

# Gazette masthead / publication boilerplate that precedes the actual text
# of Indian government notifications (registration numbers, "EXTRAORDINARY",
# ministry letterhead, Part/Section headers).
_GAZETTE_BOILERPLATE: Final = re.compile(
    r"(REGISTERED\s+NO\.?|REGD\.?\s*NO\.?|GAZETTE OF INDIA|PUBLISHED BY AUTHORITY|"
    r"EXTRAORDINARY|MINISTRY OF [A-Z ]+|PART\s+II[—\-–]SEC(TION)?)",
    re.IGNORECASE,
)

# "ARRANGEMENT OF SECTIONS" tables of contents — a long run of short,
# numbered section-title fragments with no substantive prescriptive text.
_TOC_HEADING: Final = re.compile(r"ARRANGEMENT OF SECTIONS", re.IGNORECASE)

# Thresholds calibrated against the two audits above: a single incidental
# "X means Y" or one masthead phrase inside an otherwise-substantive clause
# should not exclude it, but a clause built almost entirely out of them
# should.
_MIN_DEFINITION_ENTRIES_TO_EXCLUDE: Final = 3
_MIN_BOILERPLATE_HITS_TO_EXCLUDE: Final = 2


def is_substantive_clause(text: str) -> bool:
    """
    False for clauses that are pure definitions/glossary content, gazette
    masthead boilerplate, or a table of contents — none of which represent
    an operational requirement any operational document could "comply
    with". True (send to the LLM for assessment) for everything else.
    """
    if not text or not text.strip():
        return False

    stripped = text.strip()

    if _TOC_HEADING.search(stripped):
        return False

    if _DEFINITIONS_HEADING.match(stripped):
        return False

    if len(_DEFINITION_ENTRY.findall(stripped)) >= _MIN_DEFINITION_ENTRIES_TO_EXCLUDE:
        return False

    if len(_GAZETTE_BOILERPLATE.findall(stripped)) >= _MIN_BOILERPLATE_HITS_TO_EXCLUDE:
        return False

    return True
