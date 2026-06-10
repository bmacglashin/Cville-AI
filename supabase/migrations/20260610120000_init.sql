-- ============================================================================
-- Copp Oak Advisory — initial schema
-- Scope: internal validation + delivery backend (CRM, audit intake, delivery
-- tracking) for a founder-led AI advisory business. NOT a multi-tenant SaaS.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('client', 'admin');

create type public.org_member_role as enum ('owner', 'member');

-- Validation-first sales + delivery pipeline.
create type public.pipeline_stage as enum (
  'new_inquiry',
  'fit_call_booked',
  'audit_paid',
  'intake_submitted',
  'audit_scheduled',
  'audit_delivered',
  'quickstart_proposed',
  'implementation_active',
  'retainer_active',
  'closed_lost'
);

create type public.lead_status as enum ('new', 'contacted', 'qualified', 'converted', 'closed');

create type public.intake_status as enum ('draft', 'submitted', 'in_review', 'complete');

create type public.work_status as enum (
  'backlog',
  'advisor_review',
  'client_review',
  'in_progress',
  'done'
);

create type public.task_status as enum ('todo', 'in_progress', 'blocked', 'done');

create type public.proposal_status as enum ('draft', 'sent', 'accepted', 'declined');

create type public.data_sensitivity as enum ('public', 'internal', 'confidential', 'regulated');

create type public.roadmap_phase as enum ('now', 'next', 'later');

create type public.document_status as enum ('listed', 'uploaded', 'reviewed');

create type public.call_type as enum (
  'fit_call',
  'discovery',
  'owner_interview',
  'working_session',
  'other'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role public.app_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helper functions (security definer so policies can check membership
-- without infinite recursion).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org and user_id = (select auth.uid())
  );
$$;

-- Prevent privilege escalation: only admins may change a profile's role.
-- (auth.uid() is null for service-role / direct SQL, which stays allowed.)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- organizations — one row per client business
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  industry text,
  team_size text,
  website text,
  city text default 'Charlottesville',
  state text default 'VA',
  description text,
  pipeline_stage public.pipeline_stage not null default 'new_inquiry',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create index organizations_pipeline_stage_idx on public.organizations (pipeline_stage);
create index organizations_created_by_idx on public.organizations (created_by);

-- Members may edit their org profile, but only admins move pipeline stage.
-- (Stage changes from client actions happen via security-definer triggers.)
create or replace function public.protect_org_stage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pipeline_stage is distinct from old.pipeline_stage
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change the pipeline stage';
  end if;
  return new;
end;
$$;

create trigger organizations_protect_stage
  before update on public.organizations
  for each row execute function public.protect_org_stage();

-- ---------------------------------------------------------------------------
-- organization_members — links auth users to organizations
-- ---------------------------------------------------------------------------
create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.org_member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);

-- ---------------------------------------------------------------------------
-- contacts — people at prospect/client businesses (internal CRM)
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  role_title text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create index contacts_organization_idx on public.contacts (organization_id);

-- ---------------------------------------------------------------------------
-- leads — public audit applications and inquiries (anon-insertable)
-- ---------------------------------------------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  industry text,
  team_size text,
  biggest_bottleneck text,
  message text,
  source text not null default 'website',
  status public.lead_status not null default 'new',
  organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- audit_intakes — structured paid-audit intake submissions
-- ---------------------------------------------------------------------------
create table public.audit_intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  submitted_by uuid references public.profiles (id) on delete set null,
  status public.intake_status not null default 'submitted',
  goals text,
  budget_range text,
  timeline text,
  current_ai_usage text,
  scheduling_preference text,
  data_sensitivity_ack boolean not null default false,
  regulated_data_ack boolean not null default false,
  additional_notes text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger audit_intakes_updated_at
  before update on public.audit_intakes
  for each row execute function public.set_updated_at();

create index audit_intakes_organization_idx on public.audit_intakes (organization_id);

-- Advance the sales pipeline when a client submits intake. Security definer
-- because clients cannot update organizations.pipeline_stage themselves.
create or replace function public.handle_intake_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.organizations
  set pipeline_stage = 'intake_submitted'
  where id = new.organization_id
    and pipeline_stage in ('new_inquiry', 'fit_call_booked', 'audit_paid');
  return new;
end;
$$;

create trigger audit_intakes_advance_stage
  after insert on public.audit_intakes
  for each row execute function public.handle_intake_submitted();

-- ---------------------------------------------------------------------------
-- discovery_notes — internal call notes (fit calls, owner interviews)
-- ---------------------------------------------------------------------------
create table public.discovery_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  call_type public.call_type not null default 'discovery',
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index discovery_notes_organization_idx on public.discovery_notes (organization_id);

-- ---------------------------------------------------------------------------
-- tools_inventory — software/tools a business currently uses
-- ---------------------------------------------------------------------------
create table public.tools_inventory (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.audit_intakes (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  category text,
  usage_notes text,
  created_at timestamptz not null default now()
);

create index tools_inventory_organization_idx on public.tools_inventory (organization_id);
create index tools_inventory_intake_idx on public.tools_inventory (intake_id);

-- ---------------------------------------------------------------------------
-- workflows — recurring manual workflows reported in intake/discovery
-- ---------------------------------------------------------------------------
create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.audit_intakes (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  frequency text,
  hours_per_week numeric(5, 1) check (hours_per_week is null or (hours_per_week >= 0 and hours_per_week <= 168)),
  created_at timestamptz not null default now()
);

create index workflows_organization_idx on public.workflows (organization_id);
create index workflows_intake_idx on public.workflows (intake_id);

-- ---------------------------------------------------------------------------
-- pain_points — rated operational pain points
-- ---------------------------------------------------------------------------
create table public.pain_points (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.audit_intakes (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  area text,
  description text not null,
  severity smallint not null default 3 check (severity between 1 and 5),
  created_at timestamptz not null default now()
);

create index pain_points_organization_idx on public.pain_points (organization_id);
create index pain_points_intake_idx on public.pain_points (intake_id);

-- ---------------------------------------------------------------------------
-- data_sources — where business knowledge lives, ranked by sensitivity
-- ---------------------------------------------------------------------------
create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.audit_intakes (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  source_type text,
  sensitivity public.data_sensitivity not null default 'internal',
  notes text,
  created_at timestamptz not null default now()
);

create index data_sources_organization_idx on public.data_sources (organization_id);
create index data_sources_intake_idx on public.data_sources (intake_id);

-- ---------------------------------------------------------------------------
-- uploaded_documents — document LIST only in MVP (no file ingestion yet).
-- storage_path stays null until a storage bucket + upload flow ships.
-- ---------------------------------------------------------------------------
create table public.uploaded_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  intake_id uuid references public.audit_intakes (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_name text not null,
  storage_path text,
  mime_type text,
  size_bytes bigint,
  sensitivity public.data_sensitivity not null default 'internal',
  status public.document_status not null default 'listed',
  notes text,
  created_at timestamptz not null default now()
);

create index uploaded_documents_organization_idx on public.uploaded_documents (organization_id);

-- ---------------------------------------------------------------------------
-- ai_opportunities — candidate AI use cases identified during the audit
-- ---------------------------------------------------------------------------
create table public.ai_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  workflow_type text,
  status public.work_status not null default 'advisor_review',
  source text not null default 'audit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_opportunities_updated_at
  before update on public.ai_opportunities
  for each row execute function public.set_updated_at();

create index ai_opportunities_organization_idx on public.ai_opportunities (organization_id);

-- ---------------------------------------------------------------------------
-- opportunity_scores — impact/effort/risk/data-readiness scoring (1–5)
-- total = impact*2 + data_readiness - effort - risk  (range -8 .. +14)
-- ---------------------------------------------------------------------------
create table public.opportunity_scores (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.ai_opportunities (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  impact smallint not null check (impact between 1 and 5),
  effort smallint not null check (effort between 1 and 5),
  risk smallint not null check (risk between 1 and 5),
  data_readiness smallint not null check (data_readiness between 1 and 5),
  owner_hours_saved_weekly numeric(5, 1),
  total_score smallint generated always as (impact * 2 + data_readiness - effort - risk) stored,
  notes text,
  scored_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id)
);

create trigger opportunity_scores_updated_at
  before update on public.opportunity_scores
  for each row execute function public.set_updated_at();

create index opportunity_scores_organization_idx on public.opportunity_scores (organization_id);

-- ---------------------------------------------------------------------------
-- roadmap_items — 30-day (and beyond) implementation roadmap
-- ---------------------------------------------------------------------------
create table public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  opportunity_id uuid references public.ai_opportunities (id) on delete set null,
  title text not null,
  description text,
  phase public.roadmap_phase not null default 'now',
  status public.work_status not null default 'backlog',
  target_window text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger roadmap_items_updated_at
  before update on public.roadmap_items
  for each row execute function public.set_updated_at();

create index roadmap_items_organization_idx on public.roadmap_items (organization_id);

-- ---------------------------------------------------------------------------
-- proposals + proposal_line_items
-- ---------------------------------------------------------------------------
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  summary text,
  status public.proposal_status not null default 'draft',
  total_amount_cents bigint,
  currency text not null default 'usd',
  valid_until date,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create index proposals_organization_idx on public.proposals (organization_id);

create table public.proposal_line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  service_package_id uuid,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount_cents bigint not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index proposal_line_items_proposal_idx on public.proposal_line_items (proposal_id);

-- ---------------------------------------------------------------------------
-- deliverables — audit reports, SOPs, mockups, briefs
-- ---------------------------------------------------------------------------
create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  deliverable_type text,
  status public.work_status not null default 'in_progress',
  due_date date,
  link_url text,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger deliverables_updated_at
  before update on public.deliverables
  for each row execute function public.set_updated_at();

create index deliverables_organization_idx on public.deliverables (organization_id);

-- ---------------------------------------------------------------------------
-- tasks — engagement next steps (advisor- or client-owned)
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  roadmap_item_id uuid references public.roadmap_items (id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  owner text not null default 'advisor' check (owner in ('advisor', 'client')),
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index tasks_organization_idx on public.tasks (organization_id);

-- ---------------------------------------------------------------------------
-- comments — threaded notes between advisor and client
-- ---------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  entity_type text not null default 'organization',
  entity_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_organization_idx on public.comments (organization_id);
create index comments_entity_idx on public.comments (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- service_packages — the product ladder (publicly readable when active)
-- ---------------------------------------------------------------------------
create table public.service_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  founding_price_cents bigint,
  standard_price_cents bigint,
  price_note text,
  is_founding_offer boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger service_packages_updated_at
  before update on public.service_packages
  for each row execute function public.set_updated_at();

alter table public.proposal_line_items
  add constraint proposal_line_items_service_package_fk
  foreign key (service_package_id) references public.service_packages (id) on delete set null;

-- ---------------------------------------------------------------------------
-- activity_events — append-only audit log
-- ---------------------------------------------------------------------------
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_events_organization_idx on public.activity_events (organization_id);
create index activity_events_created_at_idx on public.activity_events (created_at desc);
