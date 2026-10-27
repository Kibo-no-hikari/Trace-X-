import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load .env file from backend root or workspace root
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "TraceX API"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # MongoDB Atlas configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "tracex_db")

    # Server settings
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS origins
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    
    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    # File upload constraints
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
    MAX_FILES_PER_REQUEST: int = int(os.getenv("MAX_FILES_PER_REQUEST", "10"))
    SUPPORTED_EXTENSIONS: set[str] = {".log", ".csv", ".json"}

    # Temporary storage
    TEMP_UPLOAD_DIR: Path = BASE_DIR / "temp_uploads"

settings = Settings()
settings.TEMP_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
