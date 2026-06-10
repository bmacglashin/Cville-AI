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
    'One workflow, two weeks, working in your business. No custom platform.',
    'One workflow selected from your audit roadmap, built and tested alongside your team in two weeks, with human-review checkpoints, a written SOP, and two weeks of post-launch adjustment.',
    350000, 475000,
    'Standard $4,500–$5,000 depending on workflow complexity.',
    true, true, 2
  ),
  (
    'c0a80001-0000-4000-8000-000000000003',
    'command-center-lite',
    'Owner Command Center Lite + Operate',
    'A private, human-reviewed AI workspace for owners ready to go beyond one workflow.',
    'Private workspace with approved document corpus, one or two role-specific assistants, workflow dashboard with human review, monthly optimization meeting, light monitoring. Offered after an audit only. Operate retainer from $1,500/month.',
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
