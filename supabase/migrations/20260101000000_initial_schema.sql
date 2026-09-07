-- UnnatiSetu.ai Supabase Schema
-- Initial migration: tables, indexes, RLS policies
-- 
-- Design principle: Supabase is the data layer only.
-- Eligibility decisions remain in the deterministic rule engine service.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLE: schemes
-- ============================================================================
-- Real NSFDC scheme rules, editable without code deploy.
-- Public read access (applicants need rules to match), admin-only write.

create table schemes (
  scheme_id text primary key,
  scheme_name text not null,
  description text,
  eligibility jsonb not null,           -- {"caste_category": ["SC"], "max_annual_family_income_inr": 300000, ...}
  loan_terms jsonb not null,            -- {"interest_rate_to_beneficiary_percent": 8.0, "max_repayment_years": 7, ...}
  sectors_supported text[],
  last_verified date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_schemes_sectors on schemes using gin(sectors_supported);

comment on table schemes is 'Real NSFDC concessional credit scheme rules. Source of truth for eligibility matching.';
comment on column schemes.eligibility is 'Deterministic eligibility criteria as JSONB for rule engine evaluation.';

-- ============================================================================
-- TABLE: applicants
-- ============================================================================
-- Applicant profiles. Applicants never log in — they submit anonymously.
-- NO real PII beyond what's needed for demo. Admins-only read after submission.

create table applicants (
  applicant_id uuid primary key default gen_random_uuid(),
  name text,
  age int,
  gender text,
  caste_category text,
  annual_income numeric,
  business_sector text,
  loan_needed numeric,
  project_cost numeric,
  state_district text,
  nlp_intake_text text,                 -- original voice/text transcript (any of 6 languages)
  detected_language text,                -- e.g. 'hi-IN', 'ta-IN' from Sarvam text-lid
  status text default 'New' check (status in ('New','Under Review','Matched','Pending Documents','Disbursed')),
  created_at timestamptz default now()
);

create index idx_applicants_status on applicants(status);
create index idx_applicants_created on applicants(created_at desc);
create index idx_applicants_state_district on applicants(state_district);

comment on table applicants is 'Applicant submissions. Anonymous — no login required. Contains sensitive financial data, admin-only read.';
comment on column applicants.nlp_intake_text is 'Original free-text/voice input preserved for auditability and admin translation view.';

-- ============================================================================
-- TABLE: channel_partners
-- ============================================================================
-- Financial institutions (SCAs, banks) that process NSFDC loans.
-- Real location data where available; capacity/NPA fields synthetic for MVP.

create table channel_partners (
  partner_id uuid primary key default gen_random_uuid(),
  name text not null,
  latitude numeric,
  longitude numeric,
  state_district text,
  schemes_supported text[],             -- array of scheme_id
  capacity_score numeric,               -- synthetic for MVP — clearly flagged in UI
  npa_status_synthetic numeric,         -- explicitly named 'synthetic'
  last_verified date,
  created_at timestamptz default now()
);

create index idx_partners_location on channel_partners(latitude, longitude);
create index idx_partners_schemes on channel_partners using gin(schemes_supported);

comment on table channel_partners is 'Channel partners (SCAs, banks). Public read for geo-ranking. Capacity/NPA clearly synthetic in MVP.';

-- ============================================================================
-- TABLE: recommendations
-- ============================================================================
-- Output of the deterministic rule engine — one row per applicant-scheme match.
-- Stores the full audit trail (reasons passed/failed), NOT just a boolean.
-- Written by backend service role only, never directly from client.

create table recommendations (
  recommendation_id uuid primary key default gen_random_uuid(),
  applicant_id uuid references applicants(applicant_id) on delete cascade,
  scheme_id text references schemes(scheme_id),
  eligible boolean not null,
  reasons_passed text[],                -- e.g. ["RULE_CATEGORY: SC matches target", "RULE_INCOME: within limit"]
  reasons_failed text[],                -- e.g. ["RULE_GENDER: scheme restricted to Female"]
  match_score numeric,                  -- percentage (0-100)
  emi_estimate numeric,
  matched_partner_id uuid references channel_partners(partner_id),
  created_at timestamptz default now()
);

create index idx_recommendations_applicant on recommendations(applicant_id);
create index idx_recommendations_scheme on recommendations(scheme_id);
create index idx_recommendations_eligible on recommendations(eligible);

comment on table recommendations is 'Deterministic rule engine output. Full audit trail (reasons_passed/failed) for transparency.';
comment on column recommendations.reasons_passed is 'Array of rule codes + explanations that passed. Shown in UI audit accordion.';

-- ============================================================================
-- TABLE: nsfdc_admins
-- ============================================================================
-- NSFDC officers who log in to review applications. Linked to auth.users.
-- The ONLY role that authenticates. Applicants remain anonymous.

create table nsfdc_admins (
  admin_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  region text,
  role text default 'officer' check (role in ('officer','regional_head')),
  created_at timestamptz default now()
);

comment on table nsfdc_admins is 'NSFDC officer accounts. The only role that logs in. Linked to Supabase auth.users.';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- SCHEMES: public read, admin-only write
alter table schemes enable row level security;

create policy "public_can_read_schemes"
  on schemes for select
  using (true);

create policy "only_admins_can_modify_schemes"
  on schemes for all
  using (auth.uid() in (select admin_id from nsfdc_admins));

-- APPLICANTS: anyone can insert (anonymous submission), admin-only read/update
alter table applicants enable row level security;

create policy "anyone_can_submit_applicant"
  on applicants for insert
  with check (true);

create policy "only_admins_can_view_applicants"
  on applicants for select
  using (auth.uid() in (select admin_id from nsfdc_admins));

create policy "only_admins_can_update_applicants"
  on applicants for update
  using (auth.uid() in (select admin_id from nsfdc_admins));

-- CHANNEL_PARTNERS: public read (needed for geo-matching), admin-only write
alter table channel_partners enable row level security;

create policy "public_can_read_partners"
  on channel_partners for select
  using (true);

create policy "only_admins_can_modify_partners"
  on channel_partners for all
  using (auth.uid() in (select admin_id from nsfdc_admins));

-- RECOMMENDATIONS: service role only write (backend), admin read
-- NOTE: No public insert policy — recommendations must be written by the backend service,
-- never directly from client code, to prevent forged "eligible" results.
alter table recommendations enable row level security;

create policy "only_admins_can_view_recommendations"
  on recommendations for select
  using (auth.uid() in (select admin_id from nsfdc_admins));

-- Service role writes are handled by bypassing RLS via the service_role key in backend

-- NSFDC_ADMINS: admins can only read their own row
alter table nsfdc_admins enable row level security;

create policy "admins_can_read_own_profile"
  on nsfdc_admins for select
  using (auth.uid() = admin_id);

-- ============================================================================
-- TRIGGERS: updated_at timestamp auto-update
-- ============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_schemes_updated_at
  before update on schemes
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKET: admin_reports
-- ============================================================================
-- For CSV/PDF exports generated by admins. Admin-only upload/read.

insert into storage.buckets (id, name, public)
values ('admin_reports', 'admin_reports', false);

-- Storage RLS: only admins can upload/read
create policy "only_admins_can_upload_reports"
  on storage.objects for insert
  with check (
    bucket_id = 'admin_reports' and
    auth.uid() in (select admin_id from nsfdc_admins)
  );

create policy "only_admins_can_read_reports"
  on storage.objects for select
  using (
    bucket_id = 'admin_reports' and
    auth.uid() in (select admin_id from nsfdc_admins)
  );
