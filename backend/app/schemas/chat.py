"""
Chat Schemas
Pydantic models for chat API requests and responses
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ChatSource(BaseModel):
    """Source citation for RAG response — includes page numbers for verifiable context."""
    document_id: str
    document_title: str
    file_name: str                          # e.g. "Mining_site.pdf"
    chunk_text: str = Field(..., max_length=500)
    relevance_score: float = Field(..., ge=0, le=1)
    page_numbers: List[int] = Field(default_factory=list)  # e.g. [12, 13]
    section_title: Optional[str] = None    # e.g. "Safety Procedures"


class ChatRequest(BaseModel):
    """Request to send a chat message"""
    content: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = Field(None, description="Existing session ID or None for new session")
    document_ids: Optional[List[str]] = Field(None, description="Specific documents to search")
    include_sources: bool = Field(default=True, description="Include source citations")


class ChatMessageResponse(BaseModel):
    """Single chat message response"""
    id: str
    role: str  # "user" or "assistant"
    content: str
    sources: List[ChatSource] = []
    created_at: datetime
    
    # AI metadata (for assistant messages)
    model_used: Optional[str] = None
    response_time_ms: Optional[int] = None
    
    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """Response after sending a message"""
    message: ChatMessageResponse
    session_id: str
    session_title: str


class ChatSessionCreate(BaseModel):
    """Request to create a new chat session"""
    title: Optional[str] = Field("New Chat", max_length=200)
    document_ids: Optional[List[str]] = Field(None, description="Document context for session")
    system_prompt: Optional[str] = Field(None, description="Custom system prompt")


class ChatSessionResponse(BaseModel):
    """Chat session response"""
    id: str
    title: str
    message_count: int
    document_context: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Preview of last message
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChatSessionDetailResponse(BaseModel):
    """Full chat session with messages"""
    id: str
    title: str
    document_context: List[str] = []
    system_prompt: Optional[str] = None
    messages: List[ChatMessageResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


class ChatSessionUpdateRequest(BaseModel):
    """Request to update chat session"""
    title: Optional[str] = Field(None, max_length=200)
    document_ids: Optional[List[str]] = None


class SuggestedQuestion(BaseModel):
    """AI-suggested follow-up question"""
    question: str
    category: Optional[str] = None  # safety, equipment, regulatory
