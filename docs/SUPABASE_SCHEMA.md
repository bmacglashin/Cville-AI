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
| `data_sensitivity` | `public`, `internal`, `confidential`, `regulated`, `prohibited` |
| `roadmap_phase` | `now`, `next`, `later` |
| `document_status` | `listed`, `uploaded`, `reviewed` |
| `call_type` | `fit_call`, `discovery`, `owner_interview`, `working_session`, `other` |
| `tool_category` | `foundational_workspace`, `llm_assistant`, `knowledge_base`, `automation`, `messaging_assistant`, `agent_workspace`, `project_management`, `crm`, `communication`, `custom_app`, `other` |
| `approval_status` | `approved`, `conditional`, `experimental`, `internal_only`, `rejected`, `needs_review` |
| `delivery_mode` | `existing_tools`, `managed_ai_workspace`, `point_solution`, `custom_glue`, `custom_app`, `decline_or_defer` |
| `recommendation_type` | `default`, `optional`, `premium`, `rejected`, `defer` |

`data_sensitivity` is the **single** classification taxonomy: `prohibited` (added by the
operating-layer migration) marks data classes that must never enter any tool or workflow —
the safety rails in `src/lib/safety.ts` force defer/decline on `regulated` and `prohibited`.

## Tables (28)

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

### Operating layer (migration `20260610130000_operating_layer.sql`)

- **`tool_vendors`** — the vetted tool catalog (ADMIN-ONLY). Identity (name, unique slug,
  `category tool_category`), doctrine (`approval_status`, `public_copy_allowed`,
  `client_owned_account_required`, `white_label_allowed bool null`), vetting fields mirroring
  `docs/VENDOR_VETTING_CHECKLIST.md` (`dpa_status`, `no_training_status`,
  `admin_controls_status`, `export_path_status`, `support_burden`, `longevity_notes`),
  `max_data_sensitivity` ceiling, `prohibited_use_cases jsonb`, `source_links jsonb`,
  candid `internal_notes` vs. shareable `public_notes`, and review cadence
  (`last_reviewed_at` / `next_review_at`).
- **`workflow_playbooks`** — the reusable method library (ADMIN-ONLY). `steps jsonb` is an
  **ordered array** of `{title, description, owner_role, tool_category, human_review,
  output_artifact}` — deliberately no separate steps table. Plus delivery defaults
  (`default_delivery_mode`, `default_tool_categories jsonb`, complexity check
  low/medium/high/custom), `max_data_sensitivity`, economics (`est_setup_hours_min/max`,
  `price_min/max_cents`, `retainer_fit` 1–5), `human_review_required` (default true),
  `success_metrics jsonb`, `active`.
- **`client_tool_instances`** — tools a client business actually runs. `tool_vendor_id`
  nullable (many client tools aren't in the AI catalog) plus a denormalized `tool_name` so the
  portal can display the client's own stack without piercing the admin-only catalog;
  `owner_type` check (`client_owned`/`agent_ally_managed`/`unknown`), `data_sensitivity`,
  free-text `status`, `monthly_cost_cents`, `review_date`, notes.
- **`stack_recommendations`** — a recommended operating stack per client: linked
  `audit_intake_id`, `delivery_mode`, `overall_data_sensitivity`, `assumptions jsonb`,
  `excluded_use_cases jsonb`, setup/retainer price ranges (cents), `status` check
  draft/reviewed/**shared** (clients only ever see shared), `created_by`.
- **`stack_recommendation_items`** — the stack lines, including the deliberate no's:
  `recommendation_type` covers `rejected`/`defer` WITH `reason`; `tool_vendor_id` nullable
  (category-level recommendations are first-class), `tool_category`, `use_case`,
  `data_boundary`, `monthly_cost_cents`, `sort_order`. Reads follow the parent recommendation.
- **`audit_readouts`** — the readout document: `generated_markdown` (deterministically
  assembled by `src/lib/readout.ts`, advisor-edited), links to intake + stack recommendation,
  `status` check draft/reviewed/sent/archived, `client_visible bool` (clients only ever see
  visible rows), `created_by`, `reviewed_at`.

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
`activity_events_created_at_idx`, `comments_entity_idx`; operating layer adds
`tool_vendors_category/approval_status`, `workflow_playbooks_active`, and FK indexes on
`client_tool_instances`, `stack_recommendations`, `stack_recommendation_items`,
`audit_readouts`).

## Storage

Not provisioned in MVP — deliberate. When document upload ships: create a private `documents`
bucket, path convention `{organization_id}/{filename}`, policies via
`is_org_member((storage.foldername(name))[1]::uuid)`, then flip `uploaded_documents.status`
to `uploaded` with the `storage_path`. See `docs/NEXT_STEPS.md`.
