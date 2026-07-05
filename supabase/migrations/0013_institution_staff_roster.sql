-- Beacon — 0013_institution_staff_roster.sql
-- A verified institution can pre-declare its expected staff (name, council
-- license number, practitioner type) — mirroring how a real hospital's
-- credentialing/HR office keeps a roster of who's actually cleared to
-- practice there. When a doctor later signs up and/or requests affiliation,
-- their license number can be checked against every institution's roster as
-- a corroborating signal.
--
-- This is a SIGNAL, not an auto-approval gate: it surfaces a match badge in
-- the admin verification queue and the institution's own pending-requests
-- queue, but the human reviewer still clicks Approve — same as every other
-- privileged status change in this app.

create table if not exists public.institution_staff_roster (
  id                uuid primary key default gen_random_uuid(),
  institution_id    uuid not null references public.institutions (id) on delete cascade,
  full_name         text not null,
  license_number    text not null,
  practitioner_type text not null default 'doctor'
                      check (practitioner_type in ('doctor','nurse')),
  created_at        timestamptz not null default now(),
  unique (institution_id, license_number)
);
create index if not exists institution_staff_roster_institution_idx
  on public.institution_staff_roster (institution_id);
-- Case-insensitive lookup by license number across all institutions.
create index if not exists institution_staff_roster_license_idx
  on public.institution_staff_roster (upper(license_number));

alter table public.institution_staff_roster enable row level security;

-- The institution manages its own roster.
drop policy if exists "isr_all_own_institution" on public.institution_staff_roster;
create policy "isr_all_own_institution" on public.institution_staff_roster
  for all using (
    institution_id in (select id from public.institutions where owner_id = auth.uid())
  ) with check (
    institution_id in (select id from public.institutions where owner_id = auth.uid())
  );

-- Any authenticated user may check a license number against every
-- institution's roster (the match-badge lookups run as the signed-in admin
-- or the signed-in institution reviewing their own pending requests — this
-- is just format/name/institution data, nothing patient-sensitive).
drop policy if exists "isr_select_authenticated" on public.institution_staff_roster;
create policy "isr_select_authenticated" on public.institution_staff_roster
  for select using (auth.role() = 'authenticated');
