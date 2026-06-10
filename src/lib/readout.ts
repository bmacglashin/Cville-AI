import { formatCents, titleCase } from "@/lib/utils";
import { isDeferSensitivity } from "@/lib/safety";
import type {
  AiOpportunity,
  AuditIntake,
  ClientToolInstance,
  DataSource,
  DiscoveryNote,
  OpportunityScore,
  Organization,
  PainPoint,
  RoadmapItem,
  StackRecommendation,
  StackRecommendationItem,
  ToolInventoryItem,
  Workflow,
} from "@/lib/types/database";

/**
 * Deterministic Audit Readout generator. NO LLM anywhere in this path —
 * it assembles structured engagement data into the standard readout
 * sections (mirrors docs/sales/AI_OPERATING_AUDIT_DELIVERABLE_TEMPLATE.md).
 * The advisor edits the result before it is reviewed/sent/shared.
 *
 * Vendor naming rule: an item's vendor name is included only when the
 * catalog row allows public copy — otherwise the generic category label is
 * used (docs/TOOL_DOCTRINE.md §2). The caller enforces this by passing
 * vendorName=null for non-public vendors.
 */

export interface ReadoutItemInput extends StackRecommendationItem {
  /** Display name, already filtered for public_copy_allowed by the caller. */
  vendorName: string | null;
}

export interface ReadoutInput {
  organization: Pick<Organization, "name" | "industry" | "team_size">;
  intake: Pick<
    AuditIntake,
    "goals" | "budget_range" | "timeline" | "current_ai_usage" | "additional_notes"
  > | null;
  discoveryNotes: Pick<DiscoveryNote, "call_type" | "summary" | "occurred_at">[];
  toolsInventory: Pick<ToolInventoryItem, "name" | "category" | "usage_notes">[];
  workflows: Pick<Workflow, "name" | "description" | "frequency" | "hours_per_week">[];
  painPoints: Pick<PainPoint, "area" | "description" | "severity">[];
  dataSources: Pick<DataSource, "name" | "sensitivity" | "notes">[];
  opportunities: (Pick<AiOpportunity, "id" | "title" | "description"> & {
    score: Pick<
      OpportunityScore,
      "impact" | "effort" | "risk" | "data_readiness" | "total_score" | "owner_hours_saved_weekly" | "notes"
    > | null;
  })[];
  roadmapItems: Pick<RoadmapItem, "title" | "description" | "phase" | "target_window">[];
  recommendation:
    | (Pick<
        StackRecommendation,
        | "title"
        | "summary"
        | "delivery_mode"
        | "overall_data_sensitivity"
        | "assumptions"
        | "excluded_use_cases"
        | "setup_price_min_cents"
        | "setup_price_max_cents"
        | "retainer_min_cents"
        | "retainer_max_cents"
      > & { items: ReadoutItemInput[] })
    | null;
  toolInstances: Pick<ClientToolInstance, "tool_name" | "owner_type" | "data_sensitivity" | "purpose">[];
  /** Injected for determinism (tests pass a fixed date). */
  today: Date;
}

const QUICKSTART_FOUNDING_CENTS = 350000;
const AUDIT_CREDIT_CENTS = 50000;
const CREDIT_WINDOW_DAYS = 14;

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function tableRow(cells: (string | number | null | undefined)[]): string {
  return `| ${cells.map((c) => String(c ?? "—").replace(/\|/g, "/")).join(" | ")} |`;
}

/** Client-friendly category labels (mirrors the public TOOL_CATEGORIES naming). */
const CATEGORY_LABELS: Record<string, string> = {
  foundational_workspace: "Foundational workspace",
  llm_assistant: "Business-grade AI assistant",
  knowledge_base: "Knowledge base",
  automation: "Automation platform",
  messaging_assistant: "Messaging-native assistant",
  agent_workspace: "Advanced agent workspace",
  custom_app: "Custom build",
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? titleCase(category);
}

function itemLabel(item: ReadoutItemInput): string {
  return item.vendorName ?? `${categoryLabel(item.tool_category)} (specific tool selected case-by-case)`;
}

export function generateReadoutMarkdown(input: ReadoutInput): string {
  const {
    organization,
    intake,
    discoveryNotes,
    toolsInventory,
    workflows,
    painPoints,
    dataSources,
    opportunities,
    roadmapItems,
    recommendation,
    toolInstances,
    today,
  } = input;

  const lines: string[] = [];
  const push = (...rows: string[]) => lines.push(...rows);

  const scored = opportunities
    .filter((o) => o.score)
    .sort((a, b) => (b.score!.total_score ?? 0) - (a.score!.total_score ?? 0));
  const topPains = [...painPoints].sort((a, b) => b.severity - a.severity);
  const declined = recommendation?.delivery_mode === "decline_or_defer";
  const items = recommendation?.items ?? [];
  const recommendedItems = items.filter(
    (i) => i.recommendation_type === "default" || i.recommendation_type === "optional" || i.recommendation_type === "premium"
  );
  const notRecommendedItems = items.filter(
    (i) => i.recommendation_type === "rejected" || i.recommendation_type === "defer"
  );
  const creditDeadline = fmtDate(addDays(today, CREDIT_WINDOW_DAYS));

  /* ── Title ── */
  push(`# AI Operating Audit Readout — ${organization.name}`, "");
  push(`**Prepared by:** Ben, Copp Oak Advisory · **Date:** ${fmtDate(today)}`);
  push(
    "**Confidential** — prepared for the owner. Contains no regulated data by design.",
    "",
    "Your accounts. Your data. Our operating method.",
    ""
  );

  /* ── 1. Executive Summary ── */
  push("## Executive Summary", "");
  push(
    `${organization.name} is ${organization.industry ? `a ${organization.industry.toLowerCase()} business` : "an owner-led business"}${organization.team_size ? ` (${organization.team_size} people)` : ""}.`
  );
  if (topPains[0]) {
    push(
      `The single costliest bottleneck found in this audit: **${topPains[0].area ?? topPains[0].description}** (severity ${topPains[0].severity}/5).`
    );
  }
  if (scored[0]) {
    push(
      `The strongest opportunity is **${scored[0].title}** (score ${scored[0].score!.total_score}), and the plan below sequences ${scored.length} scored use case${scored.length === 1 ? "" : "s"} around it.`
    );
  }
  push(
    declined
      ? "**Recommendation: decline or defer.** The risk profile or data involved does not support AI implementation right now — the honest details are below, with what would change the answer."
      : "Everything recommended below runs on tools your business owns. Existing tools first; custom builds only when the business case is clear. Nothing customer-facing ships without a person reviewing it.",
    ""
  );

  /* ── 2. What We Heard ── */
  push("## What We Heard", "");
  if (intake?.goals) push(`- **Goals (your words):** ${intake.goals}`);
  if (intake?.current_ai_usage) push(`- **AI today:** ${intake.current_ai_usage}`);
  if (intake?.timeline) push(`- **Timeline:** ${intake.timeline}`);
  if (intake?.budget_range) push(`- **Budget range:** ${intake.budget_range}`);
  if (intake?.additional_notes) push(`- **Notes:** ${intake.additional_notes}`);
  if (!intake) push("- _No structured intake on file — this draft was assembled from discovery only._");
  for (const note of discoveryNotes) {
    push(`- **From the ${titleCase(note.call_type)}:** ${note.summary}`);
  }
  push("");

  /* ── 3. Owner Bottlenecks ── */
  push("## Owner Bottlenecks", "");
  if (topPains.length > 0) {
    push(tableRow(["Bottleneck", "Severity", "Detail"]));
    push(tableRow(["---", "---", "---"]));
    for (const p of topPains) push(tableRow([p.area ?? "—", `${p.severity}/5`, p.description]));
  } else {
    push("_No pain points recorded yet._");
  }
  if (workflows.length > 0) {
    push("", "Recurring workflows reported, with estimated weekly hours:", "");
    for (const w of workflows) {
      push(`- **${w.name}**${w.hours_per_week != null ? ` — ~${w.hours_per_week} hrs/week` : ""}${w.frequency ? ` (${w.frequency})` : ""}${w.description ? `: ${w.description}` : ""}`);
    }
  }
  push("");

  /* ── 4. Workflow Opportunity Map ── */
  push("## Workflow Opportunity Map", "");
  push("Scoring: total = 2×impact + data-readiness − effort − risk. ≥7 strong first bet · 4–6 worth sequencing · <4 not yet.", "");
  if (opportunities.length > 0) {
    push(tableRow(["Use case", "Impact", "Effort", "Risk", "Data-readiness", "Total", "Owner hrs/wk back"]));
    push(tableRow(["---", "---", "---", "---", "---", "---", "---"]));
    for (const o of opportunities) {
      const s = o.score;
      push(
        tableRow([
          o.title,
          s?.impact,
          s?.effort,
          s?.risk,
          s?.data_readiness,
          s ? s.total_score : "unscored",
          s?.owner_hours_saved_weekly,
        ])
      );
    }
  } else {
    push("_No opportunities mapped yet._");
  }
  push("");

  /* ── 5. Data Risk Map ── */
  push("## Data Risk Map", "");
  push("This section is non-negotiable: what each data source is, how sensitive it is, and whether AI may touch it in this engagement.", "");
  if (dataSources.length > 0) {
    push(tableRow(["Data source", "Classification", "AI use in this engagement"]));
    push(tableRow(["---", "---", "---"]));
    for (const d of dataSources) {
      const use = isDeferSensitivity(d.sensitivity)
        ? "❌ Excluded entirely — out of scope"
        : d.sensitivity === "confidential"
          ? "❌ Excluded from AI work"
          : d.notes?.toLowerCase().includes("scrub")
            ? "✅ Allowed after scrub"
            : "✅ Allowed (approved content only)";
      push(tableRow([d.name, d.sensitivity, use]));
    }
  } else {
    push("_No data sources classified yet — classification happens before any build._");
  }
  push("");

  /* ── 6. Recommended Operating Stack ── */
  push("## Recommended Operating Stack", "");
  if (recommendation && !declined) {
    if (recommendation.summary) push(recommendation.summary, "");
    const inPlace =
      toolInstances.length > 0
        ? toolInstances.map((t) => t.tool_name)
        : toolsInventory.map((t) => t.name);
    if (inPlace.length > 0) {
      push("**Already in place (client-owned):** " + inPlace.join(", "), "");
    }
    if (recommendedItems.length > 0) {
      push(tableRow(["Role in the operation", "Tool", "Type", "Data boundary", "Est. monthly"]));
      push(tableRow(["---", "---", "---", "---", "---"]));
      for (const i of recommendedItems) {
        push(
          tableRow([
            i.use_case,
            itemLabel(i),
            i.recommendation_type,
            i.data_boundary,
            i.monthly_cost_cents != null ? formatCents(i.monthly_cost_cents) : null,
          ])
        );
      }
    } else {
      push("_Stack items pending — compose them in the stack builder._");
    }
    push("", "Every account is owned by your business — your logins, your data, your billing. Specific tools remain subject to vendor terms, data requirements, and your approval.");
  } else if (declined) {
    push("No operating stack is recommended at this time (see What We Do NOT Recommend).");
  } else {
    push("_No stack recommendation linked yet — create one in the stack builder._");
  }
  push("");

  /* ── 7. What We Recommend First ── */
  push("## What We Recommend First", "");
  if (!declined && scored.length > 0) {
    scored.slice(0, 3).forEach((o, idx) => {
      push(`${idx + 1}. **${o.title}** (score ${o.score!.total_score})${o.description ? ` — ${o.description}` : ""}${o.score!.notes ? ` _${o.score!.notes}_` : ""}`);
    });
  } else if (declined) {
    push("Nothing — deferring is the recommendation. The roadmap below covers the prerequisite fixes instead.");
  } else {
    push("_Score the opportunities to populate this section._");
  }
  push("");

  /* ── 8. What We Do NOT Recommend ── */
  push("## What We Do NOT Recommend", "");
  push("The part most vendors skip. These are deliberate no's, with reasons:", "");
  for (const i of notRecommendedItems) {
    push(`- **${i.use_case}** (${i.recommendation_type}) — ${i.reason ?? "see engagement notes"}`);
  }
  for (const excluded of recommendation?.excluded_use_cases ?? []) {
    push(`- ${excluded}`);
  }
  for (const d of dataSources.filter((src) => isDeferSensitivity(src.sensitivity))) {
    push(`- **Anything touching ${d.name}** — classified ${d.sensitivity}; excluded from every tool and workflow.`);
  }
  if (
    notRecommendedItems.length === 0 &&
    (recommendation?.excluded_use_cases ?? []).length === 0 &&
    !dataSources.some((src) => isDeferSensitivity(src.sensitivity))
  ) {
    push("- _Add at least one deliberate exclusion before sending — every honest audit has one._");
  }
  push("");

  /* ── 9. 30/60/90-Day Roadmap ── */
  push("## 30/60/90-Day Roadmap", "");
  const phases: { phase: "now" | "next" | "later"; label: string }[] = [
    { phase: "now", label: "Days 1–30" },
    { phase: "next", label: "Days 31–60" },
    { phase: "later", label: "Days 61–90+" },
  ];
  if (roadmapItems.length > 0) {
    push(tableRow(["Window", "Action", "Detail"]));
    push(tableRow(["---", "---", "---"]));
    for (const { phase, label } of phases) {
      for (const item of roadmapItems.filter((r) => r.phase === phase)) {
        push(tableRow([item.target_window || label, item.title, item.description]));
      }
    }
  } else {
    push("_No roadmap items yet — build the roadmap on the client page._");
  }
  push("");

  /* ── 10. Quickstart Proposal ── */
  push("## Quickstart Proposal", "");
  if (declined) {
    push("No implementation is proposed. When the deferral reasons above are resolved, the audit credit conversation reopens.");
  } else {
    const first = scored[0]?.title ?? "the first roadmap workflow";
    push(
      `Recommended first build: **${first}** — one workflow, two weeks, in tools you own, with human-review checkpoints, a written SOP, and two weeks of adjustment.`,
      "",
      `Founding price ${formatCents(QUICKSTART_FOUNDING_CENTS)} (standard $4,500–$5,000), **minus your ${formatCents(AUDIT_CREDIT_CENTS)} audit credit if we proceed by ${creditDeadline}** = ${formatCents(QUICKSTART_FOUNDING_CENTS - AUDIT_CREDIT_CENTS)}.`,
      "",
      "No obligation — this roadmap is yours either way."
    );
  }
  push("");

  /* ── 11. Operate Cadence ── */
  push("## Operate Cadence", "");
  if (recommendation?.retainer_min_cents != null && !declined) {
    push(
      `Once workflows are live and proven, the Operate retainer (from ${formatCents(recommendation.retainer_min_cents)}/month) covers the monthly cadence: workflow health, adoption, output-quality sampling, data-risk check, prompt/SOP updates, backlog refresh, and a one-page owner brief.`
    );
  } else {
    push(
      "Not proposed yet. When implemented workflows are running, a monthly Operate cadence (workflow health, output quality, prompt/SOP upkeep, owner brief) becomes worth discussing — it's fine that the answer today is 'not yet.'"
    );
  }
  push("");

  /* ── 12. Assumptions ── */
  push("## Assumptions", "");
  for (const a of recommendation?.assumptions ?? []) push(`- ${a}`);
  push(
    "- Every tool account is owned and administered by your business.",
    "- Copp Oak Advisory stores no passwords or financial credentials.",
    "- Pricing assumes the scope above; changes are agreed in writing before work shifts.",
    ""
  );

  /* ── 13. Open Questions ── */
  push("## Open Questions", "");
  const unscored = opportunities.filter((o) => !o.score);
  for (const o of unscored) push(`- ${o.title}: not yet scored — needs a working-session decision.`);
  if (recommendedItems.some((i) => !i.vendorName)) {
    push("- Final tool selection in the categories above: confirmed at kickoff after current vendor terms are verified.");
  }
  if (!intake?.budget_range) push("- Implementation budget range: not yet confirmed.");
  if (unscored.length === 0 && !recommendedItems.some((i) => !i.vendorName) && intake?.budget_range) {
    push("- _None open — confirm at the readout working session._");
  }
  push("");

  /* ── 14. Human-Review Requirements ── */
  push("## Human-Review Requirements", "");
  push(
    "Non-negotiable, workflow by workflow: a person reviews anything customer-facing, financial, legal, HR-adjacent, or housing-related before it acts or sends. Specifically:",
    ""
  );
  for (const i of recommendedItems) {
    push(`- **${i.use_case}:** ${i.data_boundary ?? "outputs are drafts until a named person approves them."}`);
  }
  push(
    "- No workflow auto-sends to customers. No tool makes a hiring, housing, lending, or pricing decision.",
    ""
  );

  /* ── 15. Next Step ── */
  push("## Next Step", "");
  push(
    declined
      ? `Schedule a 30-minute working session to walk through the deferral reasons and the prerequisite fixes. When those are done, we re-score — the audit stays on file.`
      : `Reply by **${creditDeadline}** to schedule the Quickstart kickoff and apply your ${formatCents(AUDIT_CREDIT_CENTS)} audit credit. Either way, the working session to walk through this readout is included in your audit.`,
    ""
  );

  return lines.join("\n");
}
