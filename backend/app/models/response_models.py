"""
Pydantic response models for API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional


class HealthResponse(BaseModel):
    """Response for the /health endpoint."""

    status: str = "ok"


class TranscribeResponse(BaseModel):
    """Response for the /transcribe endpoint."""

    success: bool = True
    transcript: str = Field(..., description="Transcribed text")
    language: str = Field(..., description="Language code used for transcription")
    model: str = Field(..., description="STT model name")
    audio_duration_sec: float = Field(
        ..., description="Input audio duration in seconds"
    )
    latency_ms: int = Field(..., description="STT inference latency in milliseconds")


class ChatResponse(BaseModel):
    """Response for the /chat endpoint."""

    success: bool = True
    reply: str = Field(..., description="LLM generated reply")
    language: str = Field(..., description="Response language code")
    latency_ms: int = Field(..., description="LLM latency in milliseconds")


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error info")


class TranslateResponse(BaseModel):
    """Response for the /translate endpoint (combined STT + translation)."""

    success: bool = True
    source_text: str = Field(..., description="Transcribed text in source language")
    translated_text: str = Field(..., description="Translated text in target language")
    source_language: str = Field(..., description="Source language code")
    target_language: str = Field(..., description="Target language code")
    stt_latency_ms: int = Field(..., description="STT inference latency in ms")
    translation_latency_ms: int = Field(..., description="LLM translation latency in ms")
    total_latency_ms: int = Field(..., description="Total pipeline latency in ms")
    audio_duration_sec: float = Field(..., description="Input audio duration in seconds")
    model: str = Field(default="", description="STT model used")

