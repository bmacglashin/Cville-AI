-- ============================================================================
-- Agent Ally — LOCAL DEVELOPMENT SEED
--
-- Everything below is FICTIONAL DUMMY DATA for local testing and demos.
-- "Blue Ridge Custom Builders" is an invented design/build company.
-- Do NOT run this against a production project (demo auth users with a
-- known password are created).
--
-- Local logins after `supabase db reset`:
--   admin:  admin@agentally.test  / password123
--   client: client@agentally.test / password123
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Service packages — the product ladder
-- ---------------------------------------------------------------------------
insert into public.service_packages
  (id, slug, name, tagline, description, founding_price_cents, standard_price_cents, price_note, is_founding_offer, active, sort_order)
values
  (
    'c0a80001-0000-4000-8000-000000000001',
    'ai-operating-audit',
    'AI Operating Audit',
    'Two weeks. A clear-eyed look at where AI actually helps your business — and where it doesn''t.',
    'Fit call, structured intake, 90-minute owner/operator interview, tool and process inventory, AI opportunity map with data-risk ranking, top 5 scored use cases, and a 30-day implementation roadmap. $500 credited toward implementation if you proceed within 14 days.',
    95000, 125000,
    'Founding price for the first five Charlottesville clients.',
    true, true, 1
  ),
  (
    'c0a80001-0000-4000-8000-000000000002',
    'ai-workflow-quickstart',
    'AI Workflow Quickstart',
    'One workflow, two weeks, working in tools you already own. No custom platform.',
    'One workflow selected from your audit roadmap, configured in existing client-owned tools wherever possible, built and tested alongside your team in two weeks, with human-review checkpoints, a written SOP, and two weeks of post-launch adjustment.',
    350000, 475000,
    'Standard $4,500–$5,000 depending on workflow complexity.',
    true, true, 2
  ),
  (
    'c0a80001-0000-4000-8000-000000000003',
    'managed-ai-workspace',
    'Managed AI Workspace + Operate',
    'Your tools, configured into a documented AI operating stack — operated and improved monthly.',
    'Client-owned tool accounts, a selected set of workflow playbooks configured across existing tools, a documented operating stack (SOPs, prompt library, data boundaries, human-review rules), team training, and a monthly operating cadence. Not a private platform. Offered after an audit only. Operate retainer from $1,500/month.',
    850000, 1250000,
    'Post-audit implementation path — not sold standalone.',
    true, true, 3
  );

-- ---------------------------------------------------------------------------
-- Demo auth users (LOCAL ONLY)
-- ---------------------------------------------------------------------------
insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
   raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'admin@agentally.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ben (Advisor)"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'client@agentally.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dana Whitfield"}',
    now(), now(), '', '', '', ''
  );

insert into auth.identities
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@agentally.test","email_verified":true}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"client@agentally.test","email_verified":true}',
    'email', now(), now(), now()
  );

-- handle_new_user trigger created the profiles; promote the admin.
update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';

-- ---------------------------------------------------------------------------
-- Demo organization: Blue Ridge Custom Builders (FICTIONAL)
-- ---------------------------------------------------------------------------
insert into public.organizations
  (id, name, slug, industry, team_size, website, city, state, description, pipeline_stage, created_by)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'Blue Ridge Custom Builders',
    'blue-ridge-custom-builders',
    'Design / build & remodeling',
    '16–40',
    'https://example.com',
    'Charlottesville', 'VA',
    'FICTIONAL demo company: $6M design/build firm. Owner Dana still reviews every proposal and fields ~30 staff questions a day.',
    'audit_delivered',
    '22222222-2222-2222-2222-222222222222'
  );

insert into public.organization_members (organization_id, user_id, role)
values ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'owner');

insert into public.contacts (organization_id, full_name, email, phone, role_title, is_primary, notes)
values
  ('33333333-3333-3333-3333-333333333333', 'Dana Whitfield', 'client@agentally.test', '434-555-0142', 'Owner / unofficial COO', true, 'Prefers early-morning calls. Referral from chamber breakfast.'),
  ('33333333-3333-3333-3333-333333333333', 'Marcus Lee', 'marcus@example.com', null, 'Production Manager', false, 'Skeptical of AI; cares about handoff quality.');

-- ---------------------------------------------------------------------------
-- A fresh inbound lead (pipeline top-of-funnel demo)
-- ---------------------------------------------------------------------------
insert into public.leads (full_name, email, phone, company, industry, team_size, biggest_bottleneck, message, source, status)
values
  (
    'Priya Raman', 'priya@example.com', '434-555-0177', 'Keswick Stoneworks',
    'Premium home services', '6–15',
    'Estimates take 10+ days and we lose jobs to faster competitors.',
    'Heard about the founding audit from a supplier. Want to talk timing.',
    'website', 'new'
  );

-- ---------------------------------------------------------------------------
-- Audit intake for Blue Ridge (submitted)
-- ---------------------------------------------------------------------------
insert into public.audit_intakes
  (id, organization_id, submitted_by, status, goals, budget_range, timeline, current_ai_usage,
   scheduling_preference, data_sensitivity_ack, regulated_data_ack, additional_notes)
values
  (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'complete',
    'Get proposals out faster, stop being the answer desk for the whole team, and make project handoffs less dependent on me personally.',
    '$5k–$15k',
    'This quarter',
    'A couple of PMs use ChatGPT for emails. Nothing systematic. No policy.',
    'Tuesday or Thursday mornings',
    true, true,
    'Busy season starts in 8 weeks — would like quick wins before then.'
  );

insert into public.tools_inventory (intake_id, organization_id, name, category, usage_notes) values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Buildertrend', 'Project management', 'Scheduling and client comms; underused daily logs.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'QuickBooks Online', 'Accounting', 'Bookkeeper-managed.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Google Workspace', 'Email / docs', 'Proposals live in Docs; SOPs scattered in Drive.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Excel estimate templates', 'Estimating', 'Three versions floating around; only Dana trusts hers.');

insert into public.workflows (intake_id, organization_id, name, description, frequency, hours_per_week) values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Proposal & estimate assembly', 'Dana drafts every proposal from site notes + old proposals + the Excel sheet.', '4–6 per month', 9),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Inquiry follow-up', 'Office manager replies when she can; older inquiries silently die.', 'Daily', 5),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Sales-to-production handoff', 'Verbal walkthrough + a partially filled checklist; rework when details get lost.', 'Per project', 4),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Answering staff questions', 'Where is X, what is our policy on Y, what did we do on the Hartman job…', 'Constant', 8);

insert into public.pain_points (intake_id, organization_id, area, description, severity) values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Proposals & estimating', 'Proposals take 2–3 weeks; two jobs lost last quarter to faster competitors.', 5),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Repeated staff questions', 'Dana answers the same ~30 questions a day; nothing written down is findable.', 4),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Project handoffs', 'Sales-to-production handoffs drop details; change orders eat margin.', 4),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Customer follow-up', 'No system for nurturing not-yet-ready inquiries.', 3);

insert into public.data_sources (intake_id, organization_id, name, source_type, sensitivity, notes) values
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Past proposals (Google Docs)', 'Documents', 'internal', 'Good training corpus candidate after client-name scrub.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'SOPs & checklists (Drive)', 'Documents', 'internal', 'Incomplete; several exist only in Dana''s head.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Client contracts', 'Documents', 'confidential', 'EXCLUDED from MVP work.'),
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Employee records', 'HR', 'regulated', 'OUT OF SCOPE — flagged in data-risk ranking.');

insert into public.uploaded_documents (organization_id, intake_id, uploaded_by, file_name, sensitivity, status, notes) values
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Sample proposal — Hartman kitchen (scrubbed).pdf', 'internal', 'listed', 'Listed for future review. No file ingestion in MVP.'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Production handoff checklist v2.docx', 'internal', 'listed', null);

-- ---------------------------------------------------------------------------
-- Discovery notes (internal)
-- ---------------------------------------------------------------------------
insert into public.discovery_notes (organization_id, author_id, call_type, summary, occurred_at) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'fit_call',
   'Strong fit: owner-led, 22 staff, real proposal bottleneck, decision-maker on the call. No regulated-data ambitions. Quoted founding audit; verbal yes.',
   now() - interval '21 days'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'owner_interview',
   '90-min interview. Dana = bottleneck by design: pricing judgment lives in her head. Best wedge: proposal assistant on scrubbed corpus. SOP assistant close second. Marcus (production) must co-own handoff workflow or it dies.',
   now() - interval '10 days');

-- ---------------------------------------------------------------------------
-- AI opportunities + scores (audit output)
-- ---------------------------------------------------------------------------
insert into public.ai_opportunities (id, organization_id, title, description, workflow_type, status, source) values
  ('aaaaaaa1-0000-4000-8000-000000000001', '33333333-3333-3333-3333-333333333333',
   'Proposal assistant', 'Draft proposals from scrubbed past projects + pricing rules; Dana reviews and sends.', 'proposal_assistant', 'client_review', 'audit'),
  ('aaaaaaa1-0000-4000-8000-000000000002', '33333333-3333-3333-3333-333333333333',
   'Internal SOP assistant', 'Answer staff questions from an approved SOP corpus; flag unanswered gaps weekly.', 'sop_assistant', 'client_review', 'audit'),
  ('aaaaaaa1-0000-4000-8000-000000000003', '33333333-3333-3333-3333-333333333333',
   'Project handoff checklist generator', 'Generate stage-specific handoff checklists from project parameters.', 'handoff_checklists', 'advisor_review', 'audit'),
  ('aaaaaaa1-0000-4000-8000-000000000004', '33333333-3333-3333-3333-333333333333',
   'Inquiry triage drafts', 'Sort inbound inquiries and draft replies for human review. No auto-send.', 'inquiry_triage', 'advisor_review', 'audit'),
  ('aaaaaaa1-0000-4000-8000-000000000005', '33333333-3333-3333-3333-333333333333',
   'Owner weekly ops brief', 'Monday digest: stalled proposals, follow-up gaps, handoff risks, top 3 actions.', 'owner_brief', 'backlog', 'audit');

insert into public.opportunity_scores
  (opportunity_id, organization_id, impact, effort, risk, data_readiness, owner_hours_saved_weekly, notes, scored_by)
values
  ('aaaaaaa1-0000-4000-8000-000000000001', '33333333-3333-3333-3333-333333333333', 5, 3, 2, 4, 7,
   'Highest ROI. Needs client-name scrub of corpus first.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000002', '33333333-3333-3333-3333-333333333333', 4, 2, 1, 3, 6,
   'Low risk, fast win. SOP gap-filling is half the value.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000003', '33333333-3333-3333-3333-333333333333', 4, 2, 2, 3, 3,
   'Marcus must co-own. Pairs with SOP assistant.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000004', '33333333-3333-3333-3333-333333333333', 3, 3, 3, 2, 4,
   'Wait until inbox is migrated off personal Gmail.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa1-0000-4000-8000-000000000005', '33333333-3333-3333-3333-333333333333', 4, 4, 2, 2, 2,
   'Phase 2: needs structured data from the first two workflows.', '11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------
-- 30-day roadmap
-- ---------------------------------------------------------------------------
insert into public.roadmap_items (organization_id, opportunity_id, title, description, phase, status, target_window, sort_order) values
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaa1-0000-4000-8000-000000000001',
   'Quickstart: proposal assistant', 'Scrub 20 past proposals, encode pricing rules, two-week build with Dana review loop.', 'now', 'client_review', 'Weeks 1–2', 1),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaa1-0000-4000-8000-000000000002',
   'SOP corpus cleanup + assistant pilot', 'Consolidate Drive SOPs; pilot assistant with office team.', 'now', 'backlog', 'Weeks 3–4', 2),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaa1-0000-4000-8000-000000000003',
   'Handoff checklist generator', 'After SOP cleanup. Co-design with Marcus.', 'next', 'backlog', 'Weeks 5–8', 3),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaa1-0000-4000-8000-000000000005',
   'Owner weekly ops brief', 'Assemble from proposal tracker + follow-up log once those exist.', 'later', 'backlog', 'Quarter 2', 4);

-- ---------------------------------------------------------------------------
-- Quickstart proposal
-- ---------------------------------------------------------------------------
insert into public.proposals (id, organization_id, title, summary, status, total_amount_cents, valid_until, sent_at) values
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333',
   'AI Workflow Quickstart — Proposal Assistant',
   'One workflow, two weeks: proposal drafting assistant on a scrubbed corpus with owner review loop, written SOP, and two weeks of post-launch adjustment. $500 audit credit applied.',
   'sent', 300000, (current_date + interval '14 days')::date, now() - interval '2 days');

insert into public.proposal_line_items (proposal_id, service_package_id, description, quantity, unit_amount_cents, sort_order) values
  ('55555555-5555-5555-5555-555555555555', 'c0a80001-0000-4000-8000-000000000002', 'AI Workflow Quickstart — proposal assistant (founding price)', 1, 350000, 1),
  ('55555555-5555-5555-5555-555555555555', 'c0a80001-0000-4000-8000-000000000001', 'Founding audit credit (proceeding within 14 days)', 1, -50000, 2);

-- ---------------------------------------------------------------------------
-- Deliverables, tasks, comments
-- ---------------------------------------------------------------------------
insert into public.deliverables (organization_id, title, description, deliverable_type, status, due_date, link_url) values
  ('33333333-3333-3333-3333-333333333333', 'AI Operating Audit report', 'Full audit: opportunity map, data-risk ranking, top 5 scored use cases, 30-day roadmap.', 'audit_report', 'done', (current_date - 3)::date, null),
  ('33333333-3333-3333-3333-333333333333', 'Proposal assistant mockup (dummy data)', 'Clickable mockup on fictional project data shown in the audit readout.', 'mockup', 'done', (current_date - 3)::date, null),
  ('33333333-3333-3333-3333-333333333333', 'Sample Owner Weekly Ops Brief', 'Illustrative weekly brief assembled from audit findings (fictional data).', 'ops_brief', 'client_review', (current_date + 4)::date, null);

insert into public.tasks (organization_id, title, description, status, owner, due_date, sort_order) values
  ('33333333-3333-3333-3333-333333333333', 'Review Quickstart proposal', 'Decide within credit window (14 days).', 'in_progress', 'client', (current_date + 5)::date, 1),
  ('33333333-3333-3333-3333-333333333333', 'Send 20 past proposals for scrubbing', 'Export from Google Docs; Agent Ally scrubs client names before any AI use.', 'todo', 'client', (current_date + 7)::date, 2),
  ('33333333-3333-3333-3333-333333333333', 'Prepare corpus scrub checklist', 'PII scrub procedure for proposal corpus.', 'todo', 'advisor', (current_date + 7)::date, 3);

insert into public.comments (organization_id, author_id, entity_type, body) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'organization',
   'Audit readout delivered. Recommendation: start with the proposal assistant — strongest ROI and the corpus is in good shape after a scrub.'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'organization',
   'Walked Marcus through the readout. He wants the handoff checklist sooner — discuss sequencing on Thursday.');

-- ---------------------------------------------------------------------------
-- Activity log
-- ---------------------------------------------------------------------------
insert into public.activity_events (organization_id, actor_id, event_type, entity_type, metadata) values
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'intake_submitted', 'audit_intake', '{"source":"seed"}'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'stage_changed', 'organization', '{"from":"audit_scheduled","to":"audit_delivered"}'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'proposal_sent', 'proposal', '{"proposal":"Quickstart — proposal assistant"}');

-- ============================================================================
-- OPERATING LAYER — internal catalog (tool vendors + workflow playbooks)
--
-- INTERNAL NOTES ONLY. tool_vendors and workflow_playbooks are admin-only by
-- RLS; vendor names with public_copy_allowed=false must NEVER appear in
-- public copy or client-facing UI (see docs/TOOL_DOCTRINE.md). Terms not yet
-- verified are marked 'needs_review' — verify via
-- docs/VENDOR_VETTING_CHECKLIST.md before recommending to a paying client.
-- ============================================================================

insert into public.tool_vendors
  (id, name, slug, category, approval_status, short_description, default_use_case,
   public_copy_allowed, client_owned_account_required, white_label_allowed,
   dpa_status, no_training_status, admin_controls_status, export_path_status,
   max_data_sensitivity, support_burden, longevity_notes,
   prohibited_use_cases, internal_notes, public_notes, last_reviewed_at, next_review_at)
values
  (
    'd0a80001-0000-4000-8000-000000000001',
    'Google Workspace', 'google-workspace', 'foundational_workspace', 'approved',
    'Email, docs, drive, calendar — the default foundational workspace for our ICP.',
    'Foundational workspace; where most client documents and email already live.',
    true, true, false,
    'available — standard Workspace DPA', 'business tiers: customer data not used to train models (verify Gemini settings per tenant)',
    'strong — admin console, 2FA enforcement, role management', 'good — Google Takeout + Drive export',
    'confidential', 'low', 'entrenched; low shutdown risk',
    '["regulated data without engagement-level review"]'::jsonb,
    'Default recommendation when the client is already on it. Check Gemini-for-Workspace data settings per tenant before enabling AI features.',
    'Recommended when your business already runs on it.',
    now(), now() + interval '12 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000002',
    'Microsoft 365', 'microsoft-365', 'foundational_workspace', 'approved',
    'Outlook, Office, SharePoint, Teams — the other default foundational workspace.',
    'Foundational workspace for Microsoft-centric clients.',
    true, true, false,
    'available — Microsoft DPA / standard contractual terms', 'business tiers: customer data not used to train foundation models (verify Copilot settings per tenant)',
    'strong — admin center, conditional access, role management', 'good — standard Microsoft export paths',
    'confidential', 'low', 'entrenched; low shutdown risk',
    '["regulated data without engagement-level review"]'::jsonb,
    'Default for Microsoft-shop clients. Verify Copilot data-handling settings per tenant before enabling AI features.',
    'Recommended when your business already runs on it.',
    now(), now() + interval '12 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000003',
    'Claude Team', 'claude-team', 'llm_assistant', 'conditional',
    'Business-grade AI assistant plan with admin controls.',
    'Drafting, summarizing, and internal Q&A on approved non-sensitive content.',
    true, true, false,
    'needs_review — confirm DPA availability on Team tier', 'commercial terms state no training on business data — verify current terms',
    'admin console with member management — verify SSO availability on tier', 'conversation export available — verify completeness',
    'internal', 'low', 'well-funded; active development',
    '["regulated data", "customer-facing automation without human review"]'::jsonb,
    'Condition: business tier only (never personal accounts for client work); document data boundary per engagement.',
    'A business-grade AI assistant option, set up in your accounts.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000004',
    'ChatGPT Team', 'chatgpt-team', 'llm_assistant', 'conditional',
    'Business-grade AI assistant plan with workspace controls.',
    'Drafting, summarizing, and internal Q&A on approved non-sensitive content.',
    true, true, false,
    'needs_review — confirm DPA on Team tier', 'Team tier states no training on business data — verify current terms',
    'workspace admin controls — verify audit-log availability on tier', 'export available — verify completeness',
    'internal', 'low', 'well-funded; fast-moving product surface',
    '["regulated data", "customer-facing automation without human review"]'::jsonb,
    'Condition: Team tier or above only; many clients already have informal personal-account usage — migrate them to the business tier.',
    'A business-grade AI assistant option, set up in your accounts.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000005',
    'Gemini for Workspace', 'gemini-for-workspace', 'llm_assistant', 'conditional',
    'AI assistant inside Google Workspace.',
    'Drafting and summarizing inside Docs/Gmail for Workspace-based clients.',
    true, true, false,
    'covered under Workspace DPA — verify Gemini addendum', 'workspace data protections apply — verify per-tenant settings',
    'managed via Workspace admin console', 'content stays in Workspace export paths',
    'internal', 'low', 'tied to Google Workspace; low shutdown risk',
    '["regulated data", "customer-facing automation without human review"]'::jsonb,
    'Condition: only for clients already on Google Workspace; verify tenant AI settings before enabling.',
    'An AI assistant option inside the workspace you already own.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000006',
    'Notion', 'notion', 'knowledge_base', 'conditional',
    'Flexible docs/wiki knowledge base with AI features.',
    'SOP library, onboarding paths, and structured project knowledge.',
    true, true, false,
    'needs_review — confirm DPA on Business tier', 'needs_review — verify AI-feature training terms on current tier',
    'workspace admin + member roles — verify SSO tier', 'good — markdown/CSV export',
    'internal', 'low', 'established; active development',
    '["regulated data", "confidential client contracts"]'::jsonb,
    'Condition: Business tier for client work; keep AI features off until terms verified per engagement.',
    'A knowledge-base option for SOPs and onboarding content.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000007',
    'Airtable', 'airtable', 'knowledge_base', 'conditional',
    'Structured database/base builder; good for trackers and light operations data.',
    'Follow-up trackers, project logs, and structured checklists.',
    true, true, false,
    'needs_review — confirm DPA on Team/Business tier', 'needs_review — verify AI-feature terms',
    'workspace admin + granular permissions on higher tiers', 'good — CSV export per table',
    'internal', 'medium', 'established; pricing has shifted before — note in proposals',
    '["regulated data", "financial credentials"]'::jsonb,
    'Condition: structure the base so sensitive fields never enter; review automations for write-scope.',
    'A structured-tracker option for follow-up and project data.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000008',
    'Zapier', 'zapier', 'automation', 'conditional',
    'Mainstream no-code automation between SaaS tools.',
    'Moving data between tools with human checkpoints (e.g., form → tracker → draft email).',
    true, true, false,
    'needs_review — confirm DPA on Team tier', 'n/a (pipes data; verify AI-step terms if used)',
    'team workspace with shared connections — verify audit logs', 'zap configs exportable/sharable — document each zap in the SOP',
    'internal', 'medium', 'category leader; low shutdown risk',
    '["regulated data", "auto-sending customer communications without review step"]'::jsonb,
    'Condition: every zap that writes outward needs a human checkpoint or explicit sign-off; inventory zaps in the handoff doc.',
    'An automation option between the tools you already use.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-000000000009',
    'Make', 'make', 'automation', 'conditional',
    'Visual automation platform; more capable branching than Zapier, steeper learning curve.',
    'Multi-step internal automations where Zapier pricing or branching falls short.',
    true, true, false,
    'needs_review — confirm DPA', 'n/a (pipes data; verify AI-step terms if used)',
    'team roles available — verify tier', 'scenario blueprints exportable as JSON',
    'internal', 'medium', 'established; watch pricing-model changes',
    '["regulated data", "auto-sending customer communications without review step"]'::jsonb,
    'Condition: same write-path rules as Zapier; prefer when client already has it or branching demands it.',
    'An automation option between the tools you already use.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-00000000000a',
    'n8n', 'n8n', 'automation', 'conditional',
    'Source-available automation; self-hostable. Most control, most operational burden.',
    'Automation where data residency/control matters or SaaS automation pricing breaks.',
    true, true, false,
    'self-hosted: DPA n/a (client infrastructure); cloud tier needs_review', 'self-hosted: data stays in client infrastructure',
    'depends on deployment — define admin model per engagement', 'full — workflows are exportable JSON; self-hosted data is the client''s',
    'confidential', 'high', 'sustainable license model; self-hosting shifts burden to us/client',
    '["regulated data", "deployments nobody is assigned to maintain"]'::jsonb,
    'Condition: self-hosted n8n counts as infrastructure the client must own/maintain (or pay us to, within Operate limits) — do not deploy without a named owner. Cloud tier: verify terms.',
    'A self-hostable automation option when control matters.',
    now(), now() + interval '6 months'
  ),
  (
    'd0a80001-0000-4000-8000-00000000000b',
    'Messaging-native assistant (e.g. Poke)', 'messaging-native-assistant', 'messaging_assistant', 'experimental',
    'Assistant that lives in SMS/iMessage/WhatsApp threads; consumer-grade terms.',
    'OPTIONAL low-risk point solution: personal reminders/coordination for an owner, non-sensitive only.',
    false, true, false,
    'needs_review — consumer terms, DPA unlikely at current tier', 'needs_review — assume content may be processed under personal-use terms',
    'weak — personal account model, no central admin', 'needs_review — no documented export path',
    'internal', 'medium', 'early-stage vendor; treat continuity as unproven',
    '["regulated data", "confidential data", "HR decisions", "tenant decisions", "financial decisions", "customer-facing communication"]'::jsonb,
    'PERSONAL-USE TERMS: vendor terms are consumer-grade; the vendor owns automation recipes created on-platform; NO white-label or resale rights. VERIFY CURRENT TERMS BEFORE ANY CLIENT USE. Never name this vendor in public copy (public_copy_allowed=false). Position only as an optional low-risk point solution for an owner''s personal coordination, never as business infrastructure.',
    null,
    now(), now() + interval '3 months'
  ),
  (
    'd0a80001-0000-4000-8000-00000000000c',
    'Advanced agent workspace (e.g. Hermes)', 'advanced-agent-workspace', 'agent_workspace', 'internal_only',
    'Heavy-duty agentic work environment for complex multi-step AI work.',
    'INTERNAL: Agent Ally delivery cockpit; premium pilot demos inside paid engagements.',
    false, true, false,
    'needs_review', 'needs_review',
    'needs_review — single-operator model today', 'needs_review',
    'internal', 'high', 'early-stage; high churn risk in this category',
    '["any client-side deployment without security review + paid SOW", "regulated data", "unattended operation"]'::jsonb,
    'INTERNAL COCKPIT / PREMIUM PILOTS ONLY. High support burden by definition. Client-side use requires a security review AND its own paid SOW — never bundled, never implied in public copy (public_copy_allowed=false).',
    null,
    now(), now() + interval '3 months'
  ),
  (
    'd0a80001-0000-4000-8000-00000000000d',
    'Custom Supabase/Next.js build', 'custom-supabase-nextjs', 'custom_app', 'conditional',
    'Purpose-built application on the client''s own Supabase/Vercel accounts.',
    'The rare gap existing tools can''t close: focused glue or a point application.',
    true, true, false,
    'client-owned infrastructure — DPA posture set per engagement', 'no model training; data stays in client-owned Postgres',
    'full control — we design the admin model; RLS required on every table', 'full — it''s the client''s database',
    'confidential', 'high', 'longevity = maintenance plan; do not build without one',
    '["regulated data", "anything without a maintenance owner", "speculative platform features"]'::jsonb,
    'POST-AUDIT, PAID SOW ONLY. All four gates must pass: ROI, data risk, scope, budget (docs/TOOL_DOCTRINE.md §4). Client owns the Supabase/Vercel accounts from day one. Never positioned as a public product.',
    'Custom software is scoped case-by-case after an audit, under its own statement of work.',
    now(), now() + interval '12 months'
  );

-- ---------------------------------------------------------------------------
-- Workflow playbooks — the reusable method library (admin-only).
-- The first seven align 1:1 with EXAMPLE_WORKFLOWS slugs in src/lib/content.ts
-- (cross-asserted by tests/content.test.ts).
-- ---------------------------------------------------------------------------
insert into public.workflow_playbooks
  (id, name, slug, target_icp, pain_addressed, description, default_delivery_mode, complexity,
   default_tool_categories, steps, max_data_sensitivity,
   est_setup_hours_min, est_setup_hours_max, price_min_cents, price_max_cents,
   retainer_fit, human_review_required, success_metrics, active)
values
  (
    'e0a80001-0000-4000-8000-000000000001',
    'Proposal/Estimate Drafting Assistant', 'proposal-estimate-drafting-assistant',
    'Design/build, remodeling, premium trades',
    'Proposals take weeks because pricing judgment lives in the owner''s head; deals lost to faster bidders.',
    'Drafts proposals/estimates from scrubbed past projects, pricing rules, and site notes inside a business-grade AI assistant. The owner reviews and sends every output.',
    'existing_tools', 'medium',
    '["llm_assistant", "foundational_workspace"]'::jsonb,
    '[
      {"title": "Corpus scrub", "description": "Select ~20 past proposals; scrub client names/PII; owner approves the scrubbed set.", "owner_role": "advisor", "tool_category": "foundational_workspace", "human_review": true, "output_artifact": "approved scrubbed corpus"},
      {"title": "Pricing-rule capture", "description": "Encode the owner''s pricing heuristics as written rules the assistant must follow (and must not override).", "owner_role": "owner", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "pricing rules doc"},
      {"title": "Assistant configuration", "description": "Set up the drafting workflow (project + prompt library) in the client''s assistant account.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "configured drafting workflow"},
      {"title": "Owner review loop", "description": "Draft 3 real proposals; owner edits; tune prompts against the edits.", "owner_role": "owner", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "3 sent proposals"},
      {"title": "SOP + handoff", "description": "Written SOP incl. the human-review rule: nothing sent without owner approval.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "proposal drafting SOP"}
    ]'::jsonb,
    'internal', 20, 35, 350000, 500000, 5, true,
    '["proposal turnaround days (target: under 1 week)", "owner hours per proposal (target: -60%)", "proposals sent per month"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000002',
    'Internal SOP Assistant', 'internal-sop-assistant',
    'Any owner-led team',
    'The owner answers the same ~30 questions a day; written answers exist but nobody can find them.',
    'An assistant that answers team questions from an approved SOP corpus only, and reports unanswered questions weekly — which becomes the SOP backlog.',
    'existing_tools', 'low',
    '["knowledge_base", "llm_assistant"]'::jsonb,
    '[
      {"title": "SOP consolidation", "description": "Gather scattered SOPs/checklists/policies into one approved corpus location.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "approved SOP corpus"},
      {"title": "Assistant setup", "description": "Configure assistant answering from the approved corpus only; no outside knowledge for policy questions.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "configured SOP assistant"},
      {"title": "Team pilot", "description": "Office team uses it for one week; log unanswered questions.", "owner_role": "team", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "gap list"},
      {"title": "Gap-fill + SOP", "description": "Write the top missing SOPs; document the weekly gap-review habit.", "owner_role": "owner", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "SOP assistant operating SOP"}
    ]'::jsonb,
    'internal', 12, 20, 350000, 450000, 5, true,
    '["owner interruptions per day (target: -50%)", "questions answered from corpus vs escalated", "SOP gaps closed per month"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000003',
    'Customer Inquiry Triage Drafts', 'customer-inquiry-triage-drafts',
    'High-inquiry-volume services',
    'Inquiries that are not ready today never hear back; follow-up depends on whoever has time.',
    'Sorts inbound inquiries by type/urgency and drafts replies for a human to review and send. No auto-sending — ever.',
    'existing_tools', 'medium',
    '["llm_assistant", "automation", "foundational_workspace"]'::jsonb,
    '[
      {"title": "Inbox audit", "description": "Map where inquiries arrive; confirm business-owned inbox (no personal Gmail).", "owner_role": "advisor", "tool_category": "foundational_workspace", "human_review": true, "output_artifact": "inquiry channel map"},
      {"title": "Triage rules", "description": "Define types, urgency tiers, and reply templates with the owner.", "owner_role": "owner", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "triage rubric"},
      {"title": "Draft workflow", "description": "Configure sort + draft-reply workflow; drafts land in a review queue, never outbound.", "owner_role": "advisor", "tool_category": "automation", "human_review": true, "output_artifact": "triage workflow with review queue"},
      {"title": "SOP + adoption", "description": "Train the person who owns the inbox; SOP includes the no-auto-send rule.", "owner_role": "team", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "inquiry triage SOP"}
    ]'::jsonb,
    'internal', 18, 30, 350000, 500000, 4, true,
    '["first-response time (target: same business day)", "inquiries with second touch (target: 100%)", "drafts approved without edit %"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000004',
    'Project Handoff Checklist Generator', 'project-handoff-checklist-generator',
    'Design/build, property management',
    'Sales-to-production and production-to-closeout handoffs drop details; rework eats margin.',
    'Turns project parameters into stage-specific handoff checklists so what sales promised is what production builds.',
    'existing_tools', 'low',
    '["llm_assistant", "knowledge_base", "project_management"]'::jsonb,
    '[
      {"title": "Handoff failure inventory", "description": "Collect the last 5 handoffs'' dropped details with the production lead.", "owner_role": "team", "tool_category": "project_management", "human_review": true, "output_artifact": "failure-mode list"},
      {"title": "Checklist templates", "description": "Build stage-specific checklist templates from the failure modes.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "checklist template set"},
      {"title": "Generator workflow", "description": "Configure assistant to instantiate checklists from project parameters.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "checklist generator"},
      {"title": "Co-owned rollout", "description": "Production lead co-owns the rollout; checklist sign-off becomes part of the handoff meeting.", "owner_role": "team", "tool_category": "project_management", "human_review": true, "output_artifact": "handoff SOP"}
    ]'::jsonb,
    'internal', 10, 18, 350000, 450000, 4, true,
    '["handoff items dropped per project (target: 0 critical)", "change orders attributable to handoff misses", "checklist completion rate"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000005',
    'Owner Weekly Ops Brief', 'owner-weekly-ops-brief',
    'Owners who are the unofficial COO',
    'The owner finds out about stalled proposals and follow-up gaps after the week has already eaten them.',
    'A Monday-morning brief assembled from approved sources: stalled proposals, follow-up gaps, handoff risks, top 3 actions. Compiled by the advisor (Operate cadence) or a reviewed workflow — never an unattended pipeline.',
    'existing_tools', 'medium',
    '["llm_assistant", "automation", "foundational_workspace"]'::jsonb,
    '[
      {"title": "Source approval", "description": "Owner approves exactly which trackers/inboxes feed the brief (non-sensitive only).", "owner_role": "owner", "tool_category": "foundational_workspace", "human_review": true, "output_artifact": "approved source list"},
      {"title": "Brief template", "description": "One-page format: stalled items, gaps, risks, top 3 actions (see docs/sales/SAMPLE_OWNER_WEEKLY_OPS_BRIEF.md).", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "brief template"},
      {"title": "Assembly workflow", "description": "Configure the draft-assembly steps from approved sources; a person reviews before it reaches the owner.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "weekly assembly workflow"},
      {"title": "Cadence", "description": "Run 4 weekly cycles; tune what makes the top-3 cut.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "4 delivered briefs"}
    ]'::jsonb,
    'internal', 15, 25, 350000, 500000, 5, true,
    '["owner-rated usefulness 1-5 weekly (target: 4+)", "actions from brief acted on", "surprises that bypassed the brief"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000006',
    'Staff Onboarding Knowledge Base', 'staff-onboarding-knowledge-base',
    'Teams of 6–40',
    'Onboarding depends on whoever has time that week; new hires shadow the owner for a month.',
    'Scattered training materials organized into a structured onboarding path, with an assistant answering new-hire questions from approved content only.',
    'existing_tools', 'medium',
    '["knowledge_base", "llm_assistant"]'::jsonb,
    '[
      {"title": "Content inventory", "description": "Collect existing training material; flag gaps and out-of-date items.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "content inventory"},
      {"title": "Onboarding path", "description": "Structure week-1/month-1 path by role in the knowledge base.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "role onboarding paths"},
      {"title": "Q&A assistant", "description": "Assistant answers new-hire questions from approved content only.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "onboarding assistant"},
      {"title": "First-hire pilot", "description": "Next hire onboards through it; log every question it could not answer.", "owner_role": "team", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "pilot gap report"}
    ]'::jsonb,
    'internal', 16, 28, 350000, 500000, 4, true,
    '["time-to-productive for new hires", "owner hours per onboarding (target: -70%)", "questions answered from approved content %"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000007',
    'Review/Content Drafting System', 'review-content-drafting-system',
    'Reputation-driven local businesses',
    'Public presence (reviews, project write-ups) gets maintained at 10pm or not at all.',
    'Drafts review responses, project write-ups, and follow-up notes in the owner''s voice, for human review before anything is posted.',
    'existing_tools', 'low',
    '["llm_assistant", "foundational_workspace"]'::jsonb,
    '[
      {"title": "Voice corpus", "description": "Collect approved examples of the owner''s written voice; define tone rules.", "owner_role": "owner", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "voice guide"},
      {"title": "Drafting workflows", "description": "Configure review-response and write-up drafting prompts in the client''s assistant.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "drafting prompt set"},
      {"title": "Review-and-post SOP", "description": "Who reviews, who posts, turnaround targets; nothing posts without sign-off.", "owner_role": "team", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "content SOP"}
    ]'::jsonb,
    'internal', 8, 14, 350000, 450000, 3, true,
    '["review response rate (target: 100%)", "response turnaround (target: 48h)", "owner evening hours on content (target: ~0)"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000008',
    'Change Order Risk Radar', 'change-order-risk-radar',
    'Design/build, remodeling',
    'Change orders surface late, get eaten to preserve the relationship, and quietly destroy job margin.',
    'A reviewed workflow that flags projects with change-order risk signals (scope notes vs. contract line items, stalled selections, schedule slips) for the owner to inspect — it flags, a person decides.',
    'existing_tools', 'medium',
    '["llm_assistant", "project_management", "knowledge_base"]'::jsonb,
    '[
      {"title": "Risk-signal definition", "description": "Define the 5-8 signals that historically preceded eaten change orders.", "owner_role": "owner", "tool_category": "project_management", "human_review": true, "output_artifact": "risk-signal rubric"},
      {"title": "Weekly scan workflow", "description": "Configure assistant to scan approved project notes/logs against the rubric weekly.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "weekly risk scan"},
      {"title": "Review ritual", "description": "10-minute weekly review: owner/PM disposition each flag (act, watch, dismiss).", "owner_role": "owner", "tool_category": "project_management", "human_review": true, "output_artifact": "flag log"},
      {"title": "SOP", "description": "Document signals, scan cadence, and the human-decision rule.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "risk radar SOP"}
    ]'::jsonb,
    'internal', 14, 24, 350000, 500000, 4, true,
    '["change orders billed vs eaten", "days between risk signal and owner awareness", "flags dispositioned weekly %"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-000000000009',
    'Vendor/Subcontractor Follow-up Tracker', 'vendor-subcontractor-follow-up-tracker',
    'Design/build, premium trades, property management',
    'Sub and supplier commitments live in text threads; chasing them is unpaid project management.',
    'A structured tracker of outstanding vendor/sub commitments with drafted follow-up nudges a human reviews and sends.',
    'existing_tools', 'low',
    '["knowledge_base", "automation", "llm_assistant"]'::jsonb,
    '[
      {"title": "Commitment tracker", "description": "Structured tracker (who/what/promised-when/status) in a client-owned base or sheet.", "owner_role": "advisor", "tool_category": "knowledge_base", "human_review": false, "output_artifact": "commitment tracker"},
      {"title": "Capture habit", "description": "Define who logs commitments and when (end-of-day, 2 minutes).", "owner_role": "team", "tool_category": "knowledge_base", "human_review": true, "output_artifact": "capture SOP"},
      {"title": "Follow-up drafts", "description": "Overdue items get drafted nudges queued for human review — no auto-send.", "owner_role": "advisor", "tool_category": "automation", "human_review": true, "output_artifact": "follow-up draft queue"}
    ]'::jsonb,
    'internal', 8, 14, 350000, 450000, 4, true,
    '["overdue commitments without follow-up (target: 0)", "schedule slips caught before they cascade", "PM hours chasing subs (target: -50%)"]'::jsonb,
    true
  ),
  (
    'e0a80001-0000-4000-8000-00000000000a',
    'Meeting Notes → Action Plan', 'meeting-notes-action-plan',
    'Any owner-led team with recurring meetings',
    'Decisions made in meetings evaporate; the same topics get re-discussed for weeks.',
    'Turns meeting notes/recordings (with attendee consent) into a structured action plan — owners, due dates, decisions log — reviewed by the meeting lead before distribution.',
    'existing_tools', 'low',
    '["llm_assistant", "foundational_workspace"]'::jsonb,
    '[
      {"title": "Consent + capture", "description": "Set the consent rule for any recording; define the notes template.", "owner_role": "owner", "tool_category": "foundational_workspace", "human_review": true, "output_artifact": "capture policy"},
      {"title": "Action-plan workflow", "description": "Configure assistant to extract decisions/actions/owners/dates into the standard format.", "owner_role": "advisor", "tool_category": "llm_assistant", "human_review": false, "output_artifact": "action-plan prompt"},
      {"title": "Review-and-send", "description": "Meeting lead reviews and corrects before distribution; corrections feed prompt tuning.", "owner_role": "team", "tool_category": "llm_assistant", "human_review": true, "output_artifact": "distributed action plans"}
    ]'::jsonb,
    'internal', 6, 10, 350000, 400000, 3, true,
    '["actions with named owner + date %", "re-discussed topics per month (target: -75%)", "minutes from meeting end to distributed plan"]'::jsonb,
    true
  );

-- ---------------------------------------------------------------------------
-- Blue Ridge demo: tool instances, a SHARED stack recommendation, and a
-- client-visible audit readout so /admin and /portal operating-layer
-- surfaces are populated on first run. (FICTIONAL demo data.)
-- ---------------------------------------------------------------------------
insert into public.client_tool_instances
  (id, organization_id, tool_vendor_id, tool_name, owner_type, purpose, data_sensitivity, status, monthly_cost_cents, review_date, notes)
values
  (
    'f0a80001-0000-4000-8000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'd0a80001-0000-4000-8000-000000000001',
    'Google Workspace', 'client_owned',
    'Email, proposals in Docs, SOPs scattered in Drive', 'internal', 'active',
    7200, (current_date + 180)::date,
    'Already paid for; the foundational workspace for this engagement.'
  ),
  (
    'f0a80001-0000-4000-8000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    null,
    'Buildertrend', 'client_owned',
    'Project management and scheduling; daily logs underused', 'internal', 'active',
    39900, null,
    'Not in our AI catalog — listed for stack completeness from intake.'
  ),
  (
    'f0a80001-0000-4000-8000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'd0a80001-0000-4000-8000-000000000004',
    'ChatGPT (personal accounts)', 'unknown',
    'Two PMs draft emails informally — no policy, personal accounts', 'internal', 'needs_migration',
    null, (current_date + 30)::date,
    'Migrate to a business tier under the org''s control before any client work uses it.'
  );

insert into public.stack_recommendations
  (id, organization_id, audit_intake_id, title, summary, delivery_mode, overall_data_sensitivity,
   assumptions, excluded_use_cases, setup_price_min_cents, setup_price_max_cents,
   retainer_min_cents, retainer_max_cents, status, created_by)
values
  (
    'f1a80001-0000-4000-8000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'Recommended operating stack — Blue Ridge Custom Builders',
    'Existing tools first: the whole first phase runs on Google Workspace plus one business-grade AI assistant, with the SOP corpus consolidated in Drive. No new platforms, no custom software. Client contracts and employee records stay out of every tool.',
    'existing_tools', 'internal',
    '["Client owns and administers every account (Google Workspace already in place)", "Proposal corpus is scrubbed of client names before any AI use", "Dana reviews every proposal before it is sent", "Assistant tier with no-training terms, verified at kickoff"]'::jsonb,
    '["Employee records / HR (regulated — excluded entirely)", "Client contracts (confidential — excluded from AI work)", "Customer-facing chat or auto-sent email (human review is the rule)"]'::jsonb,
    350000, 500000, 150000, 150000,
    'shared',
    '11111111-1111-1111-1111-111111111111'
  );

insert into public.stack_recommendation_items
  (stack_recommendation_id, tool_vendor_id, tool_category, recommendation_type, use_case, reason, data_boundary, monthly_cost_cents, sort_order)
values
  (
    'f1a80001-0000-4000-8000-000000000001',
    'd0a80001-0000-4000-8000-000000000001',
    'foundational_workspace', 'default',
    'Keep Google Workspace as the foundation — proposals, SOP corpus, email',
    'Already owned and paid for; the scrubbed proposal corpus and consolidated SOPs live here.',
    'Internal documents only; client contracts stay in the restricted drive, out of AI scope.',
    7200, 1
  ),
  (
    'f1a80001-0000-4000-8000-000000000001',
    null,
    'llm_assistant', 'default',
    'One business-grade AI assistant for proposal drafting + SOP Q&A',
    'Single assistant tier covers both Quickstart workflows; specific vendor confirmed at kickoff after terms verification (business tier, no-training terms, client-owned).',
    'Scrubbed proposals and approved SOPs only — nothing confidential, nothing regulated.',
    10000, 2
  ),
  (
    'f1a80001-0000-4000-8000-000000000001',
    null,
    'automation', 'optional',
    'Light automation for inquiry triage drafts (phase 2)',
    'Worth adding once the inbox moves off personal Gmail; drafts route to a review queue, never auto-send.',
    'Inquiry text only; no payment data, no attachments until reviewed.',
    3000, 3
  ),
  (
    'f1a80001-0000-4000-8000-000000000001',
    null,
    'messaging_assistant', 'rejected',
    'Messaging-native assistant for owner reminders',
    'Rejected for now: consumer-grade vendor terms (unverified), no admin controls, and the same need is covered by the weekly ops brief. Revisit only as a personal point solution if Dana asks.',
    'Would be limited to non-sensitive personal coordination — no business data.',
    null, 4
  ),
  (
    'f1a80001-0000-4000-8000-000000000001',
    null,
    'custom_app', 'defer',
    'Custom estimating application',
    'Deferred: the Excel-template pain is real, but a custom build fails the ROI gate until the proposal assistant proves volume. Re-score after 90 days of Quickstart data.',
    'n/a — not in scope this phase.',
    null, 5
  );

insert into public.audit_readouts
  (id, organization_id, audit_intake_id, stack_recommendation_id, title, generated_markdown,
   status, client_visible, created_by, reviewed_at)
values
  (
    'f2a80001-0000-4000-8000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'f1a80001-0000-4000-8000-000000000001',
    'AI Operating Audit Readout — Blue Ridge Custom Builders',
    E'# AI Operating Audit Readout — Blue Ridge Custom Builders\n\n**Prepared by:** Ben, Agent Ally\n**Status:** Sent — demo seed document (FICTIONAL data)\n\nYour accounts. Your data. Our operating method.\n\n## Executive Summary\n\nBlue Ridge Custom Builders is a $6M design/build firm whose owner, Dana, is the bottleneck by design: pricing judgment, proposal drafting, and ~30 staff questions a day all route through her. The audit found two workflows worth implementing now — proposal drafting and an internal SOP assistant — both of which run on tools the business already owns. Nothing in this plan requires new platforms, and nothing customer-facing ships without Dana''s review.\n\n## What We Heard\n\n- Get proposals out faster; stop being the answer desk; make handoffs less owner-dependent.\n- A couple of PMs use AI informally on personal accounts. No policy, no consistency.\n- Busy season starts in 8 weeks — quick wins matter.\n\n## Owner Bottlenecks\n\n| Bottleneck | Severity | Est. hrs/wk |\n| --- | --- | --- |\n| Proposal & estimate assembly | 5/5 | 9 |\n| Repeated staff questions | 4/5 | 8 |\n| Sales-to-production handoffs | 4/5 | 4 |\n| Customer follow-up | 3/5 | 5 |\n\n## Data Risk Map\n\n| Data source | Classification | AI use |\n| --- | --- | --- |\n| Past proposals (Docs) | internal | Allowed after client-name scrub |\n| SOPs & checklists (Drive) | internal | Allowed |\n| Client contracts | confidential | Excluded |\n| Employee records | regulated | Excluded entirely — out of scope |\n\n## Recommended Operating Stack\n\nExisting tools first: Google Workspace stays the foundation; one business-grade AI assistant (client-owned, no-training terms verified at kickoff) covers proposal drafting and SOP Q&A. Light automation for inquiry triage is optional in phase 2. A messaging-native assistant was REJECTED (unverified consumer terms); a custom estimating app is DEFERRED (fails the ROI gate today).\n\n## What We Recommend First\n\n1. Proposal/Estimate Drafting Assistant — highest ROI; corpus needs a scrub pass first.\n2. Internal SOP Assistant — low risk, fast win; gap report becomes the SOP backlog.\n\n## What We Do NOT Recommend\n\n- Customer-facing chat or auto-sent email — human review is the rule, not a phase.\n- Custom estimating application — deferred until proposal volume proves the case.\n- Anything touching employee records — regulated, excluded entirely.\n\n## Human-Review Requirements\n\nEvery proposal is reviewed and sent by Dana. SOP assistant answers only from the approved corpus. Inquiry triage (if added) drafts only — auto-send stays off.\n\n## Next Step\n\nReply within 14 days to schedule the Quickstart kickoff; your $500 audit credit applies.\n',
    'sent', true,
    '11111111-1111-1111-1111-111111111111',
    now() - interval '3 days'
  );
