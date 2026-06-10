import { describe, expect, it } from "vitest";
import { generateReadoutMarkdown, type ReadoutInput } from "@/lib/readout";

/**
 * The Audit Readout generator is DETERMINISTIC — same input, same markdown,
 * no model anywhere. These tests pin the section contract (mirrors
 * docs/sales/AI_OPERATING_AUDIT_DELIVERABLE_TEMPLATE.md), the data-risk and
 * human-review guarantees, and the vendor-naming doctrine.
 */

const TODAY = new Date("2026-06-10T12:00:00Z");

function baseInput(): ReadoutInput {
  return {
    organization: { name: "Blue Ridge Custom Builders", industry: "Design / build", team_size: "16–40" },
    intake: {
      goals: "Faster proposals, fewer interruptions.",
      budget_range: "$5k–$15k",
      timeline: "This quarter",
      current_ai_usage: "Two PMs use chat tools informally.",
      additional_notes: null,
    },
    discoveryNotes: [
      { call_type: "owner_interview", summary: "Pricing judgment lives with the owner.", occurred_at: "2026-06-01" },
    ],
    toolsInventory: [{ name: "Buildertrend", category: "PM", usage_notes: null }],
    workflows: [
      { name: "Proposal assembly", description: "Owner drafts everything.", frequency: "Weekly", hours_per_week: 9 },
    ],
    painPoints: [
      { area: "Proposals", description: "Take 2–3 weeks.", severity: 5 },
      { area: "Staff questions", description: "30 a day.", severity: 4 },
    ],
    dataSources: [
      { name: "Past proposals", sensitivity: "internal", notes: "Needs scrub." },
      { name: "Client contracts", sensitivity: "confidential", notes: null },
      { name: "Employee records", sensitivity: "regulated", notes: null },
    ],
    opportunities: [
      {
        id: "o1",
        title: "Proposal assistant",
        description: "Drafts from scrubbed corpus.",
        score: { impact: 5, effort: 3, risk: 2, data_readiness: 4, total_score: 9, owner_hours_saved_weekly: 7, notes: null },
      },
      { id: "o2", title: "Unscored idea", description: null, score: null },
    ],
    roadmapItems: [
      { title: "Quickstart: proposal assistant", description: "Two-week build.", phase: "now", target_window: "Weeks 1–2" },
      { title: "Ops brief", description: null, phase: "later", target_window: null },
    ],
    recommendation: {
      title: "Recommended stack",
      summary: "Existing tools first.",
      delivery_mode: "existing_tools",
      overall_data_sensitivity: "internal",
      assumptions: ["Client owns every account"],
      excluded_use_cases: ["Customer-facing chat"],
      setup_price_min_cents: 350000,
      setup_price_max_cents: 500000,
      retainer_min_cents: 150000,
      retainer_max_cents: 150000,
      items: [
        {
          id: "i1",
          stack_recommendation_id: "r1",
          tool_vendor_id: "v1",
          tool_category: "foundational_workspace",
          recommendation_type: "default",
          use_case: "Keep the workspace as the foundation",
          reason: "Already owned.",
          data_boundary: "Internal docs only.",
          monthly_cost_cents: 7200,
          sort_order: 1,
          created_at: "2026-06-01",
          vendorName: "Google Workspace", // public_copy_allowed vendor
        },
        {
          id: "i2",
          stack_recommendation_id: "r1",
          tool_vendor_id: "v2",
          tool_category: "messaging_assistant",
          recommendation_type: "rejected",
          use_case: "Messaging-native assistant for reminders",
          reason: "Consumer-grade terms; rejected for now.",
          data_boundary: null,
          monthly_cost_cents: null,
          sort_order: 2,
          created_at: "2026-06-01",
          vendorName: null, // public_copy_allowed=false → category only
        },
        {
          id: "i3",
          stack_recommendation_id: "r1",
          tool_vendor_id: null,
          tool_category: "llm_assistant",
          recommendation_type: "default",
          use_case: "Business-grade AI assistant for drafting",
          reason: null,
          data_boundary: "Scrubbed proposals and approved SOPs only.",
          monthly_cost_cents: 10000,
          sort_order: 3,
          created_at: "2026-06-01",
          vendorName: null,
        },
      ],
    },
    toolInstances: [
      { tool_name: "Google Workspace", owner_type: "client_owned", data_sensitivity: "internal", purpose: "Email + docs" },
    ],
    today: TODAY,
  };
}

const REQUIRED_SECTIONS = [
  "## Executive Summary",
  "## What We Heard",
  "## Owner Bottlenecks",
  "## Workflow Opportunity Map",
  "## Data Risk Map",
  "## Recommended Operating Stack",
  "## What We Recommend First",
  "## What We Do NOT Recommend",
  "## 30/60/90-Day Roadmap",
  "## Quickstart Proposal",
  "## Operate Cadence",
  "## Assumptions",
  "## Open Questions",
  "## Human-Review Requirements",
  "## Next Step",
];

describe("readout generator", () => {
  it("is deterministic — identical input produces identical markdown", () => {
    expect(generateReadoutMarkdown(baseInput())).toBe(generateReadoutMarkdown(baseInput()));
  });

  it("always contains every required section, in order", () => {
    const md = generateReadoutMarkdown(baseInput());
    let cursor = -1;
    for (const section of REQUIRED_SECTIONS) {
      const idx = md.indexOf(section);
      expect(idx, `missing or out-of-order section: ${section}`).toBeGreaterThan(cursor);
      cursor = idx;
    }
  });

  it("maps data risk honestly: regulated excluded entirely, confidential excluded from AI", () => {
    const md = generateReadoutMarkdown(baseInput());
    expect(md).toMatch(/Employee records \| regulated \| ❌ Excluded entirely/);
    expect(md).toMatch(/Client contracts \| confidential \| ❌ Excluded from AI work/);
    expect(md).toMatch(/Past proposals \| internal \| ✅ Allowed after scrub/);
  });

  it("includes the not-recommended items WITH reasons", () => {
    const md = generateReadoutMarkdown(baseInput());
    const section = md.slice(md.indexOf("## What We Do NOT Recommend"), md.indexOf("## 30/60/90"));
    expect(section).toContain("Messaging-native assistant for reminders");
    expect(section).toContain("Consumer-grade terms; rejected for now.");
    expect(section).toContain("Customer-facing chat");
    expect(section).toContain("Employee records");
  });

  it("carries the human-review requirements for every recommended item", () => {
    const md = generateReadoutMarkdown(baseInput());
    const section = md.slice(md.indexOf("## Human-Review Requirements"));
    expect(section).toContain("a person reviews anything customer-facing");
    expect(section).toContain("Business-grade AI assistant for drafting");
    expect(section).toContain("No workflow auto-sends to customers");
  });

  it("never names non-public vendors — category label only", () => {
    const md = generateReadoutMarkdown(baseInput());
    expect(md).toContain("Google Workspace"); // public_copy_allowed
    // i3 is recommended with no nameable vendor → generic category label.
    expect(md).toContain("Business-grade AI assistant (specific tool selected case-by-case)");
    // The non-public messaging vendor appears nowhere by name.
    expect(md).not.toMatch(/\bpoke\b/i);
  });

  it("computes the credit deadline and Quickstart math from the injected date", () => {
    const md = generateReadoutMarkdown(baseInput());
    expect(md).toContain("June 24, 2026"); // today + 14 days
    expect(md).toContain("$3,500");
    expect(md).toContain("$500");
    expect(md).toContain("$3,000");
  });

  it("declines honestly when the recommendation is decline_or_defer", () => {
    const input = baseInput();
    input.recommendation!.delivery_mode = "decline_or_defer";
    const md = generateReadoutMarkdown(input);
    expect(md).toContain("**Recommendation: decline or defer.**");
    expect(md).toContain("No implementation is proposed");
    expect(md).toContain("No operating stack is recommended at this time");
  });

  it("degrades gracefully with an empty engagement", () => {
    const md = generateReadoutMarkdown({
      organization: { name: "Empty Co", industry: null, team_size: null },
      intake: null,
      discoveryNotes: [],
      toolsInventory: [],
      workflows: [],
      painPoints: [],
      dataSources: [],
      opportunities: [],
      roadmapItems: [],
      recommendation: null,
      toolInstances: [],
      today: TODAY,
    });
    for (const section of REQUIRED_SECTIONS) {
      expect(md).toContain(section);
    }
    expect(md).toContain("Empty Co");
  });
});
