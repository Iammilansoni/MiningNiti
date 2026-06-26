"""
Custom Prompts API Endpoints
CRUD operations for user-defined AI prompts
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_id
from app.core.exceptions import NotFoundError
from app.db.session import get_db
from app.models.prompt import CustomPrompt
from app.schemas.prompt import (
    PromptCreate,
    PromptListResponse,
    PromptResponse,
    PromptUpdate,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[PromptResponse])
async def list_prompts(
    category: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    List all custom prompts for the current user.
    """
    query = db.query(CustomPrompt).filter(CustomPrompt.user_id == user_id)

    if category:
        query = query.filter(CustomPrompt.category == category)

    prompts = query.order_by(CustomPrompt.created_at.desc()).all()

    return [
        PromptResponse(
            id=str(p.id),
            name=p.name,
            prompt=p.prompt_text,
            description=p.description,
            category=p.category,
            is_default=p.is_default,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in prompts
    ]


@router.post("", response_model=PromptResponse, status_code=201)
async def create_prompt(
    request: PromptCreate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new custom prompt.
    """
    prompt = CustomPrompt(
        user_id=user.clerk_user_id,
        name=request.name,
        prompt_text=request.prompt,
        description=request.description,
        category=request.category,
        is_default=False,
    )

    db.add(prompt)
    db.commit()
    db.refresh(prompt)

    logger.info(f"Prompt created: {prompt.id} by user {user.clerk_user_id[:12]}")

    return PromptResponse(
        id=str(prompt.id),
        name=prompt.name,
        prompt=prompt.prompt_text,
        description=prompt.description,
        category=prompt.category,
        is_default=prompt.is_default,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get a specific prompt by ID.
    """
    prompt = (
        db.query(CustomPrompt)
        .filter(
            CustomPrompt.id == prompt_id,
            CustomPrompt.user_id == user_id,
        )
        .first()
    )

    if not prompt:
        raise NotFoundError("Prompt", prompt_id)

    return PromptResponse(
        id=str(prompt.id),
        name=prompt.name,
        prompt=prompt.prompt_text,
        description=prompt.description,
        category=prompt.category,
        is_default=prompt.is_default,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    request: PromptUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Update a custom prompt.
    """
    prompt = (
        db.query(CustomPrompt)
        .filter(
            CustomPrompt.id == prompt_id,
            CustomPrompt.user_id == user_id,
        )
        .first()
    )

    if not prompt:
        raise NotFoundError("Prompt", prompt_id)

    if request.name is not None:
        prompt.name = request.name
    if request.prompt is not None:
        prompt.prompt_text = request.prompt
    if request.description is not None:
        prompt.description = request.description
    if request.category is not None:
        prompt.category = request.category

    db.commit()
    db.refresh(prompt)

    return PromptResponse(
        id=str(prompt.id),
        name=prompt.name,
        prompt=prompt.prompt_text,
        description=prompt.description,
        category=prompt.category,
        is_default=prompt.is_default,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
    )


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Delete a custom prompt.
    """
    prompt = (
        db.query(CustomPrompt)
        .filter(
            CustomPrompt.id == prompt_id,
            CustomPrompt.user_id == user_id,
        )
        .first()
    )

    if not prompt:
        raise NotFoundError("Prompt", prompt_id)

    db.delete(prompt)
    db.commit()

    logger.info(f"Prompt deleted: {prompt_id}")

    return {"success": True, "message": "Prompt deleted successfully"}
