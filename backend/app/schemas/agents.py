"""
Agent Output Schemas
Pydantic models ensuring structured, validated outputs from all AI agents.
Replaces manual dict extraction and imperative coercion logic with type-safe schemas.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.document import ComplianceStatus, DocumentCategory


class ClassifierOutput(BaseModel):
    """Structured output for ClassifierAgent."""

    model_config = ConfigDict(use_enum_values=True)

    category: DocumentCategory = DocumentCategory.OTHER
    subcategory: Optional[str] = None
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    reasoning: str = ""

    @field_validator("category", mode="before")
    @classmethod
    def _coerce_category(cls, v: Any) -> DocumentCategory:
        """Coerce raw string to DocumentCategory enum, defaulting to OTHER on unknown."""
        if not v:
            return DocumentCategory.OTHER
        clean = str(v).lower().strip()
        try:
            return DocumentCategory(clean)
        except ValueError:
            return DocumentCategory.OTHER

    @field_validator("confidence", mode="before")
    @classmethod
    def _coerce_confidence(cls, v: Any) -> float:
        """Ensure confidence is a valid float between 0.0 and 1.0."""
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.5


class HazardItem(BaseModel):
    """Individual hazard entry detected by SafetyAnalyzerAgent."""

    type: str = "general"
    severity: str = "medium"
    description: str = "Unspecified hazard"
    regulation: Optional[str] = None

    @field_validator("description", mode="before")
    @classmethod
    def _ensure_description(cls, v: Any) -> str:
        if v is None or not str(v).strip():
            return "Unspecified hazard"
        return str(v).strip()


class SafetyAnalyzerOutput(BaseModel):
    """Structured output for SafetyAnalyzerAgent."""

    model_config = ConfigDict(use_enum_values=True)

    score: Optional[float] = Field(default=50.0, ge=0.0, le=100.0)
    status: ComplianceStatus = ComplianceStatus.PENDING
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    hazards: List[HazardItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    compliance_details: Dict[str, Any] = Field(default_factory=dict)
    reasoning: Dict[str, Any] = Field(
        default_factory=lambda: {
            "score_explanation": "",
            "positive_factors": [],
            "negative_factors": [],
            "evidence": [],
        }
    )
    summary: str = ""
    error: Optional[str] = None

    @field_validator("hazards", mode="before")
    @classmethod
    def _coerce_hazards(cls, v: Any) -> List[Dict[str, Any]]:
        """Normalize raw LLM hazard list so strings, dicts, or None degrade cleanly."""
        if not isinstance(v, list):
            return []
        coerced = []
        for item in v:
            if isinstance(item, dict):
                coerced.append(item)
            elif item is not None and str(item).strip():
                coerced.append({"description": str(item).strip()})
        return coerced

    @field_validator("recommendations", mode="before")
    @classmethod
    def _coerce_recommendations(cls, v: Any) -> List[str]:
        if not isinstance(v, list):
            return []
        return [
            str(item).strip() for item in v if item is not None and str(item).strip()
        ]

    @field_validator("status", mode="before")
    @classmethod
    def _coerce_status(cls, v: Any) -> ComplianceStatus:
        if not v:
            return ComplianceStatus.PENDING
        clean = str(v).lower().strip()
        try:
            return ComplianceStatus(clean)
        except ValueError:
            return ComplianceStatus.PENDING

    @field_validator("score", mode="before")
    @classmethod
    def _coerce_score(cls, v: Any) -> Optional[float]:
        if v is None:
            return 50.0
        try:
            val = float(v)
            return max(0.0, min(100.0, val))
        except (ValueError, TypeError):
            return 50.0


class EntityExtractorOutput(BaseModel):
    """Structured output for EntityExtractorAgent."""

    equipment: List[str] = Field(default_factory=list)
    chemicals: List[str] = Field(default_factory=list)
    locations: List[str] = Field(default_factory=list)
    personnel: List[str] = Field(default_factory=list)
    dates: List[str] = Field(default_factory=list)
    regulations: List[str] = Field(default_factory=list)
    entity_count: int = 0
    status: Optional[str] = None
    error: Optional[str] = None

    @field_validator(
        "equipment",
        "chemicals",
        "locations",
        "personnel",
        "dates",
        "regulations",
        mode="before",
    )
    @classmethod
    def _deduplicate_and_clean(cls, v: Any) -> List[str]:
        """Deduplicate while preserving order and casting non-strings safely."""
        if not isinstance(v, list):
            return []
        seen = set()
        cleaned = []
        for item in v:
            if item is not None:
                s = str(item).strip()
                if s and s.lower() not in seen:
                    seen.add(s.lower())
                    cleaned.append(s)
        return cleaned

    def model_post_init(self, __context: Any) -> None:
        """Automatically calculate entity_count across all categories."""
        total = (
            len(self.equipment)
            + len(self.chemicals)
            + len(self.locations)
            + len(self.personnel)
            + len(self.dates)
            + len(self.regulations)
        )
        self.entity_count = total


class SummarizerOutput(BaseModel):
    """Structured output for SummarizerAgent."""

    summary: str = "Summary not available."
    key_points: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    document_purpose: str = ""
    confidence: float = Field(default=0.7, ge=0.0, le=1.0)
    word_count: int = 0
    status: Optional[str] = None
    error: Optional[str] = None

    @field_validator("key_points", "action_items", mode="before")
    @classmethod
    def _clean_str_list(cls, v: Any) -> List[str]:
        if not isinstance(v, list):
            return []
        return [
            str(item).strip() for item in v if item is not None and str(item).strip()
        ]

    def model_post_init(self, __context: Any) -> None:
        if self.summary:
            self.word_count = len(self.summary.split())
