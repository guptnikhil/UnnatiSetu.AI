import math
from typing import List, Dict, Any
from synthetic_data import SYNTHETIC_CHANNEL_PARTNERS

# State capital coordinates fallback
STATE_COORDINATES = {
    "Uttar Pradesh": {"lat": 26.8467, "lng": 80.9462},
    "Maharashtra": {"lat": 19.0760, "lng": 72.8777},
    "Bihar": {"lat": 25.5941, "lng": 85.1376},
    "Delhi": {"lat": 28.6139, "lng": 77.2090},
    "Madhya Pradesh": {"lat": 23.2599, "lng": 77.4126},
    "Rajasthan": {"lat": 26.9124, "lng": 75.7873},
    "West Bengal": {"lat": 22.5726, "lng": 88.3639},
    "Tamil Nadu": {"lat": 13.0827, "lng": 80.2707}
}

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geographical distance between two lat/lng points in KM."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def rank_channel_partners(
    applicant_state: str,
    applicant_district: str,
    target_scheme_id: str,
    applicant_lat: float = None,
    applicant_lng: float = None
) -> List[Dict[str, Any]]:
    """
    Ranks channel partners using a multi-factor score:
    - Geo-proximity (40%)
    - Capacity / Processing Speed Score (40%)
    - Direct Scheme Support Match (20%)
    """
    if applicant_lat is None or applicant_lng is None:
        coords = STATE_COORDINATES.get(applicant_state, {"lat": 26.8467, "lng": 80.9462})
        applicant_lat, applicant_lng = coords["lat"], coords["lng"]

    ranked_list = []

    for cp in SYNTHETIC_CHANNEL_PARTNERS:
        dist_km = haversine_km(applicant_lat, applicant_lng, cp["lat"], cp["lng"])
        supports_scheme = target_scheme_id in cp["supported_scheme_ids"]

        # Proximity score (100 for 0 km, decays smoothly)
        proximity_score = max(0.0, 100.0 - (dist_km * 0.25))

        # Capacity score from partner profile (0-100)
        capacity_score = float(cp["capacity_score"])

        # Scheme match score (100 if supported, 40 if indirect)
        scheme_score = 100.0 if supports_scheme else 40.0

        # State bonus if in same state
        state_bonus = 15.0 if cp["state"].lower() == applicant_state.lower() else 0.0

        total_rank_score = (proximity_score * 0.35) + (capacity_score * 0.35) + (scheme_score * 0.20) + state_bonus
        total_rank_score = min(100.0, round(total_rank_score, 1))

        ranked_list.append({
            "partner": cp,
            "distance_km": round(dist_km, 1),
            "supports_target_scheme": supports_scheme,
            "rank_score": total_rank_score,
            "capacity_score": cp["capacity_score"],
            "npa_status": cp["npa_status"],
            "avg_turnaround_days": cp["avg_turnaround_days"]
        })

    # Sort by total_rank_score descending
    ranked_list.sort(key=lambda x: x["rank_score"], reverse=True)
    return ranked_list
