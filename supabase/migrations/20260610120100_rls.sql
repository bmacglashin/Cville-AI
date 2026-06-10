-- ============================================================================
-- Agent Ally — Row Level Security
--
-- Principles:
--   * RLS is enabled on EVERY table in public.
--   * Clients see only their own organization's data.
--   * Admin (Ben) access is explicit via public.is_admin().
--   * Internal CRM tables (leads, contacts, discovery_notes, activity_events)
--     are admin-only to read; leads are anon-insertable for the public
--     application form (insert-only — applicants can never read back).
--   * The service-role key bypasses RLS and must only ever be used server-side.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.audit_intakes enable row level security;
alter table public.discovery_notes enable row level security;
alter table public.tools_inventory enable row level security;
alter table public.workflows enable row level security;
alter table public.pain_points enable row level security;
alter table public.data_sources enable row level security;
alter table public.uploaded_documents enable row level security;
alter table public.ai_opportunities enable row level security;
alter table public.opportunity_scores enable row level security;
alter table public.roadmap_items enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_line_items enable row level security;
alter table public.deliverables enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.service_packages enable row level security;
alter table public.activity_events enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own or admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles: update own or admin"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());
-- role escalation is blocked by the profiles_protect_role trigger.

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create policy "organizations: members and admin read"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id) or public.is_admin());

create policy "organizations: authenticated users create their own"
  on public.organizations for insert
  to authenticated
  with check (created_by = (select auth.uid()));

-- Members may update their org's profile fields; the
-- organizations_protect_stage trigger blocks non-admin stage changes.
create policy "organizations: members and admin update"
  on public.organizations for update
  to authenticated
  using (public.is_org_member(id) or public.is_admin())
  with check (public.is_org_member(id) or public.is_admin());

create policy "organizations: admin delete"
  on public.organizations for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- organization_members
-- ---------------------------------------------------------------------------
create policy "org_members: read own memberships or admin"
  on public.organization_members for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- A user may add themself as owner of an organization they created;
-- admin may add anyone.
create policy "org_members: self-join own created org or admin"
  on public.organization_members for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      user_id = (select auth.uid())
      and exists (
        select 1 from public.organizations o
        where o.id = organization_id and o.created_by = (select auth.uid())
      )
    )
  );

create policy "org_members: admin update"
  on public.organization_members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "org_members: admin delete"
  on public.organization_members for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- contacts (internal CRM)
-- ---------------------------------------------------------------------------
create policy "contacts: admin all"
  on public.contacts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- leads — public application form writes; admin-only reads
-- ---------------------------------------------------------------------------
create policy "leads: anyone can apply"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "leads: admin read"
  on public.leads for select
  to authenticated
  using (public.is_admin());

create policy "leads: admin update"
  on public.leads for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "leads: admin delete"
  on public.leads for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- audit_intakes
-- ---------------------------------------------------------------------------
create policy "audit_intakes: members and admin read"
  on public.audit_intakes for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "audit_intakes: members submit for own org"
  on public.audit_intakes for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and submitted_by = (select auth.uid())
  );

create policy "audit_intakes: admin update"
  on public.audit_intakes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "audit_intakes: admin delete"
  on public.audit_intakes for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- discovery_notes (internal call notes — admin only)
-- ---------------------------------------------------------------------------
create policy "discovery_notes: admin all"
  on public.discovery_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Intake child tables: members read + insert for their org; admin manages.
-- ---------------------------------------------------------------------------
create policy "tools_inventory: members and admin read"
  on public.tools_inventory for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "tools_inventory: members insert own org"
  on public.tools_inventory for insert
  to authenticated
  with check (public.is_org_member(organization_id) or public.is_admin());

create policy "tools_inventory: admin update"
  on public.tools_inventory for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tools_inventory: admin delete"
  on public.tools_inventory for delete
  to authenticated
  using (public.is_admin());

create policy "workflows: members and admin read"
  on public.workflows for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "workflows: members insert own org"
  on public.workflows for insert
  to authenticated
  with check (public.is_org_member(organization_id) or public.is_admin());

create policy "workflows: admin update"
  on public.workflows for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "workflows: admin delete"
  on public.workflows for delete
  to authenticated
  using (public.is_admin());

create policy "pain_points: members and admin read"
  on public.pain_points for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "pain_points: members insert own org"
  on public.pain_points for insert
  to authenticated
  with check (public.is_org_member(organization_id) or public.is_admin());

create policy "pain_points: admin update"
  on public.pain_points for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "pain_points: admin delete"
  on public.pain_points for delete
  to authenticated
  using (public.is_admin());

create policy "data_sources: members and admin read"
  on public.data_sources for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "data_sources: members insert own org"
  on public.data_sources for insert
  to authenticated
  with check (public.is_org_member(organization_id) or public.is_admin());

create policy "data_sources: admin update"
  on public.data_sources for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "data_sources: admin delete"
  on public.data_sources for delete
  to authenticated
  using (public.is_admin());

create policy "uploaded_documents: members and admin read"
  on public.uploaded_documents for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "uploaded_documents: members insert own org"
  on public.uploaded_documents for insert
  to authenticated
  with check (
    (public.is_org_member(organization_id) and uploaded_by = (select auth.uid()))
    or public.is_admin()
  );

create policy "uploaded_documents: admin update"
  on public.uploaded_documents for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "uploaded_documents: admin delete"
  on public.uploaded_documents for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Delivery tables: members read their org; admin writes.
-- ---------------------------------------------------------------------------
create policy "ai_opportunities: members and admin read"
  on public.ai_opportunities for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "ai_opportunities: admin write"
  on public.ai_opportunities for insert
  to authenticated
  with check (public.is_admin());

create policy "ai_opportunities: admin update"
  on public.ai_opportunities for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "ai_opportunities: admin delete"
  on public.ai_opportunities for delete
  to authenticated
  using (public.is_admin());

create policy "opportunity_scores: members and admin read"
  on public.opportunity_scores for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "opportunity_scores: admin write"
  on public.opportunity_scores for insert
  to authenticated
  with check (public.is_admin());

create policy "opportunity_scores: admin update"
  on public.opportunity_scores for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "opportunity_scores: admin delete"
  on public.opportunity_scores for delete
  to authenticated
  using (public.is_admin());

create policy "roadmap_items: members and admin read"
  on public.roadmap_items for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "roadmap_items: admin write"
  on public.roadmap_items for insert
  to authenticated
  with check (public.is_admin());

create policy "roadmap_items: admin update"
  on public.roadmap_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "roadmap_items: admin delete"
  on public.roadmap_items for delete
  to authenticated
  using (public.is_admin());

create policy "proposals: members and admin read"
  on public.proposals for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "proposals: admin write"
  on public.proposals for insert
  to authenticated
  with check (public.is_admin());

create policy "proposals: admin update"
  on public.proposals for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "proposals: admin delete"
  on public.proposals for delete
  to authenticated
  using (public.is_admin());

create policy "proposal_line_items: via parent proposal read"
  on public.proposal_line_items for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.proposals p
      where p.id = proposal_id and public.is_org_member(p.organization_id)
    )
  );

create policy "proposal_line_items: admin write"
  on public.proposal_line_items for insert
  to authenticated
  with check (public.is_admin());

create policy "proposal_line_items: admin update"
  on public.proposal_line_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "proposal_line_items: admin delete"
  on public.proposal_line_items for delete
  to authenticated
  using (public.is_admin());

create policy "deliverables: members and admin read"
  on public.deliverables for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "deliverables: admin write"
  on public.deliverables for insert
  to authenticated
  with check (public.is_admin());

create policy "deliverables: admin update"
  on public.deliverables for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "deliverables: admin delete"
  on public.deliverables for delete
  to authenticated
  using (public.is_admin());

create policy "tasks: members and admin read"
  on public.tasks for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "tasks: admin write"
  on public.tasks for insert
  to authenticated
  with check (public.is_admin());

create policy "tasks: admin update"
  on public.tasks for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tasks: admin delete"
  on public.tasks for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- comments — members read + write within their org; authors own their words
-- ---------------------------------------------------------------------------
create policy "comments: members and admin read"
  on public.comments for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

create policy "comments: members write own in own org"
  on public.comments for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and (public.is_org_member(organization_id) or public.is_admin())
  );

create policy "comments: author or admin delete"
  on public.comments for delete
  to authenticated
  using (author_id = (select auth.uid()) or public.is_admin());

-- ---------------------------------------------------------------------------
-- service_packages — public catalog
-- ---------------------------------------------------------------------------
create policy "service_packages: anyone reads active"
  on public.service_packages for select
  to anon, authenticated
  using (active = true or public.is_admin());

create policy "service_packages: admin write"
  on public.service_packages for insert
  to authenticated
  with check (public.is_admin());

create policy "service_packages: admin update"
  on public.service_packages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "service_packages: admin delete"
  on public.service_packages for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- activity_events — append-only; users log their own actions, admin reads
-- ---------------------------------------------------------------------------
create policy "activity_events: admin read"
  on public.activity_events for select
  to authenticated
  using (public.is_admin());

create policy "activity_events: authenticated log own actions"
  on public.activity_events for insert
  to authenticated
  with check (actor_id = (select auth.uid()) or public.is_admin());

-- No update/delete policies: the activity log is append-only by design.
