from typing import Dict, Any, List
from synthetic_data import NSFDC_SCHEMES

def evaluate_applicant_eligibility(applicant_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates applicant profile against all NSFDC schemes.
    Returns a list of scheme match results, with clear audit trails for pass/fail rules.
    """
    category = applicant_profile.get("category", "SC").upper()
    gender = applicant_profile.get("gender", "Female").capitalize()
    income = float(applicant_profile.get("annual_income", 120000))
    locality = applicant_profile.get("locality", "Rural")
    loan_amount = float(applicant_profile.get("loan_amount_requested", 100000))
    business_type = applicant_profile.get("business_type", "Micro Enterprise")

    evaluations = []

    for scheme in NSFDC_SCHEMES:
        passed_rules = []
        failed_rules = []

        # Rule 1: Category Check
        if category in scheme["category_target"]:
            passed_rules.append({
                "rule_code": "RULE_CATEGORY",
                "label_en": f"Social Category ({category}) matches target ({', '.join(scheme['category_target'])})",
                "label_hi": f"सामाजिक वर्ग ({category}) लक्ष्य से मेल खाता है ({', '.join(scheme['category_target'])})",
                "passed": True
            })
        else:
            failed_rules.append({
                "rule_code": "RULE_CATEGORY",
                "label_en": f"Social Category ({category}) does not match scheme target ({', '.join(scheme['category_target'])})",
                "label_hi": f"सामाजिक वर्ग ({category}) योजना के लक्ष्य से मेल नहीं खाता है",
                "passed": False
            })

        # Rule 2: Gender Check
        if gender in scheme["gender_target"] or "All" in scheme["gender_target"]:
            passed_rules.append({
                "rule_code": "RULE_GENDER",
                "label_en": f"Gender ({gender}) is eligible for {scheme['code']}",
                "label_hi": f"लिंग ({gender}) {scheme['code']} के लिए पात्र है",
                "passed": True
            })
        else:
            failed_rules.append({
                "rule_code": "RULE_GENDER",
                "label_en": f"Scheme is restricted to {', '.join(scheme['gender_target'])} applicants only",
                "label_hi": f"योजना केवल {', '.join(scheme['gender_target'])} आवेदकों के लिए आरक्षित है",
                "passed": False
            })

        # Rule 3: Income Threshold Check
        income_cap = scheme["max_income_rural"] if locality == "Rural" else scheme["max_income_urban"]
        if income <= income_cap:
            passed_rules.append({
                "rule_code": "RULE_INCOME",
                "label_en": f"Annual Income (₹{income:,.0f}) is within limit (₹{income_cap:,.0f})",
                "label_hi": f"वार्षिक आय (₹{income:,.0f}) सीमा (₹{income_cap:,.0f}) के भीतर है",
                "passed": True
            })
        else:
            failed_rules.append({
                "rule_code": "RULE_INCOME",
                "label_en": f"Annual Income (₹{income:,.0f}) exceeds threshold (₹{income_cap:,.0f})",
                "label_hi": f"वार्षिक आय (₹{income:,.0f}) सीमा (₹{income_cap:,.0f}) से अधिक है",
                "passed": False
            })

        # Rule 4: Loan Amount Cap Check
        max_loan = float(scheme["max_loan_amount"])
        if loan_amount <= max_loan:
            passed_rules.append({
                "rule_code": "RULE_LOAN_CAP",
                "label_en": f"Requested Loan (₹{loan_amount:,.0f}) is within scheme limit (₹{max_loan:,.0f})",
                "label_hi": f"मांगा गया ऋण (₹{loan_amount:,.0f}) योजना की अधिकतम सीमा (₹{max_loan:,.0f}) में है",
                "passed": True
            })
        elif loan_amount <= max_loan * 2.5:
            # Partial pass: can still match but capped with score penalty
            passed_rules.append({
                "rule_code": "RULE_LOAN_CAP_CAPPED",
                "label_en": f"Loan requested (₹{loan_amount:,.0f}) exceeds scheme cap (₹{max_loan:,.0f}); will be capped at ₹{max_loan:,.0f}",
                "label_hi": f"मांगा गया ऋण योजना की सीमा (₹{max_loan:,.0f}) से अधिक है; इसे सीमित किया जाएगा",
                "passed": True
            })
        else:
            # Failed: requested loan is way beyond scheme capacity (> 2.5x max loan)
            failed_rules.append({
                "rule_code": "RULE_LOAN_CAP_EXCEEDED",
                "label_en": f"Requested Loan (₹{loan_amount:,.0f}) far exceeds scheme maximum capacity (₹{max_loan:,.0f})",
                "label_hi": f"मांगा गया ऋण (₹{loan_amount:,.0f}) योजना की अधिकतम क्षमता (₹{max_loan:,.0f}) से बहुत अधिक है",
                "passed": False
            })

        # Rule 5: Business Type Alignment Check
        allowed_b_types = scheme.get("allowed_business_types", [])
        if any(b.lower() in business_type.lower() for b in allowed_b_types) or "Micro Enterprise" in allowed_b_types:
            passed_rules.append({
                "rule_code": "RULE_BUSINESS_TYPE",
                "label_en": f"Business Type ({business_type}) aligns with scheme focus",
                "label_hi": f"व्यापार का प्रकार ({business_type}) योजना के अनुकूल है",
                "passed": True
            })
        else:
            failed_rules.append({
                "rule_code": "RULE_BUSINESS_TYPE",
                "label_en": f"Business Type ({business_type}) is outside primary scheme focus ({', '.join(allowed_b_types)})",
                "label_hi": f"व्यापार प्रकार योजना के मुख्य फोकस से बाहर है",
                "passed": False
            })

        is_eligible = len(failed_rules) == 0
        total_checks = len(passed_rules) + len(failed_rules)
        match_score = int((len(passed_rules) / total_checks) * 100) if total_checks > 0 else 0

        # Adjust score for capped loans
        if loan_amount > max_loan:
            penalty = min(30, int(((loan_amount - max_loan) / max_loan) * 20))
            match_score = max(10, match_score - penalty)

        # Adjust score bonus for female-focused scheme if female
        if gender == "Female" and "Female" in scheme["gender_target"] and len(scheme["gender_target"]) == 1:
            match_score = min(100, match_score + 5)

        evaluations.append({
            "scheme": scheme,
            "is_eligible": is_eligible,
            "match_score": match_score,
            "passed_rules": passed_rules,
            "failed_rules": failed_rules,
            "capped_loan_amount": min(loan_amount, float(scheme["max_loan_amount"])),
            "interest_rate_pa": scheme["interest_rate_pa"],
            "max_tenure_months": scheme["max_tenure_months"],
            "moratorium_months": scheme["moratorium_months"],
            "nsfdc_subsidy_pct": scheme["nsfdc_subsidy_pct"],
            "promoter_contribution_pct": scheme["promoter_contribution_pct"]
        })

    # Sort evaluations: eligible first, then by match_score descending
    evaluations.sort(key=lambda x: (x["is_eligible"], x["match_score"]), reverse=True)
    return evaluations

