"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateAuditSummary } from "@/lib/ai/generate-audit-summary";

/**
 * Admin mutations for the internal CRM/delivery dashboard.
 * Every action re-verifies the admin role server-side; RLS enforces it again
 * at the database layer (defense in depth — the UI hiding buttons is not
 * a security boundary).
 */

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return { supabase, userId: user.id };
}

async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  organizationId: string | null,
  eventType: string,
  entityType: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("activity_events").insert({
    organization_id: organizationId,
    actor_id: userId,
    event_type: eventType,
    entity_type: entityType,
    metadata,
  });
}

function refresh(orgId?: string | null) {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/clients");
  if (orgId) revalidatePath(`/admin/clients/${orgId}`);
}

const uuid = z.uuid();

/* ── Leads ─────────────────────────────────────────────────────── */

export async function updateLeadStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const status = z
    .enum(["new", "contacted", "qualified", "converted", "closed"])
    .safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase.from("leads").update({ status: status.data }).eq("id", id.data);
  refresh();
}

export async function convertLeadToOrganization(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return;

  const { data: lead } = await ctx.supabase.from("leads").select("*").eq("id", id.data).single();
  if (!lead || lead.organization_id) return;

  const { data: org, error } = await ctx.supabase
    .from("organizations")
    .insert({
      name: lead.company || `${lead.full_name}'s business`,
      industry: lead.industry,
      team_size: lead.team_size,
      pipeline_stage: "new_inquiry",
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error || !org) {
    console.error("[admin] convert lead failed:", error?.message);
    return;
  }

  await ctx.supabase.from("contacts").insert({
    organization_id: org.id,
    full_name: lead.full_name,
    email: lead.email,
    phone: lead.phone,
    is_primary: true,
    notes: lead.biggest_bottleneck ? `From application: ${lead.biggest_bottleneck}` : null,
  });
  await ctx.supabase
    .from("leads")
    .update({ organization_id: org.id, status: "converted" })
    .eq("id", id.data);
  await logActivity(ctx.supabase, ctx.userId, org.id, "lead_converted", "lead", {
    lead_id: id.data,
  });
  refresh(org.id);
}

/* ── Organizations ─────────────────────────────────────────────── */

const PIPELINE = z.enum([
  "new_inquiry",
  "fit_call_booked",
  "audit_paid",
  "intake_submitted",
  "audit_scheduled",
  "audit_delivered",
  "quickstart_proposed",
  "implementation_active",
  "retainer_active",
  "closed_lost",
]);

export async function updateOrgStage(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const stage = PIPELINE.safeParse(formData.get("pipeline_stage"));
  if (!id.success || !stage.success) return;

  const { data: before } = await ctx.supabase
    .from("organizations")
    .select("pipeline_stage")
    .eq("id", id.data)
    .single();
  await ctx.supabase
    .from("organizations")
    .update({ pipeline_stage: stage.data })
    .eq("id", id.data);
  await logActivity(ctx.supabase, ctx.userId, id.data, "stage_changed", "organization", {
    from: before?.pipeline_stage,
    to: stage.data,
  });
  refresh(id.data);
}

/* ── Discovery notes ───────────────────────────────────────────── */

export async function addDiscoveryNote(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      call_type: z.enum(["fit_call", "discovery", "owner_interview", "working_session", "other"]),
      summary: z.string().min(1).max(8000),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      call_type: formData.get("call_type"),
      summary: String(formData.get("summary") ?? "").trim(),
    });
  if (!parsed.success) return;

  await ctx.supabase.from("discovery_notes").insert({ ...parsed.data, author_id: ctx.userId });
  refresh(parsed.data.organization_id);
}

/* ── Opportunities + scores ────────────────────────────────────── */

const WORK_STATUS = z.enum(["backlog", "advisor_review", "client_review", "in_progress", "done"]);

export async function addOpportunity(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      title: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      workflow_type: z.string().max(80).optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || undefined,
      workflow_type: String(formData.get("workflow_type") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("ai_opportunities").insert({ ...parsed.data, source: "advisor" });
  refresh(parsed.data.organization_id);
}

export async function updateOpportunityStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  const status = WORK_STATUS.safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase.from("ai_opportunities").update({ status: status.data }).eq("id", id.data);
  refresh(orgId.success ? orgId.data : undefined);
}

export async function scoreOpportunity(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const score15 = z.coerce.number().int().min(1).max(5);
  const parsed = z
    .object({
      opportunity_id: uuid,
      organization_id: uuid,
      impact: score15,
      effort: score15,
      risk: score15,
      data_readiness: score15,
      owner_hours_saved_weekly: z.coerce.number().min(0).max(168).optional(),
      notes: z.string().max(2000).optional(),
    })
    .safeParse({
      opportunity_id: formData.get("opportunity_id"),
      organization_id: formData.get("organization_id"),
      impact: formData.get("impact"),
      effort: formData.get("effort"),
      risk: formData.get("risk"),
      data_readiness: formData.get("data_readiness"),
      owner_hours_saved_weekly:
        String(formData.get("owner_hours_saved_weekly") ?? "").trim() || undefined,
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase
    .from("opportunity_scores")
    .upsert({ ...parsed.data, scored_by: ctx.userId }, { onConflict: "opportunity_id" });
  refresh(parsed.data.organization_id);
}

/* ── Roadmap ───────────────────────────────────────────────────── */

export async function addRoadmapItem(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      title: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      phase: z.enum(["now", "next", "later"]),
      target_window: z.string().max(80).optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || undefined,
      phase: formData.get("phase"),
      target_window: String(formData.get("target_window") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("roadmap_items").insert(parsed.data);
  refresh(parsed.data.organization_id);
}

export async function updateRoadmapStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  const status = WORK_STATUS.safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase.from("roadmap_items").update({ status: status.data }).eq("id", id.data);
  refresh(orgId.success ? orgId.data : undefined);
}

/* ── Proposals ─────────────────────────────────────────────────── */

export async function addProposal(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      title: z.string().min(1).max(200),
      summary: z.string().max(4000).optional(),
      total_amount_cents: z.coerce.number().int().min(0).optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim() || undefined,
      total_amount_cents: String(formData.get("total_amount_dollars") ?? "").trim()
        ? Math.round(Number(formData.get("total_amount_dollars")) * 100)
        : undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("proposals").insert(parsed.data);
  refresh(parsed.data.organization_id);
}

export async function updateProposalStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  const status = z.enum(["draft", "sent", "accepted", "declined"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase
    .from("proposals")
    .update({
      status: status.data,
      sent_at: status.data === "sent" ? new Date().toISOString() : undefined,
    })
    .eq("id", id.data);
  if (orgId.success) {
    await logActivity(ctx.supabase, ctx.userId, orgId.data, `proposal_${status.data}`, "proposal", {
      proposal_id: id.data,
    });
  }
  refresh(orgId.success ? orgId.data : undefined);
}

export async function addProposalLineItem(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      proposal_id: uuid,
      organization_id: uuid,
      description: z.string().min(1).max(400),
      quantity: z.coerce.number().int().min(1).default(1),
      unit_amount_cents: z.coerce.number().int(),
    })
    .safeParse({
      proposal_id: formData.get("proposal_id"),
      organization_id: formData.get("organization_id"),
      description: String(formData.get("description") ?? "").trim(),
      quantity: formData.get("quantity") || 1,
      unit_amount_cents: Math.round(Number(formData.get("unit_amount_dollars") ?? 0) * 100),
    });
  if (!parsed.success) return;

  const { organization_id, ...row } = parsed.data;
  await ctx.supabase.from("proposal_line_items").insert(row);
  refresh(organization_id);
}

/* ── Deliverables ──────────────────────────────────────────────── */

export async function addDeliverable(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      title: z.string().min(1).max(200),
      description: z.string().max(4000).optional(),
      deliverable_type: z.string().max(80).optional(),
      due_date: z.string().optional(),
      link_url: z.url().optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || undefined,
      deliverable_type: String(formData.get("deliverable_type") ?? "").trim() || undefined,
      due_date: String(formData.get("due_date") ?? "").trim() || undefined,
      link_url: String(formData.get("link_url") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("deliverables").insert({ ...parsed.data, status: "in_progress" });
  refresh(parsed.data.organization_id);
}

export async function updateDeliverableStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  const status = WORK_STATUS.safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase.from("deliverables").update({ status: status.data }).eq("id", id.data);
  refresh(orgId.success ? orgId.data : undefined);
}

/* ── Tasks ─────────────────────────────────────────────────────── */

export async function addTask(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      owner: z.enum(["advisor", "client"]),
      due_date: z.string().optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || undefined,
      owner: formData.get("owner") ?? "advisor",
      due_date: String(formData.get("due_date") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("tasks").insert(parsed.data);
  refresh(parsed.data.organization_id);
}

export async function updateTaskStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  const status = z.enum(["todo", "in_progress", "blocked", "done"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  await ctx.supabase.from("tasks").update({ status: status.data }).eq("id", id.data);
  refresh(orgId.success ? orgId.data : undefined);
}

/* ── Contacts ──────────────────────────────────────────────────── */

export async function addContact(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      organization_id: uuid,
      full_name: z.string().min(1).max(160),
      email: z.email().optional(),
      phone: z.string().max(40).optional(),
      role_title: z.string().max(120).optional(),
    })
    .safeParse({
      organization_id: formData.get("organization_id"),
      full_name: String(formData.get("full_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || undefined,
      phone: String(formData.get("phone") ?? "").trim() || undefined,
      role_title: String(formData.get("role_title") ?? "").trim() || undefined,
    });
  if (!parsed.success) return;

  await ctx.supabase.from("contacts").insert(parsed.data);
  refresh(parsed.data.organization_id);
}

/* ── AI stub ───────────────────────────────────────────────────── */

export async function runGenerateAuditSummary(organizationId: string): Promise<string> {
  const ctx = await requireAdmin();
  if (!ctx) return "Not authorized.";
  const result = await generateAuditSummary(organizationId);
  return result.message;
}
