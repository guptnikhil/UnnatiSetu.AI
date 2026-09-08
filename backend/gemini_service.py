"""
Gemini API service wrapper for UnnatiSetu.ai backend.
Uses official google-genai SDK with gemini-3.7-flash for high-precision,
multilingual structured profile extraction and entity understanding.
"""
import os
import json
from typing import Dict, Any, Optional

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


EXTRACTION_SYSTEM_PROMPT = """You are a structured data extraction assistant for UnnatiSetu.ai, a credit-scheme matching platform for marginalized entrepreneurs in India.

Extract structured fields from the applicant's spoken or typed input. Return ONLY valid JSON with these keys:
- name: applicant's name (string or null)
- gender: "Male", "Female", or "Other" (or null)
- category: "SC", "ST", "OBC", or "General" (or null). (SC = Scheduled Caste / Dalit / अनुसूचित जाति. ST = Scheduled Tribe / Tribal / आदिवासी).
- annual_income: annual income in INR as a float (or null). Convert "1.2 lakh" to 120000.
- locality: "Rural" or "Urban" (or null)
- state: Indian state name in English (or null)
- district: district name in English (or null)
- business_type: one of "Micro Enterprise", "Dairy/Agri", "Beauty Parlour", "Tailoring", "Transport", "E-Rickshaw", "Manufacturing", "Services", "Small Retail", "Food Processing" (or null if unclear)
- loan_amount_requested: loan amount in INR as a float (or null). Convert "1.5 lakh" to 150000.

Return ONLY the JSON object, no explanation, no markdown fences."""


def is_gemini_configured() -> bool:
    """Returns True if GEMINI_API_KEY environment variable is present."""
    return bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))


async def extract_profile_gemini(transcript: str) -> Dict[str, Any]:
    """
    Uses Gemini API to extract structured applicant fields from free-form multilingual text.
    Iterates through models (gemini-2.5-flash, gemini-3.7-flash, gemini-2.5-pro) to handle temporary 503 spikes gracefully.
    """
    if not GEMINI_AVAILABLE:
        return {"extracted_profile": {}, "confidence_note": "google-genai SDK not installed", "success": False}

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return {"extracted_profile": {}, "confidence_note": "GEMINI_API_KEY missing", "success": False}

    models_to_try = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview"]
    client = genai.Client(api_key=api_key)

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"[Gemini AI] Trying extraction with model: {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=transcript,
                config=types.GenerateContentConfig(
                    system_instruction=EXTRACTION_SYSTEM_PROMPT,
                    temperature=0.0,
                    response_mime_type="application/json"
                )
            )

            raw_text = response.text.strip()
            extracted = json.loads(raw_text)
            clean_profile = {k: v for k, v in extracted.items() if v is not None}

            print(f"[Gemini AI] Successfully extracted profile via {model_name}: {clean_profile}")
            return {
                "extracted_profile": clean_profile,
                "confidence_note": f"Extracted via Gemini API ({model_name})",
                "success": True
            }
        except Exception as exc:
            last_error = exc
            print(f"[Gemini AI] {model_name} failed: {exc}. Trying next model...")

    return {
        "extracted_profile": {},
        "confidence_note": f"Gemini extraction error: {last_error}",
        "success": False
    }
