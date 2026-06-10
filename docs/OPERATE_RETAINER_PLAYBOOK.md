# Operate Retainer Playbook

The monthly cadence behind "+ Operate" (from $1,500/month). This is a **document**, not a
dashboard — run it as a checklist per client, file the outputs as deliverables/notes in
`/admin`. Do not build software for this until the first retainer client exists and the manual
loop has been run at least three times (see `docs/NEXT_STEPS.md`).

## Monthly cycle (per client, ~half a day)

### 1. Workflow health
For each live workflow (from the client's stack recommendation / handoff doc): ran as designed
this month? Failures, workarounds, silent abandonment? Tool changes (pricing, terms, features)
that affect it? Record exceptions, not green checkmarks.

### 2. Adoption
Who is actually using it — and who has quietly stopped? Where does the team route around the
workflow? One adoption conversation with the workflow's day-to-day owner per month, 15 minutes.

### 3. Output quality
Sample 3–5 real outputs per workflow (proposals drafted, replies suggested, checklists
generated). Score against the SOP's "good output" definition. Drift → prompt/SOP fix this
month, not "eventually."

### 4. Risk check
Any new data flowing into any tool? Still inside each tool's `max_data_sensitivity` ceiling
and the engagement's data boundaries? Human-review checkpoints still happening (spot-check,
don't ask)? Any vendor term/feature changes that move risk? Anything drifting toward a
regulated area → stop the workflow, flag to owner, document.

### 5. Prompt & SOP changes
Apply fixes from #3/#4. Version the prompt library and SOPs (date + one-line change note in the
client's docs). The client's copy is updated the same day ours is.

### 6. Backlog refresh
Re-rank the improvement backlog (from the audit roadmap + new requests). Anything newly
justified? Anything to retire? New requests get the same scoring as audit opportunities —
impact, effort, risk, data readiness.

### 7. Owner brief
One page to the owner: what ran, what improved, what we changed, what we recommend next, any
risk flags. Plain language. (Format: `docs/sales/SAMPLE_OWNER_WEEKLY_OPS_BRIEF.md`, monthly
cadence.) File as a deliverable; log an `activity_event`.

### 8. Training notes
What did the team struggle with? Refresher delivered or scheduled? New-hire onboarding to the
workflows still accurate?

## Retainer boundaries (say them out loud at kickoff)

- Covers: the cadence above, small workflow adjustments, prompt/SOP updates, vendor-change
  monitoring for tools in the documented stack, one monthly working session.
- Does NOT cover: new workflow builds (that's a Quickstart), custom software (paid SOW),
  regulated-data work (never), emergency 24/7 support (we're founder-led; response is
  next-business-day), or operating tools outside the documented stack.
- Cancellation: 30 days' notice. Everything keeps working — the tools are in client accounts
  and the SOPs are theirs. Exit follows `docs/CLIENT_HANDOFF_TEMPLATE.md`.
