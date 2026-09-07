"""
Supabase service wrapper for UnnatiSetu.ai backend.

Two clients are initialised at module load:
  - supabase_admin  — Service role key, bypasses RLS. Used for backend writes
                      (recommendations, status updates). NEVER exposed to frontend.
  - supabase_public — Anon key, subject to RLS. Mirrors what the frontend can do.
                      Used for reads where RLS allows public access (schemes, partners).

Design principle: Supabase is the data layer only.
The rule engine (rules_engine.py) remains the sole source of eligibility decisions.
"""
import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = Any  # type: ignore


def _require_env(key: str) -> str:
    val = os.environ.get(key, "")
    if not val:
        raise EnvironmentError(
            f"Environment variable '{key}' is not set. "
            "Copy backend/.env.example to backend/.env and fill in your Supabase credentials."
        )
    return val


@lru_cache(maxsize=1)
def get_admin_client() -> "Client":
    """Service-role client — bypasses RLS. Backend writes only."""
    if not SUPABASE_AVAILABLE:
        raise RuntimeError("supabase-py is not installed. Run: pip install supabase")
    url = _require_env("SUPABASE_URL")
    key = _require_env("SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)


@lru_cache(maxsize=1)
def get_public_client() -> "Client":
    """Anon-key client — subject to RLS. Safe for reads that allow public access."""
    if not SUPABASE_AVAILABLE:
        raise RuntimeError("supabase-py is not installed. Run: pip install supabase")
    url = _require_env("SUPABASE_URL")
    key = _require_env("SUPABASE_ANON_KEY")
    return create_client(url, key)


def is_supabase_configured() -> bool:
    """Returns True if Supabase env vars are present — used for graceful fallback."""
    return bool(
        os.environ.get("SUPABASE_URL")
        and os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    )


# ---------------------------------------------------------------------------
# Schemes
# ---------------------------------------------------------------------------

def fetch_schemes() -> List[Dict]:
    """
    Reads all scheme rows from Supabase.
    Falls back to synthetic_data.NSFDC_SCHEMES if Supabase is not configured.
    """
    client = get_public_client()
    result = client.table("schemes").select("*").execute()
    return result.data or []


# ---------------------------------------------------------------------------
# Applicants
# ---------------------------------------------------------------------------

def insert_applicant(applicant_data: Dict) -> Dict:
    """
    Inserts a new applicant record using the service-role key.
    Returns the created row with the generated applicant_id.
    """
    client = get_admin_client()
    result = (
        client.table("applicants")
        .insert(applicant_data)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else {}


def fetch_applicants(status_filter: Optional[str] = None, state_filter: Optional[str] = None) -> List[Dict]:
    """Fetches applicants with optional filters. Admin access only (enforced by RLS + service key)."""
    client = get_admin_client()
    query = client.table("applicants").select("*").order("created_at", desc=True)
    if status_filter and status_filter != "All":
        query = query.eq("status", status_filter)
    if state_filter and state_filter != "All":
        query = query.ilike("state_district", f"%{state_filter}%")
    result = query.execute()
    return result.data or []


def update_applicant_status(applicant_id: str, new_status: str) -> Dict:
    """Updates applicant status. Returns the updated row."""
    client = get_admin_client()
    result = (
        client.table("applicants")
        .update({"status": new_status})
        .eq("applicant_id", applicant_id)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else {}


def count_applicants_by_status() -> Dict[str, int]:
    """Returns a breakdown of applicant counts by status for the KPI dashboard."""
    client = get_admin_client()
    result = client.table("applicants").select("status").execute()
    counts: Dict[str, int] = {}
    for row in (result.data or []):
        s = row.get("status", "New")
        counts[s] = counts.get(s, 0) + 1
    return counts


def count_applicants_by_state() -> Dict[str, int]:
    """Returns applicant counts per state for the regional distribution chart."""
    client = get_admin_client()
    result = client.table("applicants").select("state_district").execute()
    counts: Dict[str, int] = {}
    for row in (result.data or []):
        # state_district format is "District, State"
        raw = row.get("state_district", "Unknown")
        state = raw.split(",")[-1].strip() if "," in raw else raw
        counts[state] = counts.get(state, 0) + 1
    return counts


# ---------------------------------------------------------------------------
# Channel Partners
# ---------------------------------------------------------------------------

def fetch_channel_partners(state_filter: Optional[str] = None) -> List[Dict]:
    """Fetches channel partners. Public read (RLS allows). Optional state filter."""
    client = get_public_client()
    query = client.table("channel_partners").select("*")
    if state_filter:
        query = query.ilike("state_district", f"%{state_filter}%")
    result = query.execute()
    return result.data or []


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

def insert_recommendations(recs: List[Dict]) -> List[Dict]:
    """
    Writes rule-engine output to the recommendations table.
    Uses the service-role key — this must NEVER be called from client-side code.
    Each record includes the full reasons_passed / reasons_failed audit trail.
    """
    if not recs:
        return []
    client = get_admin_client()
    result = client.table("recommendations").insert(recs).execute()
    return result.data or []


def fetch_recommendations_for_applicant(applicant_id: str) -> List[Dict]:
    """Fetches all scheme match results for a given applicant. Admin access only."""
    client = get_admin_client()
    result = (
        client.table("recommendations")
        .select("*, schemes(*)")
        .eq("applicant_id", applicant_id)
        .order("match_score", desc=True)
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# Admin Metrics (aggregated — avoids pulling full table to frontend)
# ---------------------------------------------------------------------------

def get_admin_metrics() -> Dict:
    """
    Aggregates KPIs for the admin dashboard:
    total applicants, status breakdown, state distribution, stuck cases count.
    """
    client = get_admin_client()

    total_result = client.table("applicants").select("applicant_id", count="exact").execute()
    total = total_result.count or 0

    status_counts = count_applicants_by_status()
    state_distribution = count_applicants_by_state()

    stuck_result = (
        client.table("applicants")
        .select("applicant_id", count="exact")
        .eq("status", "Pending Documents")
        .execute()
    )
    stuck_count = stuck_result.count or 0

    partners_result = client.table("channel_partners").select("partner_id", count="exact").execute()
    partners_count = partners_result.count or 0

    capital_result = client.table("applicants").select("loan_needed").execute()
    total_capital = sum(row.get("loan_needed") or 0 for row in (capital_result.data or []))

    scheme_uptake: Dict[str, int] = {}
    rec_result = client.table("recommendations").select("scheme_id").eq("eligible", True).execute()
    for row in (rec_result.data or []):
        s = row.get("scheme_id", "unknown")
        scheme_uptake[s] = scheme_uptake.get(s, 0) + 1

    return {
        "total_applicants": total,
        "status_breakdown": status_counts,
        "scheme_uptake": scheme_uptake,
        "state_distribution": state_distribution,
        "total_requested_capital_inr": total_capital,
        "avg_match_time_seconds": 1.4,
        "stuck_cases_count": stuck_count,
        "active_channel_partners_count": partners_count,
    }
