# src/routers/translator.py
from __future__ import annotations

import html
import logging
import os
import time
from functools import lru_cache
from typing import Any, Dict, Iterable, List, Optional

import requests

try:
    from src.config import settings
except Exception:  # pragma: no cover
    settings = None  # type: ignore

log = logging.getLogger("translator")

BASE_URL = "https://translation.googleapis.com/language/translate/v2"
SUPPORTED_LANGS = {"en","hi","mr","gu","bn","ta","te","kn","ml","pa","or","as"}

def _norm_lang(lang: Optional[str]) -> Optional[str]:
    if not lang: return None
    primary = lang.strip().lower().replace(" ", "").split("-")[0].split("_")[0]
    return primary

def _get_api_key() -> Optional[str]:
    key = os.getenv("GOOGLE_TRANSLATE_API_KEY")
    if key: return key
    try:
        if settings:
            key = getattr(settings, "GOOGLE_TRANSLATE_API_KEY", None) or getattr(settings, "GOOGLE_API_KEY", None)
            if key:
                os.environ.setdefault("GOOGLE_TRANSLATE_API_KEY", key)
                return key
    except Exception:
        pass
    try:
        from dotenv import load_dotenv, find_dotenv  # type: ignore
        load_dotenv(find_dotenv(), override=False)
        key = os.getenv("GOOGLE_TRANSLATE_API_KEY")
        if key: return key
    except Exception:
        pass
    return None

def _google_translate_batch(
    texts: List[str],
    target_lang: str,
    source_lang: Optional[str] = None,
    timeout: int = 12,
    retries: int = 2,
) -> List[str]:
    key = _get_api_key()
    if not key:
        return texts

    target_lang = _norm_lang(target_lang) or "en"
    params: Dict[str, Any] = {"target": target_lang, "key": key}
    if source_lang:
        params["source"] = _norm_lang(source_lang) or source_lang
    data = [("q", t if t is not None else "") for t in texts]

    last_err: Optional[Exception] = None
    for attempt in range(retries + 1):
        try:
            r = requests.post(BASE_URL, params=params, data=data, timeout=timeout)
            r.raise_for_status()
            payload = r.json()
            translations = payload["data"]["translations"]
            return [html.unescape(tr.get("translatedText", "")) for tr in translations]
        except Exception as e:
            last_err = e
            log.warning("translate batch failed (attempt %s/%s): %s", attempt+1, retries+1, e)
            if attempt < retries:
                time.sleep(0.6 * (attempt + 1))
            else:
                break
    if last_err:
        log.warning("translate failed, returning originals: %s", last_err)
    return texts

def detect_languages(texts: List[str], timeout: int = 8) -> List[Optional[str]]:
    key = _get_api_key()
    if not key:
        return [None]*len(texts)
    try:
        url = f"{BASE_URL}/detect"
        params = {"key": key}
        data = [("q", t if t is not None else "") for t in texts]
        r = requests.post(url, params=params, data=data, timeout=timeout)
        r.raise_for_status()
        payload = r.json()
        out: List[Optional[str]] = []
        for lst in payload.get("data", {}).get("detections", []):
            if isinstance(lst, list) and lst:
                out.append(_norm_lang(lst[0].get("language")))
            else:
                out.append(None)
        while len(out) < len(texts):
            out.append(None)
        return out
    except Exception as e:
        log.warning("detect_languages failed: %s", e)
        return [None]*len(texts)

def detect_language(text: Optional[str]) -> Optional[str]:
    if not text or not text.strip():
        return None
    return detect_languages([text])[0]

@lru_cache(maxsize=50_000)
def _cached_translate_single(text: str, target_lang: str, source_lang: Optional[str]) -> str:
    return _google_translate_batch([text], target_lang, source_lang=source_lang)[0]

def translate_text(text: Optional[str], target_lang: str, source_lang: Optional[str] = None) -> Optional[str]:
    if text is None: return None
    if not text.strip(): return text
    target_lang = _norm_lang(target_lang) or "en"
    try:
        return _cached_translate_single(text, target_lang, source_lang)
    except Exception as e:
        log.warning("translate_text failed (fallback to original): %s", e)
        return text

def translate_many(texts: List[str], target_lang: str, source_lang: Optional[str] = None) -> List[str]:
    if not texts: return texts
    target_lang = _norm_lang(target_lang) or "en"
    try:
        return _google_translate_batch(texts, target_lang, source_lang=source_lang)
    except Exception as e:
        log.warning("translate_many failed (fallback to originals): %s", e)
        return texts

def translate_payload(payload: Any, target_lang: str, keys: Iterable[str], source_lang: Optional[str] = None) -> Any:
    target_lang = _norm_lang(target_lang) or "en"
    keys = set(keys)
    def _walk(node: Any) -> Any:
        if isinstance(node, dict):
            new = {}
            for k, v in node.items():
                if k in keys and isinstance(v, str):
                    new[k] = translate_text(v, target_lang, source_lang)
                else:
                    new[k] = _walk(v)
            return new
        elif isinstance(node, list):
            return [_walk(x) for x in node]
        else:
            return node
    return _walk(payload)

def to_english(text: Optional[str], source_lang: Optional[str] = None) -> Optional[str]:
    if text is None or not text.strip(): return text
    try:
        return _google_translate_batch([text], "en", source_lang=_norm_lang(source_lang))[0]
    except Exception as e:
        log.warning("to_english failed (fallback to original): %s", e)
        return text
