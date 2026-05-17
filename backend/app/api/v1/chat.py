"""
Chat API Endpoints
Chat sessions and AI conversations with RAG
"""

import logging
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.models.chat import ChatSession, ChatMessage
from app.models.audit import create_audit_log, AuditAction
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageResponse,
    ChatSessionUpdateRequest,
)
from app.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List user's chat sessions ordered by most recent.
    """
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.updated_at.desc()).limit(limit).all()
    
    result = []
    for session in sessions:
        last_msg = session.messages[-1] if session.messages else None
        result.append(ChatSessionResponse(
            id=str(session.id),
            title=session.title,
            message_count=len(session.messages),
            document_context=session.document_context or [],
            created_at=session.created_at,
            updated_at=session.updated_at,
            last_message=last_msg.content[:100] if last_msg else None,
            last_message_at=last_msg.created_at if last_msg else None
        ))
    
    return result


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    request: ChatSessionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new chat session.
    """
    session = ChatSession(
        user_id=user_id,
        title=request.title or "New Chat",
        document_context=request.document_ids or [],
        system_prompt=request.system_prompt
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Audit log
    audit = create_audit_log(
        action=AuditAction.CHAT_CREATE.value,
        user_id=user_id,
        resource_type="chat_session",
        resource_id=str(session.id)
    )
    db.add(audit)
    db.commit()
    
    return ChatSessionResponse(
        id=str(session.id),
        title=session.title,
        message_count=0,
        document_context=session.document_context,
        created_at=session.created_at,
        updated_at=session.updated_at
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
async def get_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get chat session with all messages.
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise NotFoundError("Chat session", session_id)
    
    messages = [
        ChatMessageResponse(
            id=str(msg.id),
            role=msg.role,
            content=msg.content,
            sources=msg.sources or [],
            created_at=msg.created_at,
            model_used=msg.model_used,
            response_time_ms=msg.response_time_ms
        )
        for msg in session.messages
    ]
    
    return ChatSessionDetailResponse(
        id=str(session.id),
        title=session.title,
        document_context=session.document_context or [],
        system_prompt=session.system_prompt,
        messages=messages,
        created_at=session.created_at,
        updated_at=session.updated_at
    )


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(
    session_id: str,
    request: ChatSessionUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update chat session title or document context.
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise NotFoundError("Chat session", session_id)
    
    if request.title is not None:
        session.title = request.title
    if request.document_ids is not None:
        session.document_context = request.document_ids
    
    session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(session)
    
    return ChatSessionResponse(
        id=str(session.id),
        title=session.title,
        message_count=len(session.messages),
        document_context=session.document_context,
        created_at=session.created_at,
        updated_at=session.updated_at
    )


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a chat session and all messages.
    """
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    
    if not session:
        raise NotFoundError("Chat session", session_id)
    
    # Audit log
    audit = create_audit_log(
        action=AuditAction.CHAT_DELETE.value,
        user_id=user_id,
        resource_type="chat_session",
        resource_id=session_id
    )
    db.add(audit)
    
    db.delete(session)
    db.commit()
    
    return {"success": True, "message": "Chat session deleted"}


@router.post("/send", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Send a message and get AI response.
    Uses RAG to find relevant document context.
    """
    start_time = datetime.utcnow()
    
    # Get or create session
    if request.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == request.session_id,
            ChatSession.user_id == user_id
        ).first()
        if not session:
            raise NotFoundError("Chat session", request.session_id)
    else:
        # Create new session
        session = ChatSession(
            user_id=user_id,
            title="New Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    
    # Save user message (but don't commit yet - wait for successful response)
    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    
    # Generate AI response with RAG
    from app.services.chat_service import ChatService
    chat_service = ChatService()
    
    try:
        ai_response, sources = await chat_service.generate_response(
            query=request.content,
            user_id=user_id,
            document_ids=request.document_ids,
            db=db
        )
        
        # Calculate response time
        end_time = datetime.utcnow()
        response_time_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Save assistant message
        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=ai_response,
            sources=sources if request.include_sources else [],
            model_used="gemini-2.0-flash",
            response_time_ms=response_time_ms
        )
        db.add(assistant_message)
        
        # Get fresh message count from database
        message_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).count()
        
        # Update session title if first/second message
        if message_count <= 2:
            # Auto-generate title from first user message
            session.title = request.content[:50] + ("..." if len(request.content) > 50 else "")
        
        session.updated_at = datetime.utcnow()
        
        # Audit log
        audit = create_audit_log(
            action=AuditAction.CHAT_MESSAGE.value,
            user_id=user_id,
            resource_type="chat_session",
            resource_id=str(session.id),
            details={"message_length": len(request.content)}
        )
        db.add(audit)
        
        # Commit all changes atomically
        db.commit()
        db.refresh(assistant_message)
    except Exception as e:
        db.rollback()
        raise
    
    return ChatResponse(
        message=ChatMessageResponse(
            id=str(assistant_message.id),
            role="assistant",
            content=ai_response,
            sources=sources if request.include_sources else [],
            created_at=assistant_message.created_at,
            model_used="gemini-2.0-flash",
            response_time_ms=response_time_ms
        ),
        session_id=str(session.id),
        session_title=session.title
    )
