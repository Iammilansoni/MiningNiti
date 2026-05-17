"""
Analytics Schemas
Pydantic models for dashboard and analytics endpoints
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field


class CategoryCount(BaseModel):
    """Count by document category"""
    category: str
    count: int
    percentage: float


class StatusCount(BaseModel):
    """Count by document status"""
    status: str
    count: int


class SafetyDistribution(BaseModel):
    """Safety score distribution"""
    range: str  # "0-25", "26-50", "51-75", "76-100"
    count: int
    percentage: float


class DashboardStats(BaseModel):
    """Main dashboard statistics"""
    # Document stats
    total_documents: int = 0
    processed_documents: int = 0
    pending_documents: int = 0
    failed_documents: int = 0
    
    # Chat stats
    total_chat_sessions: int = 0
    total_messages: int = 0
    
    # Safety stats
    average_safety_score: Optional[float] = None
    documents_with_hazards: int = 0
    compliance_violations: int = 0
    compliance_warnings: int = 0
    
    # Processing stats
    documents_processed_today: int = 0
    documents_processed_this_week: int = 0
    
    # Category breakdown
    documents_by_category: List[CategoryCount] = []
    
    # Recent activity
    last_upload_at: Optional[datetime] = None
    last_chat_at: Optional[datetime] = None


class DocumentAnalytics(BaseModel):
    """Detailed document analytics"""
    # Time series
    uploads_by_day: List[Dict[str, Any]] = []  # [{"date": "2024-01-15", "count": 5}]
    processing_times: List[Dict[str, Any]] = []  # [{"date": "...", "avg_time_ms": 1500}]
    
    # Category distribution
    by_category: List[CategoryCount] = []
    
    # Status distribution
    by_status: List[StatusCount] = []
    
    # File type distribution
    by_file_type: List[Dict[str, Any]] = []
    
    # Top documents by views
    top_documents: List[Dict[str, Any]] = []


class SafetyAnalytics(BaseModel):
    """Safety compliance analytics"""
    # Overall scores
    average_safety_score: float = 0
    median_safety_score: Optional[float] = None
    min_safety_score: Optional[float] = None
    max_safety_score: Optional[float] = None
    
    # Distribution
    score_distribution: List[SafetyDistribution] = []
    
    # Compliance
    compliant_count: int = 0
    warning_count: int = 0
    violation_count: int = 0
    
    # Hazards
    total_hazards_detected: int = 0
    hazards_by_type: List[Dict[str, Any]] = []  # [{"type": "fall hazard", "count": 10}]
    
    # Trend
    safety_trend: List[Dict[str, Any]] = []  # [{"date": "...", "avg_score": 75}]
    
    # Top issues
    top_safety_concerns: List[Dict[str, Any]] = []


class EntityAnalytics(BaseModel):
    """Named entity analytics"""
    # Equipment mentioned
    top_equipment: List[Dict[str, Any]] = []  # [{"name": "Caterpillar D11", "mentions": 25}]
    
    # Locations
    top_locations: List[Dict[str, Any]] = []
    
    # Chemicals
    chemicals_mentioned: List[Dict[str, Any]] = []
    
    # Regulations referenced
    regulations_cited: List[Dict[str, Any]] = []


class AnalyticsSummary(BaseModel):
    """Combined analytics summary"""
    documents: DocumentAnalytics
    safety: SafetyAnalytics
    entities: EntityAnalytics
    generated_at: datetime = Field(default_factory=datetime.utcnow)
