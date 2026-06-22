-- Beacon — Digital Health Passport
-- 0001_init.sql — schema, indexes, RLS, and the new-user trigger.
-- Apply via the Supabase SQL editor or `supabase db push`.
-- Source of truth: BUILD_SPEC.md §4–§6.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('patient', 'provider');
create type public.provider_status as enum ('none', 'pending', 'approved');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  role            public.user_role not null default 'patient',
  provider_status public.provider_status not null default 'none',
  full_name       text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- medical_profiles (1:1 with a patient profile)
-- allergies / medications / medical_conditions hold AES-256-GCM ciphertext
-- (packed iv:tag:ciphertext), written and read only by privileged server code.
-- ---------------------------------------------------------------------------
create table public.medical_profiles (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references public.profiles (id) on delete cascade,
  blood_group              text not null default 'unknown'
                             check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  allergies                text,           -- encrypted
  medications              text,           -- encrypted
  medical_conditions       text,           -- encrypted
  emergency_contact_name   text,
  emergency_contact_phone  text,
  qr_token                 uuid not null unique default gen_random_uuid(),
  updated_at               timestamptz not null default now()
);

create index medical_profiles_user_id_idx  on public.medical_profiles (user_id);
create index medical_profiles_qr_token_idx on public.medical_profiles (qr_token);

-- ---------------------------------------------------------------------------
-- access_logs (append-only audit trail)
-- ---------------------------------------------------------------------------
create table public.access_logs (
  id          uuid primary key default gen_random_uuid(),
  accessor_id uuid not null references public.profiles (id) on delete cascade,
  patient_id  uuid not null references public.medical_profiles (id) on delete cascade,
  access_type text not null default 'emergency_view',
  created_at  timestamptz not null default now()
);

create index access_logs_patient_id_idx on public.access_logs (patient_id);

-- ---------------------------------------------------------------------------
-- New-user trigger: create a profiles row from signup metadata.
-- A provider self-registration lands in provider_status = 'pending'.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role public.user_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role, 'patient'
  );
begin
  insert into public.profiles (id, role, provider_status, full_name)
  values (
    new.id,
    meta_role,
    case when meta_role = 'provider' then 'pending'::public.provider_status
         else 'none'::public.provider_status end,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security (BUILD_SPEC §5 — the authz core)
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.medical_profiles enable row level security;
alter table public.access_logs      enable row level security;

-- profiles: a user can see and update only their own row.
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Safety net for self-provisioning a profile if the trigger didn't fire.
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- medical_profiles: a patient has full CRUD over only their own record.
-- There is deliberately NO provider read policy — providers never read patient
-- data through the normal client; the privileged server path handles that.
create policy "medical_profiles_select_own"
  on public.medical_profiles for select
  using (user_id = auth.uid());

create policy "medical_profiles_insert_own"
  on public.medical_profiles for insert
  with check (user_id = auth.uid());

create policy "medical_profiles_update_own"
  on public.medical_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "medical_profiles_delete_own"
  on public.medical_profiles for delete
  using (user_id = auth.uid());

-- access_logs: a patient can read the access events for their own record.
-- There is NO client insert policy — logs are written only by the secret-key
-- server path (which bypasses RLS).
create policy "access_logs_select_own"
  on public.access_logs for select
  using (
    patient_id in (
      select id from public.medical_profiles where user_id = auth.uid()
    )
  );
