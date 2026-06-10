import type { DataSensitivity, DeliveryMode, RecommendationType } from "@/lib/types/database";

/**
 * Safety rails for the operating layer. Pure functions so the rules are
 * unit-testable; server actions in src/lib/actions/operating.ts apply them
 * before any write. The rails implement the product-level boundary:
 * anything with 'regulated' or 'prohibited' data sensitivity — or touching
 * a restricted workflow area — is forced to defer/decline, never silently
 * recommended.
 */

export const DEFER_SENSITIVITIES: readonly DataSensitivity[] = ["regulated", "prohibited"];

export function isDeferSensitivity(sensitivity: string | null | undefined): boolean {
  return sensitivity === "regulated" || sensitivity === "prohibited";
}

/**
 * Workflow areas we decline or defer outright, regardless of how the data
 * is classified. Matching is deliberately broad — over-deferring is safe;
 * the advisor can reword a false positive after a human look.
 */
export const RESTRICTED_WORKFLOW_AREAS: readonly { area: string; pattern: RegExp }[] = [
  {
    area: "HR / employment",
    pattern: /\b(hr|human resources|employee records?|employment|hiring|firing|personnel|payroll)\b/i,
  },
  { area: "tenant screening", pattern: /\btenants?\b/i },
  { area: "credit / lending", pattern: /\b(credit|lending|loans?|underwriting)\b/i },
  {
    area: "healthcare",
    pattern: /\b(healthcare|health (care|records?|data)|medical|patients?|hipaa|phi|clinical)\b/i,
  },
  { area: "legal", pattern: /\b(legal|attorneys?|lawyers?|paralegal)\b/i },
  { area: "student records", pattern: /\b(students?|ferpa)\b/i },
];

/** Returns the restricted area a text touches, or null when clean. */
export function touchesRestrictedArea(text: string | null | undefined): string | null {
  if (!text) return null;
  for (const { area, pattern } of RESTRICTED_WORKFLOW_AREAS) {
    if (pattern.test(text)) return area;
  }
  return null;
}

export interface RailResult<T> {
  value: T;
  railed: boolean;
  reason: string | null;
}

/**
 * Forces recommendation_type='defer' when the engagement sensitivity is
 * regulated/prohibited or the use-case text touches a restricted area.
 */
export function railRecommendationType(
  requested: RecommendationType,
  opts: { sensitivity?: string | null; text?: string | null }
): RailResult<RecommendationType> {
  if (isDeferSensitivity(opts.sensitivity)) {
    return {
      value: "defer",
      railed: requested !== "defer" && requested !== "rejected",
      reason: `Safety rail: data sensitivity '${opts.sensitivity}' forces defer.`,
    };
  }
  const area = touchesRestrictedArea(opts.text);
  if (area) {
    return {
      value: "defer",
      railed: requested !== "defer" && requested !== "rejected",
      reason: `Safety rail: touches restricted area (${area}) — forced to defer.`,
    };
  }
  return { value: requested, railed: false, reason: null };
}

/**
 * Forces delivery_mode='decline_or_defer' when the overall sensitivity is
 * regulated/prohibited or the recommendation text touches a restricted area.
 */
export function railDeliveryMode(
  requested: DeliveryMode,
  opts: { sensitivity?: string | null; text?: string | null }
): RailResult<DeliveryMode> {
  if (isDeferSensitivity(opts.sensitivity)) {
    return {
      value: "decline_or_defer",
      railed: requested !== "decline_or_defer",
      reason: `Safety rail: data sensitivity '${opts.sensitivity}' forces decline-or-defer.`,
    };
  }
  const area = touchesRestrictedArea(opts.text);
  if (area) {
    return {
      value: "decline_or_defer",
      railed: requested !== "decline_or_defer",
      reason: `Safety rail: touches restricted area (${area}) — forced to decline-or-defer.`,
    };
  }
  return { value: requested, railed: false, reason: null };
}

/** Prefixes a stored reason with the rail explanation so it stays visible. */
export function withRailReason(reason: string | null | undefined, rail: RailResult<unknown>): string | null {
  const base = (reason ?? "").trim();
  if (!rail.railed || !rail.reason) return base || null;
  return base ? `${rail.reason} ${base}` : rail.reason;
}
