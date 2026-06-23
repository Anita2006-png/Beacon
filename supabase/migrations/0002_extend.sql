-- Beacon — 0002_extend.sql
-- Adds: accessor identity on the audit log, a patient emergency-access kill
-- switch, and an expanded medical profile. Idempotent.

-- ── access_logs: denormalise WHO accessed (so the patient can see it without a
--    cross-user read, which RLS forbids). Written by the privileged path only.
alter table public.access_logs
  add column if not exists accessor_name  text,
  add column if not exists accessor_email text;

-- ── medical_profiles: kill switch + richer triage data ─────────────────────
alter table public.medical_profiles
  add column if not exists emergency_access_enabled boolean not null default true,
  add column if not exists date_of_birth date,
  add column if not exists sex text,
  add column if not exists organ_donor boolean,
  add column if not exists additional_notes text,            -- AES-encrypted
  add column if not exists emergency_contact_relationship text,
  add column if not exists emergency_contact_2_name text,
  add column if not exists emergency_contact_2_phone text,
  add column if not exists emergency_contact_2_relationship text,
  add column if not exists primary_physician_name text,
  add column if not exists primary_physician_phone text;

-- Constrain sex to a small plain-language set (drop first so it's idempotent).
alter table public.medical_profiles
  drop constraint if exists medical_profiles_sex_check;
alter table public.medical_profiles
  add constraint medical_profiles_sex_check
  check (sex is null or sex in ('female','male','intersex','prefer_not_to_say','unknown'));
