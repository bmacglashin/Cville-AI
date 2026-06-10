import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  OFFERS,
  EXAMPLE_WORKFLOWS,
  FAQS,
  RISK_BOUNDARIES,
  POSITIONING,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_DISCLAIMER,
} from "@/lib/content";

/**
 * Guards the offer math and keeps the marketing content, seed data, and
 * positioning aligned with the validation strategy.
 */

describe("product ladder", () => {
  it("matches the founding strategy pricing", () => {
    const audit = OFFERS.find((o) => o.slug === "ai-operating-audit")!;
    const quickstart = OFFERS.find((o) => o.slug === "ai-workflow-quickstart")!;
    const workspace = OFFERS.find((o) => o.slug === "managed-ai-workspace")!;

    expect(audit.foundingPriceCents).toBe(95000);
    expect(audit.standardPriceCents).toBe(125000);
    expect(quickstart.foundingPriceCents).toBe(350000);
    expect(workspace.foundingPriceCents).toBe(850000);
    expect(workspace.standardPriceCents).toBe(1250000);
  });

  it("keeps the audit as the first offer and the entry point", () => {
    expect(OFFERS[0].slug).toBe("ai-operating-audit");
    expect(OFFERS[0].position.toLowerCase()).toContain("starting point");
  });

  it("positions the Managed AI Workspace as post-audit, never standalone, never a platform", () => {
    const ws = OFFERS.find((o) => o.slug === "managed-ai-workspace")!;
    expect(ws.name).toBe("Managed AI Workspace + Operate");
    expect(ws.href).toBe("/managed-workspace");
    expect(`${ws.position} ${ws.priceNote}`.toLowerCase()).toMatch(/after an audit|post-audit/);
    expect(ws.position.toLowerCase()).toContain("not a private platform");
    expect(ws.priceNote).toContain("$1,500/month");
  });

  it("frames the Quickstart as existing-tools-first", () => {
    const quickstart = OFFERS.find((o) => o.slug === "ai-workflow-quickstart")!;
    const corpus = `${quickstart.tagline} ${quickstart.priceNote} ${quickstart.includes.join(" ")}`.toLowerCase();
    expect(corpus).toMatch(/existing|already own/);
  });

  it("seed service_packages pricing agrees with content offers", () => {
    const seed = readFileSync(path.resolve(__dirname, "../supabase/seed.sql"), "utf8");
    expect(seed).toContain("95000, 125000");
    expect(seed).toContain("'ai-operating-audit'");
    expect(seed).toContain("'ai-workflow-quickstart'");
    expect(seed).toContain("'managed-ai-workspace'");
    expect(seed).not.toContain("'command-center-lite'");
  });
});

describe("positioning guardrails", () => {
  it("carries the three load-bearing positioning lines", () => {
    expect(POSITIONING.ownership).toBe("Your accounts. Your data. Our operating method.");
    expect(POSITIONING.existingFirst).toBe(
      "Existing tools first. Custom builds only when the business case is clear."
    );
    expect(POSITIONING.rightTool).toBe("We use the right tool, not one tool.");
  });

  it("lists tool categories generically with the case-by-case disclaimer", () => {
    const names = TOOL_CATEGORIES.map((c) => c.name.toLowerCase());
    for (const expected of [
      "foundational workspace",
      "business-grade ai assistants",
      "knowledge bases",
      "automation platforms",
      "messaging-native assistants",
      "advanced agent workspaces",
      "custom builds",
    ]) {
      expect(names, `missing tool category ${expected}`).toContain(expected);
    }
    expect(TOOL_CATEGORY_DISCLAIMER).toContain("case-by-case");
    expect(TOOL_CATEGORY_DISCLAIMER.toLowerCase()).toContain("vendor terms");
    // Categories stay generic — no vendor names in public copy.
    const corpus = JSON.stringify(TOOL_CATEGORIES).toLowerCase();
    for (const vendor of ["google", "microsoft", "claude", "chatgpt", "notion", "zapier"]) {
      expect(corpus, `vendor name in public tool categories: ${vendor}`).not.toContain(vendor);
    }
  });

  it("offers seven concrete example workflows, each mapped to a playbook slug", () => {
    expect(EXAMPLE_WORKFLOWS).toHaveLength(7);
    for (const wf of EXAMPLE_WORKFLOWS) {
      expect(wf.ownerWin.length).toBeGreaterThan(10);
      expect(wf.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("contains the hard risk boundaries", () => {
    const joined = RISK_BOUNDARIES.join(" ").toLowerCase();
    for (const term of ["hipaa", "student", "tenant", "payroll", "human review", "children"]) {
      expect(joined, `risk boundaries must mention ${term}`).toContain(term);
    }
  });

  it("avoids hype language in offer copy and FAQs", () => {
    const corpus = JSON.stringify({ OFFERS, FAQS }).toLowerCase();
    for (const banned of ["10x", "game-chang", "revolution", "replace your employees", "magic bullet"]) {
      expect(corpus, `banned phrase found: ${banned}`).not.toContain(banned);
    }
  });
});
