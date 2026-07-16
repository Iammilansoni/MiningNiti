"""
Document Schemas
Pydantic models for document API requests and responses
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class DocumentCategory(str, Enum):
    """Document category enum matching the model"""

    SAFETY_PROTOCOL = "safety_protocol"
    EQUIPMENT_MANUAL = "equipment_manual"
    REGULATORY = "regulatory"
    INCIDENT_REPORT = "incident_report"
    GEOLOGICAL = "geological"
    ENVIRONMENTAL = "environmental"
    TRAINING = "training"
    PERMIT = "permit"
    MAINTENANCE = "maintenance"
    OTHER = "other"


class DocumentStatus(str, Enum):
    """Document processing status"""

    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class ComplianceStatus(str, Enum):
    """Safety compliance status"""

    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    PENDING = "pending"
    NOT_APPLICABLE = "not_applicable"


class DocumentCreate(BaseModel):
    """Request model for creating a document from UploadThing"""

    file_url: str = Field(..., description="UploadThing file URL")
    file_name: str = Field(..., description="Original file name")
    file_size: int = Field(..., gt=0, description="File size in bytes")
    file_type: str = Field(..., description="MIME type")
    title: Optional[str] = Field(None, description="Custom document title")
    tags: Optional[List[str]] = Field(default=[], description="User-defined tags")


class DocumentUploadResponse(BaseModel):
    """Response after document upload - before processing"""

    id: str
    title: str
    file_name: str
    status: DocumentStatus = DocumentStatus.PENDING
    job_id: Optional[str] = Field(None, description="Background processing job ID")
    message: str = "Document uploaded successfully. Processing started."


class DocumentAnalysisResult(BaseModel):
    """AI analysis results for a document"""

    # Classification
    category: DocumentCategory
    subcategory: Optional[str] = None
    classification_confidence: float = Field(..., ge=0, le=1)

    # Summary
    summary: str
    key_points: List[str] = []

    # Safety Analysis
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    compliance_status: ComplianceStatus = ComplianceStatus.PENDING
    hazards_detected: List[Dict[str, Any]] = []
    safety_recommendations: List[str] = []
    reasoning: Optional[Dict[str, Any]] = None

    # Entities
    entities: Dict[str, List[str]] = Field(
        default_factory=lambda: {
            "equipment": [],
            "chemicals": [],
            "locations": [],
            "personnel": [],
            "dates": [],
            "regulations": [],
        }
    )


class DocumentResponse(BaseModel):
    """Full document response with all fields"""

    id: str
    title: str
    file_name: str
    file_size: int
    file_type: str
    file_url: str
    status: DocumentStatus

    # Processing info
    processing_error: Optional[str] = None
    processed_at: Optional[datetime] = None

    # Content info
    page_count: Optional[int] = None
    word_count: Optional[int] = None

    # AI Classification
    category: Optional[DocumentCategory] = None
    subcategory: Optional[str] = None
    classification_confidence: Optional[float] = None

    # AI Summary
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None

    # Safety Analysis
    safety_score: Optional[float] = None
    compliance_status: Optional[ComplianceStatus] = None
    hazards_detected: Optional[List[Dict[str, Any]]] = None
    safety_recommendations: Optional[List[str]] = None

    # Entities
    entities: Optional[Dict[str, List[str]]] = None

    # Metadata
    tags: List[str] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    """Paginated list of documents"""

    documents: List[DocumentResponse]
    total: int
    page: int = 1
    page_size: int = 20

    # Aggregated stats
    stats: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "by_category": {},
            "by_status": {},
            "avg_safety_score": None,
        }
    )


class DocumentAnalysisResponse(BaseModel):
    """Response for document analysis endpoint"""

    document_id: str
    status: str
    analysis: Optional[DocumentAnalysisResult] = None
    processing_time_ms: Optional[int] = None
