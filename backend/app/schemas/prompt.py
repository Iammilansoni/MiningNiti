"""
Prompt Schemas
Pydantic models for custom prompt API requests and responses
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class PromptCreate(BaseModel):
    """Request model for creating a custom prompt"""
    name: str = Field(..., min_length=1, max_length=255, description="Prompt name")
    prompt: str = Field(..., min_length=1, description="The prompt text")
    description: Optional[str] = Field(None, description="Optional description")
    category: Optional[str] = Field(None, description="Category for grouping (e.g. safety, compliance)")


class PromptUpdate(BaseModel):
    """Request model for updating a custom prompt"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    prompt: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    category: Optional[str] = None


class PromptResponse(BaseModel):
    """Response model for a custom prompt"""
    id: str
    name: str
    prompt: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_default: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromptListResponse(BaseModel):
    """Response model for listing prompts"""
    prompts: List[PromptResponse]
    total: int
