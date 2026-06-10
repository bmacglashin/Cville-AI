# Next Steps

The honest ledger: what's done, what's stubbed, what's deliberately deferred — and the
recommended order of work.

**Productization rule:** do not productize ANY internal capability until **≥3 clients ask for
(or pay for) the same thing**. Documents before dashboards. The operating layer exists to make
delivery faster, not to grow public platform surface.

## ✅ Built and verified (this repo)

- 13-page marketing site around the paid-audit offer, refit to the tool-agnostic
  operating-partner positioning (design/build ICP first; `/managed-workspace` replaces the old
  command-center page with a permanent redirect)
- `/apply` application → `leads` (+ Resend notification scaffold)
- Auth (signup/login/confirm-callback/signout) with auto org creation
- 7-step intake wizard with localStorage drafts + zod validation both sides
- Client portal prototype ("Client Delivery Room", 10 pages, labeled, org-scoped via RLS) —
  incl. read-only operating stack + audit readout views
- Admin CRM: 10-stage pipeline board, leads management, full client delivery workspace
  (contacts, discovery notes, opportunities + 4-dimension scoring, roadmap, proposals + line
  items, deliverables, tasks, messages, activity log)
- **Operating layer v1:** vetted tool-vendor catalog (`/admin/tools`), workflow playbook
  library (`/admin/playbooks`), per-client tool instances + stack recommendation builder
  (`/admin/clients/[orgId]/stack`), deterministic audit-readout builder + print view
  (`/admin/clients/[orgId]/readout`), proposal generation from a recommendation, safety rails
  forcing decline-or-defer on regulated/prohibited work
- Owner Weekly Ops Brief demo (fictional, disclaimed)
- 28-table schema, full RLS, privilege-escalation trigger guards, seed with rich demo org +
  internal vendor/playbook catalog
- Stripe/Resend/AI scaffolds that degrade gracefully with zero keys
- Vitest suites incl. static migration-safety checks + banned-language scan; lint/typecheck/
  build green
- Docs: architecture, schema, RLS, product spec, launch + QA checklists, privacy doctrine,
  tool doctrine, vendor vetting checklist, operate playbook, handoff template, prompt library,
  sales copy + 11 field assets

## 🔌 Needs Ben (keys/accounts — see LAUNCH_CHECKLIST for exact steps)

Hosted Supabase project + `db push` · domain + Vercel · Calendly link · Resend domain + key ·
Stripe Payment Link ($950) · real admin account promotion · live contact email replacing
`ben@coppoakadvisory.com` placeholder · entity/MSA/insurance before first paid engagement · verify
vendor terms for every catalog row still marked `needs_review` (see
`docs/VENDOR_VETTING_CHECKLIST.md`) before recommending those tools to a paying client.

## 🧱 Stubbed in code (intentional, with TODOs)

| Stub | Location | Unstub trigger |
| --- | --- | --- |
| LLM-assisted readout drafting | `src/lib/ai/generate-audit-summary.ts` behind `AI_DRAFTING_ENABLED=false`; readout builder is deterministic | After audit #2–3, when the deterministic draft feels mechanical |
| Programmatic Stripe checkout + webhook | `src/lib/stripe.ts` | When Payment Links become operationally annoying |
| Email sends | `src/lib/email.ts` (logs without key) | Key set — already functional then |
| Document upload/storage | `uploaded_documents.storage_path` null; no bucket | First engagement that truly needs file exchange through the app |
| Owner brief generation | prompts in `src/lib/prompts/` | First Operate retainer |

## 🗺 Deferred deliberately (do NOT build before paid demand)

- **Operate-health dashboards / `operate_health_checks` tables** — the monthly cadence runs as
  a document (`docs/OPERATE_RETAINER_PLAYBOOK.md`) **until the first retainer client exists**,
  and gets software only per the ≥3-clients rule.
- **Handoff-asset DB + handoff-builder UI** — `docs/CLIENT_HANDOFF_TEMPLATE.md` is the product
  **until the first retainer client exists**.
- Live integrations with any vendor (including messaging-assistant or agent-workspace APIs) —
  the catalog is advisory metadata, never connections.
- Generalized RAG/pgvector · client-facing AI chat · anything acting without human review ·
  workflow marketplace · Drive/Notion/HubSpot/QuickBooks integrations · multi-tenant billing ·
  mobile app · writes to client systems · PDF generation (print view suffices) · a separate
  playbook-steps table.

## Recommended next 5 implementation steps

1. **Connect production infrastructure** (Supabase project + `db push`, Vercel + domain, env
   vars, admin promotion) and run `docs/QA_CHECKLIST.md` against production. *~half a day.*
2. **Wire the conversion path live:** Calendly event + env var, Resend domain + notification
   email test, Stripe Payment Link created and saved. End-to-end test: apply → email → fit-call
   booking → payment link. *~half a day.*
3. **Run the 30-day validation sprint** out of `/admin`: 50 outreaches from
   `docs/sales/OUTREACH_EMAILS.md` (new positioning line), pipeline reviewed weekly against
   targets (3 audits, $2,850+, ≥1 implementation proposal). The software is done enough — this
   step is the business.
4. **After audit #1:** capture friction. Run the readout builder against a real engagement and
   note where the deterministic draft needed the most editing; verify any vendor rows the
   recommendation touched (`needs_review` → vetted); refine playbook pricing from actuals.
5. **After audit #2–3 (only if validated):** consider enabling `AI_DRAFTING_ENABLED` by
   implementing `generateAuditSummary()` with the Claude API per `docs/PROMPT_LIBRARY.md`
   (advisor-review-only output), then the Stripe webhook → auto-advance `audit_paid`. Revisit
   Managed AI Workspace packaging with real client evidence.

## Known limitations (acceptable for validation)

- One organization per user (first membership wins) — schema supports more later.
- Admin CRUD has no edit/delete UI for most rows (status changes + adds only; tools/playbooks
  do have full edit forms) — use Supabase Studio for other corrections during validation.
- Comments thread has no notifications — check `/admin` daily (or add Resend ping later).
- `next dev` may warn about multiple lockfiles if a parent dir has one — harmless here.
- Hand-maintained DB types; switch to generated types once hosted project exists.
