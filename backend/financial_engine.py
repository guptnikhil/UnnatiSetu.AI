import math
from typing import Dict, Any, List

def calculate_loan_schedule(
    principal: float,
    interest_rate_pa: float,
    tenure_months: int,
    moratorium_months: int = 0,
    monthly_income: float = 10000.0
) -> Dict[str, Any]:
    """
    Calculates EMI, moratorium schedule, interest saved via concessional rates,
    and affordability indicators.
    """
    principal = max(5000.0, float(principal))
    interest_rate_pa = max(1.0, float(interest_rate_pa))
    tenure_months = max(6, int(tenure_months))
    moratorium_months = max(0, min(12, int(moratorium_months)))

    r = (interest_rate_pa / 100.0) / 12.0

    # Amortization after moratorium
    repayment_months = max(1, tenure_months - moratorium_months)

    if r > 0:
        normal_emi = (principal * r * math.pow(1 + r, repayment_months)) / (math.pow(1 + r, repayment_months) - 1)
    else:
        normal_emi = principal / repayment_months

    moratorium_monthly_payment = principal * r if moratorium_months > 0 else normal_emi

    total_repayment = (moratorium_monthly_payment * moratorium_months) + (normal_emi * repayment_months)
    total_interest = total_repayment - principal

    # Commercial market rate comparison (e.g. 14% p.a. standard microfinance)
    market_r = (14.0 / 100.0) / 12.0
    market_emi = (principal * market_r * math.pow(1 + market_r, tenure_months)) / (math.pow(1 + market_r, tenure_months) - 1)
    market_total = market_emi * tenure_months
    interest_saved = max(0.0, market_total - total_repayment)

    # Monthly Affordability Check
    emi_to_income_ratio = (normal_emi / max(1.0, monthly_income)) * 100.0
    
    if emi_to_income_ratio <= 25:
        affordability_status_en = "Comfortable (Very Safe)"
        affordability_status_hi = "सुविधाजनक (अत्यंत सुरक्षित)"
        affordability_color = "green"
    elif emi_to_income_ratio <= 40:
        affordability_status_en = "Manageable"
        affordability_status_hi = "प्रबंधनीय"
        affordability_color = "yellow"
    else:
        affordability_status_en = "High EMI Strain (Consider longer tenure or lower loan)"
        affordability_status_hi = "उच्च ईएमआई दबाव (लंबी अवधि या कम ऋण पर विचार करें)"
        affordability_color = "red"

    # Generate Amortization Table sample (First 6 months + final month)
    schedule = []
    balance = principal
    for m in range(1, tenure_months + 1):
        if m <= moratorium_months:
            interest_paid = balance * r
            principal_paid = 0.0
            emi_paid = moratorium_monthly_payment
            is_moratorium = True
        else:
            interest_paid = balance * r
            principal_paid = normal_emi - interest_paid
            balance = max(0.0, balance - principal_paid)
            emi_paid = normal_emi
            is_moratorium = False

        schedule.append({
            "month": m,
            "emi": round(emi_paid, 2),
            "principal_paid": round(principal_paid, 2),
            "interest_paid": round(interest_paid, 2),
            "remaining_balance": round(balance, 2),
            "is_moratorium": is_moratorium
        })

    return {
        "principal": principal,
        "interest_rate_pa": interest_rate_pa,
        "tenure_months": tenure_months,
        "moratorium_months": moratorium_months,
        "monthly_emi": round(normal_emi, 2),
        "moratorium_emi": round(moratorium_monthly_payment, 2),
        "total_interest": round(total_interest, 2),
        "total_repayment": round(total_repayment, 2),
        "commercial_market_emi": round(market_emi, 2),
        "interest_saved_vs_market": round(interest_saved, 2),
        "emi_to_income_ratio_pct": round(emi_to_income_ratio, 1),
        "affordability_status_en": affordability_status_en,
        "affordability_status_hi": affordability_status_hi,
        "affordability_color": affordability_color,
        "schedule": schedule
    }
