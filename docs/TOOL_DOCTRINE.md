# Tool Doctrine

**The proprietary asset is the METHOD** — audit methodology, opportunity scoring, data-risk
framework, vendor vetting, workflow playbooks, prompt library, QA, operating cadence — never a
platform, never the portal, never a tool. This document is the internal rulebook for how tools
enter, live in, and leave Agent Ally engagements.

Positioning it serves: *"Agent Ally is a tool-agnostic AI operating partner for owner-led
businesses. We audit the business, recommend the right client-owned tool stack, configure safe
workflows, document the system, train the team, and stay on to operate and improve it. Existing
tools first. Custom builds only when ROI, data risk, scope, and budget justify it."*

## 1. Client-owned first — always

- Every tool is set up in **accounts the client's business owns**: their logins, their billing
  relationship, their data, their admin console. Agent Ally holds delegated/admin access only
  where the engagement requires it, documented in the handoff record.
- We never resell, sublicense, white-label, or mark up software. The client pays vendors
  directly. Our fee is for the method, configuration, documentation, training, and operation.
- "Your accounts. Your data. Our operating method." If a recommendation can't satisfy that
  sentence, it isn't a recommendation — it's a custom-build conversation (see §5) or a decline.

## 2. Public vs. internal tool naming rules

- **Public copy (website, ads, one-pagers, social):** tool *categories* only — foundational
  workspace, business-grade AI assistants, knowledge bases, automation platforms,
  messaging-native assistants, advanced agent workspaces, custom builds. Always with the
  disclaimer that specific tools are recommended case-by-case and remain subject to vendor
  terms, data requirements, and client approval. Never imply endorsement, affiliation,
  partnership, or resale of any vendor. (Enforced by `tests/banned-language.test.ts`.)
- **Client-facing engagement materials (readouts, proposals, SOPs):** specific vendors may be
  named **only if** the catalog row has `public_copy_allowed = true`, or the naming is a
  deliberate, reviewed act by the advisor inside a private deliverable. Vendors flagged
  `public_copy_allowed = false` are described by category in anything that could circulate.
- **Internal (admin catalog, seed notes, this doc):** full candor — real names, real terms
  concerns, real support-burden assessments.

## 3. Approval tiers (mirrors the `approval_status` enum)

| Tier | Meaning | Client use |
| --- | --- | --- |
| `approved` | Business-grade terms verified; standard recommendation | Yes |
| `conditional` | Fine within documented conditions (plan tier, data ceiling, DPA) | Yes, conditions in writing |
| `experimental` | Promising; terms or maturity unverified | Optional, low-risk point solutions only, flagged as experimental |
| `internal_only` | We use it to deliver; clients don't run it | No — internal cockpit / premium pilots only |
| `rejected` | Failed vetting | Never; record the reason |
| `needs_review` | In the catalog, vetting incomplete | Not until reviewed |

## 4. Category-specific rules

- **Messaging-native assistants (Poke-style):** optional, **low-risk point solutions only**.
  Never for regulated or confidential data; never for HR, tenant, or financial decisions.
  Typical consumer terms mean: personal-use license, the vendor may own automation
  recipes/workflows created on-platform, no white-label or resale rights. **Verify the current
  terms before any client use**, document the data boundary in the stack recommendation, and
  keep the vendor unnamed in public copy.
- **Advanced agent workspaces (Hermes-style):** **internal/premium only.** Our delivery cockpit
  and, rarely, a premium pilot inside a paid engagement. High support burden by definition.
  Client-side use requires a security review and its own paid SOW. Never in public copy.
- **Custom builds (Supabase/Next.js or similar):** **paid SOW only, post-audit only.** Built
  when — and only when — ROI, data risk, scope, and budget justify it and existing tools
  genuinely can't do the job. Described inside the Managed AI Workspace narrative, never as a
  standalone public product. The client owns the deployment target and accounts.
- **Everything else (workspace suites, LLM assistants, knowledge bases, automation):** follow
  the catalog row — approval tier, `max_data_sensitivity`, prohibited use cases, and the
  conditions recorded by the vetting checklist (`docs/VENDOR_VETTING_CHECKLIST.md`).

## 5. Data rules (non-negotiable)

- **No regulated data, anywhere, in any tool** — health/PHI, student records, tenant screening,
  employment/credit/lending/insurance decisioning, legal advice workflows, payroll decisioning,
  financial credentials, children's data. A workflow touching these is **decline-or-defer** in
  every recommendation and proposal — enforced in code (`src/lib/safety.ts`) and in the schema's
  `data_sensitivity` ceiling (`regulated`, `prohibited`).
- Every tool has a `max_data_sensitivity` ceiling; a workflow's data class must fit inside the
  ceiling of every tool it touches.
- Human review is required on anything customer-facing, financial, legal, HR, housing-related,
  or regulated-adjacent. Playbooks default to `human_review_required = true`; turning it off is
  an explicit, documented decision.

## 6. Lifecycle

Every catalog row carries `last_reviewed_at` / `next_review_at`. Re-vet on: plan changes,
terms-of-service changes, security incidents, or 12 months elapsed — whichever comes first.
Offboarding a tool follows `docs/CLIENT_HANDOFF_TEMPLATE.md`: export path exercised, access
revoked, client confirmation in writing.
