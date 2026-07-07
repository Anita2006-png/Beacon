-- Beacon — 0016_provider_verifications_license_unique.sql
-- Prevents two different provider accounts from registering the same council
-- license number — e.g. someone signing up and claiming a real doctor's MDCN
-- number. Case/whitespace-normalized (upper + trim) so "mdcn-1001" and
-- " MDCN-1001 " are treated as the same number. This is the authoritative,
-- race-condition-proof guard; submitLicenseVerification also pre-checks for
-- a friendlier error message before hitting this constraint.
create unique index if not exists provider_verifications_license_norm_idx
  on public.provider_verifications (upper(trim(license_number)));
