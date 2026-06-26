"""
User Profile API Endpoints
User profile management endpoints
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_id
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()


class UserProfileResponse(BaseModel):
    """User profile response"""

    clerk_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    company_name: Optional[str] = None
    company_role: Optional[str] = None
    industry_focus: Optional[List[str]] = None
    mine_sites: Optional[List[str]] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """User profile update request"""

    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_role: Optional[str] = None
    industry_focus: Optional[List[str]] = None
    mine_sites: Optional[List[str]] = None


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    user: User = Depends(get_current_user),
):
    """
    Get the current user's profile.
    Creates the user record on first access if it doesn't exist.
    """
    return UserProfileResponse(
        clerk_user_id=user.clerk_user_id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        company_name=user.company_name,
        company_role=user.company_role,
        industry_focus=user.industry_focus,
        mine_sites=user.mine_sites,
        is_active=user.is_active,
    )


@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    request: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the current user's profile.
    """
    if request.full_name is not None:
        user.full_name = request.full_name
    if request.company_name is not None:
        user.company_name = request.company_name
    if request.company_role is not None:
        user.company_role = request.company_role
    if request.industry_focus is not None:
        user.industry_focus = request.industry_focus
    if request.mine_sites is not None:
        user.mine_sites = request.mine_sites

    db.commit()
    db.refresh(user)

    logger.info(f"User profile updated: {user.clerk_user_id[:12]}")

    return UserProfileResponse(
        clerk_user_id=user.clerk_user_id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        company_name=user.company_name,
        company_role=user.company_role,
        industry_focus=user.industry_focus,
        mine_sites=user.mine_sites,
        is_active=user.is_active,
    )
