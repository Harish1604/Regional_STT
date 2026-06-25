"""
Structured logging configuration using loguru.
"""

import sys
from loguru import logger

# Remove default handler
logger.remove()

# Add structured console handler
logger.add(
    sys.stdout,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
    level="INFO",
    colorize=True,
)

# Add file handler for persistent logs
logger.add(
    "logs/app_{time:YYYY-MM-DD}.log",
    rotation="10 MB",
    retention="7 days",
    level="DEBUG",
    format=(
        "{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | "
        "{name}:{function}:{line} | {message}"
    ),
)


def get_logger(name: str = __name__):
    """Get a logger instance with the given name."""
    return logger.bind(module=name)
