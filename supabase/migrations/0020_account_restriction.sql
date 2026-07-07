-- Beacon — 0020_account_restriction.sql
-- A restricted account is signed out and can't sign back in until an admin
-- lifts it. Enforced at two independent layers: profiles.restricted gates
-- every authenticated page load (getCurrentProfile force-signs-out a
-- restricted session on its very next request, and signInAction refuses a
-- restricted account outright), and Supabase's own ban_duration blocks new
-- logins/token refreshes at the Auth layer itself, regardless of our schema.

alter table public.profiles
  add column if not exists restricted boolean not null default false;
