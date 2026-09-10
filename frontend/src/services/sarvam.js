/**
 * Sarvam AI frontend service — UnnatiSetu.ai
 *
 * All calls go through the FastAPI proxy at /api/sarvam/* so the
 * Sarvam API key is never exposed in browser code.
 *
 * Five capabilities:
 *  1. speechToText   — audio Blob → transcript string
 *  2. detectLanguage — transcript string → { language_code, lang_short }
 *  3. extractProfile — transcript string → structured applicant fields
 *  4. translateText  — text + target lang → translated string
 *  5. textToSpeech   — text + lang → decoded AudioBuffer (plays inline)
 *
 * Every function resolves even on failure — callers never see a thrown
 * error; instead they receive { success: false } and fall back to manual
 * input, preserving the design principle of zero dead-end errors.
 */

import { apiUrl } from './api';

const BASE = apiUrl('/api/sarvam');

// Language code map (matches AppContext SUPPORTED_LANGUAGES keys)
export const SARVAM_LANG_CODES = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
};

// ---------------------------------------------------------------------------
// 1. Speech-to-Text
// ---------------------------------------------------------------------------

/**
 * Sends a recorded audio Blob to Sarvam saaras:v3 for transcription.
 * Uses mode="transcribe" so the returned text is in the speaker's own language.
 *
 * @param {Blob} audioBlob  - Raw audio blob from MediaRecorder
 * @param {string} mimeType - e.g. "audio/webm" or "audio/wav"
 * @returns {Promise<{ transcript: string, language_code: string, success: boolean }>}
 */
export async function speechToText(audioBlob, mimeType = 'audio/webm') {
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
  const filename = `recording.${ext}`;

  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('filename', filename);

  try {
    const res = await fetch(`${BASE}/stt`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err?.detail?.message || err?.detail || res.statusText || 'STT Service Error';
      console.warn('[Sarvam STT] API error:', msg);
      return { transcript: '', language_code: 'en-IN', success: false, error: msg };
    }

    const data = await res.json();
    return {
      transcript: data.transcript || '',
      language_code: data.language_code || 'en-IN',
      success: true,
    };
  } catch (err) {
    console.warn('[Sarvam STT] Network error:', err.message);
    return { transcript: '', language_code: 'en-IN', success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// 2. Language Identification
// ---------------------------------------------------------------------------

/**
 * Identifies which of the 6 supported languages a text snippet is in.
 * Run this on the STT transcript to auto-set the UI language.
 *
 * @param {string} text
 * @returns {Promise<{ language_code: string, lang_short: string, success: boolean }>}
 */
export async function detectLanguage(text) {
  if (!text?.trim()) {
    return { language_code: 'en-IN', lang_short: 'en', success: false };
  }

  try {
    const res = await fetch(`${BASE}/lid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      return { language_code: 'en-IN', lang_short: 'en', success: false };
    }

    const data = await res.json();
    return {
      language_code: data.language_code || 'en-IN',
      lang_short: data.lang_short || 'en',
      success: data.success !== false,
    };
  } catch (err) {
    console.warn('[Sarvam LID] Network error:', err.message);
    return { language_code: 'en-IN', lang_short: 'en', success: false };
  }
}

// ---------------------------------------------------------------------------
// 3. Structured Profile Extraction
// ---------------------------------------------------------------------------

/**
 * Extracts structured applicant fields from a free-text transcript using
 * Sarvam chat/completions (sarvam-m). Only non-null fields are returned so
 * the caller can do a safe partial-merge with the existing profile state.
 *
 * IMPORTANT: this output is used only for form pre-population.
 * Eligibility decisions are made solely by the deterministic rules engine.
 *
 * @param {string} transcript
 * @returns {Promise<{
 *   extracted_profile: object,
 *   confidence_note: string,
 *   success: boolean
 * }>}
 */
export async function extractProfile(transcript) {
  if (!transcript?.trim()) {
    return { extracted_profile: {}, confidence_note: '', success: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${BASE}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { extracted_profile: {}, confidence_note: '', success: false };
    }

    const data = await res.json();
    return {
      extracted_profile: data.extracted_profile || {},
      confidence_note: data.confidence_note || '',
      success: data.success !== false,
    };
  } catch (err) {
    console.warn('[Sarvam Extract] Fast fallback due to network/timeout:', err.message);
    return { extracted_profile: {}, confidence_note: '', success: false };
  }
}

// ---------------------------------------------------------------------------
// 4. Translation
// ---------------------------------------------------------------------------

/**
 * Translates text to a target language.
 * Used by the admin dashboard to normalise applicant input to English while
 * keeping the original language version available for auditability.
 *
 * @param {string} text
 * @param {string} targetLangCode  - e.g. "en-IN"
 * @param {string} [sourceLangCode]
 * @returns {Promise<{ translated_text: string, success: boolean }>}
 */
export async function translateText(text, targetLangCode = 'en-IN', sourceLangCode = null) {
  if (!text?.trim()) {
    return { translated_text: text, success: false };
  }

  try {
    const body = { text, target_language_code: targetLangCode };
    if (sourceLangCode) body.source_language_code = sourceLangCode;

    const res = await fetch(`${BASE}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { translated_text: text, success: false };
    }

    const data = await res.json();
    return {
      translated_text: data.translated_text || text,
      success: data.success !== false,
    };
  } catch (err) {
    console.warn('[Sarvam Translate] Network error:', err.message);
    return { translated_text: text, success: false };
  }
}

// ---------------------------------------------------------------------------
// 5. Text-to-Speech
// ---------------------------------------------------------------------------

/**
 * Converts text to speech using Sarvam Bulbul and plays it in the browser.
 * The backend returns base64-encoded WAV; we decode it and play via the
 * Web Audio API — no <audio> element or object URL needed.
 *
 * @param {string} text
 * @param {string} langCode  - Sarvam language code, e.g. "hi-IN"
 * @returns {Promise<{ success: boolean }>}
 */
export async function speakText(text, langCode = 'hi-IN') {
  if (!text?.trim()) return { success: false };

  try {
    const res = await fetch(`${BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_language_code: langCode }),
    });

    if (!res.ok) {
      console.warn('[Sarvam TTS] API error:', res.statusText);
      return { success: false };
    }

    const data = await res.json();
    if (!data.audio_base64) return { success: false };

    // Decode base64 → ArrayBuffer → AudioBuffer → play
    const binaryStr = atob(data.audio_base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);

    return { success: true };
  } catch (err) {
    console.warn('[Sarvam TTS] Playback error:', err.message);
    return { success: false };
  }
}
