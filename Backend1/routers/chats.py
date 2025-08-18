# routers/chat.py
from fastapi import APIRouter, HTTPException
import uuid, re, time, logging, asyncio
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import List, Tuple, Optional, Dict, Any

from anyio import to_thread
import httpx
import asyncpg

from db import get_conn, fetch, fetchrow, execute
from config import settings
from routers.translator import translate_text, to_english, detect_language
from utils.session_title import is_meaningful, make_session_title
# 👇 use your relevancy helpers
from services.relevancy import is_relevant, build_enriched_prompt

router = APIRouter(tags=["chat"])
IST = ZoneInfo("Asia/Kolkata")
DEFAULT_TITLE = "New Chat"

log = logging.getLogger("agri.chat")
if not log.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

SCRIPT_REGEX = {
    "hi": r"[\u0900-\u097F]", "mr": r"[\u0900-\u097F]",
    "gu": r"[\u0A80-\u0AFF]", "bn": r"[\u0980-\u09FF]",
    "ta": r"[\u0B80-\u0BFF]", "te": r"[\u0C00-\u0C7F]",
    "kn": r"[\u0C80-\u0CFF]", "ml": r"[\u0D00-\u0D7F]",
    "pa": r"[\u0A00-\u0A7F]", "or": r"[\u0B00-\u0B7F]",
    "as": r"[\u0980-\u09FF]",
}
_ASCIIish = re.compile(r"^[A-Za-z0-9\s\-\.,'?!/()]+$")

def _has_native_script(text: str, lang: Optional[str]) -> bool:
    if not text or not lang:
        return False
    pat = SCRIPT_REGEX.get(lang)
    return bool(pat and re.search(pat, text))

def _looks_romanized(text: str) -> bool:
    return bool(text and _ASCIIish.fullmatch(text))

def _client() -> httpx.AsyncClient:
    # shared httpx client from app.py
    from app import _httpx_client
    assert _httpx_client is not None, "HTTP client not initialized"
    return _httpx_client

async def _get_session_title(conn: asyncpg.Connection, session_id: str, user_email: str) -> Optional[str]:
    row = await fetchrow(conn, """
        SELECT session_name
        FROM sessions
        WHERE session_id=$1 AND user_email=$2
        ORDER BY created_time DESC
        LIMIT 1
    """, session_id, user_email)
    if not row:
        raise HTTPException(status_code=404, detail="Session not found for this user")
    return row["session_name"]

async def _set_session_name_all(conn: asyncpg.Connection, session_id: str, user_email: str, name: str) -> None:
    await execute(conn, "UPDATE sessions SET session_name=$1 WHERE session_id=$2 AND user_email=$3",
                  name, session_id, user_email)

async def _fetch_last_turns_en(conn: asyncpg.Connection, session_id: str, limit: int = 3) -> List[Tuple[str, str]]:
    rows = await fetch(conn, """
        SELECT COALESCE(user_query_en, ''), COALESCE(bot_message, '')
        FROM sessions
        WHERE session_id=$1 AND message_id IS NOT NULL
        ORDER BY created_time DESC
        LIMIT $2
    """, session_id, limit)
    rows = list(rows)[::-1]
    return [(r[0], r[1]) for r in rows]

async def _get_user_info(conn: asyncpg.Connection, user_email: str) -> Dict[str, Any]:
    row = await fetchrow(conn, "SELECT mode, language, pincode FROM user_information WHERE user_email=$1", user_email)
    if not row:
        return {"mode": "general", "language": "en", "pincode": None}
    return {"mode": row["mode"] or "general", "language": row["language"] or "en", "pincode": row["pincode"]}

def _parse_end_time_to_utc(end_time_str: Optional[str]) -> datetime:
    if not end_time_str:
        return datetime.now(timezone.utc)
    try:
        dt = datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=IST)
        return dt.astimezone(timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)

def _is_default_title(name: Optional[str]) -> bool:
    if not name:
        return True
    n = name.strip().lower()
    return n in {"new chat", "new session"}

@router.post("/chat")
async def chat(body: dict):
    t0 = time.time()
    session_id = (body.get("session_id") or "").strip()
    user_email = (body.get("user_email") or "").strip()
    user_msg_original = (body.get("user_msg") or "").strip()
    if not (session_id and user_email and user_msg_original):
        raise HTTPException(status_code=400, detail="session_id, user_email, user_msg are required")

    db = await get_conn()

    # Title (from latest row)
    current_title = await _get_session_title(db, session_id, user_email)
    if current_title is None:
        await _set_session_name_all(db, session_id, user_email, DEFAULT_TITLE)
        current_title = DEFAULT_TITLE

    # User prefs & last turns (get last 5 per your spec)
    user_info = await _get_user_info(db, user_email)
    last_turns_en = await _fetch_last_turns_en(db, session_id, 5)
    ui_language = user_info["language"] or "en"
    mode = user_info["mode"]
    pincode = user_info["pincode"]

    # Detect language (kept)
    input_lang = await to_thread.run_sync(detect_language, user_msg_original)
    input_lang = input_lang or "und"

    # Normalize to English (kept translator behavior & romanized handling)
    user_msg_en: Optional[str] = None
    if ui_language != "en":
        if _looks_romanized(user_msg_original) and not _has_native_script(user_msg_original, ui_language):
            tmp = await to_thread.run_sync(to_english, user_msg_original, None)
            if (tmp or "").strip().lower() == user_msg_original.strip().lower():
                native_try = await to_thread.run_sync(translate_text, user_msg_original, ui_language, None)
                if native_try and _has_native_script(native_try, ui_language):
                    user_msg_en = await to_thread.run_sync(to_english, native_try, ui_language)
                else:
                    user_msg_en = tmp or user_msg_original
            else:
                user_msg_en = tmp or user_msg_original
    if not user_msg_en:
        user_msg_en = await to_thread.run_sync(to_english, user_msg_original, None) or user_msg_original

    # Optional title rename (same)
    renamed = False
    if _is_default_title(current_title) and is_meaningful(user_msg_original):
        try:
            new_title = (make_session_title(user_msg_original) or "").strip()
            if new_title and new_title.lower() not in {"new chat", "new session", "untitled"}:
                await _set_session_name_all(db, session_id, user_email, new_title)
                current_title = new_title
                renamed = True
        except Exception:
            pass

    # Persist user turn (raw + EN)
    message_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    await execute(db, """
        INSERT INTO sessions (
          user_email, session_id, message_id, session_name,
          user_query_raw, user_query_en, created_time
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
    """, user_email, session_id, message_id, current_title or DEFAULT_TITLE, user_msg_original, user_msg_en, now_utc)

    # ---------- NEW: Relevancy + Enrichment ----------
    try:
        # run is_relevant in a thread to avoid blocking the event loop
        relevant = await asyncio.to_thread(is_relevant, user_msg_en, last_turns_en)
    except Exception as e:
        log.warning("relevancy check failed: %s", e)
        relevant = False

    if relevant:
        user_msg_for_adk = build_enriched_prompt(user_msg_en, last_turns_en)
    else:
        user_msg_for_adk = user_msg_en
    # -----------------------------------------------

    # Downstream KisanSaathi — exact payload; user_query may be enriched
    kis_url = settings.KISANSATHI_URL
    if not kis_url:
        bot_reply_en = f"[MOCK REPLY] You said: {user_msg_for_adk}"
        end_time_utc = datetime.now(timezone.utc)
    else:
        try:
            payload = {
                "user_email": user_email,
                "session_id": session_id,
                "message_id": message_id,
                "user_query": user_msg_for_adk,
                "meta": {"language": ui_language, "mode": mode, "pincode": pincode}
            }
            r = await _client().post(kis_url, json=payload)  # no client timeout
            r.raise_for_status()
            data = r.json() if r.content else {}
            bot_reply_en = (data.get("bot_reply") or "").strip()
            end_time_utc = _parse_end_time_to_utc(data.get("end_time"))
            if not bot_reply_en:
                bot_reply_en = "Sorry, I couldn't fetch the information at this moment."
        except Exception as e:
            log.warning("Downstream call failed: %s", e)
            bot_reply_en = "Sorry, I couldn't fetch the information at this moment."
            end_time_utc = datetime.now(timezone.utc)

    # Store EN reply
    await execute(db, """
        UPDATE sessions
        SET bot_message=$1, end_time=$2
        WHERE message_id=$3 AND session_id=$4 AND user_email=$5
    """, bot_reply_en, end_time_utc, message_id, session_id, user_email)

    # Localize reply for UI (translate only for display)
    if (ui_language or "en") == "en":
        bot_reply_ui = bot_reply_en
        session_name_ui = current_title or DEFAULT_TITLE
    else:
        bot_reply_ui = await to_thread.run_sync(translate_text, bot_reply_en, ui_language, "en")
        session_name_ui = await to_thread.run_sync(translate_text, current_title or DEFAULT_TITLE, ui_language, "en")

    log.info("Total /chat latency: %.3fs", time.time() - t0)

    return {
        "message_id": message_id,
        "session_id": session_id,
        "bot_msg": bot_reply_ui,    # UI-facing (translated if needed)
        "bot_msg_en": bot_reply_en, # exact EN from KisanSaathi (optional for QA)
        "user_email": user_email,
        "session_name": current_title or DEFAULT_TITLE,
        "session_name_ui": session_name_ui,
        "renamed": renamed,
        "relevance_used": bool(relevant)  # helpful for debugging
    }
