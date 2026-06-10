import { describe, expect, it } from "vitest";
import {
  auditApplicationSchema,
  intakeSubmissionSchema,
  signUpSchema,
  painPointSchema,
  workflowSchema,
} from "@/lib/validation/intake";

const validApplication = {
  full_name: "Dana Whitfield",
  email: "dana@example.com",
  phone: "",
  company: "Blue Ridge Custom Builders",
  industry: "Design / build & remodeling" as const,
  team_size: "16–40" as const,
  biggest_bottleneck: "Proposals take three weeks and all route through me.",
  message: "",
};

describe("auditApplicationSchema", () => {
  it("accepts a valid application", () => {
    expect(auditApplicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const r = auditApplicationSchema.safeParse({ ...validApplication, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects a too-short bottleneck description", () => {
    const r = auditApplicationSchema.safeParse({ ...validApplication, biggest_bottleneck: "help" });
    expect(r.success).toBe(false);
  });

  it("rejects unknown industries", () => {
    const r = auditApplicationSchema.safeParse({ ...validApplication, industry: "Crypto mining" });
    expect(r.success).toBe(false);
  });
});

describe("intakeSubmissionSchema", () => {
  const base = {
    profile: {
      organization_name: "Blue Ridge Custom Builders",
      industry: "Design / build & remodeling" as const,
      team_size: "16–40" as const,
      website: "",
      city: "Charlottesville",
      description: "",
    },
    goals: {
      goals: "Get proposals out faster without me writing every word.",
      budget_range: "$5k–$15k" as const,
      timeline: "This quarter" as const,
      current_ai_usage: "",
    },
    tools: [],
    workflows: [{ name: "Proposal assembly", description: "", frequency: "", hours_per_week: 9 }],
    pain_points: [
      { area: "Proposals & estimating" as const, description: "Slow proposals", severity: 5 },
    ],
    data_sources: [],
    documents: [],
    scheduling_preference: "",
    additional_notes: "",
    data_sensitivity_ack: true,
    regulated_data_ack: true,
  };

  it("accepts a complete submission", () => {
    expect(intakeSubmissionSchema.safeParse(base).success).toBe(true);
  });

  it("requires both data acknowledgments to be true", () => {
    expect(
      intakeSubmissionSchema.safeParse({ ...base, regulated_data_ack: false }).success
    ).toBe(false);
    expect(
      intakeSubmissionSchema.safeParse({ ...base, data_sensitivity_ack: false }).success
    ).toBe(false);
  });

  it("bounds pain point severity to 1–5", () => {
    expect(painPointSchema.safeParse({ area: "Other", description: "x y z", severity: 6 }).success).toBe(
      false
    );
    expect(painPointSchema.safeParse({ area: "Other", description: "x y z", severity: 0 }).success).toBe(
      false
    );
  });

  it("bounds workflow hours to a real week", () => {
    expect(workflowSchema.safeParse({ name: "Estimates", hours_per_week: 200 }).success).toBe(false);
    expect(workflowSchema.safeParse({ name: "Estimates", hours_per_week: 8 }).success).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("requires an 8+ character password", () => {
    const r = signUpSchema.safeParse({
      full_name: "Dana",
      email: "dana@example.com",
      password: "short",
      organization_name: "BRCB",
    });
    expect(r.success).toBe(false);
  });
});
