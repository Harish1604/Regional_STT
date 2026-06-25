"""
AI4Bharat IndicConformer Speech-to-Text Service.

Uses the ai4bharat/indic-conformer-600m-multilingual model (600M params)
for multilingual Indian language ASR. Supports 22 scheduled Indian languages.

The model is loaded once at startup and reused for all requests.
"""

import time
import os
from typing import Optional

import torch
import torchaudio

from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)


class STTService:
    """
    Speech-to-Text service wrapping AI4Bharat IndicConformer.

    The model accepts:
    - Audio tensor: 16kHz mono WAV loaded as torch tensor
    - Language code: ISO 639-1 (e.g., 'ta', 'hi', 'te')
    - Decode mode: 'ctc' (batch) or 'rnnt' (streaming-capable)
    """

    def __init__(self):
        self.model = None
        self.model_name = settings.stt_model_name
        self.device = self._resolve_device()
        self.decode_mode = settings.stt_decode_mode
        self._loaded = False

    def _resolve_device(self) -> str:
        """Determine the best device for inference."""
        if settings.stt_device == "auto":
            if torch.cuda.is_available():
                device = "cuda"
            else:
                device = "cpu"
        else:
            device = settings.stt_device

        log.info(f"STT device resolved: {device}")
        return device

    def load_model(self) -> None:
        """
        Load the AI4Bharat IndicConformer model.
        Called once during application startup.
        """
        if self._loaded:
            log.info("STT model already loaded, skipping.")
            return

        log.info(f"Loading STT model: {self.model_name}")
        log.info(f"Device: {self.device}")
        start_time = time.time()

        try:
            # Set HuggingFace token for gated model access
            if settings.hf_token:
                os.environ["HF_TOKEN"] = settings.hf_token
                log.info("HuggingFace token set for model download")

            # Load via transformers AutoModel with trust_remote_code
            # The multilingual model uses a custom forward() that accepts
            # (audio_tensor, language_code, decode_mode)
            from transformers import AutoModel

            self.model = AutoModel.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                token=settings.hf_token if settings.hf_token else None,
            )

            # Move to device and set to eval mode
            self.model = self.model.to(self.device)
            self.model.eval()

            load_time = time.time() - start_time
            self._loaded = True
            log.info(
                f"STT model loaded successfully in {load_time:.2f}s "
                f"on {self.device}"
            )

        except Exception as e:
            log.error(f"Failed to load STT model: {e}")
            raise RuntimeError(
                f"Failed to load AI4Bharat STT model '{self.model_name}': {e}"
            ) from e

    def transcribe(self, audio_path: str, language: str) -> dict:
        """
        Transcribe an audio file using AI4Bharat IndicConformer.

        Args:
            audio_path: Path to preprocessed 16kHz mono WAV file.
            language: ISO 639-1 language code (e.g., 'ta', 'hi').

        Returns:
            dict with keys:
                - transcript: str
                - model: str
                - duration_sec: float
                - latency_ms: int
        """
        if not self._loaded:
            raise RuntimeError("STT model not loaded. Call load_model() first.")

        log.info(
            f"Transcribing: {audio_path} | language: {language} | "
            f"decode: {self.decode_mode}"
        )

        start_time = time.time()

        try:
            # Load audio file
            wav, sr = torchaudio.load(audio_path)

            # Ensure mono
            if wav.shape[0] > 1:
                wav = torch.mean(wav, dim=0, keepdim=True)

            # Resample if needed (should already be 16kHz from preprocessing)
            if sr != 16000:
                resampler = torchaudio.transforms.Resample(
                    orig_freq=sr, new_freq=16000
                )
                wav = resampler(wav)

            # Calculate audio duration
            duration_sec = wav.shape[1] / 16000.0

            # Move tensor to model device
            wav = wav.to(self.device)

            # Run inference
            # The multilingual model's forward: model(audio_tensor, lang_code, mode)
            with torch.no_grad():
                transcript = self.model(wav, language, self.decode_mode)

            # Handle different return types
            if isinstance(transcript, (list, tuple)):
                transcript = transcript[0] if transcript else ""
            transcript = str(transcript).strip()

            latency_ms = int((time.time() - start_time) * 1000)

            log.info(
                f"Transcription complete | language: {language} | "
                f"duration: {duration_sec:.2f}s | latency: {latency_ms}ms | "
                f"transcript: {transcript[:100]}..."
            )

            return {
                "transcript": transcript,
                "model": self.model_name,
                "duration_sec": round(duration_sec, 2),
                "latency_ms": latency_ms,
            }

        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            log.error(f"Transcription failed after {latency_ms}ms: {e}")
            raise RuntimeError(f"STT transcription failed: {e}") from e

    @property
    def is_loaded(self) -> bool:
        """Check if the model is loaded."""
        return self._loaded
