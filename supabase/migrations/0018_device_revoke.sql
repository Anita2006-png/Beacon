-- Beacon — 0018_device_revoke.sql
-- Lets an account owner see (never write) their own login history and known
-- devices, same "select own" pattern as access_logs_select_own — so they can
-- review a flagged sign-in and reject the device it came from. Writes stay
-- admin/service-role only (signInAction, signUpAction, and the reject action).

alter table public.auth_events
  add column if not exists device_id text;

create policy "auth_events_select_own" on public.auth_events
  for select using (user_id = auth.uid());

create policy "known_devices_select_own" on public.known_devices
  for select using (user_id = auth.uid());
