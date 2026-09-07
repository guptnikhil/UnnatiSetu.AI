# UnnatiSetu.AI

**AI-Assisted Concessional Credit Matching for Marginalized Entrepreneurs**

A Smart India Hackathon 2026 (SIH26092) prototype by Team The Innovators.

UnnatiSetu.ai is a multilingual, voice-first platform that connects SC/ST/OBC entrepreneurs with NSFDC government loan schemes through deterministic eligibility matching, EMI simulation, and capacity-ranked channel partner routing — with zero black-box rejections.

---

## Features

✅ **Multilingual Voice Input** — Speak in English, Hindi, Marathi, Bengali, Tamil, or Telugu. Automatic language detection switches the UI.

✅ **Structured Field Extraction** — Voice/text → structured applicant profile via Sarvam AI (with rule-based fallback).

✅ **Deterministic Eligibility Engine** — 100% explainable rule-based scheme matching (never uses AI for the eligibility decision).

✅ **Text-to-Speech Explanations** — Low-literacy users can hear why they qualify, not just read it.

✅ **Admin Dashboard Translation** — NSFDC officers see applicant transcripts in English with a single-click toggle to the original language.

✅ **Geo-spatial Partner Ranking** — Matches applicants with the nearest, highest-capacity channel partners.

✅ **EMI & Affordability Simulator** — Full amortization schedule with moratorium support and market comparison.

---

## Tech Stack

**Backend:** Python 3.11+, FastAPI, Pydantic, httpx  
**Frontend:** React 19, Vite 8, Tailwind CSS v4, Recharts, Lucide icons  
**AI/ML:** Sarvam AI (saaras:v3 STT, Bulbul TTS, mayura:v1 translate, sarvam-m chat)

---

## Getting Started

### Prerequisites

- Python 3.11+ with `pip`
- Node.js 18+ with `npm`
- Sarvam AI API key (free tier available at [dashboard.sarvam.ai](https://dashboard.sarvam.ai))

---

## Backend Setup

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example env file and add your Sarvam API key:

```bash
cp .env.example .env
```

Edit `.env` and set:

```bash
SARVAM_API_KEY=your_actual_api_key_here
```

**Where to get your Sarvam API key:**

1. Sign up at [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Navigate to "API Keys" in the dashboard
3. Create a new key and copy it

**Without this key:**
- Voice transcription will fail gracefully → user can type instead
- Structured extraction falls back to the rule-based NLP parser
- TTS and translation features won't work, but the core eligibility engine remains functional

### 4. Run the FastAPI Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

**API Documentation (Swagger):** `http://localhost:8000/docs`

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

**Proxy Configuration:** Vite automatically proxies `/api/*` and `/ws/*` requests to the FastAPI backend at `localhost:8000` (configured in `vite.config.js`).

---

## Testing the Voice Flow (End-to-End)

1. Open `http://localhost:3000` in Chrome/Edge (Safari has limited MediaRecorder support)
2. Navigate to **Applicant Portal → Step 1: Profile Intake**
3. Click the **"Click to Speak (Voice Input)"** button
4. Grant microphone permissions when prompted
5. Speak in any of the 6 supported languages, e.g.:
   - English: _"I am Ramesh from Lucknow. I need a loan of 1 lakh rupees for a grocery shop."_
   - Hindi: _"मैं सुनीता देवी हूँ। मुझे डेयरी फार्म के लिए 1.2 लाख रुपये का ऋण चाहिए।"_
6. Click the button again to stop recording
7. Watch the transcript appear in the text box and the fields auto-populate
8. Click **"Evaluate Eligibility & Match Schemes"**
9. On the Scheme Match screen (Step 2), click the **speaker icon** next to any scheme card to hear the eligibility explanation read aloud

---

## Testing the Admin Dashboard Translation

1. Open `http://localhost:3000` and switch to **NSFDC Admin Dashboard** (button in top nav)
2. Click the **chevron down icon** next to any applicant row to expand it
3. The **Applicant Intake Transcript** panel shows the original voice/text input
4. Click **"View in English"** to see the Sarvam-translated version
5. Click **"Show Original"** to toggle back — the original is never lost

---

## Project Structure

```
UnnatiSetu.AI/
├── backend/
│   ├── main.py                 # FastAPI app + all routes
│   ├── sarvam_service.py       # Sarvam AI service wrapper (STT, LID, translate, extract, TTS)
│   ├── rules_engine.py         # Deterministic 5-rule eligibility evaluator
│   ├── financial_engine.py     # EMI calculator + amortization schedule
│   ├── partner_ranker.py       # Haversine + composite scoring
│   ├── synthetic_data.py       # 5 NSFDC schemes, 6 channel partners, sample applicants
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AppContext.jsx  # Global state + Sarvam integration hooks
    │   ├── services/
    │   │   └── sarvam.js       # Frontend Sarvam API client (5 functions)
    │   ├── components/
    │   │   ├── applicant/
    │   │   │   ├── ConversationalIntake.jsx       # Voice input + field extraction
    │   │   │   ├── SchemeRecommender.jsx          # Eligibility cards + TTS
    │   │   │   ├── EMICalculator.jsx
    │   │   │   ├── PartnerLocator.jsx
    │   │   │   └── DocumentChecklist.jsx
    │   │   └── admin/
    │   │       └── AdminDashboard.jsx              # Transcript translation toggle
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## API Endpoints

### Scheme Matching & Financial

- `POST /api/recommend` — Evaluates applicant against all schemes
- `POST /api/calculate-emi` — Returns full loan schedule + affordability color
- `POST /api/rank-partners` — Geo + capacity ranked channel partners
- `POST /api/nlp/parse` — Rule-based keyword extraction (fallback)

### Sarvam AI (all gracefully degrade on failure)

- `POST /api/sarvam/stt` — Speech-to-text (multipart audio upload)
- `POST /api/sarvam/lid` — Language identification
- `POST /api/sarvam/extract` — Structured profile extraction from text
- `POST /api/sarvam/translate` — Text translation (used by admin dashboard)
- `POST /api/sarvam/tts` — Text-to-speech (returns base64 WAV)

### Admin

- `GET /api/admin/metrics` — KPI aggregations
- `GET /api/admin/applicants?status=X&state=Y` — Filterable applicant list
- `POST /api/admin/applicant-status` — Update status + broadcast via WebSocket

---

## Design Principles

### 1. AI for Language, Not for Decisions

Sarvam AI is used **only** for:
- Converting speech → text
- Extracting structured fields from free text
- Translating for admin readability
- Reading explanations aloud

The **eligibility decision** is made entirely by `rules_engine.py` — a deterministic 5-rule evaluator with full audit trails. This ensures:
- Zero false rejections
- 100% explainability (every passed/failed rule is shown in English + Hindi)
- Government auditability

### 2. Graceful Degradation

Every Sarvam API call has a fallback:
- STT fails → user types instead
- Extraction fails → rule-based NLP parser kicks in
- TTS fails → button does nothing (silent, no error modal)
- Translation fails → shows original text only

The core eligibility engine works **fully offline** without Sarvam.

### 3. Trust Over Hype

The UI avoids ML hype language. Instead of "AI-powered match," it says "Evaluated against deterministic NSFDC guidelines. 100% explainable & auditable." The design system uses deep green (#1F5C3F) for trust, amber (#B8860B) for actions, and never uses red for "denied" states — everything is framed as "not yet eligible, here's why."

---

## Supported Languages

| Language | Code | Voice Input | UI Translation | TTS Output |
|----------|------|-------------|----------------|------------|
| English | `en-IN` | ✅ | ✅ | ✅ |
| Hindi | `hi-IN` | ✅ | ✅ | ✅ |
| Bengali | `bn-IN` | ✅ | ✅ | ✅ |
| Marathi | `mr-IN` | ✅ | ✅ | ✅ |
| Telugu | `te-IN` | ✅ | ✅ | ✅ |
| Tamil | `ta-IN` | ✅ | ✅ | ✅ |

---

## Troubleshooting

### Voice input not working

- **Chrome/Edge required:** Safari has limited MediaRecorder support
- **Microphone permissions:** Check browser settings if "access denied" appears
- **HTTPS required in production:** MediaRecorder only works on `localhost` or HTTPS

### Sarvam API errors

- Check that `SARVAM_API_KEY` is set in `backend/.env`
- Verify the key is valid at [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
- Check backend console for error details (`uvicorn` logs)

### Frontend not connecting to backend

- Confirm backend is running on `localhost:8000`
- Check Vite proxy config in `frontend/vite.config.js`
- Open browser DevTools → Network tab to see if API calls are reaching the backend

---

## Deployment Notes

### Backend

- Set `SARVAM_API_KEY` as an environment variable in your hosting platform (Railway, Render, AWS, etc.)
- Use `uvicorn main:app --host 0.0.0.0 --port $PORT` for cloud deployment
- Consider rate-limiting on Sarvam endpoints if using free tier

### Frontend

- Build: `npm run build` (outputs to `dist/`)
- Proxy `/api/*` requests to your deployed FastAPI backend URL
- Serve over HTTPS (required for MediaRecorder in production)

---

## License

This is a Smart India Hackathon 2026 prototype. Built by Team The Innovators.

---

## Acknowledgments

- **Sarvam AI** for Indian-language-first speech and NLP APIs
- **NSFDC** for the concessional credit scheme data structure
- **Smart India Hackathon 2026** for the problem statement (SIH26092)

---

## Supabase Setup

Supabase provides the Postgres database, Row Level Security, NSFDC admin authentication, and file storage. The app runs fully without it (in-memory demo mode), but you'll want it connected for real data persistence.

### 1. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a free project
2. Note your **Project URL** and **API keys** from Project Settings → API

### 2. Run the Migrations

In the Supabase dashboard, open the **SQL Editor** and run the migrations in order:

```
supabase/migrations/20260101000000_initial_schema.sql   ← tables + RLS + storage bucket
supabase/migrations/20260101000001_seed_data.sql        ← 5 schemes, 15 partners, 8 demo applicants
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**

```bash
cp backend/.env.example backend/.env
```

Add your three Supabase values:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key ⚠️ never expose to browser |

**Frontend (`frontend/.env`):**

```bash
cp frontend/.env.example frontend/.env
```

Add only the two public-safe values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

The service role key **must never appear** in any `VITE_` prefixed variable.

### 4. Create the First Admin User

Applicants never log in. Only NSFDC officers need accounts.

**Step 1 — Create the auth user** (Supabase Dashboard → Authentication → Users → Invite):

```
Email: officer@your-nsfdc-domain.in
```

**Step 2 — Register them as an officer** (SQL Editor):

```sql
insert into nsfdc_admins (admin_id, full_name, region, role)
values (
  '<uuid-from-auth-users-table>',
  'Officer Name',
  'Uttar Pradesh',
  'officer'   -- or 'regional_head'
);
```

A valid Supabase auth account alone is not enough — the `nsfdc_admins` row is required. This prevents accidental self-signup.

### 5. Graceful Fallback Behaviour

Every Supabase call in the backend (`supabase_client.py`) and frontend has a fallback:

| Supabase unavailable | Behaviour |
|---|---|
| Backend env vars missing | `is_supabase_configured()` returns False → all endpoints use in-memory data |
| Frontend env vars missing | `SupabaseAuthContext` skips auth → admin dashboard loads without login |
| Individual query fails | Logged to console, falls back to `SYNTHETIC_*` data silently |

You can demo the entire application — including the admin dashboard — with zero Supabase configuration.

### 6. Database Schema Reference

| Table | Access | Purpose |
|---|---|---|
| `schemes` | Public read, admin write | 5 NSFDC concessional credit scheme rules |
| `applicants` | Anon insert, admin read/update | Applicant profiles submitted via the portal |
| `channel_partners` | Public read, admin write | Geo-ranked financial institutions |
| `recommendations` | Service-role write, admin read | Rule-engine output with full audit trail |
| `nsfdc_admins` | Self-read only | Officers linked to `auth.users` |

### 7. Storage Bucket: `admin_reports`

Used for CSV/PDF exports from the admin dashboard. Admin-only upload and read — enforced by storage RLS policies defined in the schema migration.

To upload a report from the admin UI (future feature), use:

```js
const { data, error } = await supabase.storage
  .from('admin_reports')
  .upload(`reports/${filename}`, fileBlob);
```

---

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS — it lives only in `backend/.env` and is used exclusively by the FastAPI server
- The `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` is safe to ship in the browser; RLS enforces what it can access
- Recommendations are written only by the backend service role — there is no public insert policy, preventing a user from forging an "eligible" result client-side
- The rule engine (`rules_engine.py`) is the sole source of eligibility decisions; Supabase stores the output but contains zero eligibility logic
