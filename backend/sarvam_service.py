"""
Sarvam AI service wrapper for UnnatiSetu.ai
Handles: Speech-to-Text, Language Identification, Translation,
         Structured Field Extraction (chat/completions), and Text-to-Speech.

Auth notes:
  - Chat/completions endpoint uses:  Authorization: Bearer <key>
  - Speech endpoints (STT/TTS) use:  api-subscription-key: <key>
  - All keys read from environment variable SARVAM_API_KEY — never hardcoded.
"""
import os
import json
import base64
from typing import Optional

import httpx

SARVAM_BASE_URL = "https://api.sarvam.ai"

# Language code mapping used across the platform
LANGUAGE_CODES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "bn": "bn-IN",
    "mr": "mr-IN",
    "te": "te-IN",
    "ta": "ta-IN",
}


def _get_api_key() -> str:
    key = os.environ.get("SARVAM_API_KEY", "")
    if not key:
        raise ValueError(
            "SARVAM_API_KEY environment variable is not set. "
            "Sign up at https://dashboard.sarvam.ai and add it to your .env file."
        )
    return key


def _speech_headers() -> dict:
    """Headers for STT / TTS endpoints."""
    return {"api-subscription-key": _get_api_key()}


def _chat_headers() -> dict:
    """Headers for chat/completions and NLP endpoints."""
    return {
        "Authorization": f"Bearer {_get_api_key()}",
        "Content-Type": "application/json",
    }


# ---------------------------------------------------------------------------
# 1. Speech-to-Text
# ---------------------------------------------------------------------------

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> dict:
    """
    Converts audio blob to text using Sarvam saaras:v3.
    mode='transcribe' preserves the user's own language in the output.

    Returns:
        {
            "transcript": str,
            "language_code": str,   # e.g. "hi-IN"
            "success": bool
        }
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/speech-to-text",
                headers=_speech_headers(),
                files={"file": (filename, audio_bytes, "audio/webm")},
                data={"model": "saaras:v3", "mode": "transcribe"},
            )
            response.raise_for_status()
            data = response.json()
            return {
                "transcript": data.get("transcript", ""),
                "language_code": data.get("language_code", "en-IN"),
                "success": True,
            }
    except Exception as exc:
        return {"transcript": "", "language_code": "en-IN", "success": False, "error": str(exc)}


# ---------------------------------------------------------------------------
# 2. Language Identification
# ---------------------------------------------------------------------------

async def detect_language(text: str) -> dict:
    """
    Identifies which of Sarvam's supported languages the text is in.

    Returns:
        {
            "language_code": str,   # e.g. "hi-IN"
            "lang_short": str,      # e.g. "hi"  (AppContext key)
            "success": bool
        }
    """
    try:
        async with httpx.AsyncClient(timeout=2.5) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/text-lid",
                headers=_chat_headers(),
                json={"input": text},
            )
            response.raise_for_status()
            data = response.json()
            lang_code = data.get("language_code", "en-IN")
            # Derive short code (hi-IN → hi)
            lang_short = lang_code.split("-")[0] if "-" in lang_code else lang_code
            return {"language_code": lang_code, "lang_short": lang_short, "success": True}
    except Exception as exc:
        return {"language_code": "en-IN", "lang_short": "en", "success": False, "error": str(exc)}


# ---------------------------------------------------------------------------
# 3. Translation
# ---------------------------------------------------------------------------

async def translate_text(text: str, target_language_code: str = "en-IN", source_language_code: Optional[str] = None) -> dict:
    """
    Translates text to the target language using Sarvam's /translate endpoint.
    Used to normalise applicant free-text to English for the backend rule engine
    and for NSFDC admin dashboard display.

    Returns:
        {
            "translated_text": str,
            "success": bool
        }
    """
    payload: dict = {
        "input": text,
        "target_language_code": target_language_code,
        "speaker_gender": "Female",
        "mode": "formal",
        "model": "mayura:v1",
    }
    if source_language_code:
        payload["source_language_code"] = source_language_code

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/translate",
                headers=_chat_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return {"translated_text": data.get("translated_text", text), "success": True}
    except Exception as exc:
        return {"translated_text": text, "success": False, "error": str(exc)}


# ---------------------------------------------------------------------------
# 4. Structured Field Extraction via Chat/Completions
# ---------------------------------------------------------------------------

EXTRACTION_SYSTEM_PROMPT = """You are a structured data extraction assistant for UnnatiSetu.ai, a government credit-scheme matching system for marginalized entrepreneurs in India.

Extract the following fields from the applicant's spoken or typed input and return ONLY valid JSON with exactly these keys. If a field is not mentioned, return null for that field — never guess or infer.

Fields to extract:
- name: applicant's name (string or null)
- gender: "Male", "Female", or "Other" (or null)
- category: "SC", "ST", "OBC", or "General" (or null). SC = Scheduled Caste / Dalit / अनुसूचित जाति. ST = Scheduled Tribe / Tribal / आदिवासी.
- annual_income: annual income in INR as a number (or null). Convert "1.2 lakh" to 120000.
- locality: "Rural" or "Urban" (or null)
- state: Indian state name in English (or null)
- district: district name in English (or null)
- business_type: one of "Micro Enterprise", "Dairy/Agri", "Beauty Parlour", "Tailoring", "Transport", "E-Rickshaw", "Manufacturing", "Services", "Retail Shop" (or null if unclear)
- loan_amount_requested: loan amount in INR as a number (or null). Convert "1 lakh" to 100000.

Return ONLY the JSON object, no explanation, no markdown fences."""


def _local_regex_extract(transcript: str) -> dict:
    """Fast local fallback NLP parser for profile fields from text."""
    import re
    p = {}
    lower = transcript.lower()

    # Category
    if re.search(r'\b(sc|scheduled caste|दलित|अनुसूचित जाति)\b', lower):
        p["category"] = "SC"
    elif re.search(r'\b(st|scheduled tribe|आदिवासी|अनुसूचित जनजाति)\b', lower):
        p["category"] = "ST"
    elif re.search(r'\b(obc|other backward|पिछड़ा)\b', lower):
        p["category"] = "OBC"

    # Gender
    if re.search(r'\b(female|woman|महिला|महिा|महिलाएं|श्रीमती|देवी|lady)\b', lower):
        p["gender"] = "Female"
    elif re.search(r'\b(male|man|पुरुष|आदमी|श्री)\b', lower):
        p["gender"] = "Male"

    # Amounts (e.g. 1.2 lakh, ₹1,00,000, 100000)
    lakh_matches = re.findall(r'(?:₹|rs\.?|inr)?\s*([\d\.]+)\s*(?:lakh|lacs?|लाख)', lower)
    if lakh_matches:
        try:
            val = float(lakh_matches[0]) * 100000
            p["loan_amount_requested"] = val
        except ValueError:
            pass

    raw_nums = re.findall(r'(?:₹|rs\.?|inr)?\s*([\d,]{5,8})', lower)
    if raw_nums and "loan_amount_requested" not in p:
        try:
            val = float(raw_nums[0].replace(',', ''))
            if val >= 10000:
                p["loan_amount_requested"] = val
        except ValueError:
            pass

    # Business sector
    if re.search(r'\b(dairy|cow|buffalo|cattle|milk|डेयरी|पशुपालन|किसान)\b', lower):
        p["business_type"] = "Dairy/Agri"
    elif re.search(r'\b(beauty|parlour|salon|ब्यूटी पार्लर|ब्यूटी)\b', lower):
        p["business_type"] = "Beauty Parlour"
    elif re.search(r'\b(tailor|tailoring|boutique|sewing|कपड़ा|सिलाई)\b', lower):
        p["business_type"] = "Tailoring"
    elif re.search(r'\b(transport|vehicle|auto|taxi|रिक्शा|परिवहन)\b', lower):
        p["business_type"] = "Transport"
    elif re.search(r'\b(e-rickshaw|e rickshaw|green|solar|ई-रिक्शा)\b', lower):
        p["business_type"] = "E-Rickshaw"
    elif re.search(r'\b(grocery|retail|shop|kirana|दुकान|किराना)\b', lower):
        p["business_type"] = "Micro Enterprise"

    # State / District
    if "lucknow" in lower or "up" in lower or "uttar pradesh" in lower or "उत्तर प्रदेश" in lower:
        p["state"] = "Uttar Pradesh"
        if "lucknow" in lower or "लखनऊ" in lower:
            p["district"] = "Lucknow"
    elif "bihar" in lower or "patna" in lower or "बिहार" in lower or "पटना" in lower:
        p["state"] = "Bihar"
        if "patna" in lower or "पटना" in lower:
            p["district"] = "Patna"
    elif "delhi" in lower or "दिल्ली" in lower:
        p["state"] = "Delhi"
        p["district"] = "Central Delhi"
    elif "mumbai" in lower or "maharashtra" in lower or "महाराष्ट्र" in lower:
        p["state"] = "Maharashtra"
        p["district"] = "Mumbai"

    return p


async def extract_profile_from_text(transcript: str) -> dict:
    """
    Extracts structured applicant fields from free-form text using Sarvam AI (sarvam-m).
    Falls back to local rule-based NLP if SARVAM_API_KEY is not set or call fails/times out.
    """
    local_p = _local_regex_extract(transcript)
    try:
        payload = {
            "model": "sarvam-m",
            "messages": [
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": transcript},
            ],
            "temperature": 0.0,
            "max_tokens": 512,
        }

        async with httpx.AsyncClient(timeout=2.5) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/chat/completions",
                headers=_chat_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

            raw_content = data["choices"][0]["message"]["content"].strip()
            if raw_content.startswith("```"):
                raw_content = raw_content.split("```")[1]
                if raw_content.startswith("json"):
                    raw_content = raw_content[4:]
            extracted = json.loads(raw_content)

        clean_profile = {k: v for k, v in extracted.items() if v is not None}
        # Merge local regex findings to ensure full coverage
        merged_profile = {**local_p, **clean_profile}
        return {
            "extracted_profile": merged_profile,
            "confidence_note": "Extracted via Sarvam AI & Local Intelligent NLP Engine",
            "success": True,
        }
    except Exception as exc:
        print(f"[Sarvam AI] Fast extraction fallback to local regex parser due to: {exc}")
        return {
            "extracted_profile": local_p,
            "confidence_note": "Extracted via Fast Local Intelligent NLP Engine",
            "success": True if local_p else False,
        }


# ---------------------------------------------------------------------------
# 5. Text-to-Speech
# ---------------------------------------------------------------------------

async def text_to_speech(text: str, target_language_code: str = "hi-IN") -> dict:
    """
    Converts text to speech using Sarvam Bulbul model.
    Response contains base64-encoded audio in audios[] array.

    Returns:
        {
            "audio_base64": str,   # decode → play in browser
            "success": bool
        }
    """
    # Sarvam TTS has a ~500-char limit per request; truncate gracefully
    truncated_text = text[:500] if len(text) > 500 else text

    payload = {
        "inputs": [truncated_text],
        "target_language_code": target_language_code,
        "speaker": "meera",
        "model": "bulbul:v1",
        "enable_preprocessing": True,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{SARVAM_BASE_URL}/text-to-speech",
                headers=_speech_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            audios = data.get("audios", [])
            if not audios:
                raise ValueError("No audio returned from Sarvam TTS")
            return {"audio_base64": audios[0], "success": True}
    except Exception as exc:
        return {"audio_base64": "", "success": False, "error": str(exc)}
