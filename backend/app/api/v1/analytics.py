"""
Analytics API Endpoints
Dashboard statistics and mining intelligence metrics
"""

import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.models.document import (
    ComplianceStatus,
    Document,
    DocumentCategory,
    DocumentStatus,
)
from app.schemas.analytics import (
    CategoryCount,
    DashboardStats,
    DocumentAnalytics,
    SafetyAnalytics,
    SafetyDistribution,
    StatusCount,
)

logger = logging.getLogger(__name__)

router = APIRouter()


import json

import redis

from app.config import settings

# Optional Redis client
try:
    redis_client = redis.Redis.from_url(
        settings.REDIS_URL, decode_responses=True, socket_timeout=1
    )
except Exception:
    redis_client = None


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for the current user.
    Provides overview of documents, chats, and safety metrics.
    """
    cache_key = f"dashboard_stats:{user_id}"

    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                return DashboardStats.model_validate_json(cached_data)
        except Exception as e:
            logger.warning(f"Redis cache read error: {e}")

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    # Document counts
    doc_query = db.query(Document).filter(Document.user_id == user_id)

    total_documents = doc_query.count()
    processed_documents = doc_query.filter(
        Document.status == DocumentStatus.COMPLETED
    ).count()
    pending_documents = doc_query.filter(
        Document.status.in_(
            [
                DocumentStatus.PENDING,
                DocumentStatus.PROCESSING,
                DocumentStatus.ANALYZING,
            ]
        )
    ).count()
    failed_documents = doc_query.filter(
        Document.status == DocumentStatus.FAILED
    ).count()

    # Today and week counts
    docs_today = doc_query.filter(Document.created_at >= today_start).count()
    docs_week = doc_query.filter(Document.created_at >= week_start).count()

    # Chat counts
    total_sessions = (
        db.query(ChatSession).filter(ChatSession.user_id == user_id).count()
    )
    total_messages = (
        db.query(ChatMessage)
        .join(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .count()
    )

    # Safety metrics
    safety_stats = (
        db.query(
            func.avg(Document.safety_score).label("avg_score"),
            func.count(case((Document.hazards_detected.isnot(None), 1))).label(
                "with_hazards"
            ),
            func.count(
                case((Document.compliance_status == ComplianceStatus.VIOLATION, 1))
            ).label("violations"),
            func.count(
                case((Document.compliance_status == ComplianceStatus.WARNING, 1))
            ).label("warnings"),
        )
        .filter(
            Document.user_id == user_id, Document.status == DocumentStatus.COMPLETED
        )
        .first()
    )

    # Category breakdown
    category_counts = (
        db.query(Document.category, func.count(Document.id).label("count"))
        .filter(Document.user_id == user_id, Document.category.isnot(None))
        .group_by(Document.category)
        .all()
    )

    total_categorized = sum(c.count for c in category_counts)
    categories = [
        CategoryCount(
            category=cat.value if cat else "other",
            count=count,
            percentage=(
                round(count / total_categorized * 100, 1)
                if total_categorized > 0
                else 0
            ),
        )
        for cat, count in category_counts
    ]

    # Last activity
    last_doc = doc_query.order_by(Document.created_at.desc()).first()
    last_chat = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(ChatSession.updated_at.desc())
        .first()
    )

    stats = DashboardStats(
        total_documents=total_documents,
        processed_documents=processed_documents,
        pending_documents=pending_documents,
        failed_documents=failed_documents,
        total_chat_sessions=total_sessions,
        total_messages=total_messages,
        average_safety_score=(
            round(safety_stats.avg_score, 1)
            if safety_stats and safety_stats.avg_score
            else None
        ),
        documents_with_hazards=safety_stats.with_hazards if safety_stats else 0,
        compliance_violations=safety_stats.violations if safety_stats else 0,
        compliance_warnings=safety_stats.warnings if safety_stats else 0,
        documents_processed_today=docs_today,
        documents_processed_this_week=docs_week,
        documents_by_category=categories,
        last_upload_at=last_doc.created_at if last_doc else None,
        last_chat_at=last_chat.updated_at if last_chat else None,
    )

    if redis_client:
        try:
            # Cache for 60 seconds
            redis_client.setex(cache_key, 60, stats.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis cache write error: {e}")

    return stats


@router.get("/documents", response_model=DocumentAnalytics)
async def get_document_analytics(
    days: int = Query(30, ge=1, le=365),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get detailed document analytics over time.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    # Uploads by day
    uploads = (
        db.query(
            func.date(Document.created_at).label("date"),
            func.count(Document.id).label("count"),
        )
        .filter(Document.user_id == user_id, Document.created_at >= start_date)
        .group_by(func.date(Document.created_at))
        .order_by("date")
        .all()
    )

    uploads_by_day = [{"date": str(d), "count": c} for d, c in uploads]

    # Category distribution
    categories = (
        db.query(Document.category, func.count(Document.id).label("count"))
        .filter(Document.user_id == user_id, Document.category.isnot(None))
        .group_by(Document.category)
        .all()
    )

    total = sum(c for _, c in categories)
    by_category = [
        CategoryCount(
            category=cat.value if cat else "other",
            count=count,
            percentage=round(count / total * 100, 1) if total > 0 else 0,
        )
        for cat, count in categories
    ]

    # Status distribution
    statuses = (
        db.query(Document.status, func.count(Document.id).label("count"))
        .filter(Document.user_id == user_id)
        .group_by(Document.status)
        .all()
    )

    by_status = [
        StatusCount(status=s.value if s else "unknown", count=c) for s, c in statuses
    ]

    # File type distribution
    file_types = (
        db.query(Document.file_type, func.count(Document.id).label("count"))
        .filter(Document.user_id == user_id)
        .group_by(Document.file_type)
        .all()
    )

    by_file_type = [{"type": ft, "count": c} for ft, c in file_types]

    return DocumentAnalytics(
        uploads_by_day=uploads_by_day,
        by_category=by_category,
        by_status=by_status,
        by_file_type=by_file_type,
    )


@router.get("/safety", response_model=SafetyAnalytics)
async def get_safety_analytics(
    user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    """
    Get safety compliance analytics.
    """
    # Base query for completed documents with safety scores
    base = db.query(Document).filter(
        Document.user_id == user_id,
        Document.status == DocumentStatus.COMPLETED,
        Document.safety_score.isnot(None),
    )

    # Score statistics
    stats = (
        db.query(
            func.avg(Document.safety_score).label("avg"),
            func.min(Document.safety_score).label("min"),
            func.max(Document.safety_score).label("max"),
        )
        .filter(Document.user_id == user_id, Document.safety_score.isnot(None))
        .first()
    )

    # Score distribution
    ranges = [
        ("0-25", 0, 25),
        ("26-50", 26, 50),
        ("51-75", 51, 75),
        ("76-100", 76, 100),
    ]

    total_with_scores = base.count()
    distribution = []

    for label, low, high in ranges:
        count = base.filter(
            Document.safety_score >= low, Document.safety_score <= high
        ).count()
        distribution.append(
            SafetyDistribution(
                range=label,
                count=count,
                percentage=(
                    round(count / total_with_scores * 100, 1)
                    if total_with_scores > 0
                    else 0
                ),
            )
        )

    # Compliance counts
    compliant = (
        db.query(Document)
        .filter(
            Document.user_id == user_id,
            Document.compliance_status == ComplianceStatus.COMPLIANT,
        )
        .count()
    )

    warnings = (
        db.query(Document)
        .filter(
            Document.user_id == user_id,
            Document.compliance_status == ComplianceStatus.WARNING,
        )
        .count()
    )

    violations = (
        db.query(Document)
        .filter(
            Document.user_id == user_id,
            Document.compliance_status == ComplianceStatus.VIOLATION,
        )
        .count()
    )

    return SafetyAnalytics(
        average_safety_score=round(stats.avg, 1) if stats.avg else 0,
        min_safety_score=stats.min,
        max_safety_score=stats.max,
        score_distribution=distribution,
        compliant_count=compliant,
        warning_count=warnings,
        violation_count=violations,
    )


@router.get("/violations")
async def get_recent_violations(
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get recent violations and warnings from analyzed documents.
    Returns documents with detected hazards, ordered by severity and recency.
    """
    # Get documents with violations or warnings that have hazards
    docs = (
        db.query(Document)
        .filter(
            Document.user_id == user_id,
            Document.status == DocumentStatus.COMPLETED,
            Document.compliance_status.in_(
                [ComplianceStatus.VIOLATION, ComplianceStatus.WARNING]
            ),
            Document.hazards_detected.isnot(None),
        )
        .order_by(Document.created_at.desc())
        .limit(limit)
        .all()
    )

    violations = []
    for doc in docs:
        hazards = doc.hazards_detected or []
        if isinstance(hazards, list):
            for h in hazards[:3]:  # Max 3 hazards per doc
                if isinstance(h, dict):
                    violations.append(
                        {
                            "document_id": str(doc.id),
                            "document_title": doc.title,
                            "file_name": doc.file_name,
                            "hazard_type": h.get("type", "Unknown Hazard"),
                            "severity": h.get("severity", "medium"),
                            "description": h.get("description", ""),
                            "regulation": h.get("regulation", ""),
                            "detected_at": (
                                doc.processed_at.isoformat()
                                if doc.processed_at
                                else doc.created_at.isoformat()
                            ),
                            "compliance_status": (
                                doc.compliance_status.value
                                if doc.compliance_status
                                else "warning"
                            ),
                        }
                    )

    return {
        "violations": violations,
        "total": len(violations),
    }
