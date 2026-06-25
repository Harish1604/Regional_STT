"""
Health check endpoint.
"""

from fastapi import APIRouter

from app.models.response_models import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify the API is running."""
    return HealthResponse(status="ok")
