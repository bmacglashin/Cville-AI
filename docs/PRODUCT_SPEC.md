# Product Specification — Agent Ally MVP

**Status:** Built (validation phase) · **Last updated:** June 2026

## 1. Strategy in one paragraph

Agent Ally validates a premium local AI advisory practice by selling **paid AI Operating Audits**
to Charlottesville owner-led businesses — leading with design/build, remodeling,
architecture-adjacent, and premium home services, where the owner is still the unofficial COO.
The audit ($950 founding / $1,250 standard, $500 credited toward implementation within 14 days)
feeds a single-workflow **AI Workflow Quickstart** ($3,500 founding). **Owner Command Center
Lite** ($8,500 founding setup + $1,500/mo Operate retainer) is packaging for later, positioned
strictly post-audit. The software in this repo is the operating system for that motion: convert,
intake, deliver, track. It is not the product being sold.

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
   top 5 scored use cases → 30-day roadmap. May include a small mockup on dummy/approved
   non-sensitive data. **Primary CTA everywhere.**
2. **AI Workflow Quickstart** — $3,500 founding / $4,500–$5,000 standard. One workflow, two
   weeks, human-review checkpoints, written SOP, two weeks of adjustment. No custom platform.
3. **Owner Command Center Lite + Operate** — $8,500 founding / $12,500 standard setup;
   retainer from $1,500/mo. Private workspace, approved corpus, 1–2 role assistants, dashboard,
   monthly optimization. **Post-audit path only — never sold standalone.**

## 4. Personas & roles

| Role | Access |
| --- | --- |
| Visitor | Marketing site, `/apply` (no account) |
| Applicant (lead) | Row in `leads`; no login |
| Client (`profiles.role='client'`) | `/start-audit` wizard + `/portal` (own org only, via RLS) |
| Admin / Ben (`role='admin'`) | Everything: `/admin` CRM + all org data |

## 5. User journeys

**Buy journey (no account needed):** Home → offer page → `/apply` (5-min form) → lead created →
admin notified → fit call → audit paid (Stripe Payment Link, off-platform for now) → admin moves
pipeline stage.

**Delivery journey:** Client signs up → `/start-audit` 7-step wizard (business profile, goals,
tools, workflows, pain points, data sources + sensitivity, acknowledgments) → submission advances
pipeline to `intake_submitted` → Ben runs interview, logs `discovery_notes` → creates/scores
`ai_opportunities` → builds `roadmap_items`, `deliverables`, `tasks`, `proposals` in `/admin` →
client sees read-only state + messages in `/portal` (prototype).

**Pipeline:** `new_inquiry → fit_call_booked → audit_paid → intake_submitted → audit_scheduled →
audit_delivered → quickstart_proposed → implementation_active → retainer_active` (+
`closed_lost`).

## 6. Scope decisions (what we deliberately did NOT build)

| Deferred | Why | Where it's stubbed |
| --- | --- | --- |
| Document ingestion / file upload | Data-risk first; validation doesn't need it | `uploaded_documents.status='listed'`, portal documents page notice |
| Vector search / RAG | No corpus until clients + approvals exist | `docs/NEXT_STEPS.md`, prompt library ready |
| AI-generated audit summaries | Founder judgment IS the product right now | `src/lib/ai/generate-audit-summary.ts` + admin stub button |
| Client-facing AI chat / autonomous agents | Explicit risk boundary | Risk boundaries in content + terms |
| Programmatic Stripe billing | Payment Links suffice at this volume | `src/lib/stripe.ts` scaffold |
| Third-party integrations (Drive, HubSpot, QuickBooks…) | Post-validation | `docs/NEXT_STEPS.md` |
| Multi-org-per-user, teams, invites | One owner, one org is the validation case | schema supports later expansion |

## 7. Risk boundaries (product-level, non-negotiable)

No HIPAA/PHI, student records, tenant-screening/employment/credit/lending/insurance decisions,
legal/tax advice workflows, payroll decisioning, financial credentials, children's data, or
autonomous decisions. Human review is required for anything customer-facing, financial, legal,
HR, housing-related, or regulated. These appear: in site copy (`/about`, `/privacy`, `/terms`),
in the intake acknowledgments (stored as booleans on `audit_intakes`), and in
`docs/PRIVACY_AND_DATA_HANDLING_NOTES.md`.

## 8. Success criteria for this software

- A cold visitor can understand the offer and apply in under 5 minutes.
- Ben can run the entire sales+delivery motion from `/admin` without spreadsheets.
- A paying client completes intake in ≤ 20 minutes without help.
- Zero client data is accessible across org boundaries (RLS-enforced, tested).
- The site never overclaims: no platform language, no autonomy promises, no regulated-data
  readiness implications.
