# Agent Ally

**Practical AI implementation for Charlottesville owner-led businesses.**

This repository is a **validation-first** sales, intake, and delivery operating system for a
premium local AI advisory practice — *not* a multi-tenant SaaS product. It exists to sell and
deliver paid **AI Operating Audits** ($950 founding / $1,250 standard), follow them with
**AI Workflow Quickstarts** ($3,500 founding), and track everything in an internal CRM.

What's in the box:

| Surface | Purpose |
| --- | --- |
| Public site (12 pages) | Convert design/build & premium home-service owners to paid audit applications |
| `/apply` | No-account audit application → `leads` table → email notification |
| `/start-audit` | 7-step paid-audit intake wizard (account required, save-as-you-go) |
| `/portal` | **Prototype** client workspace (labeled as such) — roadmap, deliverables, tasks, messages |
| `/admin` | Ben's internal CRM: 10-stage pipeline, leads, client delivery workspace |
| `/demo/ops-brief` | Sample "Owner Weekly Ops Brief" built on fictional data |
| `supabase/` | Migrations (22 tables, full RLS), seed data, local config |
| `docs/` | Architecture, schema, security, launch checklist, prompt library |
| `docs/sales/` | Field kit: offer one-pager, scripts, outreach emails, delivery playbook |

## Quick start (zero keys required)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The entire marketing site works with no configuration.
Auth/portal/admin surfaces show a setup notice until Supabase is connected.

## Full local stack (with database)

1. **Install the Supabase CLI** (https://supabase.com/docs/guides/cli) and Docker.

2. **Start Supabase locally:**

   ```bash
   supabase start        # boots Postgres/auth/studio; prints URL + anon key
   supabase db reset     # applies migrations + seed.sql
   ```

3. **Configure the app:**

   ```bash
   cp .env.example .env.local
   # paste from `supabase start` output:
   #   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   #   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```

4. **Run it:**

   ```bash
   npm run dev
   ```

5. **Sign in with seeded demo users** (fictional data — see `supabase/seed.sql`):

   | Role | Email | Password |
   | --- | --- | --- |
   | Admin (Ben) | `admin@agentally.test` | `password123` |
   | Client (demo) | `client@agentally.test` | `password123` |

   The seed includes "Blue Ridge Custom Builders" — a fictional design/build client with a
   complete intake, scored opportunities, roadmap, proposal, deliverables, and tasks, so both
   `/admin` and `/portal` are fully populated on first run.

## Connecting a hosted Supabase project

1. Create a project at https://supabase.com/dashboard.
2. Link and push the schema:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push          # applies supabase/migrations
   ```

   **Do not run `supabase/seed.sql` in production** — it creates demo auth users with a known
   password. Production seeding needs only the three `service_packages` rows (copy that block
   alone if desired).

3. Put the hosted URL + anon key in `.env.local` (and in Vercel env vars for deploys).
4. Create your real account via `/signup`, then promote it in the SQL editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@yourdomain.com';
   ```

## Environment variables

See [.env.example](./.env.example) — every variable is optional except the two Supabase vars
(needed for auth/intake/portal/admin). Email (Resend), Stripe, Calendly, and analytics are
scaffolded and degrade gracefully to stubs/logs when unset. **The service-role key is never used
in app code today and must never appear client-side** (a test enforces this).

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest (validation, utils, content, migration-safety tests)
```

## Deploying (Vercel)

1. Import the repo in Vercel (framework: Next.js — zero config).
2. Set env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ optional Resend/Calendly/Plausible).
3. In Supabase → Authentication → URL Configuration, set the Site URL to your domain and add
   `https://yourdomain.com/auth/callback` to redirect URLs.
4. Work through [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) before announcing.

## Documentation map

- [docs/PRODUCT_SPEC.md](./docs/PRODUCT_SPEC.md) — what this MVP is and deliberately isn't
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — stack, app structure, design decisions
- [docs/SUPABASE_SCHEMA.md](./docs/SUPABASE_SCHEMA.md) — all 22 tables, enums, triggers
- [docs/RLS_POLICIES.md](./docs/RLS_POLICIES.md) — the security model, table by table
- [docs/PRIVACY_AND_DATA_HANDLING_NOTES.md](./docs/PRIVACY_AND_DATA_HANDLING_NOTES.md) — data stance + legal to-dos
- [docs/PROMPT_LIBRARY.md](./docs/PROMPT_LIBRARY.md) — versioned prompts for future AI features
- [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) + [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md)
- [docs/SALES_COPY.md](./docs/SALES_COPY.md) — positioning + message bank
- [docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md) — what's stubbed, deferred, and next
- `docs/sales/` — the 10-asset founder sales kit (offer one-pager → red flags)

## The honest scope statement

This codebase deliberately does **not** include: document ingestion, vector search/RAG,
client-facing AI chat, autonomous agents, live Stripe billing, or third-party integrations.
Those are stubbed with clear TODOs (see `src/lib/ai/`, `src/lib/stripe.ts`,
[docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)) and only get built after paid demand proves they
should exist. The client portal is a labeled prototype; buying an audit never requires it.
