import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { OFFERS, EXAMPLE_WORKFLOWS, FAQS, RISK_BOUNDARIES } from "@/lib/content";

/**
 * Guards the offer math and keeps the marketing content, seed data, and
 * positioning aligned with the validation strategy.
 */

describe("product ladder", () => {
  it("matches the founding strategy pricing", () => {
    const audit = OFFERS.find((o) => o.slug === "ai-operating-audit")!;
    const quickstart = OFFERS.find((o) => o.slug === "ai-workflow-quickstart")!;
    const commandCenter = OFFERS.find((o) => o.slug === "command-center-lite")!;

    expect(audit.foundingPriceCents).toBe(95000);
    expect(audit.standardPriceCents).toBe(125000);
    expect(quickstart.foundingPriceCents).toBe(350000);
    expect(commandCenter.foundingPriceCents).toBe(850000);
    expect(commandCenter.standardPriceCents).toBe(1250000);
  });

  it("keeps the audit as the first offer and the entry point", () => {
    expect(OFFERS[0].slug).toBe("ai-operating-audit");
    expect(OFFERS[0].position.toLowerCase()).toContain("starting point");
  });

  it("positions Command Center as post-audit, never standalone", () => {
    const cc = OFFERS.find((o) => o.slug === "command-center-lite")!;
    expect(`${cc.position} ${cc.priceNote}`.toLowerCase()).toMatch(/after an audit|post-audit/);
  });

  it("seed service_packages pricing agrees with content offers", () => {
    const seed = readFileSync(path.resolve(__dirname, "../supabase/seed.sql"), "utf8");
    expect(seed).toContain("95000, 125000");
    expect(seed).toContain("'ai-operating-audit'");
    expect(seed).toContain("'ai-workflow-quickstart'");
    expect(seed).toContain("'command-center-lite'");
  });
});

describe("positioning guardrails", () => {
  it("offers seven concrete example workflows", () => {
    expect(EXAMPLE_WORKFLOWS).toHaveLength(7);
    for (const wf of EXAMPLE_WORKFLOWS) {
      expect(wf.ownerWin.length).toBeGreaterThan(10);
    }
  });

  it("contains the hard risk boundaries", () => {
    const joined = RISK_BOUNDARIES.join(" ").toLowerCase();
    for (const term of ["hipaa", "student", "tenant", "payroll", "autonomous", "children"]) {
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
