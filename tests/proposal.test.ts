import { describe, expect, it } from "vitest";
import {
  AUDIT_CREDIT_CENTS,
  buildProposalDraft,
  isWithinCreditWindow,
  MANAGED_WORKSPACE_SETUP_CENTS,
  QUICKSTART_FOUNDING_CENTS,
} from "@/lib/proposal";
import { OFFERS } from "@/lib/content";

/**
 * Proposal generation math, including the $500 audit-credit line inside the
 * 14-day window, the Managed AI Workspace lines, and the rails that refuse
 * decline_or_defer and custom_app recommendations.
 */

const NOW = new Date("2026-06-10T12:00:00Z");

const baseRecommendation = {
  title: "Recommended stack",
  delivery_mode: "existing_tools" as const,
  assumptions: ["Client owns every account"],
  excluded_use_cases: ["Customer-facing chat"],
  setup_price_min_cents: null,
  retainer_min_cents: null,
};

const items = [
  { use_case: "Proposal drafting assistant", recommendation_type: "default" as const },
  { use_case: "Messaging assistant", recommendation_type: "rejected" as const },
];

describe("ladder constants stay aligned with content.ts", () => {
  it("matches the published founding prices", () => {
    const quickstart = OFFERS.find((o) => o.slug === "ai-workflow-quickstart")!;
    const workspace = OFFERS.find((o) => o.slug === "managed-ai-workspace")!;
    expect(QUICKSTART_FOUNDING_CENTS).toBe(quickstart.foundingPriceCents);
    expect(MANAGED_WORKSPACE_SETUP_CENTS).toBe(workspace.foundingPriceCents);
    expect(AUDIT_CREDIT_CENTS).toBe(50000);
  });
});

describe("credit window", () => {
  it("is inclusive of day 0 through day 14, exclusive after", () => {
    expect(isWithinCreditWindow("2026-06-10T12:00:00Z", NOW)).toBe(true); // day 0
    expect(isWithinCreditWindow("2026-06-01T12:00:00Z", NOW)).toBe(true); // day 9
    expect(isWithinCreditWindow("2026-05-27T12:00:00Z", NOW)).toBe(true); // day 14
    expect(isWithinCreditWindow("2026-05-26T12:00:00Z", NOW)).toBe(false); // day 15
    expect(isWithinCreditWindow(null, NOW)).toBe(false);
    expect(isWithinCreditWindow("not a date", NOW)).toBe(false);
  });
});

describe("Quickstart proposals", () => {
  it("applies the −$500 credit line inside the window", () => {
    const result = buildProposalDraft({
      recommendation: baseRecommendation,
      items,
      auditReadoutSentAt: "2026-06-05T12:00:00Z",
      now: NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { draft } = result;
    expect(draft.title).toBe("AI Workflow Quickstart — Proposal drafting assistant");
    expect(draft.lineItems).toHaveLength(2);
    expect(draft.lineItems[0].unit_amount_cents).toBe(350000);
    expect(draft.lineItems[1].unit_amount_cents).toBe(-50000);
    expect(draft.lineItems[1].description).toContain("audit credit");
    expect(draft.total_amount_cents).toBe(300000);
    expect(draft.valid_until).toBe("2026-06-24");
    expect(draft.summary).toContain("client-owned tools");
    expect(draft.summary).toContain("Agent Ally operating method");
    expect(draft.summary).toContain("Assumptions: Client owns every account");
    expect(draft.summary).toContain("Exclusions: Customer-facing chat");
  });

  it("omits the credit line outside the window (and when no readout was sent)", () => {
    for (const sentAt of ["2026-05-01T12:00:00Z", null]) {
      const result = buildProposalDraft({
        recommendation: baseRecommendation,
        items,
        auditReadoutSentAt: sentAt,
        now: NOW,
      });
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.draft.lineItems).toHaveLength(1);
      expect(result.draft.total_amount_cents).toBe(350000);
    }
  });

  it("never builds the proposal around a rejected/deferred item", () => {
    const result = buildProposalDraft({
      recommendation: baseRecommendation,
      items: [
        { use_case: "Messaging assistant", recommendation_type: "rejected" },
        { use_case: "SOP assistant", recommendation_type: "optional" },
      ],
      auditReadoutSentAt: null,
      now: NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft.title).toContain("SOP assistant");
  });
});

describe("Managed AI Workspace proposals", () => {
  it("emits setup + monthly retainer lines with founding defaults", () => {
    const result = buildProposalDraft({
      recommendation: { ...baseRecommendation, delivery_mode: "managed_ai_workspace" },
      items,
      auditReadoutSentAt: "2026-06-05T12:00:00Z",
      now: NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { draft } = result;
    expect(draft.title).toContain("Managed AI Workspace + Operate");
    expect(draft.lineItems[0].unit_amount_cents).toBe(850000);
    expect(draft.lineItems[0].description).toContain("client-owned tools");
    expect(draft.lineItems[1].unit_amount_cents).toBe(0); // monthly — not part of one-time total
    expect(draft.lineItems[1].description).toContain("$1,500/month");
    expect(draft.total_amount_cents).toBe(850000);
    expect(draft.summary).toContain("Not a private platform");
  });

  it("respects recommendation-specific setup/retainer pricing when present", () => {
    const result = buildProposalDraft({
      recommendation: {
        ...baseRecommendation,
        delivery_mode: "managed_ai_workspace",
        setup_price_min_cents: 900000,
        retainer_min_cents: 200000,
      },
      items,
      auditReadoutSentAt: null,
      now: NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.draft.lineItems[0].unit_amount_cents).toBe(900000);
    expect(result.draft.lineItems[1].description).toContain("$2,000/month");
  });
});

describe("proposal rails", () => {
  it("refuses decline_or_defer recommendations", () => {
    const result = buildProposalDraft({
      recommendation: { ...baseRecommendation, delivery_mode: "decline_or_defer" },
      items,
      auditReadoutSentAt: null,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("decline-or-defer");
  });

  it("refuses custom_app recommendations (bespoke SOW only)", () => {
    const result = buildProposalDraft({
      recommendation: { ...baseRecommendation, delivery_mode: "custom_app" },
      items,
      auditReadoutSentAt: null,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("SOW");
  });
});
