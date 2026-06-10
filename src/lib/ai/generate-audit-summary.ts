import "server-only";

import { isAiDraftingEnabled } from "@/lib/env";

/**
 * STUB — intentionally not implemented during validation, and gated behind
 * AI_DRAFTING_ENABLED (default false). Audit readouts are generated
 * DETERMINISTICALLY in src/lib/readout.ts; this stub is the only seam where
 * LLM-assisted drafting would ever plug in.
 *
 * Deliberate constraints when this ships:
 *  - Drafts for the advisor only — never auto-delivered to a client.
 *  - Input limited to intake/discovery data already in our database;
 *    no client documents until the document-ingestion path exists and the
 *    engagement's data-risk review allows it.
 *  - Output is stored as a draft readout (status 'draft', never
 *    client_visible) for advisor editing.
 *
 * TODO(post-validation): implement with the Claude API (see
 * docs/PROMPT_LIBRARY.md), include human-review framing in output, and add
 * an activity_events entry ('ai_draft_generated') for auditability.
 */
export async function generateAuditSummary(_organizationId: string): Promise<{
  status: "disabled" | "not_implemented";
  message: string;
}> {
  if (!isAiDraftingEnabled()) {
    return {
      status: "disabled",
      message:
        "AI drafting is disabled (AI_DRAFTING_ENABLED=false). Use the deterministic readout generator — it assembles the engagement data without any model.",
    };
  }
  return {
    status: "not_implemented",
    message:
      "AI audit-summary drafting is intentionally not implemented during validation. The deterministic readout generator is the supported path.",
  };
}
