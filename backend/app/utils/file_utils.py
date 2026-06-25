"""
Utility functions for temporary file management.
"""

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.utils.logger import get_logger

log = get_logger(__name__)


async def save_upload(file: UploadFile, directory: str) -> str:
    """
    Save an uploaded file to the specified directory.
    Returns the absolute path of the saved file.
    """
    os.makedirs(directory, exist_ok=True)

    # Generate unique filename preserving extension
    ext = Path(file.filename).suffix if file.filename else ".wav"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(directory, unique_name)

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    log.info(f"Saved upload: {save_path} ({len(content)} bytes)")
    return os.path.abspath(save_path)


def cleanup_file(path: str) -> None:
    """Remove a temporary file if it exists."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
            log.debug(f"Cleaned up: {path}")
    except OSError as e:
        log.warning(f"Failed to clean up {path}: {e}")


def ensure_directories(*dirs: str) -> None:
    """Create directories if they don't exist."""
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        log.debug(f"Ensured directory exists: {d}")
