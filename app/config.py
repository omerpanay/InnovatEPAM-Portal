"""Application configuration via pydantic-settings.

Loads settings from environment variables or a .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql+asyncpg://admin:admin@localhost:5432/innovatepam"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    UPLOAD_DIR: str = "./app/uploads"
    FRONTEND_URL: str = "http://localhost:5173"

    # Provide a sync URL for Alembic (derived from DATABASE_URL)
    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg")

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
