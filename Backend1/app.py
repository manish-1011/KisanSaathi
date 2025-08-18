# src/app.py
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from config import settings
from db import init_pool
from routers.chats import router as chat_router
from routers.history import router as history_router
from routers.session import router as session_router
from routers.feedback import router as feedback_router
from routers.user_info import router as userinfo_router

# Exposed so other modules (e.g., chat.py) can reuse the same client
_httpx_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    App startup/shutdown:
    - Initialize asyncpg pool
    - Create a shared httpx.AsyncClient with NO timeouts (per your requirement)
    """
    global _httpx_client

    # Initialize DB pool (no statement_timeout; configured in src/db.py)
    await init_pool()

    # Shared HTTP client — no timeouts
    _httpx_client = httpx.AsyncClient(
        timeout=None,  # <- you asked for no tight timeouts
        follow_redirects=True,
        limits=httpx.Limits(max_keepalive_connections=50, max_connections=100),
        http2=True,
    )

    try:
        yield
    finally:
        # Graceful shutdown
        if _httpx_client:
            await _httpx_client.aclose()


app = FastAPI(
    title="Agri Chat API",
    default_response_class=ORJSONResponse,  # faster JSON
    lifespan=lifespan,
)

# CORS
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Routers
app.include_router(session_router)
app.include_router(chat_router)
app.include_router(history_router)
app.include_router(feedback_router)
app.include_router(userinfo_router)


# Health / root
@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"name": "Agri Chat API", "status": "ok"}
