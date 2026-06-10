import "server-only";

/**
 * STUB — intentionally not implemented during validation.
 *
 * Future: given an organization's intake (tools, workflows, pain points,
 * data sources) and discovery notes, draft an audit summary for ADVISOR
 * review using the templates in src/lib/prompts/audit-summary.ts.
 *
 * Deliberate constraints when this ships:
 *  - Drafts for the advisor only — never auto-delivered to a client.
 *  - Input limited to intake/discovery data already in our database;
 *    no client documents until the document-ingestion path exists and the
 *    engagement's data-risk review allows it.
 *  - Output is stored as a draft deliverable with status 'advisor_review'.
 *
 * TODO(post-validation): implement with the Claude API (see
 * docs/PROMPT_LIBRARY.md), include human-review framing in output, and add
 * an activity_events entry ('ai_draft_generated') for auditability.
 */
export async function generateAuditSummary(_organizationId: string): Promise<{
  status: "not_implemented";
  message: string;
}> {
  return {
    status: "not_implemented",
    message:
      "AI audit-summary drafting is intentionally disabled during validation. Audits are written by the advisor using the templates in docs/templates/.",
  };
}
