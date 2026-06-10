import { describe, expect, it } from "vitest";
import {
  isDeferSensitivity,
  railDeliveryMode,
  railRecommendationType,
  touchesRestrictedArea,
  withRailReason,
} from "@/lib/safety";

/**
 * The product-level safety rail: regulated/prohibited data — or restricted
 * workflow areas — can never be silently recommended. Server actions apply
 * these functions before any stack write.
 */

describe("sensitivity rails", () => {
  it("treats regulated and prohibited as defer-class sensitivities", () => {
    expect(isDeferSensitivity("regulated")).toBe(true);
    expect(isDeferSensitivity("prohibited")).toBe(true);
    for (const ok of ["public", "internal", "confidential", null, undefined]) {
      expect(isDeferSensitivity(ok)).toBe(false);
    }
  });

  it("forces recommendation_type to defer for regulated/prohibited data", () => {
    for (const sensitivity of ["regulated", "prohibited"]) {
      const result = railRecommendationType("default", { sensitivity });
      expect(result.value).toBe("defer");
      expect(result.railed).toBe(true);
      expect(result.reason).toContain(sensitivity);
    }
  });

  it("forces delivery_mode to decline_or_defer for regulated/prohibited data", () => {
    for (const sensitivity of ["regulated", "prohibited"]) {
      const result = railDeliveryMode("existing_tools", { sensitivity });
      expect(result.value).toBe("decline_or_defer");
      expect(result.railed).toBe(true);
    }
  });

  it("leaves safe sensitivities and clean text untouched", () => {
    const rec = railRecommendationType("optional", {
      sensitivity: "internal",
      text: "Proposal drafting assistant on a scrubbed corpus",
    });
    expect(rec).toEqual({ value: "optional", railed: false, reason: null });

    const mode = railDeliveryMode("managed_ai_workspace", {
      sensitivity: "confidential",
      text: "Documented operating stack across owned tools",
    });
    expect(mode).toEqual({ value: "managed_ai_workspace", railed: false, reason: null });
  });
});

describe("restricted workflow areas", () => {
  const cases: [string, string][] = [
    ["screen job applicants and support hiring decisions", "HR / employment"],
    ["automate tenant screening for the rental portfolio", "tenant screening"],
    ["pre-qualify customers for credit and loan offers", "credit / lending"],
    ["summarize patient intake forms", "healthcare"],
    ["draft legal advice letters", "legal"],
    ["organize student records for the tutoring side", "student records"],
    ["payroll exception decisioning", "HR / employment"],
  ];

  for (const [text, area] of cases) {
    it(`defers workflows touching ${area}`, () => {
      expect(touchesRestrictedArea(text)).toBe(area);
      const rec = railRecommendationType("default", { sensitivity: "internal", text });
      expect(rec.value).toBe("defer");
      expect(rec.railed).toBe(true);
      const mode = railDeliveryMode("existing_tools", { sensitivity: "internal", text });
      expect(mode.value).toBe("decline_or_defer");
    });
  }

  it("does not trip on ordinary operations language", () => {
    for (const text of [
      "weekly workflow health review and owner brief",
      "proposal and estimate drafting from scrubbed past projects",
      "sales-to-production handoff checklists",
      "vendor follow-up tracker with human-reviewed nudges",
    ]) {
      expect(touchesRestrictedArea(text), `false positive on: ${text}`).toBeNull();
    }
  });

  it("an explicit rejection stays rejected (not weakened to defer reporting as railed)", () => {
    const result = railRecommendationType("rejected", {
      sensitivity: "internal",
      text: "tenant screening automation",
    });
    expect(result.value).toBe("defer");
    expect(result.railed).toBe(false); // already a no — the rail didn't change the answer's direction
  });
});

describe("withRailReason", () => {
  it("prefixes the visible rail reason onto the stored reason", () => {
    const rail = railRecommendationType("default", { sensitivity: "regulated" });
    expect(withRailReason("Owner asked for this.", rail)).toMatch(
      /^Safety rail: data sensitivity 'regulated' forces defer\. Owner asked for this\.$/
    );
  });

  it("passes reasons through untouched when no rail fired", () => {
    const rail = railRecommendationType("default", { sensitivity: "internal", text: "clean" });
    expect(withRailReason("Solid ROI.", rail)).toBe("Solid ROI.");
    expect(withRailReason("", rail)).toBeNull();
  });
});
