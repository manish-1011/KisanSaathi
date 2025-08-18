from typing import List, Tuple
import google.generativeai as genai
from config import settings

# Init Gemini
if settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

_MODEL_NAME = "gemini-2.0-flash"


def format_turns_for_prompt(turns: List[Tuple[str, str]]) -> str:
    """
    turns = list of (user_query, bot_message), oldest -> newest
    Formats into numbered 'Turn N' blocks, including bot reply when present.
    """
    lines = ["Previous context:"]
    for i, (u, b) in enumerate(turns, start=1):
        lines.append(f"Turn {i}")
        if u:
            lines.append(f"User: {u}")
        if b:
            lines.append(f"Bot: {b}")
    return "\n".join(lines)


def is_relevant(query: str, turns: List[Tuple[str, str]]) -> bool:
    """
    Ask Gemini to return strictly 'true' or 'false' (lowercase)
    whether the previous context is useful to answer the current query.
    Fallback to False if the key is missing or any error occurs.
    """
    if not settings.GOOGLE_API_KEY or not turns:
        return False
    try:
        history_text = format_turns_for_prompt(turns)
        prompt = f"""You are a strict relevance checker.

Decide if the following previous conversation is relevant to answering the user's current request.
Return strictly 'true' or 'false' (lowercase). No explanations.

{history_text}

Current task:
User now asks: "{query}"
Is the previous context relevant? (true/false only)"""

        model = genai.GenerativeModel(_MODEL_NAME)
        resp = model.generate_content(prompt)
        out = (resp.text or "").strip().lower()
        return out.startswith("t")  # 'true'
    except Exception:
        return False


def build_enriched_prompt(query: str, turns: List[Tuple[str, str]]) -> str:
    """
    Build the enriched prompt ADK should see when relevance=True.
    Includes both previous user and bot messages in a tidy structure.
    """
    history_text = format_turns_for_prompt(turns)
    return (
        f"{history_text}\n\n"
        "Current task:\n"
        f'User now asks: "{query}"\n'
        "Return a focused, helpful answer that stays consistent with the context."
    )
