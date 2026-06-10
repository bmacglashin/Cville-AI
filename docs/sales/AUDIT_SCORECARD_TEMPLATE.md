# Audit Scorecard Template

Two instruments: the **use-case scorecard** (mirrors `opportunity_scores` in the app — fill it
in `/admin` and it computes totals) and the **readiness scorecard** (engagement-level context
for the readout). Scores are structured judgment, not measurement — defend every number aloud.

## A. Use-case scorecard (per candidate, 1–5 each)

**Total = 2×Impact + Data-readiness − Effort − Risk** *(range −8…+14)*

| Dimension | 1 | 3 | 5 |
| --- | --- | --- | --- |
| **Impact** | Minor convenience | Meaningful weekly time/revenue effect | Removes a top-3 owner burden or revenue leak |
| **Effort** | Config + corpus exists | ~2-week Quickstart w/ moderate prep | Heavy data prep, multi-system, behavior change |
| **Risk** | Internal-only, reversible, low-sensitivity | Customer-visible w/ review step, internal data | Touches money/reputation/sensitive data; hard to reverse |
| **Data-readiness** | Knowledge in heads/paper | Digital but scattered/unscrubbed | Clean, digital, approved, scrubbable this week |

**Reading totals:** ≥9 exceptional first bet · 7–8 strong (Quickstart-ready) · 4–6 sequence
later (name the unblocking condition) · ≤3 "not yet" (say what would change it).

**Calibration anchors (from the fictional Blue Ridge demo):** proposal assistant I5 E3 R2 D4 =
**9** · SOP assistant I4 E2 R1 D3 = **8** · owner brief before its sources exist I4 E4 R2 D2 =
**4** (correctly "later").

Per-use-case worksheet:

```
Use case: ___________________  Workflow type: ____________
Impact __ /5   why: ______________________________________
Effort __ /5   why: ______________________________________
Risk __ /5     why + review point: _______________________
Data-readiness __ /5   sources + scrub needed: ___________
Owner hrs/week recoverable: ____   TOTAL: ____
Honest caveat (mandatory): _______________________________
```

## B. Readiness scorecard (engagement level, 0–20 each → /100)

| Category | What you're judging | Score |
| --- | --- | --- |
| Process clarity | Are workflows definable enough to systematize? | /20 |
| Data foundation | Digital? Findable? Scrub-able? Sensitivity known? | /20 |
| Team adoption capacity | Will the team use what gets built? Champion besides the owner? | /20 |
| Owner bandwidth | Can the owner give review time in weeks 1–4? | /20 |
| Risk posture | Realistic expectations? Accepts human-review discipline? | /20 |

**Bands:** 80–100 ready — recommend a Quickstart now · 60–79 ready with prep — roadmap includes
foundation work first · 40–59 foundations first — sell process fixes, AI second visit ·
<40 not yet — say so plainly; the audit's value is the avoided waste.

*Note: the portal currently derives its "readiness signal" from use-case score totals; this
engagement-level scorecard lives in the written deliverable. Wire it into the app later only
if clients keep asking for it.*

## Scoring discipline

Score within 48h of the interview · pre-score from intake, then correct after (the deltas are
your learning loop) · never score above Risk 3 for anything customer-facing without naming its
review step · at least one candidate should score "not yet" in every honest audit.
