"""
Golden set for retrieval evaluation.

A small labelled mining corpus plus queries whose correct answers are known.
Queries are tagged by the retrieval arm they are designed to stress:

  lexical  — exact identifiers, part numbers, regulation citations. Dense
             embeddings are weak here: "30 CFR 75.323" and "30 CFR 75.400"
             embed almost identically, so only the inverted index separates
             them.
  semantic — paraphrases that share no vocabulary with the source text. The
             lexical arm cannot match these at all.
  mixed    — realistic questions needing both.

The tags are what make the suite diagnostic rather than just a number: if the
lexical arm silently stops returning rows (which is exactly what happened with
the old pg_trgm matcher), the `lexical` queries collapse while `semantic`
queries stay healthy, and the failure names itself.

Chunk ids are stable strings so expectations stay readable.
"""

from dataclasses import dataclass, field
from typing import Dict, List


@dataclass(frozen=True)
class Chunk:
    id: str
    document: str
    page: int
    text: str


@dataclass(frozen=True)
class Query:
    question: str
    relevant: List[str]
    kind: str  # "lexical" | "semantic" | "mixed"
    note: str = ""


CORPUS: List[Chunk] = [
    Chunk(
        "ventilation-methane-limits",
        "msha_part75.pdf",
        12,
        "Methane monitoring is required under 30 CFR 75.323. When methane "
        "reaches 1.0 percent in a return air split, changes or adjustments "
        "shall be made to the ventilation system to reduce the concentration "
        "of methane to less than 1.0 percent. Where methane reaches 1.5 "
        "percent, all persons except those necessary to make corrections "
        "shall be withdrawn from the affected area.",
    ),
    Chunk(
        "ventilation-accumulation",
        "msha_part75.pdf",
        14,
        "Under 30 CFR 75.400, coal dust, including float coal dust deposited "
        "on rock-dusted surfaces, loose coal, and other combustible materials "
        "shall be cleaned up and not be permitted to accumulate in active "
        "workings or on diesel-powered equipment.",
    ),
    Chunk(
        "escapeway-scsr",
        "emergency_procedures.pdf",
        3,
        "Self-contained self-rescuer devices shall be provided to each person "
        "underground. Each SCSR must supply at least one hour of breathable "
        "oxygen. Storage caches shall be located along designated escapeways "
        "at intervals not exceeding 30 minutes of normal travel time.",
    ),
    Chunk(
        "escapeway-drills",
        "emergency_procedures.pdf",
        7,
        "Every miner shall participate in an evacuation drill once each "
        "quarter. Drills must cover donning of rescue devices, use of "
        "lifelines in smoke conditions, and assembly at the designated "
        "refuge alternative.",
    ),
    Chunk(
        "equipment-d11-maintenance",
        "cat_d11_manual.pdf",
        88,
        "The Caterpillar D11 track-type tractor requires scheduled "
        "maintenance every 500 service hours. Inspect the final drive oil "
        "level, track shoe bolt torque, and hydraulic cylinder rod seals. "
        "Torque all track bolts to 1200 newton meters.",
    ),
    Chunk(
        "equipment-d11-filters",
        "cat_d11_manual.pdf",
        91,
        "Replace the engine air filter primary element when the restriction "
        "indicator shows red. The secondary element should be replaced every "
        "third primary element change and must never be cleaned and reused.",
    ),
    Chunk(
        "roof-control-bolting",
        "roof_control_plan.pdf",
        5,
        "Roof bolting patterns shall not exceed 5 feet centers in the "
        "intersection. Additional support is required where the immediate "
        "roof shows signs of separation, sloughing, or where a horseback is "
        "encountered during mining.",
    ),
    Chunk(
        "roof-control-examination",
        "roof_control_plan.pdf",
        9,
        "A certified person shall examine the roof, face, and ribs "
        "immediately before any work is begun and as conditions warrant "
        "during the shift. Loose material shall be taken down or supported "
        "before other work proceeds.",
    ),
    Chunk(
        "electrical-grounding",
        "electrical_standards.pdf",
        22,
        "All metallic sheaths, armors, and conduits enclosing power "
        "conductors shall be electrically continuous throughout and shall be "
        "grounded to a low resistance ground field. Resistance shall not "
        "exceed 4 ohms measured at the grounding medium.",
    ),
    Chunk(
        "training-new-miner",
        "training_program.pdf",
        2,
        "New underground miners shall receive no less than 40 hours of "
        "training before beginning work. Instruction must include statutory "
        "rights, self-rescue and emergency procedures, health and safety "
        "aspects of the tasks assigned, and the mine ventilation plan.",
    ),
]


QUERIES: List[Query] = [
    # ── Lexical: exact citations and part identifiers ─────────────────────────
    Query(
        "30 CFR 75.323 methane return air split",
        ["ventilation-methane-limits"],
        "lexical",
        "Nearly identical embedding to 75.400 — only the inverted index "
        "distinguishes the citation.",
    ),
    Query(
        "30 CFR 75.400 float coal dust accumulation",
        ["ventilation-accumulation"],
        "lexical",
    ),
    Query(
        "Caterpillar D11 track bolt torque specification",
        ["equipment-d11-maintenance"],
        "lexical",
    ),
    Query(
        "SCSR oxygen duration requirement",
        ["escapeway-scsr"],
        "lexical",
        "Acronym-heavy; embeddings often miss SCSR entirely.",
    ),
    # ── Semantic: paraphrases with little lexical overlap ─────────────────────
    Query(
        "At what gas concentration must workers leave the area?",
        ["ventilation-methane-limits"],
        "semantic",
        "Says nothing about 'methane' or 'withdrawn' explicitly.",
    ),
    Query(
        "How often do miners practise getting out in an emergency?",
        ["escapeway-drills"],
        "semantic",
    ),
    Query(
        "What stops the ceiling from falling in?",
        ["roof-control-bolting", "roof-control-examination"],
        "semantic",
    ),
    Query(
        "How much instruction does someone need before their first shift?",
        ["training-new-miner"],
        "semantic",
    ),
    # ── Mixed: realistic operator questions ───────────────────────────────────
    Query(
        "What are the methane limits and when must we evacuate?",
        ["ventilation-methane-limits"],
        "mixed",
    ),
    Query(
        "D11 air filter replacement and service interval",
        ["equipment-d11-filters", "equipment-d11-maintenance"],
        "mixed",
    ),
    Query(
        "grounding resistance limit for power conductors",
        ["electrical-grounding"],
        "mixed",
    ),
    Query(
        "roof examination requirements before starting work",
        ["roof-control-examination"],
        "mixed",
    ),
]


def _build_distractors() -> List[Chunk]:
    """
    Plausible but non-answering chunks, to make retrieval a real selection task.

    Without these the corpus is smaller than RERANK_OVER_FETCH, so the search
    returns *everything* and the reranker alone produces a perfect score — the
    metrics stay at 1.000 even with an entire retrieval arm dead. That was
    measured, not theorised: stubbing the lexical arm to return [] left
    hit_rate@5 at 1.000 on a 10-chunk corpus.

    Distractors deliberately reuse the vocabulary of the answers (ventilation,
    torque, roof, training, grounding) so they are genuinely confusable rather
    than trivially filtered.
    """
    themes = [
        (
            "ventilation_ops",
            "msha_part75.pdf",
            "Air quantity in the last open crosscut of each set of entries "
            "shall be at least {n} cubic feet per minute. Readings shall be "
            "taken at the section loading point and recorded weekly by a "
            "certified person in the mine ventilation record book.",
        ),
        (
            "belt_conveyor",
            "conveyor_standards.pdf",
            "Belt conveyor slippage switches shall be tested every {n} days. "
            "Sequence switches, belt alignment devices, and carbon monoxide "
            "sensors along the belt entry must be maintained in operating "
            "condition at all times during production shifts.",
        ),
        (
            "equipment_hydraulics",
            "cat_d11_manual.pdf",
            "Hydraulic system pressure shall be verified at {n} bar with the "
            "engine at high idle. Check the implement pump case drain flow "
            "and inspect all quick-disconnect fittings for weeping before "
            "placing the unit back into production.",
        ),
        (
            "roof_support_supplies",
            "roof_control_plan.pdf",
            "A supply of not less than {n} roof support materials shall be "
            "maintained within 200 feet of each working face. Materials "
            "include posts, headers, crossbars, and supplemental support "
            "suitable for the mining height encountered.",
        ),
        (
            "electrical_inspection",
            "electrical_standards.pdf",
            "Trailing cables shall be examined every {n} shifts for damage to "
            "the outer jacket. Temporary splices are prohibited except where "
            "made in a permanent manner and only for the duration of the "
            "shift in which the damage was discovered.",
        ),
        (
            "training_refresher",
            "training_program.pdf",
            "Annual refresher training of not less than {n} hours shall cover "
            "changes at the mine, transportation controls, communication "
            "systems, escape and emergency evacuation plans, and first aid "
            "for all experienced miners.",
        ),
        (
            "dust_sampling",
            "dust_control_plan.pdf",
            "Respirable dust sampling shall be conducted on {n} consecutive "
            "production shifts. Sampling devices must be worn by the "
            "designated occupation for the full shift and results reported "
            "within 24 hours of the last sample.",
        ),
        (
            "fire_protection",
            "fire_protection.pdf",
            "Portable fire extinguishers rated at least {n}-A shall be "
            "provided at each electrical installation, belt drive, and "
            "permanent pump station. Extinguishers must be inspected monthly "
            "and hydrostatically tested per the manufacturer schedule.",
        ),
        (
            "haulage_roads",
            "surface_haulage.pdf",
            "Berms or guardrails shall be provided on elevated roadways where "
            "a drop-off exceeds {n} feet. Berm height must equal at least "
            "mid-axle height of the largest vehicle using the roadway.",
        ),
        (
            "impoundment",
            "environmental_plan.pdf",
            "Refuse impoundment freeboard shall be maintained at a minimum of "
            "{n} feet. Weekly instrumentation readings of phreatic surface "
            "elevation must be recorded and reviewed by a registered "
            "professional engineer quarterly.",
        ),
    ]

    distractors: List[Chunk] = []
    for theme_name, document, template in themes:
        for i in range(12):
            distractors.append(
                Chunk(
                    id=f"distractor-{theme_name}-{i}",
                    document=document,
                    page=100 + i,
                    text=template.format(n=(i + 1) * 7),
                )
            )
    return distractors


DISTRACTORS: List[Chunk] = _build_distractors()

# What actually gets loaded: labelled answers plus enough noise that top-k is
# a genuine selection rather than "return the whole table".
FULL_CORPUS: List[Chunk] = CORPUS + DISTRACTORS


def queries_by_kind() -> Dict[str, List[Query]]:
    """Group the query set by which retrieval arm it stresses."""
    grouped: Dict[str, List[Query]] = {}
    for q in QUERIES:
        grouped.setdefault(q.kind, []).append(q)
    return grouped
