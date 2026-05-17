"""
API Dependencies
Shared dependencies for FastAPI endpoints
"""

import hashlib
import logging
from typing import Optional
from fastapi import Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db, SessionLocal
from app.core.security import verify_jwt_token, extract_user_id, extract_user_email
from app.core.exceptions import AuthenticationError
from app.models.user import User
from app.models.audit import create_audit_log, AuditAction

logger = logging.getLogger(__name__)


def _anonymize_user_id(user_id: str) -> str:
    """Create a truncated hash of user_id for safe logging."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:12]

# Security scheme
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Dependency to extract and verify user ID from JWT.
    Returns Clerk user ID string.
    """
    token = credentials.credentials
    payload = await verify_jwt_token(token)
    return extract_user_id(payload)


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current user model from database.
    Creates user record if it doesn't exist (first login).
    """
    user = db.query(User).filter(User.clerk_user_id == user_id).first()
    
    if not user:
        # Auto-create user on first access
        user = User(
            clerk_user_id=user_id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Created new user: {_anonymize_user_id(user_id)}")
    
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Dependency for endpoints that work with or without auth.
    Returns User if authenticated, None otherwise.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = await verify_jwt_token(token)
        user_id = extract_user_id(payload)
        return db.query(User).filter(User.clerk_user_id == user_id).first()
    except Exception:
        return None


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    """Extract user agent from request"""
    return request.headers.get("User-Agent", "unknown")


async def audit_middleware(
    request: Request,
    user_id: str = Depends(get_current_user_id)
):
    """
    Middleware-like dependency to log API access.
    Add to endpoints that need audit logging.
    """
    # This is called after auth, so we have user_id
    # Actual logging happens in endpoint handlers
    return {
        "user_id": user_id,
        "ip_address": get_client_ip(request),
        "user_agent": get_user_agent(request)
    }
