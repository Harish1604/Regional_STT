"""
Regional STT Chatbot — FastAPI Application

Main entry point for the backend server.
Loads the AI4Bharat STT model at startup and configures the LLM service.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.stt_service import STTService
from app.services.audio_service import AudioService
from app.services.llm_service import create_llm_service
from app.routes import health, transcribe, chat, translate
from app.utils.file_utils import ensure_directories
from app.utils.logger import get_logger

log = get_logger(__name__)

# --- Global service instances (loaded once at startup) ---
stt_service: STTService = None  # type: ignore
audio_service: AudioService = None  # type: ignore
llm_service = None  # type: ignore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Loads the STT model and initializes services at startup.
    Cleans up resources on shutdown.
    """
    global stt_service, audio_service, llm_service

    log.info("=" * 60)
    log.info("Regional STT Chatbot — Starting up")
    log.info("=" * 60)

    # Ensure required directories exist
    ensure_directories(settings.upload_dir, settings.temp_audio_dir, "logs")

    # Initialize Audio Service
    log.info("Initializing Audio Service...")
    audio_service = AudioService()
    log.info("Audio Service ready")

    # Initialize STT Service and load model
    log.info("Initializing STT Service...")
    stt_service = STTService()
    stt_service.load_model()
    log.info("STT Service ready")

    # Initialize LLM Service
    log.info(f"Initializing LLM Service (provider: {settings.llm_provider})...")
    llm_service = create_llm_service()
    log.info("LLM Service ready")

    log.info("=" * 60)
    log.info("All services initialized. Server is ready!")
    log.info(f"Frontend URL (CORS): {settings.frontend_url}")
    log.info(f"STT Model: {settings.stt_model_name}")
    log.info(f"LLM Provider: {settings.llm_provider}")
    log.info(f"Supported Languages: {settings.supported_language_list}")
    log.info("=" * 60)

    yield

    # Shutdown
    log.info("Shutting down Regional STT Chatbot...")


# --- Create FastAPI app ---
app = FastAPI(
    title="Regional STT Chatbot API",
    description=(
        "Indian regional-language speech chatbot using "
        "AI4Bharat IndicConformer STT and configurable LLM."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(health.router)
app.include_router(transcribe.router)
app.include_router(chat.router)
app.include_router(translate.router)


# --- Entry point for direct execution ---
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info",
    )
