"""
Pydantic request models for API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional


class ChatHistoryItem(BaseModel):
    """A single message in the conversation history."""

    role: str = Field(
        ...,
        description="Message role: 'user' or 'assistant'",
        pattern="^(user|assistant)$",
    )
    text: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    """Request body for the /chat endpoint."""

    message: str = Field(
        ...,
        description="The user's transcript text to send to the LLM",
        min_length=1,
    )
    language: str = Field(
        ...,
        description="ISO 639-1 language code (e.g., 'ta', 'hi', 'te')",
        min_length=2,
        max_length=3,
    )
    history: list[ChatHistoryItem] = Field(
        default=[],
        description="Previous conversation messages",
    )
