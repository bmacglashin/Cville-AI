"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ensureOrganization } from "@/lib/actions/org";
import { intakeSubmissionSchema, type IntakeSubmission } from "@/lib/validation/intake";

export interface IntakeResult {
  ok: boolean;
  error?: string;
}

export async function submitAuditIntake(input: IntakeSubmission): Promise<IntakeResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase isn't connected — see README.md." };
  }

  const parsed = intakeSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please review the form." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to submit your intake." };

  const organizationId = await ensureOrganization();
  if (!organizationId) return { ok: false, error: "Couldn't find your workspace. Contact ben@agentally.co." };

  const d = parsed.data;

  // 1. Update the org profile from the intake's business-profile step.
  const { error: orgError } = await supabase
    .from("organizations")
    .update({
      name: d.profile.organization_name,
      industry: d.profile.industry,
      team_size: d.profile.team_size,
      website: d.profile.website ?? null,
      city: d.profile.city || "Charlottesville",
      description: d.profile.description || null,
    })
    .eq("id", organizationId);
  if (orgError) {
    console.error("[intake] org update failed:", orgError.message);
    return { ok: false, error: "Couldn't save your business profile. Please try again." };
  }

  // 2. The intake row (its insert trigger advances the pipeline stage).
  const { data: intake, error: intakeError } = await supabase
    .from("audit_intakes")
    .insert({
      organization_id: organizationId,
      submitted_by: user.id,
      status: "submitted",
      goals: d.goals.goals,
      budget_range: d.goals.budget_range,
      timeline: d.goals.timeline,
      current_ai_usage: d.goals.current_ai_usage || null,
      scheduling_preference: d.scheduling_preference || null,
      data_sensitivity_ack: d.data_sensitivity_ack,
      regulated_data_ack: d.regulated_data_ack,
      additional_notes: d.additional_notes || null,
    })
    .select("id")
    .single();
  if (intakeError || !intake) {
    console.error("[intake] insert failed:", intakeError?.message);
    return { ok: false, error: "Couldn't save your intake. Please try again." };
  }

  // 3. Child collections (best-effort, validated above).
  const fail = async (label: string, message: string | undefined) => {
    console.error(`[intake] ${label} insert failed:`, message);
    return { ok: false as const, error: "Part of your intake didn't save. Contact ben@agentally.co." };
  };

  if (d.tools.length) {
    const { error } = await supabase.from("tools_inventory").insert(
      d.tools.map((t) => ({
        intake_id: intake.id,
        organization_id: organizationId,
        name: t.name,
        category: t.category || null,
        usage_notes: t.usage_notes || null,
      }))
    );
    if (error) return fail("tools", error.message);
  }

  if (d.workflows.length) {
    const { error } = await supabase.from("workflows").insert(
      d.workflows.map((w) => ({
        intake_id: intake.id,
        organization_id: organizationId,
        name: w.name,
        description: w.description || null,
        frequency: w.frequency || null,
        hours_per_week: w.hours_per_week ?? null,
      }))
    );
    if (error) return fail("workflows", error.message);
  }

  if (d.pain_points.length) {
    const { error } = await supabase.from("pain_points").insert(
      d.pain_points.map((p) => ({
        intake_id: intake.id,
        organization_id: organizationId,
        area: p.area,
        description: p.description,
        severity: p.severity,
      }))
    );
    if (error) return fail("pain_points", error.message);
  }

  if (d.data_sources.length) {
    const { error } = await supabase.from("data_sources").insert(
      d.data_sources.map((s) => ({
        intake_id: intake.id,
        organization_id: organizationId,
        name: s.name,
        source_type: s.source_type || null,
        sensitivity: s.sensitivity,
        notes: s.notes || null,
      }))
    );
    if (error) return fail("data_sources", error.message);
  }

  if (d.documents.length) {
    const { error } = await supabase.from("uploaded_documents").insert(
      d.documents.map((doc) => ({
        organization_id: organizationId,
        intake_id: intake.id,
        uploaded_by: user.id,
        file_name: doc.file_name,
        sensitivity: doc.sensitivity,
        status: "listed",
        notes: doc.notes || null,
      }))
    );
    if (error) return fail("documents", error.message);
  }

  // 4. Activity log (non-fatal if it fails).
  await supabase.from("activity_events").insert({
    organization_id: organizationId,
    actor_id: user.id,
    event_type: "intake_submitted",
    entity_type: "audit_intake",
    entity_id: intake.id,
    metadata: { source: "start-audit-wizard" },
  });

  return { ok: true };
}
