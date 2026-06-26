"""
Streaming Chat Endpoint (SSE)
Server-Sent Events streaming for real-time AI responses.

Delivers three event types to the client:
  1. 'sources' — document citations (emitted first so UI renders immediately)
  2. 'token'   — streamed LLM response tokens
  3. 'done'    — signals stream completion with metadata
  4. 'error'   — on failure
"""

import json
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.config import settings
from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.schemas.chat import ChatRequest

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Stream AI response using Server-Sent Events.

    Event format:
        event: sources
        data: [{"document_title": ..., "file_name": ..., "page_numbers": [...], ...}]

        event: token
        data: {"text": "word by word..."}

        event: done
        data: {"session_id": "...", "sources_count": 3}

    Usage with fetch():
        const source = new EventSource('/api/v1/chat/stream', {...})
        source.addEventListener('token', (e) => appendToken(JSON.parse(e.data).text))
        source.addEventListener('sources', (e) => renderSources(JSON.parse(e.data)))
        source.addEventListener('done', () => source.close())
    """
    from app.services.chat_service import ChatService

    # Get or create session
    if request.session_id:
        session = (
            db.query(ChatSession)
            .filter(
                ChatSession.id == request.session_id, ChatSession.user_id == user_id
            )
            .first()
        )
        if not session:
            from app.core.exceptions import NotFoundError

            raise NotFoundError("Chat session", request.session_id)
    else:
        session = ChatSession(user_id=user_id, title="New Chat")
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message immediately
    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=request.content,
    )
    db.add(user_message)
    db.commit()

    chat_service = ChatService()

    async def event_generator():
        full_response = []
        sources = []
        tokens_used = None

        try:
            async for event in chat_service.generate_response_stream(
                query=request.content,
                user_id=user_id,
                document_ids=request.document_ids,
                db=db,
            ):
                # Forward each SSE event to client
                yield event

                # Track sources from the sources event for DB persistence
                if event.startswith("event: sources\n"):
                    data_line = event.split("data: ", 1)[-1].strip()
                    try:
                        sources = json.loads(data_line)
                    except Exception:
                        pass

                # Accumulate tokens for DB persistence
                elif event.startswith("event: token\n"):
                    data_line = event.split("data: ", 1)[-1].strip()
                    try:
                        token_data = json.loads(data_line)
                        full_response.append(token_data.get("text", ""))
                    except Exception:
                        pass

                elif event.startswith("event: done\n"):
                    data_line = event.split("data: ", 1)[-1].strip()
                    try:
                        done_data = json.loads(data_line)
                        tokens_used = done_data.get("tokens_used")
                    except Exception:
                        pass

        except Exception as e:
            logger.error(f"Streaming error: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

        finally:
            # Persist assistant message after stream completes
            if full_response:
                response_text = "".join(full_response)
                assistant_message = ChatMessage(
                    session_id=session.id,
                    role="assistant",
                    content=response_text,
                    sources=sources if request.include_sources else [],
                    model_used=settings.GEMINI_MODEL,
                    tokens_used=tokens_used,
                )
                db.add(assistant_message)

                # Auto-title on first message
                msg_count = (
                    db.query(ChatMessage)
                    .filter(ChatMessage.session_id == session.id)
                    .count()
                )
                if msg_count <= 2:
                    session.title = request.content[:50] + (
                        "..." if len(request.content) > 50 else ""
                    )

                session.updated_at = datetime.utcnow()
                db.commit()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
