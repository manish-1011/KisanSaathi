from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Optional
import uuid
from db import get_conn, fetchrow, execute

router = APIRouter(tags=["feedback"])
IST = ZoneInfo("Asia/Kolkata")

async def _session_exists(db, user_email: str, session_id: str) -> bool:
    row = await fetchrow(db, "SELECT 1 FROM sessions WHERE user_email=$1 AND session_id=$2 LIMIT 1",
                         user_email, session_id)
    return row is not None

@router.post("/feedback")
async def submit_feedback(body: dict):
    user_email = (body.get("user_email") or "").strip()
    session_id = (body.get("session_id") or "").strip()
    action = (body.get("action") or "").strip().lower()
    comment: Optional[str] = body.get("comment")

    if not (user_email and session_id and action):
        raise HTTPException(status_code=400, detail="user_email, session_id, action are required")
    if action not in {"up","down"}:
        raise HTTPException(status_code=400, detail="action must be 'up' or 'down'")

    db = await get_conn()
    if not await _session_exists(db, user_email, session_id):
        raise HTTPException(status_code=404, detail="Session not found for this user")

    feedback_id = str(uuid.uuid4())
    now_utc = datetime.now(timezone.utc)
    await execute(db, """
        INSERT INTO feedback (feedback_id, session_id, user_email, action, comment, created_time)
        VALUES ($1,$2,$3,$4,$5,$6)
    """, feedback_id, session_id, user_email, action, comment, now_utc)

    return {"status_code": 200, "data": {
        "feedback_id": feedback_id,
        "session_id": session_id,
        "user_email": user_email,
        "action": action,
        "comment": comment,
        "created_time": now_utc.astimezone(IST).isoformat()
    }}
