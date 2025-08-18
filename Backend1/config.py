import os
from dotenv import load_dotenv
load_dotenv()

class Settings:
    APP_PORT = int(os.getenv("APP_PORT", "8080"))
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")

    KISANSATHI_URL = os.getenv("KISANSATHI_URL", "")

    # You said “no tight timeouts”. We’ll set *no* DB statement timeout
    # and *no* HTTP client total timeout. (If you ever want guardrails, add envs.)
    DB_STATEMENT_TIMEOUT_MS = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "0"))  # 0 = no limit
    HTTP_TIMEOUT_DISABLED = os.getenv("HTTP_TIMEOUT_DISABLED", "true").lower() in {"1","true","yes"}

settings = Settings()
