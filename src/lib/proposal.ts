import type { StackRecommendation, StackRecommendationItem } from "@/lib/types/database";

/**
 * Deterministic proposal drafting from a stack recommendation. Pure module
 * (unit-tested in tests/proposal.test.ts); the server action persists the
 * result as a proposals row + line items.
 *
 * Ladder math (cross-asserted with src/lib/content.ts by tests):
 *  - Quickstart: $3,500 founding, −$500 audit credit when the readout was
 *    sent within the last 14 days.
 *  - Managed AI Workspace: $8,500 founding setup + Operate retainer from
 *    $1,500/month (informational line; monthly, not part of the one-time total).
 *  - decline_or_defer never produces a proposal; custom apps get a bespoke
 *    SOW, not a generated draft.
 */

export const QUICKSTART_FOUNDING_CENTS = 350000;
export const AUDIT_CREDIT_CENTS = 50000;
export const CREDIT_WINDOW_DAYS = 14;
export const MANAGED_WORKSPACE_SETUP_CENTS = 850000;
export const OPERATE_RETAINER_MIN_CENTS = 150000;

export interface ProposalDraftLine {
  description: string;
  quantity: number;
  unit_amount_cents: number;
  sort_order: number;
}

export interface ProposalDraft {
  title: string;
  summary: string;
  total_amount_cents: number;
  valid_until: string; // ISO date (yyyy-mm-dd)
  lineItems: ProposalDraftLine[];
}

export type ProposalDraftResult = { ok: true; draft: ProposalDraft } | { ok: false; error: string };

export function isWithinCreditWindow(auditReadoutSentAt: string | null, now: Date): boolean {
  if (!auditReadoutSentAt) return false;
  const sent = new Date(auditReadoutSentAt).getTime();
  if (Number.isNaN(sent)) return false;
  const elapsedDays = (now.getTime() - sent) / (1000 * 60 * 60 * 24);
  return elapsedDays >= 0 && elapsedDays <= CREDIT_WINDOW_DAYS;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function ownershipLanguage(rec: Pick<StackRecommendation, "assumptions" | "excluded_use_cases">): string {
  const parts = [
    "Built on client-owned tools — your accounts, your data, the Agent Ally operating method. Existing tools first; nothing here creates dependency on software we control.",
  ];
  if (rec.assumptions.length > 0) parts.push(`Assumptions: ${rec.assumptions.join("; ")}.`);
  if (rec.excluded_use_cases.length > 0) parts.push(`Exclusions: ${rec.excluded_use_cases.join("; ")}.`);
  parts.push("Human review is required on anything customer-facing, financial, legal, HR, or housing-related.");
  return parts.join(" ");
}

export function buildProposalDraft(input: {
  recommendation: Pick<
    StackRecommendation,
    "title" | "delivery_mode" | "assumptions" | "excluded_use_cases" | "setup_price_min_cents" | "retainer_min_cents"
  >;
  items: Pick<StackRecommendationItem, "use_case" | "recommendation_type">[];
  /** When the latest readout with status='sent' went out (null = never). */
  auditReadoutSentAt: string | null;
  now: Date;
}): ProposalDraftResult {
  const { recommendation: rec, items, auditReadoutSentAt, now } = input;

  if (rec.delivery_mode === "decline_or_defer") {
    return {
      ok: false,
      error:
        "Safety rail: this recommendation is decline-or-defer — no proposal can be generated from it.",
    };
  }
  if (rec.delivery_mode === "custom_app") {
    return {
      ok: false,
      error:
        "Custom builds are scoped under their own paid SOW after the audit — draft that by hand, not from the generator.",
    };
  }

  const firstWorkflow =
    items.find((i) => i.recommendation_type === "default")?.use_case ??
    items.find((i) => i.recommendation_type === "optional" || i.recommendation_type === "premium")
      ?.use_case ??
    "the first roadmap workflow";
  const validUntil = isoDate(addDays(now, CREDIT_WINDOW_DAYS));

  if (rec.delivery_mode === "managed_ai_workspace") {
    const setup = rec.setup_price_min_cents ?? MANAGED_WORKSPACE_SETUP_CENTS;
    const retainer = rec.retainer_min_cents ?? OPERATE_RETAINER_MIN_CENTS;
    const lineItems: ProposalDraftLine[] = [
      {
        description: "Managed AI Workspace — setup (founding price; client-owned tools, documented operating stack, team training)",
        quantity: 1,
        unit_amount_cents: setup,
        sort_order: 1,
      },
      {
        description: `Operate retainer — from $${(retainer / 100).toLocaleString("en-US")}/month (billed monthly; monthly operating cadence — not included in the one-time total)`,
        quantity: 1,
        unit_amount_cents: 0,
        sort_order: 2,
      },
    ];
    return {
      ok: true,
      draft: {
        title: `Managed AI Workspace + Operate — ${rec.title}`,
        summary: `Your proven workflows configured into one documented operating stack across tools your business owns, with a monthly Operate cadence behind it. Not a private platform. ${ownershipLanguage(rec)}`,
        total_amount_cents: setup,
        valid_until: validUntil,
        lineItems,
      },
    };
  }

  // Default path: AI Workflow Quickstart (existing_tools / point_solution / custom_glue).
  const lineItems: ProposalDraftLine[] = [
    {
      description: `AI Workflow Quickstart — ${firstWorkflow} (founding price; one workflow, two weeks, existing client-owned tools, written SOP)`,
      quantity: 1,
      unit_amount_cents: QUICKSTART_FOUNDING_CENTS,
      sort_order: 1,
    },
  ];
  let total = QUICKSTART_FOUNDING_CENTS;
  if (isWithinCreditWindow(auditReadoutSentAt, now)) {
    lineItems.push({
      description: "Founding audit credit (proceeding within 14 days of the readout)",
      quantity: 1,
      unit_amount_cents: -AUDIT_CREDIT_CENTS,
      sort_order: 2,
    });
    total -= AUDIT_CREDIT_CENTS;
  }
  return {
    ok: true,
    draft: {
      title: `AI Workflow Quickstart — ${firstWorkflow}`,
      summary: `One workflow from your audit roadmap (${firstWorkflow}), built and tested in two weeks in tools you already own, with human-review checkpoints, a written SOP, and two weeks of post-launch adjustment. ${ownershipLanguage(rec)}`,
      total_amount_cents: total,
      valid_until: validUntil,
      lineItems,
    },
  };
}
