import asyncpg
from typing import Optional
from config import settings

_pool: Optional[asyncpg.pool.Pool] = None

async def init_pool():
    global _pool
    if _pool:
        return _pool
    if not settings.DATABASE_URL:
        raise RuntimeError("DATABASE_URL not set")

    _pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=1,
        max_size=20,
        # command_timeout left default; we'll explicitly set statement_timeout per-conn
    )
    async with _pool.acquire() as conn:
        # 0 means no timeout
        await conn.execute(f"SET statement_timeout TO {settings.DB_STATEMENT_TIMEOUT_MS}")
    return _pool

async def get_conn():
    if _pool is None:
        await init_pool()
    return _pool

async def fetch(conn, q: str, *args):    return await conn.fetch(q, *args)
async def fetchrow(conn, q: str, *args): return await conn.fetchrow(q, *args)
async def execute(conn, q: str, *args):  return await conn.execute(q, *args)
