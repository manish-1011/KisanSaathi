from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, HTTPException
import uuid
from db import get_conn, execute

router = APIRouter(tags=["session"])
IST = ZoneInfo("Asia/Kolkata")

@router.post("/session")
async def create_session(body: dict):
    user_email = (body.get("user_email") or "").strip()
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")
    session_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    db = await get_conn()
    await execute(db, """
        INSERT INTO sessions (user_email, session_id, session_name, created_time)
        VALUES ($1,$2,'New Chat',$3)
    """, user_email, session_id, now_utc)
    return {"user_email": user_email, "session_id": session_id, "created_time": now_utc.astimezone(IST).isoformat()}

@router.post("/session/manage")
async def manage_session(body: dict):
    domain = (body.get("domain") or "").strip()
    user_email = (body.get("user_email") or "").strip()
    session_id = (body.get("session_id") or "").strip()

    db = await get_conn()
    if domain == "rename-session":
        new_name = (body.get("session_name") or "").strip()
        if not (user_email and session_id and new_name):
            raise HTTPException(status_code=400, detail="user_email, session_id, session_name required")
        res = await execute(db, "UPDATE sessions SET session_name=$1 WHERE user_email=$2 AND session_id=$3",
                            new_name, user_email, session_id)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Session not found")
        return {"status_code": 200}

    elif domain == "delete-session":
        if not (user_email and session_id):
            raise HTTPException(status_code=400, detail="user_email and session_id required")
        res = await execute(db, "DELETE FROM sessions WHERE user_email=$1 AND session_id=$2",
                            user_email, session_id)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Session not found")
        return {"status_code": 200}

    else:
        raise HTTPException(status_code=400, detail="Invalid domain")
