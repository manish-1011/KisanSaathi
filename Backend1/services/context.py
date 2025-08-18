# src/services/context.py
from typing import List, Tuple, Optional, Dict, Any
import json, re
from services.llm import get_model

# ---------- helpers ----------
def _format_turns_pairwise(turns: List[Tuple[str, str]]) -> str:
    lines = []
    for i, (u, b) in enumerate(turns, start=1):
        u = (u or "").strip()
        b = (b or "").strip()
        lines.append(f"Turn {i}:")
        lines.append(f"- User asked: {u if u else '(empty)'}")
        lines.append(f"- Bot replied: {b if b else '(no reply saved)'}")
    return "\n".join(lines)

def _safe_json(text: str) -> Optional[Dict[str, Any]]:
    # extract first {...} block; be tolerant to stray text
    m = re.search(r"\{[\s\S]*\}", text)
    if not m: 
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None

# ---------- LLM steps ----------
def relevance_score(current_query: str, turns: List[Tuple[str, str]]) -> float:
    """
    Ask for a numeric score 0..1 whether prior turns improve answering current query.
    Returns 0.0 on failure/missing.
    """
    if not turns:
        return 0.0
    model = get_model()
    prompt = f"""You are a strict relevance scorer.

Given paired chat history and a current user query, output JSON:
{{
  "relevance": 0.0_to_1.0
}}

Where 'relevance' is how useful the history is to answer the current query.

History (oldest → newest):
---
{_format_turns_pairwise(turns)}
---

Current query:
---
{current_query}
---"""
    try:
        resp = model.generate_content(prompt)
        obj = _safe_json(resp.text or "")
        if not obj: 
            return 0.0
        r = float(obj.get("relevance", 0.0))
        return max(0.0, min(1.0, r))
    except Exception:
        return 0.0

def compile_context(turns: List[Tuple[str, str]], max_chars: int = 1200) -> str:
    """
    Produce compact bullet facts from prior turns. Keep concise, actionable.
    """
    if not turns:
        return ""
    model = get_model()
    prompt = f"""Summarize the following paired turns as concise bullet "context facts"
that would help answer a follow-up question. Avoid fluff; keep ≤ {max_chars} characters.

Paired turns (oldest → newest):
---
{_format_turns_pairwise(turns)}
---

Return plain bullets, no preface, ≤ {max_chars} chars."""
    try:
        resp = model.generate_content(prompt)
        text = (resp.text or "").strip()
        # hard trim
        return text[:max_chars]
    except Exception:
        # naive fallback: take last 2 turns joined
        last = turns[-2:] if len(turns) >= 2 else turns
        return _format_turns_pairwise(last)[:max_chars]

def reformulate_query(user_query: str, language_hint: Optional[str] = None) -> str:
    """
    Make the user's query self-contained and clear (keep language if hinted).
    """
    model = get_model()
    lang = f" in {language_hint}" if language_hint else ""
    prompt = f"""Rewrite the user query{lang} to be clear, self-contained, and unambiguous,
without changing meaning. Keep it concise and actionable.

User query:
---
{user_query}
---

Return only the rewritten query text."""
    try:
        resp = model.generate_content(prompt)
        return (resp.text or "").strip()
    except Exception:
        return user_query.strip()

def enrich_for_adk(current_query: str, turns: List[Tuple[str, str]], lang_hint: Optional[str] = None) -> str:
    """
    Build the ADK-facing prompt:
      - Context facts (if helpful)
      - Rewritten self-contained query
      - Simple instructions for downstream agents
    """
    score = relevance_score(current_query, turns)
    if score < 0.6:
        # not relevant → just reformulate lightly for clarity
        rq = reformulate_query(current_query, language_hint=lang_hint)
        return rq

    facts = compile_context(turns)
    rq = reformulate_query(current_query, language_hint=lang_hint)
    final = (
        "Context facts from previous conversation:\n"
        f"{facts}\n\n"
        "Current user need (reformulated):\n"
        f"{rq}\n\n"
        "Instructions for downstream agent:\n"
        "- Respect the context facts if they don't conflict with the current need.\n"
        "- If data is missing (e.g., crop, area, dates), ask at most 1–2 clarifying questions, then proceed.\n"
        "- Keep the answer concise and actionable; add units and dates explicitly.\n"
    )
    return final
