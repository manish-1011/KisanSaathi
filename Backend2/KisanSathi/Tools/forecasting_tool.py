import os
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# --- NEW: reuse a single HTTP session (saves TCP/TLS setup time)
SESSION = requests.Session()

# --- NEW: small in-process cache for forecasts (TTL) + stale-ok fallback
_FORECAST_CACHE: Dict[str, Dict[str, Any]] = {}
_FORECAST_TTL = timedelta(minutes=8)         # fresh within 8 min
_LAST_GOOD_TTL = timedelta(hours=24)         # stale-ok within 24h

def _now_utc() -> datetime:
    return datetime.utcnow()

def _cache_get(key: str, allow_stale: bool = False):
    item = _FORECAST_CACHE.get(key)
    if not item:
        return None
    age = _now_utc() - item["ts"]
    if age <= _FORECAST_TTL:
        return item["value"]
    if allow_stale and age <= _LAST_GOOD_TTL:
        return item["value"]
    return None

def _cache_set(key: str, value: Dict[str, Any]):
    _FORECAST_CACHE[key] = {"ts": _now_utc(), "value": value}

@lru_cache(maxsize=256)
def get_lat_lon_from_pincode(pincode: str) -> Optional[Tuple[float, float]]:
    """Convert Indian pincode to (lat, lon) using OWM Geocoding API. LRU cached."""
    if not OPENWEATHERMAP_API_KEY:
        return None
    try:
        r = SESSION.get(
            "https://api.openweathermap.org/geo/1.0/zip",
            params={"zip": f"{pincode},IN", "appid": OPENWEATHERMAP_API_KEY},
            timeout=(0.5, 3.5),  # connect, read (tighter but safe)
        )
        r.raise_for_status()
        data = r.json()
        return float(data["lat"]), float(data["lon"])
    except Exception:
        return None


def _fmt_daily_record(d: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize one 'daily' item from /data/2.5/forecast/daily into JSON-safe dict."""
    ts = d.get("dt")
    date_str = datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d") if ts else "N/A"
    weather = (d.get("weather") or [{}])[0]
    desc = weather.get("description", "N/A")

    temp = d.get("temp") or {}
    t_day = temp.get("day")
    t_min = temp.get("min")
    t_max = temp.get("max")

    humidity = d.get("humidity")
    wind = d.get("speed") or d.get("wind_speed")  # daily API uses 'speed'
    clouds = d.get("clouds")
    rain_mm = d.get("rain")  # may be absent

    return {
        "date": date_str,
        "description": desc,
        "t_day_c": t_day,
        "t_min_c": t_min,
        "t_max_c": t_max,
        "humidity_pct": humidity,
        "wind_speed_ms": wind,
        "clouds_pct": clouds,
        "rain_mm": rain_mm,
    }


def get_agri_forecast_7d(pincode: str) -> Dict[str, Any]:
    """
    Tool: 7-day daily forecast for an Indian pincode using:
      https://api.openweathermap.org/data/2.5/forecast/daily?lat=..&lon=..&cnt=7&units=metric&appid=KEY
    Returns a concise 'report' + structured 'daily' list.

    NOTE: Same interface as before. Adds:
      - session reuse
      - 8 min fresh TTL + 24h stale-ok cache
      - tighter timeouts
      - graceful fallback ('degraded') if network is slow
    """
    cache_key = f"7d::{pincode}"

    # 1) Fresh cache hit?
    cached = _cache_get(cache_key, allow_stale=False)
    if cached:
        return cached

    if not OPENWEATHERMAP_API_KEY:
        out = {
            "status": "error",
            "error_message": "OPENWEATHERMAP_API_KEY not set.",
            "pincode": pincode,
            "lat": None,
            "lon": None,
            "days": 0,
            "report": None,
            "daily": [],
        }
        _cache_set(cache_key, out)
        return out

    coords = get_lat_lon_from_pincode(pincode)
    if not coords:
        # Try stale-ok cache before giving generic guidance
        stale = _cache_get(cache_key, allow_stale=True)
        if stale:
            out = {**stale, "status": "stale_ok", "error_message": None}
            _cache_set(cache_key, out)
            return out
        # Guidance-only fallback (keeps UX positive)
        return {
            "status": "degraded",
            "error_message": None,
            "pincode": pincode,
            "lat": None,
            "lon": None,
            "days": 0,
            "report": "Irrigation tip: Delay irrigation if local rain is expected; otherwise irrigate lightly in the evening. Check soil moisture at 5–7 cm before watering.",
            "daily": [],
        }

    lat, lon = coords

    try:
        r = SESSION.get(
            "https://api.openweathermap.org/data/2.5/forecast/daily",
            params={
                "lat": lat,
                "lon": lon,
                "cnt": 7,
                "units": "metric",
                "appid": OPENWEATHERMAP_API_KEY,
            },
            timeout=(0.6, 4.0),  # connect, read
        )
        r.raise_for_status()
        data = r.json()
        raw_list: List[Dict[str, Any]] = data.get("list", [])

        daily = [_fmt_daily_record(d) for d in raw_list]
        lines = []
        for d in daily:
            part = f"• {d['date']}: {d['description']}, min–max {d['t_min_c']}–{d['t_max_c']}°C"
            if d.get("rain_mm") is not None:
                part += f", rain ~{d['rain_mm']} mm"
            lines.append(part)
        report = "\n".join(lines) if lines else None

        out = {
            "status": "success",
            "error_message": None,
            "pincode": pincode,
            "lat": lat,
            "lon": lon,
            "days": len(daily),
            "report": report,
            "daily": daily,
        }
        _cache_set(cache_key, out)
        return out

    except Exception as e:
        # 2) On timeout/error → serve stale if available, else guidance-only
        stale = _cache_get(cache_key, allow_stale=True)
        if stale:
            out = {**stale, "status": "stale_ok", "error_message": None}
            _cache_set(cache_key, out)
            return out
        return {
            "status": "degraded",
            "error_message": f"Failed to fetch forecast: {e}",
            "pincode": pincode,
            "lat": lat,
            "lon": lon,
            "days": 0,
            "report": "Irrigation tip: Prefer evening irrigation; avoid waterlogging on heavy soils; skip irrigation if local showers occur.",
            "daily": [],
        }


# Optional quick test:
if __name__ == "__main__":
    out = get_agri_forecast_7d("721302")  # Mumbai GPO
    print(out["status"], "-", out.get("error_message"))
    print(out.get("report"))


