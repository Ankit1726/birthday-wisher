from urllib.parse import urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )

    # MongoDB
    mongo_uri: str
    mongo_db_name: str

    # JWT Authentication
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days

    # CORS
    allowed_origins: str = "*"

    # Keep Alive
    self_url: str = ""
    keepalive_enabled: bool = False
    keepalive_interval_minutes: int = 10

    # Upload Limits
    max_image_mb: int = 100
    max_audio_mb: int = 200

    @property
    def origins_list(self) -> list[str]:
        if self.allowed_origins.strip() == "*":
            return ["*"]

        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def database_name(self) -> str:
        """MongoDB database names cannot contain spaces or reserved separators."""
        return self.mongo_db_name.strip().replace(" ", "_")

    @property
    def mongo_uri_without_database(self) -> str:
        parts = urlsplit(self.mongo_uri.strip())
        return urlunsplit((parts.scheme, parts.netloc, "/", parts.query, parts.fragment))

    @property
    def keepalive_url(self) -> str:
        url = self.self_url.strip().rstrip("/")
        if not url or "your-app-name.onrender.com" in url:
            return ""
        return url


settings = Settings()
