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
from app.db.session import get_db
from app.schemas.chat import ChatRequest
from app.services.chat_service import CHAT_MODEL, ChatService

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
    chat_service = ChatService()

    # 1. Prepare chat turn (validate input, load history, persist user message)
    turn = chat_service.prepare_turn(
        db=db,
        user_id=user_id,
        content=request.content,
        session_id=request.session_id,
    )

    async def event_generator():
        full_response = []
        sources = []
        tokens_used = None
        finalized = False
        start_time = datetime.utcnow()

        def _persist_assistant_turn():
            nonlocal finalized
            if finalized or not full_response:
                return
            finalized = True
            response_time_ms = int(
                (datetime.utcnow() - start_time).total_seconds() * 1000
            )
            try:
                chat_service.finalize_turn(
                    db=db,
                    session=turn.session,
                    user_id=user_id,
                    content="".join(full_response),
                    sources=sources,
                    include_sources=request.include_sources,
                    response_time_ms=response_time_ms,
                    tokens_used=tokens_used,
                    raw_user_content=request.content,
                )
            except Exception as save_err:
                logger.error(
                    f"Failed to persist streamed assistant message: {save_err}",
                    exc_info=True,
                )

        try:
            async for event in chat_service.generate_response_stream(
                query=turn.validated_query,
                user_id=user_id,
                document_ids=request.document_ids,
                db=db,
                history=turn.history,
            ):
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
                    done_data = {}
                    try:
                        done_data = json.loads(data_line)
                        tokens_used = done_data.get("tokens_used")
                    except Exception:
                        pass

                    # Persist before emitting done so follow-up turns see this reply.
                    _persist_assistant_turn()
                    done_data["session_id"] = str(turn.session.id)
                    yield f"event: done\ndata: {json.dumps(done_data)}\n\n"
                    continue

                # Forward each SSE event to client
                yield event

        except Exception as e:
            logger.error(f"Streaming error: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"

        finally:
            _persist_assistant_turn()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )
