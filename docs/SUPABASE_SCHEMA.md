# Supabase Schema

Source of truth: `supabase/migrations/`. This document is the human-readable map.
Regenerate TypeScript types after schema changes:
`npx supabase gen types typescript --linked > src/lib/types/database.gen.ts`.

## Enums

| Enum | Values |
| --- | --- |
| `app_role` | `client`, `admin` |
| `org_member_role` | `owner`, `member` |
| `pipeline_stage` | `new_inquiry`, `fit_call_booked`, `audit_paid`, `intake_submitted`, `audit_scheduled`, `audit_delivered`, `quickstart_proposed`, `implementation_active`, `retainer_active`, `closed_lost` |
| `lead_status` | `new`, `contacted`, `qualified`, `converted`, `closed` |
| `intake_status` | `draft`, `submitted`, `in_review`, `complete` |
| `work_status` | `backlog`, `advisor_review`, `client_review`, `in_progress`, `done` |
| `task_status` | `todo`, `in_progress`, `blocked`, `done` |
| `proposal_status` | `draft`, `sent`, `accepted`, `declined` |
| `data_sensitivity` | `public`, `internal`, `confidential`, `regulated` |
| `roadmap_phase` | `now`, `next`, `later` |
| `document_status` | `listed`, `uploaded`, `reviewed` |
| `call_type` | `fit_call`, `discovery`, `owner_interview`, `working_session`, `other` |

## Tables (22)

### Identity & tenancy

- **`profiles`** — 1:1 with `auth.users` (created by `handle_new_user` trigger). `role app_role`
  is the admin switch. `profiles_protect_role` trigger blocks non-admin role changes.
- **`organizations`** — one row per client business. Carries `pipeline_stage` (the sales/delivery
  state machine), profile fields (industry, team_size, website, city, description).
  `organizations_protect_stage` trigger restricts stage changes to admins/definer functions.
- **`organization_members`** — `(organization_id, user_id, role)`; links users to orgs.

### CRM (admin-facing)

- **`contacts`** — people at prospect/client businesses; `is_primary`, `role_title`, notes.
- **`leads`** — public audit applications (`/apply`): name/email/company/industry/team_size/
  `biggest_bottleneck`/message, `source`, `status`, optional `organization_id` once converted.
- **`discovery_notes`** — call notes (`call_type`, `summary`, `occurred_at`). Admin-only.
- **`activity_events`** — append-only audit log: `event_type`, `entity_type/_id`, `metadata jsonb`.

### Audit intake

- **`audit_intakes`** — goals, budget_range, timeline, current_ai_usage, scheduling_preference,
  `data_sensitivity_ack` + `regulated_data_ack` booleans, notes. Insert fires
  `handle_intake_submitted` (security definer) → advances org stage to `intake_submitted`.
- **`tools_inventory`** — software in use (name, category, usage_notes).
- **`workflows`** — recurring manual workflows (name, description, frequency,
  `hours_per_week numeric(5,1)` check 0–168).
- **`pain_points`** — area, description, `severity smallint` check 1–5.
- **`data_sources`** — where knowledge lives + `sensitivity data_sensitivity`. Feeds the audit's
  data-risk ranking.
- **`uploaded_documents`** — document **listing** only in MVP (`status='listed'`,
  `storage_path` stays null until an upload pipeline exists). Carries sensitivity.

### Delivery

- **`ai_opportunities`** — candidate use cases (title, description, `workflow_type`,
  `status work_status`, `source`).
- **`opportunity_scores`** — unique per opportunity: `impact/effort/risk/data_readiness`
  smallints (1–5 checks), `owner_hours_saved_weekly`, and **generated column**
  `total_score = impact*2 + data_readiness − effort − risk` (range −8…+14; ≥7 is a strong bet).
- **`roadmap_items`** — phase (`now/next/later`), status, `target_window`, sort_order, optional
  `opportunity_id`.
- **`proposals`** + **`proposal_line_items`** — line items carry `unit_amount_cents`
  (negative = credit, e.g. the $500 audit credit), optional `service_package_id`.
- **`deliverables`** — audit reports, SOPs, mockups, briefs; `link_url` or future `storage_path`.
- **`tasks`** — `owner in ('advisor','client')`, status, due_date, optional roadmap link.
- **`comments`** — the advisor↔client message thread (`entity_type` defaults `organization`).

### Catalog

- **`service_packages`** — the product ladder; `founding_price_cents` + `standard_price_cents`,
  `active` flag, publicly readable when active. Seeded with the three offers.

## Functions & triggers

| Object | Kind | Purpose |
| --- | --- | --- |
| `set_updated_at()` | trigger fn | `updated_at` maintenance on all mutable tables |
| `handle_new_user()` | trigger on `auth.users` (security definer) | auto-create profile |
| `is_admin()` | helper (security definer, stable) | RLS admin checks without recursion |
| `is_org_member(uuid)` | helper (security definer, stable) | RLS membership checks |
| `protect_profile_role()` | trigger | blocks non-admin role escalation |
| `protect_org_stage()` | trigger | blocks non-admin pipeline manipulation |
| `handle_intake_submitted()` | trigger (security definer) | advances pipeline on intake insert |

## Indexes

Every FK used in queries is indexed (`*_organization_idx`, `*_intake_idx`,
`leads_status_idx`, `leads_created_at_idx`, `organizations_pipeline_stage_idx`,
`activity_events_created_at_idx`, `comments_entity_idx`).

## Storage

Not provisioned in MVP — deliberate. When document upload ships: create a private `documents`
bucket, path convention `{organization_id}/{filename}`, policies via
`is_org_member((storage.foldername(name))[1]::uuid)`, then flip `uploaded_documents.status`
to `uploaded` with the `storage_path`. See `docs/NEXT_STEPS.md`.
