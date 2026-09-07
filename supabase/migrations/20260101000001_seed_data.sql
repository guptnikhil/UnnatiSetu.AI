-- UnnatiSetu.ai Seed Data
-- Run after initial_schema migration.
--
-- Sections:
--   1. schemes          — 5 real NSFDC concessional credit schemes
--   2. channel_partners — 15 synthetic partners (clearly flagged as simulated data)
--   3. applicants       — 8 demo applicants (synthetic, NOT real PII)

-- ============================================================================
-- 1. SCHEMES (sourced from real NSFDC guidelines)
-- ============================================================================

insert into schemes (scheme_id, scheme_name, description, eligibility, loan_terms, sectors_supported, last_verified) values

('SCH_MSY',
 'Mahila Samriddhi Yojana (MSY)',
 'Concessional micro-credit scheme specifically designed for Scheduled Caste women entrepreneurs for income generation.',
 '{
   "caste_category": ["SC"],
   "gender": ["Female"],
   "max_annual_family_income_inr": 300000,
   "locality": ["Rural", "Urban"]
 }',
 '{
   "max_loan_amount_inr": 140000,
   "interest_rate_to_beneficiary_percent": 4.0,
   "max_repayment_months": 60,
   "moratorium_months": 6,
   "nsfdc_subsidy_percent": 14.0,
   "promoter_contribution_percent": 5.0
 }',
 ARRAY['Micro Enterprise','Handicraft','Tailoring','Dairy/Agri','Retail Shop','Beauty Parlour'],
 '2026-01-01'),

('SCH_MCS',
 'Micro Credit Scheme (MCS)',
 'Financial assistance for small business units, tiny trade, and self-employment projects for SC individuals.',
 '{
   "caste_category": ["SC"],
   "gender": ["Male", "Female", "Other"],
   "max_annual_family_income_inr": 300000,
   "locality": ["Rural", "Urban"]
 }',
 '{
   "max_loan_amount_inr": 140000,
   "interest_rate_to_beneficiary_percent": 5.0,
   "max_repayment_months": 60,
   "moratorium_months": 6,
   "nsfdc_subsidy_percent": 10.0,
   "promoter_contribution_percent": 5.0
 }',
 ARRAY['Micro Enterprise','Small Retail','Artisan Work','Services','Transport','Repair Shop'],
 '2026-01-01'),

('SCH_TLS',
 'Term Loan Scheme (TLS)',
 'Term loan assistance up to ₹15 Lakhs for viable income generating projects in transport, service, and manufacturing sectors.',
 '{
   "caste_category": ["SC"],
   "gender": ["Male", "Female", "Other"],
   "max_annual_family_income_inr": 300000,
   "locality": ["Rural", "Urban"]
 }',
 '{
   "max_loan_amount_inr": 1500000,
   "interest_rate_to_beneficiary_percent": 6.0,
   "max_repayment_months": 120,
   "moratorium_months": 6,
   "nsfdc_subsidy_percent": 0.0,
   "promoter_contribution_percent": 10.0
 }',
 ARRAY['Manufacturing','Services','Agriculture Allied','Small Industry','Transport Fleet','Food Processing'],
 '2026-01-01'),

('SCH_MKY',
 'Mahila Kisan Yojana (MKY)',
 'Concessional credit scheme for women farmers belonging to Scheduled Castes for agriculture and allied activities.',
 '{
   "caste_category": ["SC"],
   "gender": ["Female"],
   "max_annual_family_income_inr": 300000,
   "locality": ["Rural", "Urban"]
 }',
 '{
   "max_loan_amount_inr": 200000,
   "interest_rate_to_beneficiary_percent": 5.0,
   "max_repayment_months": 60,
   "moratorium_months": 6,
   "nsfdc_subsidy_percent": 12.0,
   "promoter_contribution_percent": 5.0
 }',
 ARRAY['Dairy/Agri','Poultry','Organic Farming','Horticulture','Bee Keeping','Agri Processing'],
 '2026-01-01'),

('SCH_GBS',
 'Green Business Scheme (GBS)',
 'Financial support for eco-friendly business activities such as E-Rickshaws, Solar Energy units, and Waste Management.',
 '{
   "caste_category": ["SC"],
   "gender": ["Male", "Female", "Other"],
   "max_annual_family_income_inr": 300000,
   "locality": ["Rural", "Urban"]
 }',
 '{
   "max_loan_amount_inr": 3000000,
   "interest_rate_to_beneficiary_percent": 6.0,
   "max_repayment_months": 120,
   "moratorium_months": 6,
   "nsfdc_subsidy_percent": 0.0,
   "promoter_contribution_percent": 10.0
 }',
 ARRAY['E-Rickshaw','Solar Power Unit','Waste Recycling','Bio-gas Plant','Eco-friendly Packaging'],
 '2026-01-01');

-- ============================================================================
-- 2. CHANNEL PARTNERS
-- IMPORTANT: capacity_score and npa_status_synthetic are SIMULATED for this
-- prototype. Real values must be obtained from NSFDC before production use.
-- ============================================================================

insert into channel_partners (partner_id, name, latitude, longitude, state_district, schemes_supported, capacity_score, npa_status_synthetic, last_verified) values

-- Uttar Pradesh
(gen_random_uuid(),
 'UP Scheduled Castes Finance & Development Corporation (UPSCFDC)',
 26.8467, 80.9462,
 'Lucknow, Uttar Pradesh',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_MKY','SCH_GBS'],
 92.0, 2.1,
 '2026-08-15'),

(gen_random_uuid(),
 'Punjab National Bank — Regional Microfinance Branch',
 25.3176, 82.9739,
 'Varanasi, Uttar Pradesh',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS'],
 78.0, 4.3,
 '2026-08-20'),

(gen_random_uuid(),
 'Bank of Baroda — SC Beneficiary Cell',
 27.1767, 78.0081,
 'Agra, Uttar Pradesh',
 ARRAY['SCH_MCS','SCH_TLS','SCH_GBS'],
 74.0, 3.8,
 '2026-07-30'),

-- Bihar
(gen_random_uuid(),
 'Bihar State Scheduled Castes Co-operative Development Corporation',
 25.6126, 85.1588,
 'Patna, Bihar',
 ARRAY['SCH_MSY','SCH_MCS','SCH_MKY'],
 65.0, 5.1,
 '2026-08-10'),

(gen_random_uuid(),
 'UCO Bank — Priority Sector Lending Hub',
 25.2425, 86.9842,
 'Bhagalpur, Bihar',
 ARRAY['SCH_MCS','SCH_TLS'],
 60.0, 5.6,
 '2026-07-25'),

-- Maharashtra
(gen_random_uuid(),
 'Mahatma Phule Backward Class Development Corporation (MPBCDC)',
 19.0600, 72.8426,
 'Mumbai, Maharashtra',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_GBS'],
 88.0, 1.8,
 '2026-08-28'),

(gen_random_uuid(),
 'Bank of Maharashtra — Social Banking Division',
 18.5204, 73.8567,
 'Pune, Maharashtra',
 ARRAY['SCH_MSY','SCH_MCS','SCH_MKY'],
 81.0, 2.9,
 '2026-08-05'),

(gen_random_uuid(),
 'Vidarbha Konkan Gramin Bank — SC Cell',
 21.1458, 79.0882,
 'Nagpur, Maharashtra',
 ARRAY['SCH_MCS','SCH_TLS','SCH_GBS'],
 70.0, 3.4,
 '2026-07-15'),

-- Delhi
(gen_random_uuid(),
 'State Bank of India — Special Priority Lending Hub',
 28.6315, 77.2167,
 'Central Delhi, Delhi',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_GBS'],
 95.0, 0.9,
 '2026-09-01'),

(gen_random_uuid(),
 'Delhi SC/ST/OBC/Minority Finance & Development Corporation',
 28.5355, 77.3910,
 'Noida, Delhi NCR',
 ARRAY['SCH_MSY','SCH_MCS','SCH_MKY','SCH_GBS'],
 85.0, 2.2,
 '2026-08-22'),

-- Madhya Pradesh
(gen_random_uuid(),
 'MP State Scheduled Castes Finance & Development Corporation',
 23.2599, 77.4126,
 'Bhopal, Madhya Pradesh',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_MKY'],
 82.0, 2.4,
 '2026-08-25'),

(gen_random_uuid(),
 'Central Bank of India — SC Priority Cell',
 22.7196, 75.8577,
 'Indore, Madhya Pradesh',
 ARRAY['SCH_MCS','SCH_TLS','SCH_GBS'],
 76.0, 3.1,
 '2026-08-01'),

-- West Bengal
(gen_random_uuid(),
 'West Bengal SC/ST Development Finance Corporation',
 22.5726, 88.3639,
 'Kolkata, West Bengal',
 ARRAY['SCH_MSY','SCH_MCS','SCH_MKY'],
 79.0, 3.6,
 '2026-07-20'),

-- Tamil Nadu
(gen_random_uuid(),
 'Tamil Nadu Adi Dravidar Housing Development Corporation (TAHDCO)',
 13.0827, 80.2707,
 'Chennai, Tamil Nadu',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_MKY'],
 86.0, 2.0,
 '2026-08-18'),

-- Rajasthan
(gen_random_uuid(),
 'Rajasthan Scheduled Castes Development Cooperative Corporation',
 26.9124, 75.7873,
 'Jaipur, Rajasthan',
 ARRAY['SCH_MSY','SCH_MCS','SCH_TLS','SCH_GBS'],
 73.0, 4.0,
 '2026-08-12');

-- ============================================================================
-- 3. DEMO APPLICANTS
-- SYNTHETIC DATA ONLY — not real individuals.
-- Seeded for dashboard demonstration. Clearly labelled as demo records.
-- ============================================================================

insert into applicants (name, age, gender, caste_category, annual_income, business_sector, loan_needed, project_cost, state_district, nlp_intake_text, detected_language, status) values

('Ramesh Kumar', 34, 'Male', 'SC', 120000, 'Micro Enterprise', 100000, 120000,
 'Lucknow, Uttar Pradesh',
 'I am Ramesh Kumar, SC category from Lucknow rural. I earn ₹1.2 Lakh annually and want a ₹1,00,000 loan for a small grocery retail shop.',
 'en-IN', 'Matched'),

('Sunita Devi', 28, 'Female', 'SC', 95000, 'Dairy/Agri', 120000, 150000,
 'Patna, Bihar',
 'मैं सुनीता देवी, अनुसूचित जाति महिला किसान हूँ। मैं पटना ग्रामीण से हूँ और डेयरी उद्योग के लिए ₹1,20,000 ऋण चाहती हूँ।',
 'hi-IN', 'Pending Documents'),

('Anita Rani', 32, 'Female', 'SC', 150000, 'Beauty Parlour', 140000, 160000,
 'Central Delhi, Delhi',
 'I am Anita Rani from Delhi, SC category. I want a loan of ₹1,40,000 under Mahila Samriddhi Yojana for my beauty parlour.',
 'en-IN', 'Disbursed'),

('Rajesh Sonkar', 41, 'Male', 'SC', 210000, 'Transport', 500000, 650000,
 'Varanasi, Uttar Pradesh',
 'I am Rajesh Sonkar. I need ₹5 lakh loan for transport business in Varanasi.',
 'en-IN', 'Under Review'),

('Pooja Valmiki', 26, 'Female', 'SC', 80000, 'Tailoring', 100000, 110000,
 'Mumbai, Maharashtra',
 'मला मुंबईमध्ये शिलाई व्यवसायासाठी ₹१,००,००० कर्ज हवे आहे.',
 'mr-IN', 'New'),

('Kavitha Selvaraj', 30, 'Female', 'SC', 110000, 'Dairy/Agri', 180000, 200000,
 'Chennai, Tamil Nadu',
 'நான் கவிதா. எனக்கு ஆட்டு பண்ணை தொடங்க ₹1,80,000 கடன் தேவை.',
 'ta-IN', 'Matched'),

('Mohammed Saleem', 38, 'Male', 'SC', 175000, 'E-Rickshaw', 250000, 280000,
 'Bhopal, Madhya Pradesh',
 'मुझे भोपाल में ई-रिक्शा खरीदने के लिए ₹2,50,000 का लोन चाहिए।',
 'hi-IN', 'Under Review'),

('Priya Mondal', 29, 'Female', 'SC', 88000, 'Micro Enterprise', 100000, 115000,
 'Kolkata, West Bengal',
 'আমি প্রিয়া মণ্ডল। আমার একটি ছোট ব্যবসা শুরু করতে ১ লক্ষ টাকার ঋণ দরকার।',
 'bn-IN', 'New');
