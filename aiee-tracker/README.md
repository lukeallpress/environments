# AIEE Coalition Tracker

A web app for the Arizona Institute for Education and the Economy at NAU to track
coalition member organizations, contacts, events, attendance, interactions, and
engagement trends.

See [`PLAN.md`](./PLAN.md) for full scoping (architecture, data model, screens,
roadmap, deploy workflow).

**Status: Phase 0 scaffold.** Auth + branded shell + empty schema. CRUD and
data screens land in Phases 1–4.

## Stack

- **Next.js 16** (App Router, TypeScript) — UI + API in one repo
- **Tailwind CSS v4** — styling
- **Supabase** — Postgres + magic-link auth + storage
- **Vercel** — hosting (auto-deploy on push)

## First-time setup

### 1. Supabase project

1. Create a project at <https://supabase.com> (free tier is fine).
2. **Authentication → Providers → Email**: enable, turn **off** "Confirm email"
   (magic-link sign-in handles confirmation implicitly).
3. **Authentication → URL Configuration**:
   - Site URL: your production URL (or `http://localhost:3000` for now)
   - Redirect URLs: add both `http://localhost:3000/auth/callback` and the
     equivalent for any Vercel deploy URL you'll use.
4. **Project Settings → API**: grab the project URL and the **anon public** key.

### 2. Local env

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Apply database migrations

Easiest path: open the Supabase **SQL editor**, paste the contents of
`supabase/migrations/0001_init.sql`, run. Then do the same with
`supabase/seed.sql` after editing it to include real AIEE staff emails.

CLI path:

```bash
# one-time: install the Supabase CLI (https://supabase.com/docs/guides/cli)
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase db push          # applies migrations
```

### 4. Run locally

```bash
npm install
npm run dev
# open http://localhost:3000 → redirects to /login
```

Sign in with one of the emails you added to `staff_allowlist`. Check your
inbox for the magic link.

## Deploying to Vercel

1. Push this repo to `lukeallpress/aiee-tracker` on GitHub.
2. In Vercel, **Add New → Project** → import the repo.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Add the Vercel preview/prod URLs back into Supabase's redirect URL list.

## Project structure

```
src/
  app/
    (app)/              authenticated routes (dashboard, orgs, contacts, ...)
    auth/callback/      magic-link landing → exchanges code, checks allowlist
    auth/error/         friendly error page
    login/              magic-link sign-in form
    layout.tsx          root layout (fonts, html shell)
    page.tsx            redirects "/" to "/dashboard"
  components/           BrandMark, AppShell, SignOutButton
  lib/supabase/         browser + server + middleware clients
  middleware.ts         protects all routes that aren't in PUBLIC_PATHS
supabase/
  migrations/0001_init.sql  schema + RLS + engagement weights
  seed.sql                  staff allowlist (edit before running)
PLAN.md                 architecture, data model, roadmap, deploy workflow
```

## Visual style

NAU navy + gold with a cyan accent. Source Serif 4 for headings, Inter for UI.
Tokens live in `src/app/globals.css`. The current `BrandMark` is a hand-drawn
SVG placeholder of the AIEE stacked-triangle motif — swap in the official
logo file when available.
