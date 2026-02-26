"""FastAPI application factory for the InnovatEPAM Portal.

Creates and configures the FastAPI application with CORS middleware,
router registration, health check, and global error handling.
"""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.logging import setup_logging
from app.routers import auth, evaluations, ideas, users

# Initialize logging before creating the app
setup_logging()
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="InnovatEPAM Portal",
        description="Innovation idea submission and evaluation platform.",
        version="1.0.0",
    )

    # CORS configuration
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register routers
    application.include_router(auth.router)
    application.include_router(users.router)
    application.include_router(ideas.router)
    application.include_router(evaluations.router)

    # Health check
    @application.get("/health", tags=["health"])
    async def health_check():
        """Liveness probe endpoint."""
        return {"status": "ok"}

    # Global exception handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Catch-all for unhandled exceptions; log and return 500."""
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return application


app = create_app()
