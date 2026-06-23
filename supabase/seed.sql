-- Beacon — seed data (dev/demo only).
--
-- Creates ONE pre-approved healthcare provider you can sign in with:
--     Email:    provider@beacon.test
--     Password: BeaconDemo1!
--
-- Idempotent: safe to run more than once. Run it either via the Supabase CLI
-- (`supabase db reset` runs this automatically on a local stack) or by pasting
-- it into the hosted project's SQL Editor.
--
-- Notes:
--  * The password is hashed with pgcrypto's crypt(). If your SQL Editor can't
--    find crypt()/gen_salt(), prefix them with `extensions.` (e.g.
--    extensions.crypt(...)) — Supabase installs pgcrypto in the extensions schema.
--  * email_confirmed_at is set so the account works even with "Confirm email" on.

do $$
declare
  provider_id uuid;
begin
  -- 1) Auth user (create once).
  select id into provider_id from auth.users where email = 'provider@beacon.test';

  if provider_id is null then
    provider_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      provider_id,
      'authenticated',
      'authenticated',
      'provider@beacon.test',
      crypt('BeaconDemo1!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"provider","full_name":"Dr. Demo Provider"}',
      now(),
      now()
    );

    -- 2) Email identity so password sign-in works.
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      provider_id,
      provider_id::text,
      json_build_object('sub', provider_id::text, 'email', 'provider@beacon.test'),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  -- 3) Profile as an APPROVED provider (works whether or not the
  --    handle_new_user trigger already created a row).
  insert into public.profiles (id, role, provider_status, full_name)
  values (provider_id, 'provider', 'approved', 'Dr. Demo Provider')
  on conflict (id)
  do update set role = 'provider', provider_status = 'approved';
end $$;

-- ---------------------------------------------------------------------------
-- Admin account.
--   Email:    ijeoma@gmail.com
--   Password: Password
-- Admin powers come from the ADMIN_EMAILS allowlist in .env.local, so this is
-- just a normal (patient-role) account whose email is allowlisted for /admin.
-- ---------------------------------------------------------------------------
do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'ijeoma@gmail.com';

  if admin_id is null then
    admin_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      admin_id, 'authenticated', 'authenticated',
      'ijeoma@gmail.com',
      crypt('Password', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"patient","full_name":"Ijeoma"}',
      now(), now()
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), admin_id, admin_id::text,
      json_build_object('sub', admin_id::text, 'email', 'ijeoma@gmail.com'),
      'email', now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = crypt('Password', gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now())
     where id = admin_id;
  end if;

  insert into public.profiles (id, role, provider_status, full_name)
  values (admin_id, 'patient', 'none', 'Ijeoma')
  on conflict (id) do update set full_name = 'Ijeoma';
end $$;

-- ---------------------------------------------------------------------------
-- IMPORTANT: GoTrue cannot scan NULL token columns and returns
-- "Database error querying schema" (HTTP 500) on sign-in / listUsers when a
-- hand-inserted auth.users row leaves them NULL. Normalise them to ''.
-- ---------------------------------------------------------------------------
update auth.users set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where email in ('provider@beacon.test', 'ijeoma@gmail.com');
