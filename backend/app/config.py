import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # SQLite Persistence Settings
    sqlite_db_path: str = Field(default="./app/data/tallybook.db", env="SQLITE_DB_PATH")

    # Groq AI Settings
    groq_api_key: str = Field(default="", env="GROQ_API_KEY")

    # Reconciliation Thresholds
    accept_threshold: float = Field(default=0.80, env="ACCEPT_THRESHOLD")
    exception_threshold: float = Field(default=0.55, env="EXCEPTION_THRESHOLD")
    high_value_threshold: float = Field(default=10000.0, env="HIGH_VALUE_THRESHOLD")

    # JWT Settings
    jwt_secret: str = Field(default="tallybook_super_secret_jwt_key_2026_buildathon", env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=480, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Environment
    app_env: str = Field(default="development", env="APP_ENV")
    data_dir: str = Field(default="./app/data", env="DATA_DIR")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
