-- Beacon — 0019_account_restriction_enum.sql
-- Adds two admin_action_type values for suspending/restoring an account.
-- Must be its own migration — Postgres cannot use a newly added enum value
-- in the same transaction it is added in (same rule as 0006_institution_enums).

alter type public.admin_action_type add value if not exists 'account_restrict';
alter type public.admin_action_type add value if not exists 'account_unrestrict';
