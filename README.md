# Beacon — Digital Health Passport & Emergency Medical ID

Beacon is a secure web app where a **patient** stores critical medical data (blood
group, allergies, medications, conditions, emergency contacts) and gets a QR code
linked to their profile. In an emergency, an authenticated, **approved healthcare
provider** scans the code and sees a restricted, glanceable emergency view. Every
access is logged.

One product, two modes:

- **Patient mode** — calm, spacious, reassuring. Manage your own record.
- **Emergency mode** — a stark, official "Emergency Medical ID" a responder reads
  in seconds on a phone.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19, Turbopack), TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme`), shadcn-style components, `lucide-react`, `sonner` |
| Display type | Fraunces (display) · Geist Sans (body) · Geist Mono (vitals) |
| Auth + DB | Supabase (`@supabase/supabase-js` + `@supabase/ssr`), Postgres + RLS |
| Encryption | Web Crypto AES-256-GCM on the sensitive medical fields |
| QR | `qrcode` (server-side) |
| Hosting | Vercel / Render (app) + Supabase (DB/Auth) |

Package manager is **pnpm**.

## Architecture

Three-tier, Supabase-backed:

- Patient self-service reads/writes go **client/server → Supabase with RLS**. A
  patient can only ever touch their own rows.
- The **emergency-access path** is the one piece of privileged server code. It
  runs in Next.js route handlers / server actions using the **secret key**: it
  decrypts the AES fields, writes an `access_logs` row, and returns the minimal
  emergency view to a provider who is *not* the row owner (which RLS would block).
- Sensitive fields (`allergies`, `medications`, `medical_conditions`) are
  AES-256-GCM encrypted **before** being stored and only decrypted server-side.
  The key never reaches the browser.

**Provider trust boundary:** providers self-register as `pending` and must be
flipped to `approved` (via the `/admin` screen) before they can open any emergency
record. This is the documented mitigation for the "anyone can claim to be a
clinician" gap.

## Project layout

```text
src/
  app/
    (auth)/         login, signup, forgot/reset password
    (patient)/      dashboard, profile/edit, qr, access-log  (+ shared layout)
    provider/       provider signup/login/home, pending
    admin/          provider approvals (allowlist-gated)
    e/[qr_token]/   the emergency triage view
    auth/callback/  email-link session exchange
    api/emergency/  privileged emergency-read JSON endpoint
  components/       ui primitives, auth, patient, emergency, admin, brand
  lib/              supabase clients, crypto, qr, emergency, auth, validation…
supabase/
  migrations/       schema + RLS + trigger
  seed.sql          demo provider + admin accounts
  templates/        branded auth email templates
  config.toml       email-template wiring (supabase config push)
```

## Getting started

### 1. Install

```bash
pnpm install
```

### 2. Environment

Copy the example and fill it in:

```bash
cp .env.example .env.local
```

| Var | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client | publishable key (`sb_publishable_…`; legacy anon JWT also works) |
| `SUPABASE_SECRET_KEY` | **server only** | secret key (`sb_secret_…`; legacy service_role also works) — bypasses RLS |
| `BEACON_ENCRYPTION_KEY` | **server only** | base64-encoded 32-byte AES-256 key |
| `ADMIN_EMAILS` | server only | comma-separated allowlist for `/admin` |
| `NEXT_PUBLIC_APP_URL` | client+server | base URL encoded into QR codes (no trailing slash) |

Generate an encryption key:

```bash
openssl rand -base64 32
```

> ⚠️ Changing `BEACON_ENCRYPTION_KEY` makes any already-encrypted data unreadable.

### 3. Database

Link the project and apply the schema with the Supabase CLI:

```bash
pnpm add -D supabase
pnpm supabase login
pnpm supabase link --project-ref <your-project-ref>
pnpm supabase db push          # applies supabase/migrations/*
pnpm supabase gen types typescript --linked > src/lib/database.types.ts   # optional
```

If tables already exist and `db push` reports conflicts, run
`pnpm supabase migration repair --status applied 0001` then push again, or apply
the missing pieces from the migration in the dashboard SQL Editor.

### 4. Seed demo accounts (optional)

Paste `supabase/seed.sql` into the dashboard **SQL Editor** (or `supabase db reset`
on a local stack). It creates:

- **Provider** — `provider@beacon.test` / `BeaconDemo1!` (pre-approved)
- **Admin** — `ijeoma@gmail.com` / `Password` (allowlisted for `/admin`)

> The seed normalises GoTrue's token columns to `''` — hand-inserting `auth.users`
> rows with `NULL` there causes a "Database error querying schema" 500 on sign-in.

### 5. Run

```bash
pnpm dev      # http://localhost:3000
```

## Auth emails

Branded templates live in `supabase/templates/` and are wired in
`supabase/config.toml`. Apply them with:

```bash
pnpm supabase config push
```

…or paste each file into **Authentication → Emails → Templates** in the dashboard.

- Email sends are rate-limited on Supabase's shared sender (~2–3/hour). For real
  volume, configure **custom SMTP** (Resend/Postmark/SendGrid) under
  *Project Settings → Authentication → SMTP*.
- For a frictionless demo you can turn **Confirm email** off
  (*Authentication → Providers → Email*).

## End-to-end demo flow

1. Sign up a patient → fill in the profile (`/profile/edit`) → view the QR (`/qr`).
2. In another browser, sign in as the seeded provider.
3. Open the patient's `/e/{qr_token}` (scan the QR or paste the URL) → the triage
   card renders and an entry appears in the patient's access log.

## Scripts

```bash
pnpm dev      # dev server (Turbopack)
pnpm build    # production build (runs type-check)
pnpm start    # serve the production build
pnpm lint     # eslint
pnpm test     # vitest (when tests are present)
```

## Deployment

- **App:** deploy to Vercel or Render. Set all env vars from the table above in
  the host's environment settings. Build command: `pnpm install --frozen-lockfile && pnpm build`.
- **Database/Auth:** Supabase. Add your deployed URL to *Authentication → URL
  Configuration* (Site URL + redirect URLs) so email links resolve.

---

Built by Ijeoma.
