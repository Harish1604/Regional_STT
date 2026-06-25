"""
Combined Speech-to-Text + Translation endpoint.
Accepts audio file + source language + target language.
Runs STT then LLM translation in a single request for minimal latency.
"""

import time

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.models.response_models import TranslateResponse, ErrorResponse
from app.utils.file_utils import save_upload, cleanup_file
from app.utils.logger import get_logger

log = get_logger(__name__)

router = APIRouter(tags=["Translation"])


@router.post(
    "/translate",
    response_model=TranslateResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def translate_audio(
    file: UploadFile = File(..., description="Audio file to transcribe and translate"),
    source_language: str = Form(
        ..., description="Source language code (e.g., 'ta', 'hi', 'te')"
    ),
    target_language: str = Form(
        default="en", description="Target language code (default: 'en')"
    ),
):
    """
    Combined STT + Translation endpoint.

    1. Transcribes the audio using AI4Bharat IndicConformer STT
    2. Translates the transcript using the configured LLM (Ollama/LLaMA)

    Single HTTP round-trip for minimum latency.
    """
    upload_path = None
    processed_path = None
    total_start = time.time()

    try:
        # Validate source language
        if source_language not in settings.supported_language_list:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported source language: '{source_language}'. "
                f"Supported: {settings.supported_language_list}",
            )

        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")

        log.info(
            f"Translate request | source: {source_language} | "
            f"target: {target_language} | filename: {file.filename}"
        )

        # Save uploaded file
        upload_path = await save_upload(file, settings.upload_dir)

        # Get service instances
        from app.main import audio_service, stt_service, llm_service

        # Step 1: Preprocess + STT
        processed_path = audio_service.preprocess(upload_path)
        stt_result = stt_service.transcribe(processed_path, source_language)

        source_text = stt_result["transcript"]
        stt_latency_ms = stt_result["latency_ms"]

        if not source_text.strip():
            raise ValueError("Transcription returned empty text. Please speak more clearly.")

        # Step 2: LLM Translation
        translation_result = llm_service.translate(
            text=source_text,
            source_language=source_language,
            target_language=target_language,
        )

        total_latency_ms = int((time.time() - total_start) * 1000)

        log.info(
            f"Translation complete | stt: {stt_latency_ms}ms | "
            f"llm: {translation_result['latency_ms']}ms | "
            f"total: {total_latency_ms}ms"
        )

        return TranslateResponse(
            success=True,
            source_text=source_text,
            translated_text=translation_result["translated_text"],
            source_language=source_language,
            target_language=target_language,
            stt_latency_ms=stt_latency_ms,
            translation_latency_ms=translation_result["latency_ms"],
            total_latency_ms=total_latency_ms,
            audio_duration_sec=stt_result["duration_sec"],
            model=stt_result["model"],
        )

    except HTTPException:
        raise
    except ValueError as e:
        log.warning(f"Translate validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        log.error(f"Translate runtime error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        log.error(f"Translate unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Translation failed: {str(e)}"
        )
    finally:
        # Cleanup temporary files
        if upload_path:
            cleanup_file(upload_path)
        if processed_path:
            cleanup_file(processed_path)
