# src/utils/session_title.py
from typing import Optional
import os
import re

# Optional LLM (disabled by default to avoid latency)
USE_LLM = os.getenv("TITLE_USE_LLM", "false").strip().lower() in {"1", "true", "yes", "y"}

# If you do enable LLM titles, we’ll use Gemini only if a key exists.
try:
    import google.generativeai as genai  # type: ignore
    from config import settings  # to access GOOGLE_API_KEY if present
    if USE_LLM and getattr(settings, "GOOGLE_API_KEY", None):
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    else:
        genai = None  # type: ignore
except Exception:
    genai = None  # type: ignore

# --- Stop phrases / patterns ---
# Common greetings and "how are you" variants in English + romanized + a few native.
STOP_PHRASES = {
    # English
    "hi", "hello", "hey", "hii", "heyy",
    "ok", "okay", "thanks", "thank you", "start",
    "good morning", "good evening", "good afternoon",
    "how are you", "how are u", "how r you", "how r u",
    "what's up", "whats up", "whats going on", "what's going on",
    # Romanized Hindi/Marathi/others (very common)
    "namaste", "namaskar", "kaisa hai", "kaisi ho", "kaise ho",
    "kasa aahes", "kashi aahes", "kase ahes",  # marathi romanized
    "kem cho",  # gujarati
    "kemon acho",  # bengali
    "vanakkam",  # tamil greeting (rare in chat openers but included)
    "sat sri akaal", "sat sri akal",  # punjabi
    # Native script snippets (not exhaustive)
    "नमस्ते", "नमस्कार", "कैसे हो", "कैसी हो",
    "क्या हाल", "क्या हाल है",
    "কেমন আছো",  # Bengali
    "வணக்கம்",   # Tamil
    "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",  # Punjabi (Gurmukhi)
}

# Regex patterns to catch short greeting-y inputs like "hey there", "hru", "sup"
STOP_PATTERNS = [
    re.compile(r"^\s*h+i+\s*$", re.IGNORECASE),
    re.compile(r"^\s*he+y+\s*$", re.IGNORECASE),
    re.compile(r"^\s*ok(ay)?\s*$", re.IGNORECASE),
    re.compile(r"^\s*h(ow)?\s*r\s*u\s*\??\s*$", re.IGNORECASE),  # hru / how r u
    re.compile(r"^\s*(what'?s|whats)\s+up\??\s*$", re.IGNORECASE),
    re.compile(r"^\s*good\s+(morning|evening|afternoon)\s*$", re.IGNORECASE),
    re.compile(r"^\s*(thank\s+you|thanks)\s*$", re.IGNORECASE),
]

# Helpers
_WHITESPACE = re.compile(r"\s+")
_NON_ALNUM_SPACE = re.compile(r"[^0-9A-Za-z\u0900-\u0D7F\s]")  # allow Indic blocks + spaces

def _normalize(s: str) -> str:
    """Lowercase, strip, remove most punctuation but keep Indic letters."""
    s = (s or "").strip()
    s = _NON_ALNUM_SPACE.sub(" ", s)
    s = _WHITESPACE.sub(" ", s).strip()
    return s

def _first_letter_caps(s: str) -> str:
    s = s.strip()
    if not s:
        return s
    return s[0].upper() + s[1:]

def is_meaningful(text: str) -> bool:
    """
    Heuristic: return True only when the input looks contentful (not a greeting).
    No LLM/translation involved to keep latency minimal.
    """
    if not text or not text.strip():
        return False

    t_raw = text.strip()
    t = _normalize(t_raw).lower()

    # Quick outs for very short inputs
    if len(t) < 3:
        return False

    # Exact stop phrases
    if t in STOP_PHRASES:
        return False

    # Pattern-based stop checks
    for pat in STOP_PATTERNS:
        if pat.match(t_raw) or pat.match(t):
            return False

    # Require at least two "content" words OR a reasonable overall length
    tokens = [w for w in t.split() if len(w) > 2]
    if len(tokens) >= 2:
        return True

    # If only one content-ish token, allow when it’s long enough (e.g., "pomegranate")
    return len(t.replace(" ", "")) >= 10

def heuristic_title(text: str, max_words: int = 6) -> str:
    """
    Fast, local title: take the first few words from the original user text,
    clean up spacing, and capitalize the first letter. No LLM, zero added latency.
    """
    if not text:
        return "New Chat"
    # Keep original words, but collapse whitespace and strip quotes/punctuation
    cleaned = _WHITESPACE.sub(" ", re.sub(r'["“”\'`]+', "", text)).strip()
    words = cleaned.split()
    title = " ".join(words[:max_words]).strip()
    if not title:
        return "New Chat"
    # First-letter capital only
    return _first_letter_caps(title)[:60]

def _llm_title(text: str) -> Optional[str]:
    """
    Optional Gemini-based title (called only if USE_LLM is True and genai is configured).
    We keep it short and clean; falls back to None on any error.
    """
    if not (USE_LLM and genai):
        return None
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "Create a very short, clean chat title (<= 40 chars) from this message.\n"
            "No quotes, no emojis, sentence-case, no trailing punctuation.\n\n"
            f"Message:\n{text}"
        )
        resp = model.generate_content(prompt)
        cand = (getattr(resp, "text", None) or "").strip()
        if not cand:
            return None
        # Clean up
        cand = re.sub(r'["“”\'`]', "", cand)
        cand = re.sub(r"\s+", " ", cand).strip()
        cand = re.sub(r"[.?!:;,\-–—\s]+$", "", cand)
        return _first_letter_caps(cand)[:40] or None
    except Exception:
        return None

def make_session_title(user_text: str) -> str:
    """
    Decide a title for the (first meaningful) user message.
    By default uses the fast heuristic; if TITLE_USE_LLM=true and Gemini is configured,
    we try an LLM title once and fall back to the heuristic.
    """
    if USE_LLM and genai:
        t = _llm_title(user_text)
        if t:
            return t
    return heuristic_title(user_text)

