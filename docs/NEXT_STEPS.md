# Next Steps

The honest ledger: what's done, what's stubbed, what's deliberately deferred — and the
recommended order of work.

## ✅ Built and verified (this repo)

- 12-page marketing site around the paid-audit offer (design/build ICP first)
- `/apply` application → `leads` (+ Resend notification scaffold)
- Auth (signup/login/confirm-callback/signout) with auto org creation
- 7-step intake wizard with localStorage drafts + zod validation both sides
- Client portal prototype (8 pages, labeled, org-scoped via RLS)
- Admin CRM: 10-stage pipeline board, leads management, full client delivery workspace
  (contacts, discovery notes, opportunities + 4-dimension scoring, roadmap, proposals + line
  items, deliverables, tasks, messages, activity log)
- Owner Weekly Ops Brief demo (fictional, disclaimed)
- 22-table schema, full RLS, privilege-escalation trigger guards, seed with rich demo org
- Stripe/Resend/AI scaffolds that degrade gracefully with zero keys
- 28 vitest tests incl. static migration-safety checks; lint/typecheck/build green
- Docs: architecture, schema, RLS, product spec, launch + QA checklists, privacy doctrine,
  prompt library, sales copy + 10 field assets

## 🔌 Needs Ben (keys/accounts — see LAUNCH_CHECKLIST for exact steps)

Hosted Supabase project + `db push` · domain + Vercel · Calendly link · Resend domain + key ·
Stripe Payment Link ($950) · real admin account promotion · live contact email replacing
`ben@agentally.co` placeholder · entity/MSA/insurance before first paid engagement.

## 🧱 Stubbed in code (intentional, with TODOs)

| Stub | Location | Unstub trigger |
| --- | --- | --- |
| AI audit-summary drafting | `src/lib/ai/generate-audit-summary.ts` (+ admin button) | After audit #2–3, when the manual template feels mechanical |
| Programmatic Stripe checkout + webhook | `src/lib/stripe.ts` | When Payment Links become operationally annoying |
| Email sends | `src/lib/email.ts` (logs without key) | Key set — already functional then |
| Document upload/storage | `uploaded_documents.storage_path` null; no bucket | First engagement that truly needs file exchange through the app |
| Owner brief generation | prompts in `src/lib/prompts/` | First Operate retainer |

## 🗺 Deferred deliberately (do NOT build before paid demand)

Generalized RAG/pgvector · client-facing AI chat · autonomous anything · workflow marketplace ·
Drive/Notion/HubSpot/QuickBooks integrations · multi-tenant billing · mobile app · writes to
client systems.

## Recommended next 5 implementation steps

1. **Connect production infrastructure** (Supabase project + `db push`, Vercel + domain, env
   vars, admin promotion) and run `docs/QA_CHECKLIST.md` against production. *~half a day.*
2. **Wire the conversion path live:** Calendly event + env var, Resend domain + notification
   email test, Stripe Payment Link created and saved. End-to-end test: apply → email → fit-call
   booking → payment link. *~half a day.*
3. **Run the 30-day validation sprint** out of `/admin`: 50 outreaches from
   `docs/sales/OUTREACH_EMAILS.md`, pipeline reviewed weekly against targets (3 audits,
   $2,850+, ≥1 implementation proposal). The software is done enough — this step is the
   business.
4. **After audit #1:** capture friction. Likely first code changes: PDF/print styling for the
   audit deliverable, intake follow-up email automation (Resend is already wired), and any
   intake questions the owner interview exposed as missing.
5. **After audit #2–3 (only if validated):** implement `generateAuditSummary()` with the Claude
   API per `docs/PROMPT_LIBRARY.md` (advisor-review-only output), then the Stripe webhook →
   auto-advance `audit_paid`. Revisit Command Center Lite packaging with real client evidence.

## Known limitations (acceptable for validation)

- One organization per user (first membership wins) — schema supports more later.
- Admin CRUD has no edit/delete UI for most rows (status changes + adds only) — use Supabase
  Studio for corrections during validation.
- Comments thread has no notifications — check `/admin` daily (or add Resend ping later).
- `next dev` may warn about multiple lockfiles if a parent dir has one — harmless here.
- Hand-maintained DB types; switch to generated types once hosted project exists.
