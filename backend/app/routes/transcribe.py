"""
Speech-to-Text transcription endpoint.
Accepts audio file + language, runs AI4Bharat IndicConformer STT.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.models.response_models import TranscribeResponse, ErrorResponse
from app.utils.file_utils import save_upload, cleanup_file
from app.utils.logger import get_logger

log = get_logger(__name__)

router = APIRouter(tags=["Transcription"])

# Service instances (injected from main.py via app.state)
# We access them through the request's app state


@router.post(
    "/transcribe",
    response_model=TranscribeResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: str = Form(
        ..., description="Language code (e.g., 'ta', 'hi', 'te', 'ml', 'kn')"
    ),
):
    """
    Transcribe speech audio using AI4Bharat IndicConformer STT.

    Accepts audio in various formats (wav, mp3, webm, ogg, m4a, flac).
    The audio is preprocessed to 16kHz mono WAV before inference.
    """
    upload_path = None
    processed_path = None

    try:
        # Validate language
        if language not in settings.supported_language_list:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported language: '{language}'. "
                f"Supported: {settings.supported_language_list}",
            )

        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")

        log.info(
            f"Transcribe request | language: {language} | "
            f"filename: {file.filename} | "
            f"content_type: {file.content_type}"
        )

        # Save uploaded file
        upload_path = await save_upload(file, settings.upload_dir)

        # Get service instances from app state
        from app.main import audio_service, stt_service

        # Preprocess audio → 16kHz mono WAV
        processed_path = audio_service.preprocess(upload_path)

        # Run STT
        result = stt_service.transcribe(processed_path, language)

        return TranscribeResponse(
            success=True,
            transcript=result["transcript"],
            language=language,
            model=result["model"],
            audio_duration_sec=result["duration_sec"],
            latency_ms=result["latency_ms"],
        )

    except HTTPException:
        raise
    except ValueError as e:
        log.warning(f"Transcribe validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        log.error(f"Transcribe runtime error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        log.error(f"Transcribe unexpected error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Transcription failed: {str(e)}"
        )
    finally:
        # Cleanup temporary files
        if upload_path:
            cleanup_file(upload_path)
        if processed_path:
            cleanup_file(processed_path)
