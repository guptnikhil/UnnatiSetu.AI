import os
import uuid
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from synthetic_data import NSFDC_SCHEMES, SYNTHETIC_CHANNEL_PARTNERS, SYNTHETIC_APPLICANTS
from rules_engine import evaluate_applicant_eligibility
from financial_engine import calculate_loan_schedule
from partner_ranker import rank_channel_partners

app = FastAPI(
    title="UnnatiSetu.ai API Engine",
    description="Deterministic Scheme Matching & Channel Partner Routing Platform for Marginalized Entrepreneurs",
    version="1.0.0"
)

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database for applicants
APPLICANTS_DB: List[Dict[str, Any]] = list(SYNTHETIC_APPLICANTS)

# Active WebSocket connections for Admin Dashboard live feeds
connected_websockets: List[WebSocket] = []

# Pydantic Schemas
class ApplicantProfileInput(BaseModel):
    name: Optional[str] = "Applicant"
    category: str = Field(default="SC", description="Social Category: SC, ST, OBC, General")
    gender: str = Field(default="Female", description="Gender: Female, Male, Other")
    annual_income: float = Field(default=120000, description="Annual Income in INR")
    locality: str = Field(default="Rural", description="Rural or Urban")
    state: str = Field(default="Uttar Pradesh", description="State")
    district: str = Field(default="Lucknow", description="District")
    pincode: Optional[str] = "226001"
    business_type: str = Field(default="Micro Enterprise", description="Type of Business")
    loan_amount_requested: float = Field(default=100000, description="Requested Loan Amount in INR")
    affordability_monthly_emi: float = Field(default=2500, description="Max affordable EMI per month")

class EmiCalculationInput(BaseModel):
    loan_amount: float
    interest_rate_pa: float
    tenure_months: int
    moratorium_months: int = 0
    monthly_income: float = 10000.0

class PartnerRankInput(BaseModel):
    state: str
    district: str
    target_scheme_id: str

class SubmitApplicationInput(BaseModel):
    name: str
    category: str
    gender: str
    annual_income: float
    locality: str
    state: str
    district: str
    pincode: str
    business_type: str
    loan_amount_requested: float
    affordability_monthly_emi: float
    matched_scheme_id: str
    matched_partner_id: str

class StatusUpdateInput(BaseModel):
    applicant_id: str
    new_status: str

class NlpParseInput(BaseModel):
    text_prompt: str

@app.get("/")
def read_root():
    return {
        "service": "UnnatiSetu.ai API Engine",
        "status": "Operational",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "schemes_count": len(NSFDC_SCHEMES),
        "partners_count": len(SYNTHETIC_CHANNEL_PARTNERS)
    }

@app.get("/api/schemes")
def get_schemes():
    return {"schemes": NSFDC_SCHEMES}

@app.post("/api/recommend")
def recommend_schemes(profile: ApplicantProfileInput):
    evaluations = evaluate_applicant_eligibility(profile.dict())
    return {
        "applicant_profile": profile.dict(),
        "total_schemes_evaluated": len(evaluations),
        "eligible_schemes_count": sum(1 for e in evaluations if e["is_eligible"]),
        "recommendations": evaluations
    }

@app.post("/api/calculate-emi")
def calculate_emi(data: EmiCalculationInput):
    result = calculate_loan_schedule(
        principal=data.loan_amount,
        interest_rate_pa=data.interest_rate_pa,
        tenure_months=data.tenure_months,
        moratorium_months=data.moratorium_months,
        monthly_income=data.monthly_income
    )
    return result

@app.post("/api/rank-partners")
def get_ranked_partners(data: PartnerRankInput):
    ranked = rank_channel_partners(
        applicant_state=data.state,
        applicant_district=data.district,
        target_scheme_id=data.target_scheme_id
    )
    return {"ranked_partners": ranked}

@app.post("/api/nlp/parse")
def parse_natural_language(input_data: NlpParseInput):
    """
    Simulates NLP entity extraction from conversational input.
    Extracts structured fields while maintaining 100% deterministic decision-making.
    """
    prompt = input_data.text_prompt.lower()

    # Rule-based fallback keyword extraction
    category = "SC"
    if "st" in prompt or "tribal" in prompt:
        category = "ST"

    gender = "Female"
    if "man" in prompt or "male" in prompt or "husband" in prompt or "boy" in prompt or "पुरुष" in prompt:
        gender = "Male"
    if "woman" in prompt or "female" in prompt or "girl" in prompt or "lady" in prompt or "महिला" in prompt or "स्त्री" in prompt:
        gender = "Female"

    locality = "Rural"
    if "city" in prompt or "urban" in prompt or "town" in prompt or "शहर" in prompt:
        locality = "Urban"

    business = "Micro Enterprise"
    if "dairy" in prompt or "cow" in prompt or "farm" in prompt or "buffalo" in prompt or "कृषि" in prompt or "डेयरी" in prompt:
        business = "Dairy/Agri"
    elif "tailor" in prompt or "stitching" in prompt or "cloth" in prompt or "कपड़ा" in prompt or "सिलाई" in prompt:
        business = "Tailoring"
    elif "beauty" in prompt or "parlour" in prompt or "parlor" in prompt or "पार्लर" in prompt:
        business = "Beauty Parlour"
    elif "shop" in prompt or "grocery" in prompt or "retail" in prompt or "दुकान" in prompt:
        business = "Small Retail"
    elif "rickshaw" in prompt or "e-rickshaw" in prompt or "solar" in prompt or "green" in prompt or "रिक्शा" in prompt:
        business = "E-Rickshaw"
    elif "transport" in prompt or "vehicle" in prompt or "auto" in prompt:
        business = "Transport"

    loan_amount = 100000.0
    # Try finding numeric numbers in prompt
    import re
    numbers = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', prompt.replace("lakh", "00000").replace("लाख", "00000"))
    if numbers:
        try:
            val = float(numbers[0].replace(",", ""))
            if val < 50: # handles e.g. "1.5 lakh" -> 1.5 -> 150000
                val = val * 100000
            loan_amount = min(5000000.0, max(10000.0, val))
        except:
            pass

    state = "Uttar Pradesh"
    if "bihar" in prompt or "बिहार" in prompt:
        state = "Bihar"
    elif "maharashtra" in prompt or "mumbai" in prompt or "महाराष्ट्र" in prompt:
        state = "Maharashtra"
    elif "delhi" in prompt or "दिल्ली" in prompt:
        state = "Delhi"
    elif "mp" in prompt or "madhya pradesh" in prompt or "मध्य प्रदेश" in prompt:
        state = "Madhya Pradesh"

    return {
        "extracted_profile": {
            "name": "Applicant",
            "category": category,
            "gender": gender,
            "annual_income": 120000,
            "locality": locality,
            "state": state,
            "district": "Capital District",
            "pincode": "226001",
            "business_type": business,
            "loan_amount_requested": loan_amount,
            "affordability_monthly_emi": round(loan_amount * 0.025, 0)
        },
        "confidence_score": 0.94,
        "extracted_keywords": [category, gender, locality, business, f"₹{loan_amount:,.0f}"]
    }

@app.post("/api/applicants/submit")
async def submit_application(data: SubmitApplicationInput):
    app_id = f"APP-2026-{len(APPLICANTS_DB) + 8806}"
    new_record = {
        "id": app_id,
        "name": data.name,
        "age": 30,
        "gender": data.gender,
        "category": data.category,
        "annual_income": data.annual_income,
        "locality": data.locality,
        "district": data.district,
        "state": data.state,
        "pincode": data.pincode,
        "business_type": data.business_type,
        "loan_amount_requested": data.loan_amount_requested,
        "affordability_monthly_emi": data.affordability_monthly_emi,
        "matched_scheme_id": data.matched_scheme_id,
        "matched_partner_id": data.matched_partner_id,
        "status": "Matched",
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "documents_uploaded": 1,
        "documents_total": 4,
        "stuck_alert": False
    }
    APPLICANTS_DB.insert(0, new_record)

    # Notify connected websocket clients (Admin Dashboard)
    for ws in connected_websockets:
        try:
            await ws.send_json({"type": "NEW_APPLICATION", "data": new_record})
        except:
            pass

    return {"status": "SUCCESS", "application_id": app_id, "record": new_record}

@app.get("/api/admin/metrics")
def get_admin_metrics():
    total_apps = len(APPLICANTS_DB)
    status_counts = {}
    for a in APPLICANTS_DB:
        s = a.get("status", "New")
        status_counts[s] = status_counts.get(s, 0) + 1

    scheme_uptake = {}
    for a in APPLICANTS_DB:
        sc = a.get("matched_scheme_id", "SCH_MCS")
        scheme_uptake[sc] = scheme_uptake.get(sc, 0) + 1

    state_distribution = {}
    for a in APPLICANTS_DB:
        st = a.get("state", "Uttar Pradesh")
        state_distribution[st] = state_distribution.get(st, 0) + 1

    total_requested_capital = sum(a.get("loan_amount_requested", 0) for a in APPLICANTS_DB)
    stuck_cases_count = sum(1 for a in APPLICANTS_DB if a.get("stuck_alert", False))

    return {
        "total_applicants": total_apps,
        "status_breakdown": status_counts,
        "scheme_uptake": scheme_uptake,
        "state_distribution": state_distribution,
        "total_requested_capital_inr": total_requested_capital,
        "avg_match_time_seconds": 1.4,
        "stuck_cases_count": stuck_cases_count,
        "active_channel_partners_count": len(SYNTHETIC_CHANNEL_PARTNERS)
    }

@app.get("/api/admin/applicants")
def get_admin_applicants(status: Optional[str] = None, state: Optional[str] = None):
    results = APPLICANTS_DB
    if status and status != "All":
        results = [a for a in results if a.get("status") == status]
    if state and state != "All":
        results = [a for a in results if a.get("state") == state]
    return {"applicants": results, "count": len(results)}

@app.post("/api/admin/applicant-status")
async def update_applicant_status(data: StatusUpdateInput):
    found = False
    updated_rec = None
    for a in APPLICANTS_DB:
        if a["id"] == data.applicant_id:
            a["status"] = data.new_status
            if data.new_status == "Pending Docs":
                a["stuck_alert"] = True
            elif data.new_status in ["Disbursed", "Matched"]:
                a["stuck_alert"] = False
            found = True
            updated_rec = a
            break

    if not found:
        raise HTTPException(status_code=404, detail="Applicant ID not found")

    # Broadcast via WS
    for ws in connected_websockets:
        try:
            await ws.send_json({"type": "STATUS_UPDATED", "data": updated_rec})
        except:
            pass

    return {"status": "SUCCESS", "updated_record": updated_rec}

@app.websocket("/ws/admin")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
