# Product Specification — Copp Oak Advisory MVP + Operating Layer v1

**Status:** Built (validation phase) · **Last updated:** June 2026

## 1. Strategy in one paragraph

Copp Oak Advisory is a **tool-agnostic AI operating partner** for owner-led businesses: we audit the
business, recommend the right client-owned tool stack, configure safe workflows, document the
system, train the team, and stay on to operate and improve it. Existing tools first; custom
builds only when ROI, data risk, scope, and budget justify it. Validation runs in
Charlottesville — leading with design/build, remodeling, architecture-adjacent, and premium
home services, where the owner is still the unofficial COO. The paid **AI Operating Audit**
($950 founding / $1,250 standard, $500 credited toward implementation within 14 days) is the
front door, feeding the single-workflow **AI Workflow Quickstart** ($3,500 founding). The
**Managed AI Workspace + Operate** ($8,500 founding setup + retainer from $1,500/mo) is the
post-audit path — client-owned tools documented into one operating stack, explicitly *not* a
private platform. The software in this repo is the internal delivery engine for that motion:
convert, intake, recommend, deliver, track. **The proprietary asset is the method** (audit
methodology, opportunity scoring, data-risk framework, vendor vetting, workflow playbooks,
prompt library, QA, operating cadence) — never the portal. It is not the product being sold.

## 2. 30-day validation targets

| Metric | Target |
| --- | --- |
| Targeted outreaches | 50 |
| Discovery calls | 10–12 |
| Paid audits sold | 3 |
| Cash collected/scheduled | $2,850+ |
| Implementation proposals requested | ≥ 1 |

The admin pipeline header surfaces these targets. Sales assets in `docs/sales/` exist to hit them.

## 3. Product ladder

1. **AI Operating Audit** — $950 founding (first 5) / $1,250 standard. Fit call → paid intake →
   90-min owner interview → tool/process inventory → opportunity map with data-risk ranking →
   top 5 scored use cases → recommended client-owned tool stack → 30-day roadmap. May include a
   small mockup on dummy/approved non-sensitive data. **Primary CTA everywhere.**
2. **AI Workflow Quickstart** — $3,500 founding / $4,500–$5,000 standard. One workflow, two
   weeks, existing client-owned tools first, human-review checkpoints, written SOP, two weeks
   of adjustment. No custom platform.
3. **Managed AI Workspace + Operate** — $8,500 founding / $12,500 standard setup; retainer from
   $1,500/mo. Client-owned tools, selected workflow playbooks, a documented operating stack
   (SOPs, prompt library, data boundaries, human-review rules), team training, monthly
   operating cadence. **Not a private platform. Post-audit path only — never sold standalone.**
4. **Custom Supabase/Next.js builds** — paid-SOW-only, post-audit-only, when ROI/data-risk/
   scope/budget all justify it. Described inside the Managed AI Workspace page and FAQ — never
   a separate public product.

## 4. Personas & roles

| Role | Access |
| --- | --- |
| Visitor | Marketing site, `/apply` (no account) |
| Applicant (lead) | Row in `leads`; no login |
| Client (`profiles.role='client'`) | `/start-audit` wizard + `/portal` (own org only, via RLS) |
| Admin / Ben (`role='admin'`) | Everything: `/admin` CRM + delivery engine + all org data |

## 5. User journeys

**Buy journey (no account needed):** Home → offer page → `/apply` (5-min form) → lead created →
admin notified → fit call → audit paid (Stripe Payment Link, off-platform for now) → admin moves
pipeline stage.

**Delivery journey:** Client signs up → `/start-audit` 7-step wizard (business profile, goals,
tools, workflows, pain points, data sources + sensitivity, acknowledgments) → submission advances
pipeline to `intake_submitted` → Ben runs interview, logs `discovery_notes` → creates/scores
`ai_opportunities` → composes a `stack_recommendations` row (catalog vendors + playbooks, with
rejected/deferred items and reasons; safety rails force decline-or-defer on regulated areas) →
assembles the **audit readout** (deterministic markdown from intake/discovery/opportunity/stack
data, advisor-edited, optionally made client-visible) → generates the draft proposal from the
recommendation → builds `roadmap_items`, `deliverables`, `tasks` in `/admin` → client sees
read-only state, the shared stack, the readout, and messages in `/portal` (prototype "Client
Delivery Room").

**Operating layer (internal):** `/admin/tools` is the vetted vendor catalog (approval tiers,
data-sensitivity ceilings, public-copy rules per `docs/TOOL_DOCTRINE.md`); `/admin/playbooks`
is the reusable workflow playbook library; both feed per-client stack recommendations and
readouts.

**Pipeline:** `new_inquiry → fit_call_booked → audit_paid → intake_submitted → audit_scheduled →
audit_delivered → quickstart_proposed → implementation_active → retainer_active` (+
`closed_lost`).

## 6. Scope decisions (what we deliberately did NOT build)

| Deferred | Why | Where it's stubbed |
| --- | --- | --- |
| Document ingestion / file upload | Data-risk first; validation doesn't need it | `uploaded_documents.status='listed'`, portal documents page notice |
| Vector search / RAG | No corpus until clients + approvals exist | `docs/NEXT_STEPS.md`, prompt library ready |
| LLM-generated readouts/summaries | Deterministic generator + founder judgment ARE the product; AI drafting stays env-gated off (`AI_DRAFTING_ENABLED`) | `src/lib/ai/generate-audit-summary.ts` stub |
| Client-facing AI chat / unattended agents | Explicit risk boundary | Risk boundaries in content + terms |
| Operate-health dashboards / handoff-builder UI | Document-driven until the first retainer client exists | `docs/OPERATE_RETAINER_PLAYBOOK.md`, `docs/CLIENT_HANDOFF_TEMPLATE.md` |
| Live vendor integrations (incl. messaging/agent tools) | Catalog is advisory metadata, not connections | `tool_vendors` rows only |
| Separate playbook-steps table | jsonb steps suffice at this scale | `workflow_playbooks.steps` |
| PDF generation | Print-friendly readout view suffices | readout print view |
| Programmatic Stripe billing | Payment Links suffice at this volume | `src/lib/stripe.ts` scaffold |
| Third-party integrations (Drive, HubSpot, QuickBooks…) | Post-validation | `docs/NEXT_STEPS.md` |
| Multi-org-per-user, teams, invites | One owner, one org is the validation case | schema supports later expansion |

## 7. Risk boundaries (product-level, non-negotiable)

No HIPAA/PHI, student records, tenant-screening/employment/credit/lending/insurance decisions,
legal/tax advice workflows, payroll decisioning, financial credentials, children's data, or AI
acting without human review. Human review is required for anything customer-facing, financial,
legal, HR, housing-related, or regulated. Workflows touching those areas are **decline-or-defer
by code** (`src/lib/safety.ts` + the `prohibited`/`regulated` sensitivity rails). These appear:
in site copy (`/about`, `/privacy`, `/terms`), in the intake acknowledgments (stored as booleans
on `audit_intakes`), in `docs/PRIVACY_AND_DATA_HANDLING_NOTES.md`, and in
`docs/TOOL_DOCTRINE.md`.

## 8. Success criteria for this software

- A cold visitor can understand the offer and apply in under 5 minutes.
- Ben can run the entire sales+delivery motion from `/admin` without spreadsheets — including
  tool vetting, stack recommendation, readout assembly, and proposal generation.
- A paying client completes intake in ≤ 20 minutes without help.
- Zero client data is accessible across org boundaries (RLS-enforced, tested); internal vendor
  doctrine is never client-readable.
- The site never overclaims: no platform language, no autonomy promises, no vendor-affiliation
  implications, no regulated-data readiness implications (test-enforced).
