-- ============================================================================
-- Copp Oak Advisory — Operating Layer v1
--
-- Internal delivery engine for the tool-agnostic operating-partner motion:
--   * tool_vendors          — vetted tool catalog (internal doctrine; admin-only)
--   * workflow_playbooks    — reusable workflow playbook library (admin-only)
--   * client_tool_instances — tools a client business actually runs
--   * stack_recommendations — per-client recommended operating stack
--   * stack_recommendation_items — the stack line items (incl. rejected/deferred)
--   * audit_readouts        — deterministic, advisor-edited audit readout docs
--
-- Doctrine: docs/TOOL_DOCTRINE.md. The catalog is advisory metadata — never
-- live vendor connections. Regulated/prohibited data forces decline-or-defer
-- (enforced in src/lib/safety.ts server actions; sensitivity ceilings here).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Extend the EXISTING sensitivity taxonomy (no parallel classification):
-- 'prohibited' marks data classes that must never enter any tool/workflow.
alter type public.data_sensitivity add value if not exists 'prohibited';

create type public.tool_category as enum (
  'foundational_workspace',
  'llm_assistant',
  'knowledge_base',
  'automation',
  'messaging_assistant',
  'agent_workspace',
  'project_management',
  'crm',
  'communication',
  'custom_app',
  'other'
);

create type public.approval_status as enum (
  'approved',
  'conditional',
  'experimental',
  'internal_only',
  'rejected',
  'needs_review'
);

create type public.delivery_mode as enum (
  'existing_tools',
  'managed_ai_workspace',
  'point_solution',
  'custom_glue',
  'custom_app',
  'decline_or_defer'
);

create type public.recommendation_type as enum (
  'default',
  'optional',
  'premium',
  'rejected',
  'defer'
);

-- ---------------------------------------------------------------------------
-- tool_vendors — the vetted tool catalog (ADMIN-ONLY: internal doctrine,
-- candid terms/risk notes, and do-not-recommend flags live here)
-- ---------------------------------------------------------------------------
create table public.tool_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category public.tool_category not null default 'other',
  approval_status public.approval_status not null default 'needs_review',
  short_description text,
  default_use_case text,
  public_copy_allowed boolean not null default false,
  client_owned_account_required boolean not null default true,
  white_label_allowed boolean,
  dpa_status text,
  no_training_status text,
  admin_controls_status text,
  export_path_status text,
  max_data_sensitivity public.data_sensitivity not null default 'internal',
  support_burden text,
  longevity_notes text,
  prohibited_use_cases jsonb not null default '[]'::jsonb,
  source_links jsonb not null default '[]'::jsonb,
  internal_notes text,
  public_notes text,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tool_vendors_updated_at
  before update on public.tool_vendors
  for each row execute function public.set_updated_at();

create index tool_vendors_category_idx on public.tool_vendors (category);
create index tool_vendors_approval_status_idx on public.tool_vendors (approval_status);

-- ---------------------------------------------------------------------------
-- workflow_playbooks — reusable delivery playbooks (ADMIN-ONLY).
-- steps is an ORDERED jsonb array of objects:
--   { title, description, owner_role, tool_category, human_review, output_artifact }
-- (deliberately NO separate steps table — see docs/PRODUCT_SPEC.md scope)
-- ---------------------------------------------------------------------------
create table public.workflow_playbooks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  target_icp text,
  pain_addressed text,
  description text,
  default_delivery_mode public.delivery_mode not null default 'existing_tools',
  complexity text not null default 'medium' check (complexity in ('low', 'medium', 'high', 'custom')),
  default_tool_categories jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  max_data_sensitivity public.data_sensitivity not null default 'internal',
  est_setup_hours_min numeric(5, 1) check (est_setup_hours_min is null or est_setup_hours_min >= 0),
  est_setup_hours_max numeric(5, 1) check (est_setup_hours_max is null or est_setup_hours_max >= 0),
  price_min_cents bigint check (price_min_cents is null or price_min_cents >= 0),
  price_max_cents bigint check (price_max_cents is null or price_max_cents >= 0),
  retainer_fit smallint not null default 3 check (retainer_fit between 1 and 5),
  human_review_required boolean not null default true,
  success_metrics jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workflow_playbooks_updated_at
  before update on public.workflow_playbooks
  for each row execute function public.set_updated_at();

create index workflow_playbooks_active_idx on public.workflow_playbooks (active);

-- ---------------------------------------------------------------------------
-- client_tool_instances — tools a client business actually runs.
-- tool_name is a denormalized display label: many client tools are not in
-- the curated catalog, and tool_vendors stays admin-only by policy, so the
-- portal needs a client-safe name on the instance row itself.
-- ---------------------------------------------------------------------------
create table public.client_tool_instances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tool_vendor_id uuid references public.tool_vendors (id) on delete set null,
  tool_name text not null,
  owner_type text not null default 'client_owned'
    check (owner_type in ('client_owned', 'advisor_managed', 'unknown')),
  purpose text,
  data_sensitivity public.data_sensitivity not null default 'internal',
  status text not null default 'active',
  monthly_cost_cents bigint check (monthly_cost_cents is null or monthly_cost_cents >= 0),
  review_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger client_tool_instances_updated_at
  before update on public.client_tool_instances
  for each row execute function public.set_updated_at();

create index client_tool_instances_organization_idx on public.client_tool_instances (organization_id);
create index client_tool_instances_tool_vendor_idx on public.client_tool_instances (tool_vendor_id);

-- ---------------------------------------------------------------------------
-- stack_recommendations — a recommended operating stack for one client.
-- Clients see a recommendation only once it is deliberately shared.
-- ---------------------------------------------------------------------------
create table public.stack_recommendations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_intake_id uuid references public.audit_intakes (id) on delete set null,
  title text not null,
  summary text,
  delivery_mode public.delivery_mode not null default 'existing_tools',
  overall_data_sensitivity public.data_sensitivity not null default 'internal',
  assumptions jsonb not null default '[]'::jsonb,
  excluded_use_cases jsonb not null default '[]'::jsonb,
  setup_price_min_cents bigint check (setup_price_min_cents is null or setup_price_min_cents >= 0),
  setup_price_max_cents bigint check (setup_price_max_cents is null or setup_price_max_cents >= 0),
  retainer_min_cents bigint check (retainer_min_cents is null or retainer_min_cents >= 0),
  retainer_max_cents bigint check (retainer_max_cents is null or retainer_max_cents >= 0),
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'shared')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stack_recommendations_updated_at
  before update on public.stack_recommendations
  for each row execute function public.set_updated_at();

create index stack_recommendations_organization_idx on public.stack_recommendations (organization_id);
create index stack_recommendations_audit_intake_idx on public.stack_recommendations (audit_intake_id);
create index stack_recommendations_created_by_idx on public.stack_recommendations (created_by);

-- ---------------------------------------------------------------------------
-- stack_recommendation_items — the stack lines, including rejected/deferred
-- items WITH reasons (the "what we do NOT recommend" half of the method).
-- ---------------------------------------------------------------------------
create table public.stack_recommendation_items (
  id uuid primary key default gen_random_uuid(),
  stack_recommendation_id uuid not null references public.stack_recommendations (id) on delete cascade,
  tool_vendor_id uuid references public.tool_vendors (id) on delete set null,
  tool_category public.tool_category not null default 'other',
  recommendation_type public.recommendation_type not null default 'default',
  use_case text not null,
  reason text,
  data_boundary text,
  monthly_cost_cents bigint check (monthly_cost_cents is null or monthly_cost_cents >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index stack_recommendation_items_recommendation_idx
  on public.stack_recommendation_items (stack_recommendation_id);
create index stack_recommendation_items_tool_vendor_idx
  on public.stack_recommendation_items (tool_vendor_id);

-- ---------------------------------------------------------------------------
-- audit_readouts — the audit readout document (deterministic markdown,
-- advisor-edited). Clients see a readout only when client_visible is set.
-- ---------------------------------------------------------------------------
create table public.audit_readouts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_intake_id uuid references public.audit_intakes (id) on delete set null,
  stack_recommendation_id uuid references public.stack_recommendations (id) on delete set null,
  title text not null,
  generated_markdown text not null default '',
  status text not null default 'draft' check (status in ('draft', 'reviewed', 'sent', 'archived')),
  client_visible boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger audit_readouts_updated_at
  before update on public.audit_readouts
  for each row execute function public.set_updated_at();

create index audit_readouts_organization_idx on public.audit_readouts (organization_id);
create index audit_readouts_audit_intake_idx on public.audit_readouts (audit_intake_id);
create index audit_readouts_stack_recommendation_idx on public.audit_readouts (stack_recommendation_id);
create index audit_readouts_created_by_idx on public.audit_readouts (created_by);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.tool_vendors enable row level security;
alter table public.workflow_playbooks enable row level security;
alter table public.client_tool_instances enable row level security;
alter table public.stack_recommendations enable row level security;
alter table public.stack_recommendation_items enable row level security;
alter table public.audit_readouts enable row level security;

-- tool_vendors — internal doctrine: admin only, never client- or anon-readable.
create policy "tool_vendors: admin all"
  on public.tool_vendors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- workflow_playbooks — internal method: admin only.
create policy "workflow_playbooks: admin all"
  on public.workflow_playbooks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- client_tool_instances — members read their own org's stack; admin manages.
create policy "client_tool_instances: members and admin read"
  on public.client_tool_instances for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "client_tool_instances: admin write"
  on public.client_tool_instances for insert
  to authenticated
  with check (public.is_admin());

create policy "client_tool_instances: admin update"
  on public.client_tool_instances for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "client_tool_instances: admin delete"
  on public.client_tool_instances for delete
  to authenticated
  using (public.is_admin());

-- stack_recommendations — members read only deliberately shared rows.
create policy "stack_recommendations: members read shared, admin all"
  on public.stack_recommendations for select
  to authenticated
  using (
    public.is_admin()
    or (public.is_org_member(organization_id) and status = 'shared')
  );

create policy "stack_recommendations: admin write"
  on public.stack_recommendations for insert
  to authenticated
  with check (public.is_admin());

create policy "stack_recommendations: admin update"
  on public.stack_recommendations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "stack_recommendations: admin delete"
  on public.stack_recommendations for delete
  to authenticated
  using (public.is_admin());

-- stack_recommendation_items — read follows the parent recommendation.
create policy "stack_recommendation_items: read follows parent"
  on public.stack_recommendation_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.stack_recommendations r
      where r.id = stack_recommendation_id
        and public.is_org_member(r.organization_id)
        and r.status = 'shared'
    )
  );

create policy "stack_recommendation_items: admin write"
  on public.stack_recommendation_items for insert
  to authenticated
  with check (public.is_admin());

create policy "stack_recommendation_items: admin update"
  on public.stack_recommendation_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "stack_recommendation_items: admin delete"
  on public.stack_recommendation_items for delete
  to authenticated
  using (public.is_admin());

-- audit_readouts — members read only rows deliberately made client-visible.
create policy "audit_readouts: members read client-visible, admin all"
  on public.audit_readouts for select
  to authenticated
  using (
    public.is_admin()
    or (public.is_org_member(organization_id) and client_visible = true)
  );

create policy "audit_readouts: admin write"
  on public.audit_readouts for insert
  to authenticated
  with check (public.is_admin());

create policy "audit_readouts: admin update"
  on public.audit_readouts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "audit_readouts: admin delete"
  on public.audit_readouts for delete
  to authenticated
  using (public.is_admin());
