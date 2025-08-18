from fastapi import APIRouter, HTTPException
from typing import Optional
from db import get_conn, fetchrow, execute
from routers.translator import _norm_lang

router = APIRouter(tags=["user-info"])

def _normalize_mode(mode: Optional[str]) -> Optional[str]:
    if not mode: return None
    m = mode.strip().lower()
    if m not in ("general","personal"):
        raise HTTPException(status_code=400, detail="mode must be 'general' or 'personal'")
    return m

def _normalize_lang(lang: Optional[str]) -> Optional[str]:
    return _norm_lang(lang) if lang else None

def _normalize_pincode(pin: Optional[str]) -> Optional[str]:
    if pin is None or str(pin).strip() == "": return None
    p = str(pin).strip()
    if not p.isdigit() or len(p) != 6:
        raise HTTPException(status_code=400, detail="pincode must be a 6-digit number")
    return p

@router.post("/user-info/get")
async def get_user_info(body: dict):
    user_email = (body.get("user_email") or "").strip()
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")
    db = await get_conn()
    row = await fetchrow(db, "SELECT mode, language, pincode FROM user_information WHERE user_email=$1", user_email)
    if not row:
        return {"status_code": 200, "data": {"mode":"general","language":"en","pincode":None}}
    return {"status_code": 200, "data": {
        "mode": row["mode"] or "general",
        "language": row["language"] or "en",
        "pincode": row["pincode"]
    }}

@router.post("/user-info/update")
async def update_user_info(body: dict):
    user_email = (body.get("user_email") or "").strip()
    if not user_email:
        raise HTTPException(status_code=400, detail="user_email is required")

    mode     = _normalize_mode(body.get("mode"))
    language = _normalize_lang(body.get("language"))
    pincode  = _normalize_pincode(body.get("pincode"))

    if mode is None and language is None and pincode is None:
        return {"status_code": 200, "message": "Nothing to update."}

    db = await get_conn()
    await execute(db, "INSERT INTO user_information (user_email) VALUES ($1) ON CONFLICT (user_email) DO NOTHING", user_email)

    sets, vals = [], []
    if mode is not None:     sets.append("mode=$%d" % (len(vals)+1));     vals.append(mode)
    if language is not None: sets.append("language=$%d" % (len(vals)+1)); vals.append(language)
    if pincode is not None:  sets.append("pincode=$%d" % (len(vals)+1));  vals.append(pincode)
    vals.append(user_email)

    await execute(db, f"UPDATE user_information SET {', '.join(sets)} WHERE user_email=${len(vals)}", *vals)
    return {"status_code": 200, "message": "User information updated."}
