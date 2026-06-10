import { describe, expect, it } from "vitest";
import { formatCents, priorityScore, slugify, titleCase } from "@/lib/utils";

describe("formatCents", () => {
  it("formats whole dollars without decimals", () => {
    expect(formatCents(95000)).toBe("$950");
    expect(formatCents(350000)).toBe("$3,500");
  });
  it("renders em dash for null/undefined/zero", () => {
    expect(formatCents(null)).toBe("—");
    expect(formatCents(undefined)).toBe("—");
    expect(formatCents(0)).toBe("—");
  });
  it("can show explicit zero when asked", () => {
    expect(formatCents(0, { showZero: true })).toBe("$0");
  });
});

describe("priorityScore", () => {
  it("weights impact double against effort", () => {
    expect(priorityScore(5, 3)).toBe(7);
    expect(priorityScore(null, 4)).toBe(-4);
  });
});

describe("slugify", () => {
  it("produces url-safe slugs", () => {
    expect(slugify("Blue Ridge Custom Builders")).toBe("blue-ridge-custom-builders");
    expect(slugify("  Dana's Café & Co.  ")).toBe("dana-s-caf-co");
  });
});

describe("titleCase", () => {
  it("humanizes snake_case statuses", () => {
    expect(titleCase("advisor_review")).toBe("Advisor Review");
    expect(titleCase("fit_call_booked")).toBe("Fit Call Booked");
  });
});
