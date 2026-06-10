# Privacy & Data Handling — Internal Notes

Companion to the public `/privacy` and `/terms` pages. This is the operating doctrine;
those pages are the public promise. Keep them in sync.

## The stance (why it's a sales asset, not a constraint)

Every competitor says "your data is safe." We instead show the mechanism: classify first,
exclude regulated data outright, build early work on dummy/approved content, human-review
everything customer-facing. For owner-led businesses whose reputation IS the business, this is
the single most differentiating page on the site. Never weaken it for a deal.

## Hard exclusions (MVP — also encoded in copy, intake acks, and prompts)

- No HIPAA/PHI or any health-record workflow
- No FERPA/student records
- No tenant-screening, employment, credit, lending, or insurance **decisions**
- No legal or tax advice workflows
- No payroll decisioning
- No financial account credentials (banking logins, card numbers)
- No children's data
- No autonomous actions — human review on anything customer-facing, financial, legal, HR,
  housing-related, or regulated

"Decisions" is the operative word for the screening/employment/credit items: drafting a job ad
is fine; ranking applicants is not.

## How data flows today (validation phase)

| Data | Where | Sensitivity controls |
| --- | --- | --- |
| Applications (`leads`) | Supabase Postgres | Anon insert-only; admin-only read |
| Intake (incl. pain points, data-source listing) | Supabase Postgres | Org-scoped RLS; sensitivity enum on sources/docs; acks stored |
| Documents | **Names/descriptions only** — no file contents | `status='listed'`; no storage bucket exists |
| Call notes (`discovery_notes`) | Supabase Postgres | Admin-only RLS |
| Email notifications | Resend (when configured) | Lead summary only; no intake details |
| AI model calls | **None in the app today** | Stub returns not-implemented |

During actual audit delivery (outside the app): work happens on dummy data or documents the
client explicitly approved as non-sensitive, via commercial API tiers with no-training terms.
Tell each client exactly which providers are involved in their engagement, in writing.

## Engagement-time rules

1. Data-risk ranking is produced in every audit (the `data_sources` sensitivity ranking is its
   input) and reviewed with the owner at the readout.
2. Anything `confidential` or `regulated` is excluded from AI work; `regulated` is excluded
   from the engagement entirely unless/until a compliant path is formally built (not MVP).
3. Client-name scrubbing before any corpus use (e.g., past proposals) — checklist lives in the
   delivery playbook.
4. Outputs that leave the building (emails, proposals, reviews) always carry a human-approval
   step, and the SOP we hand over documents it.
5. Deletion/export on request within 30 days — the privacy page promises it; honor it.

## Legal/compliance to-dos before first paid engagement

Tracked in `docs/LAUNCH_CHECKLIST.md` §4: LLC, MSA, SOW, NDA, DPA (where appropriate),
AI-output disclaimer, limitation of liability, IP ownership, deletion/export process, security
exhibit, upfront payment terms, E&O/tech-E&O/cyber quotes, counsel review of public pages.

## Incident posture (validation-phase pragmatism)

If client data is mishandled (wrong file shared, sensitive doc received unsolicited): stop,
delete and confirm in writing, tell the client what happened the same day, log it in
`activity_events` (`event_type='data_incident'`), and write down the prevention change. Small
practice, honest handling — that's the brand.

## What changes post-validation

Document upload (private bucket, org-scoped storage RLS), retention automation, provider DPAs
collected in one place, and a real subprocessor list on the privacy page. See
`docs/NEXT_STEPS.md`.
