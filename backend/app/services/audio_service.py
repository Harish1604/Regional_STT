"""
Audio preprocessing service.
Normalizes incoming audio to the format required by the STT model:
- 16kHz sample rate
- Mono channel
- WAV format
"""

import os
import uuid
from pathlib import Path

from pydub import AudioSegment
from pydub.effects import normalize
from pydub.silence import detect_nonsilent

from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

# Supported input formats
SUPPORTED_FORMATS = {
    ".wav": "wav",
    ".mp3": "mp3",
    ".ogg": "ogg",
    ".webm": "webm",
    ".m4a": "mp4",
    ".flac": "flac",
    ".opus": "ogg",
    ".wma": "wma",
    ".aac": "aac",
}


class AudioService:
    """Service for audio preprocessing and normalization."""

    def __init__(self):
        self.target_sample_rate = 16000
        self.target_channels = 1  # Mono
        self.output_format = "wav"
        self.output_dir = settings.temp_audio_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def preprocess(self, input_path: str) -> str:
        """
        Convert any supported audio file to 16kHz mono WAV.

        Args:
            input_path: Path to the input audio file.

        Returns:
            Path to the preprocessed WAV file.

        Raises:
            ValueError: If the audio format is not supported.
            RuntimeError: If audio conversion fails.
        """
        ext = Path(input_path).suffix.lower()
        log.info(f"Preprocessing audio: {input_path} (format: {ext})")

        if ext not in SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported audio format: {ext}. "
                f"Supported: {list(SUPPORTED_FORMATS.keys())}"
            )

        try:
            # Load audio using pydub (requires ffmpeg)
            input_format = SUPPORTED_FORMATS[ext]
            audio = AudioSegment.from_file(input_path, format=input_format)

            # Convert to mono
            if audio.channels > 1:
                audio = audio.set_channels(self.target_channels)
                log.debug(f"Converted to mono from {audio.channels} channels")

            # Resample to 16kHz
            if audio.frame_rate != self.target_sample_rate:
                audio = audio.set_frame_rate(self.target_sample_rate)
                log.debug(f"Resampled to {self.target_sample_rate}Hz")

            # 1. High-pass filter to remove low-frequency hum (fans, AC, rumble)
            if settings.audio_high_pass_cutoff > 0:
                audio = audio.high_pass_filter(settings.audio_high_pass_cutoff)
                log.debug(f"Applied high-pass filter: cutoff={settings.audio_high_pass_cutoff}Hz")

            # 2. Noise Gate: Attenuate low-level background noise chunks
            if settings.audio_noise_gate_enabled:
                chunk_ms = 20
                threshold = settings.audio_noise_gate_threshold
                chunks = [audio[i:i+chunk_ms] for i in range(0, len(audio), chunk_ms)]
                processed_chunks = []
                for chunk in chunks:
                    if chunk.dbfs < threshold:
                        # Attenuate quiet chunk by 20dB
                        processed_chunks.append(chunk - 20)
                    else:
                        processed_chunks.append(chunk)
                if processed_chunks:
                    gate_audio = processed_chunks[0]
                    for c in processed_chunks[1:]:
                        gate_audio += c
                    audio = gate_audio
                    log.debug(f"Applied noise gate: threshold={threshold}dBFS")

            # 3. Silence Stripping: Remove leading/trailing silence
            if settings.audio_silence_strip:
                nonsilent_ranges = detect_nonsilent(
                    audio,
                    min_silence_len=300,
                    silence_thresh=settings.audio_noise_gate_threshold
                )
                if nonsilent_ranges:
                    start_ms = max(0, nonsilent_ranges[0][0] - 100)
                    end_ms = min(len(audio), nonsilent_ranges[-1][1] + 100)
                    audio = audio[start_ms:end_ms]
                    log.debug(f"Stripped leading/trailing silence: cropped to {start_ms}ms - {end_ms}ms")

            # 4. Normalization: Equalize gain to maximize Speech-to-Noise Ratio (SNR)
            if settings.audio_normalize:
                audio = normalize(audio)
                log.debug("Normalized audio levels")

            # Set sample width to 16-bit
            audio = audio.set_sample_width(2)

            # Export as WAV
            output_name = f"{uuid.uuid4().hex}.wav"
            output_path = os.path.join(self.output_dir, output_name)
            audio.export(output_path, format=self.output_format)

            duration_sec = len(audio) / 1000.0
            log.info(
                f"Audio preprocessed: {output_path} "
                f"(duration: {duration_sec:.2f}s, "
                f"rate: {self.target_sample_rate}Hz, "
                f"channels: {self.target_channels})"
            )

            return os.path.abspath(output_path)

        except Exception as e:
            log.error(f"Audio preprocessing failed: {e}")
            raise RuntimeError(f"Failed to preprocess audio: {e}") from e

    def get_duration(self, audio_path: str) -> float:
        """Get the duration of an audio file in seconds."""
        try:
            audio = AudioSegment.from_file(audio_path)
            return len(audio) / 1000.0
        except Exception:
            return 0.0
