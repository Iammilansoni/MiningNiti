"""
API v1 Router
Combines all endpoint routers into single API router
"""

from fastapi import APIRouter

from app.api.v1 import documents, chat, analytics, jobs, health, prompts, user

api_router = APIRouter()

# Include all routers
api_router.include_router(
    health.router,
    tags=["Health"]
)

api_router.include_router(
    documents.router,
    prefix="/documents",
    tags=["Documents"]
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["Chat"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Analytics"]
)

api_router.include_router(
    jobs.router,
    prefix="/jobs",
    tags=["Jobs"]
)

api_router.include_router(
    prompts.router,
    prefix="/prompts",
    tags=["Prompts"]
)

api_router.include_router(
    user.router,
    prefix="/user",
    tags=["User"]
)
