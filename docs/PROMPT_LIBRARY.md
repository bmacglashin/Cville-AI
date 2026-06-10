# Prompt Library

Versioned prompts for FUTURE AI-assisted features. Code copies live in
`src/lib/prompts/audit-summary.ts` — that file is the source of truth; this doc adds usage
rules and the roadmap. **Nothing here is wired to a model in the validation build** —
`src/lib/ai/generate-audit-summary.ts` intentionally returns not-implemented.

## Rules that apply to every prompt in this practice

1. **Drafts for humans, never outputs for customers.** Every generation is labeled DRAFT and
   routed to advisor or owner review. No auto-send, anywhere, ever.
2. **Grounded inputs only.** Prompts receive structured data we already hold (intake rows,
   discovery notes, approved corpus). "If unknown, say UNKNOWN" beats hallucinated specifics.
3. **Regulated-data tripwire in the prompt itself.** Use cases touching excluded categories get
   marked `[OUT OF SCOPE — REGULATED]` by instruction, as a second net behind process.
4. **Honest-advisor voice.** Banned: "10x", "game-changing", "revolutionary", "replace
   employees". Required: explicit "what NOT to automate yet" sections.
5. **Version prompts like code.** They live in `src/lib/prompts/`, change via PR, and renders
   get logged to `activity_events` (`ai_draft_generated`) when implemented.

## Prompt 1 — Audit Summary Drafter (`AUDIT_SUMMARY_*`)

- **Purpose:** turn intake + discovery data into a first-draft audit for ADVISOR review,
  following the structure of `docs/sales/AI_OPERATING_AUDIT_DELIVERABLE_TEMPLATE.md`.
- **Inputs:** business profile, tools, workflows, pain points, data sources w/ sensitivity,
  discovery notes.
- **Output contract:** operating snapshot → owner-time ranking → ≤8 candidate use cases with
  impact/effort/risk/data-readiness (1–5) → data-risk ranking → top 5 + sequencing → 30-day
  roadmap → "do not automate yet."
- **Wire-up plan:** implement `generateAuditSummary()` with the Claude API
  (`claude-fable-5` or the strongest current model — judgment work, not bulk work); store
  output as a `deliverables` row, `status='advisor_review'`, `deliverable_type='audit_draft'`.

## Prompt 2 — Owner Weekly Ops Brief (`OWNER_BRIEF_*`)

- **Purpose:** assemble the Monday brief (see `/demo/ops-brief` and
  `docs/sales/SAMPLE_OWNER_WEEKLY_OPS_BRIEF.md`) from approved, pre-screened sources.
- **Hard rules in-prompt:** cite the source for every item; never invent figures; pricing/
  contract/personnel items are flagged OWNER DECISION with no recommended action; standard
  human-review notice closes every brief; 4-minute read budget.
- **Wire-up plan (post-validation, per client):** a scheduled job (Supabase Edge Function or
  Vercel cron) reads that client's approved sources → drafts → advisor reviews → THEN delivers.
  Deliver as `deliverables` row + email. Never skip the review leg.

## Backlog prompts (write when the engagement exists, not before)

| Prompt | Trigger to write it |
| --- | --- |
| Proposal assistant (per-client, corpus-grounded) | First proposal-assistant Quickstart sold |
| SOP gap reporter (unanswered staff questions → SOP backlog) | First SOP-assistant Quickstart |
| Inquiry triage drafter (classify + draft, human send) | First triage Quickstart |
| Handoff checklist generator | First handoff Quickstart |
| Discovery-notes summarizer (interview transcript → structured notes) | Audit #2 (saves real time) |

## Why prompts live in code, not a CMS

Validation phase = founder is the only operator. Code review is the QA process; git is the
audit trail; deploys are the release mechanism. Revisit only if a non-technical operator joins.
