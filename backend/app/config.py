"""
Configuration module for the Regional STT Chatbot backend.
Loads settings from environment variables via .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- HuggingFace ---
    hf_token: str = Field(
        default="",
        description="HuggingFace access token for downloading gated models",
    )

    # --- STT ---
    stt_model_name: str = Field(
        default="ai4bharat/indic-conformer-600m-multilingual",
        description="HuggingFace model ID for AI4Bharat IndicConformer STT",
    )
    stt_device: str = Field(
        default="auto",
        description="Device for STT inference: 'auto', 'cuda', or 'cpu'",
    )
    stt_decode_mode: str = Field(
        default="rnnt",
        description="Decoding mode: 'rnnt' (higher accuracy) or 'ctc' (faster)",
    )

    # --- Audio Preprocessing ---
    audio_normalize: bool = Field(
        default=True,
        description="Normalize audio levels to maximize signal-to-noise ratio",
    )
    audio_high_pass_cutoff: int = Field(
        default=100,
        description="Cutoff frequency for high-pass filter in Hz (0 to disable)",
    )
    audio_silence_strip: bool = Field(
        default=True,
        description="Strip leading and trailing silence",
    )
    audio_noise_gate_enabled: bool = Field(
        default=True,
        description="Enable simple energy-based noise gate",
    )
    audio_noise_gate_threshold: float = Field(
        default=-40.0,
        description="Noise gate threshold in dBFS (attenuates parts below this)",
    )

    # --- LLM ---
    llm_provider: str = Field(
        default="ollama",
        description="LLM provider: 'ollama', 'gemini', or 'openai'",
    )
    gemini_api_key: str = Field(
        default="",
        description="Google Gemini API key",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Gemini model name",
    )
    openai_api_key: str = Field(
        default="",
        description="OpenAI API key (if using OpenAI provider)",
    )
    openai_model: str = Field(
        default="gpt-4o-mini",
        description="OpenAI model name",
    )
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        description="Ollama base URL (if using Ollama provider)",
    )
    ollama_model: str = Field(
        default="llama3",
        description="Ollama model name",
    )

    # --- Server ---
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    frontend_url: str = Field(
        default="http://localhost:3000",
        description="Frontend URL for CORS",
    )

    # --- Paths ---
    upload_dir: str = Field(default="uploads", description="Upload directory")
    temp_audio_dir: str = Field(
        default="temp_audio", description="Temp audio directory"
    )

    # --- Supported Languages ---
    supported_languages: str = Field(
        default="ta,hi,te,ml,kn,bn,gu,mr,pa,ur",
        description="Comma-separated supported language codes",
    )

    @property
    def supported_language_list(self) -> list[str]:
        return [lang.strip() for lang in self.supported_languages.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


# Singleton settings instance
settings = Settings()
