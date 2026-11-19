"""
API v1 Module
Versioned API endpoints
"""


def __getattr__(name: str):
    if name == "api_router":
        from app.api.v1.router import api_router

        return api_router
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


__all__ = ["api_router"]
