"""
Chat endpoint.
Accepts transcript text + language + history, calls LLM, returns reply.
"""

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.models.request_models import ChatRequest
from app.models.response_models import ChatResponse, ErrorResponse
from app.utils.logger import get_logger

log = get_logger(__name__)

router = APIRouter(tags=["Chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def chat(request: ChatRequest):
    """
    Send a message to the LLM and get a reply in the same language.

    The LLM receives the transcript, language code, and conversation history,
    and is instructed to reply in the user's language.
    """
    try:
        # Validate language
        if request.language not in settings.supported_language_list:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: '{request.language}'. "
                f"Supported: {settings.supported_language_list}",
            )

        log.info(
            f"Chat request | language: {request.language} | "
            f"message_length: {len(request.message)} | "
            f"history_count: {len(request.history)}"
        )

        # Get LLM service from app state
        from app.main import llm_service

        # Build history as list of dicts
        history = [
            {"role": item.role, "text": item.text}
            for item in request.history
        ]

        # Generate reply
        result = llm_service.generate_reply(
            message=request.message,
            language=request.language,
            history=history,
        )

        log.info(
            f"Chat response | language: {request.language} | "
            f"latency: {result['latency_ms']}ms | "
            f"reply_length: {len(result['reply'])}"
        )

        return ChatResponse(
            success=True,
            reply=result["reply"],
            language=request.language,
            latency_ms=result["latency_ms"],
        )

    except HTTPException:
        raise
    except RuntimeError as e:
        log.error(f"Chat runtime error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        log.error(f"Chat unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Chat generation failed: {str(e)}"
        )
