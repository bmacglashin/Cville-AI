# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, RSC) | `src/proxy.ts` is the Next-16 rename of middleware |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS v4 | Design tokens in `src/app/globals.css` `@theme` |
| Components | Hand-rolled shadcn-style kit | `src/components/ui/*` — native elements, zero runtime deps beyond cva/clsx/tailwind-merge |
| Forms | react-hook-form + zod (`@hookform/resolvers`) | Public/client forms; admin uses plain `<form action>` server actions |
| Validation | zod v4 — single source in `src/lib/validation/intake.ts` | Same schemas client + server |
| Database | Supabase Postgres, migrations in `supabase/migrations/` | 22 tables, RLS on all |
| Auth | Supabase Auth via `@supabase/ssr` (cookie sessions) | |
| Email | Resend scaffold (`src/lib/email.ts`) | Console-log stub without key |
| Payments | Stripe scaffold (`src/lib/stripe.ts`) | Payment Link recommended for validation |
| Tests | Vitest (`tests/`) | Includes static migration-safety tests |
| Fonts | Fraunces (display) + Inter (body) via `next/font` | |

## Application structure

```
src/
├─ proxy.ts                  # session refresh + route gating (/portal, /admin, /start-audit)
├─ app/
│  ├─ (marketing)/           # 12 static pages, shared header/footer layout
│  ├─ (auth)/                # login, signup (centered card layout)
│  ├─ auth/callback/         # code exchange for email confirmation
│  ├─ start-audit/           # intake wizard (auth-gated) + server action
│  ├─ portal/                # client prototype workspace (8 pages, read-mostly)
│  ├─ admin/                 # internal CRM (pipeline, leads, clients, client detail)
│  ├─ sitemap.ts / robots.ts / opengraph-image.tsx
├─ components/
│  ├─ ui/                    # button, card, input, select, textarea, label, badge, alert, separator
│  ├─ marketing/             # logo, header, footer, section, cta-band
│  └─ status-badge, empty-state, setup-notice, analytics
├─ lib/
│  ├─ supabase/              # client.ts (browser) · server.ts (RSC/actions) · middleware.ts
│  ├─ actions/               # auth.ts · org.ts · admin.ts · comments.ts (all "use server")
│  ├─ validation/intake.ts   # zod schemas + option constants
│  ├─ types/database.ts      # hand-maintained row types (swap for generated later)
│  ├─ content.ts             # offers, workflows, FAQs, risk boundaries (single source)
│  ├─ prompts/               # versioned prompt templates (future AI features)
│  ├─ ai/                    # generate-audit-summary stub
│  ├─ email.ts / stripe.ts   # graceful-degradation scaffolds
│  └─ env.ts / utils.ts / portal.ts
└─ tests/                    # vitest suites
```

## Key decisions & rationale

**Zero-key boot.** Every entry point checks `isSupabaseConfigured()`. Without env vars the
marketing site is fully static and protected surfaces render a `SetupNotice`. This makes the
repo clonable-to-running in one command and keeps CI builds keyless.

**RLS is the security boundary, not the UI.** All client/portal reads and writes use the
anon-key server client bound to the user's cookies, so Postgres policies apply to every query.
Admin server actions re-verify `profiles.role='admin'` *and* RLS enforces it again beneath them.
The service-role key is unused in app code (test-enforced) — reserved for future background jobs.

**Two privilege-escalation guards in the database itself:** `profiles_protect_role` blocks
non-admins from changing roles even though they can update their own profile;
`organizations_protect_stage` blocks non-admins from moving pipeline stages while still letting
members edit their org profile. Client-driven stage advancement (intake submitted) happens via a
`security definer` trigger, not client privileges.

**Server actions over API routes.** Mutations are co-located with their forms
(`apply/actions.ts`, `start-audit/actions.ts`, `lib/actions/*`). Admin CRUD uses plain HTML
forms + server actions — no client-side state to break, works without JS.

**Progressive enhancement on intake.** The 7-step wizard keeps state in React + localStorage
(draft survival), validates per-step with the same zod schemas the server re-validates, and
submits once. Children rows (tools/workflows/pains/sources/docs) insert after the intake row;
order matters for FK integrity.

**Internal CRM, not SaaS.** Tables like `contacts`, `discovery_notes`, and `activity_events`
are admin-only by policy. The portal is intentionally read-mostly (comments are the only client
write) and wears a permanent "Prototype" banner.

## Future AI surface (designed, not built)

The seams for post-validation AI work already exist:

- `uploaded_documents` carries sensitivity + status for a future storage bucket + ingestion
  pipeline (add pgvector + an `embeddings` table when real corpora arrive).
- `src/lib/prompts/` holds versioned system/user prompts for the audit-summary drafter and the
  owner weekly brief; `docs/PROMPT_LIBRARY.md` documents usage rules (advisor-review-only
  outputs, regulated-data exclusions).
- `generateAuditSummary()` is the single entry point to make live; its admin button already
  exists with honest "not implemented" messaging.
- `activity_events` gives every future automation an audit trail to write to.

## Request flow (auth'd surfaces)

```
Request → src/proxy.ts (updateSession)
        → refresh Supabase session cookies
        → redirect to /login if hitting /portal|/admin|/start-audit signed out
        → layout guard (role check for /admin)
        → RSC page fetches via anon-key server client  ⇒  RLS applies
        → mutations via server actions  ⇒  zod validate → RLS-checked writes → revalidatePath
```
