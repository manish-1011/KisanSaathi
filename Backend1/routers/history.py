# routers/history.py
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import asyncio  # needed for asyncio.to_thread
from db import get_conn, fetch, fetchrow
from routers.translator import translate_many, _norm_lang

router = APIRouter(tags=["history"])
IST = ZoneInfo("Asia/Kolkata")

async def _get_user_lang_from_db(user_email: str) -> str:
    db = await get_conn()
    row = await fetchrow(db, "SELECT language FROM user_information WHERE user_email=$1", user_email)
    lang = (row["language"] if row else None) or "en"
    return _norm_lang(lang) or "en"

@router.post("/history")
async def history(body: dict):
    domain = (body.get("domain") or "").strip()
    language_body = (body.get("language") or "").strip()

    if domain == "session-chat":
        user_email = (body.get("user_email") or "").strip()
        session_id = (body.get("session_id") or "").strip()
        if not (user_email and session_id):
            raise HTTPException(status_code=400, detail="user_email and session_id are required")

        target_lang = _norm_lang(language_body) if language_body else await _get_user_lang_from_db(user_email)
        if not target_lang:
            target_lang = "en"

        db = await get_conn()
        rows = await fetch(db, """
            SELECT message_id,
                   COALESCE(user_query_en, user_query_raw) AS user_query_en,
                   bot_message,
                   created_time, end_time
            FROM sessions
            WHERE user_email=$1 AND session_id=$2
              AND message_id IS NOT NULL
              AND NOT (
                (COALESCE(user_query_en, user_query_raw) IS NULL OR btrim(COALESCE(user_query_en, user_query_raw)) = '')
                AND (bot_message IS NULL OR btrim(bot_message) = '')
              )
            ORDER BY created_time ASC
        """, user_email, session_id)

        mids, user_en, bot_en, meta = [], [], [], []
        for r in rows:
            mids.append(r["message_id"])
            user_en.append(r["user_query_en"] or "")
            bot_en.append(r["bot_message"] or "")
            created = r["created_time"].astimezone(IST).isoformat() if r["created_time"] else None
            ended   = r["end_time"].astimezone(IST).isoformat() if r["end_time"] else None
            meta.append((created, ended))

        if target_lang != "en" and (user_en or bot_en):
            # run sync translator in a thread to avoid blocking the event loop
            user_disp = await asyncio.to_thread(translate_many, user_en, target_lang, "en")
            bot_disp  = await asyncio.to_thread(translate_many, bot_en,  target_lang, "en")
        else:
            user_disp, bot_disp = user_en, bot_en

        data = []
        for i, mid in enumerate(mids):
            created, ended = meta[i]
            data.append({
                "message_id": mid,
                "user_query": user_disp[i] or "",
                "bot_message": bot_disp[i] or "",
                "created_time": created,
                "end_time": ended,
            })
        return {"status_code": 200, "data": data}

    elif domain == "list-session":
        user_email = (body.get("user_email") or "").strip()
        limit = int(body.get("limit", 25))
        offset = int(body.get("offset", 0))
        if not user_email:
            raise HTTPException(status_code=400, detail="user_email is required")

        target_lang = _norm_lang(language_body) if language_body else await _get_user_lang_from_db(user_email)
        if not target_lang:
            target_lang = "en"

        db = await get_conn()
        rows = await fetch(db, """
            SELECT session_id, COALESCE(session_name, 'Welcome') AS session_name,
                   MAX(created_time) AS last_activity
            FROM sessions
            WHERE user_email=$1
            GROUP BY session_id, session_name
            ORDER BY last_activity DESC
            LIMIT $2 OFFSET $3
        """, user_email, limit, offset)

        now_ist = datetime.now(timezone.utc).astimezone(IST)
        groups = {"Today": [], "Yesterday": [], "Past 7 days": [], "Past Month": [], "Older than a month": []}

        items, names = [], []
        for r in rows:
            last_ist = r["last_activity"].astimezone(IST)
            diff_days = (now_ist.date() - last_ist.date()).days
            nm = r["session_name"] or "Welcome"
            items.append((r["session_id"], nm, last_ist, diff_days))
            names.append(nm)

        if target_lang != "en" and names:
            names_ui = await asyncio.to_thread(translate_many, names, target_lang)
        else:
            names_ui = names

        for (sid, _name, last_ist, diff_days), nm_ui in zip(items, names_ui):
            it = {"session_id": str(sid), "session_name": nm_ui, "created_time": last_ist.isoformat()}
            if diff_days == 0:
                groups["Today"].append(it)
            elif diff_days == 1:
                groups["Yesterday"].append(it)
            elif diff_days <= 7:
                groups["Past 7 days"].append(it)
            elif diff_days <= 30:
                groups["Past Month"].append(it)
            else:
                groups["Older than a month"].append(it)

        return {"status_code": 200, "data": groups}

    else:
        raise HTTPException(status_code=400, detail="Invalid domain")
