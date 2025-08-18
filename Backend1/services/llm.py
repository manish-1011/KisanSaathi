# src/services/llm.py
import google.generativeai as genai
from config import settings

def get_model():
    if not settings.GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY not set")
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config={
            "temperature": 0,
            "top_p": 0.1,
            "top_k": 32,
        },
        safety_settings={
            "HARASSMENT": "BLOCK_NONE",
            "HATE_SPEECH": "BLOCK_NONE",
            "SEXUAL_CONTENT": "BLOCK_NONE",
            "DANGEROUS_CONTENT": "BLOCK_NONE",
        },
    )
