-- Beacon — 0015_admin_auth_log_views.sql
-- Per-admin bookmark of when they last opened /admin/auth-log, used only to
-- compute a "new since last visit" badge count in the admin sidebar. This is
-- NOT a per-event read/dismiss system like notification_reads — auth_events
-- itself always shows every row; this just tracks one watermark timestamp
-- per admin so the badge can count events newer than it.

create table if not exists public.admin_auth_log_views (
  admin_user_id  uuid primary key references public.profiles (id) on delete cascade,
  last_viewed_at timestamptz not null default now()
);

alter table public.admin_auth_log_views enable row level security;
-- Deliberately no policies — matches admin_actions/auth_events. Only the
-- service-role/admin client reads or writes this, which is how every admin
-- page already talks to the database.
