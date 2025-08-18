import os
import uuid
import json
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import google.generativeai as genai
from google.genai import types
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from KisanSathi.agent import root_agent
from KisanSathi.agent import generalized_agent

# Configure Google API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set")
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI(title="KisanSathi Backend")

class Meta(BaseModel):
    language: Optional[str] = None
    mode: Optional[str] = None
    pincode: Optional[str] = None

class KisanSathiRequest(BaseModel):
    user_email: str
    session_id: str
    message_id: str
    user_query: str
    meta: Meta = Field(default_factory=Meta)

class KisanSathiResponse(BaseModel):
    bot_reply: str
    end_time: str
    session_id: Optional[str] = None
    message_id: Optional[str] = None
    user_email: Optional[str] = None
    pincode: Optional[str] = None

# -------- Helper --------
async def run_root_agent(enriched_query: str, pincode: str, Agent: str) -> str:
    """Run the ADK root_agent once and return final text."""
    session_service = InMemorySessionService()
    adk_session_id = str(uuid.uuid4())

    await session_service.create_session(
        app_name="KisanSathi",
        session_id=adk_session_id,
        user_id="user1",
        state={"pincode": pincode}
    )

    runner = Runner(
        app_name="KisanSathi",
        agent=Agent,
        session_service=session_service
    )

    content = types.Content(role="user", parts=[types.Part(text=enriched_query)])

    final_text: Optional[str] = None
    async for event in runner.run_async(
        user_id="user1",
        session_id=adk_session_id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_text = event.content.parts[0].text
            break

    if not final_text:
        raise HTTPException(status_code=502, detail="No final response from agent")

    cleaned = re.sub(r"^```(?:json)?\n|```$", "", final_text.strip(), flags=re.IGNORECASE)
    return cleaned

# -------- Endpoint --------

@app.get("/")
async def root():
    return {"name": "KisanSathi Backend API", "status": "ok"}

@app.post("/KisanSaathi", response_model=KisanSathiResponse)
async def kisansaathi(req: KisanSathiRequest):
    if not (req.user_email and req.session_id and req.message_id and req.user_query):
        raise HTTPException(status_code=400, detail="user_email, session_id, message_id, user_query are required")

    pincode = (req.meta.pincode or "").strip()

    # NEW: build an enriched query the model will definitely read
    mode_str = "GENERAL" if (req.meta.mode or "").lower() == "general" else "PERSONALIZED"
    language = (req.meta.language or "en").strip() or "en"

    enriched_query = (
        "CONTEXT\n"
        f"PINCODE: {pincode}\n"
        f"MODE: {mode_str}\n"
        f"LANGUAGE: {language}\n"
        "AGENT RULES:\n"
        "- You already have the PINCODE above; never ask the user for it.\n"
        "- When fetching weather, call GET_AGRI_WEATHER_TOOL with the PINCODE shown above.\n"
        "\n"
        "USER QUERY\n"
        f"{req.user_query}"
    )
    print(req.user_query)

    try:
        if (req.meta.mode == "general"):
            # CHANGED: pass enriched_query (not raw user_query)
            bot_reply_text = await run_root_agent(enriched_query, pincode, generalized_agent)
        else:
            bot_reply_text = await run_root_agent(enriched_query, pincode, root_agent)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")

    end_time_iso = datetime.now(timezone.utc).isoformat()

    try:
        parsed = json.loads(bot_reply_text)
        bot_reply_text = json.dumps(parsed, ensure_ascii=False)
    except json.JSONDecodeError:
        pass

    import re
   # Replace multiple newlines (>1) with a single newline
    cleaned_text = re.sub(r"\n{2,}", "\n", bot_reply_text)

    return KisanSathiResponse(
        bot_reply=cleaned_text,
        end_time=end_time_iso,
        session_id=req.session_id,
        message_id=req.message_id,
        user_email=req.user_email,
        pincode=pincode or None,
    )
