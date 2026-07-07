-- Beacon — 0017_device_recognition.sql
-- Tracks which devices (an opaque per-browser cookie id) have logged into
-- each account, so a login from a device that's never been seen on that
-- account before can be flagged. This is a heads-up signal, not a security
-- boundary — logins are never blocked on it, and it can be reset by clearing
-- cookies or spoofed by copying the cookie value. Same (user_id, device_id)
-- pair can legitimately recur across different accounts (e.g. a shared
-- clinic computer), so uniqueness is scoped per-account, not globally.

create table if not exists public.known_devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  device_id     text not null,
  user_agent    text,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  unique (user_id, device_id)
);
create index if not exists known_devices_user_idx on public.known_devices (user_id);

alter table public.known_devices enable row level security;
-- Deliberately no policies — same posture as auth_events. Only written/read
-- via the service-role client from signInAction/signUpAction.

alter table public.auth_events
  add column if not exists new_device boolean not null default false;
