"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { railDeliveryMode, railRecommendationType, withRailReason } from "@/lib/safety";
import {
  APPROVAL_STATUSES,
  DELIVERY_MODES,
  PLAYBOOK_COMPLEXITIES,
  RECOMMENDATION_TYPES,
  TOOL_CATEGORIES_DB,
  TOOL_INSTANCE_OWNER_TYPES,
} from "@/lib/types/database";

/**
 * Operating-layer admin mutations: tool catalog, playbook library, client
 * tool instances, and stack recommendations. Same defense-in-depth as
 * lib/actions/admin.ts — every action re-verifies the admin role and RLS
 * enforces it again beneath. Safety rails (src/lib/safety.ts) run before
 * any recommendation write.
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

const uuid = z.uuid();

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optText(formData: FormData, name: string): string | undefined {
  return text(formData, name) || undefined;
}

function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

/** Textarea where each non-empty line becomes one array entry. */
function lines(formData: FormData, name: string): string[] {
  return text(formData, name)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function dollarsToCents(formData: FormData, name: string): number | undefined {
  const raw = text(formData, name);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n * 100) : undefined;
}

/* ── Tool vendors ──────────────────────────────────────────────── */

// Vendor data ceilings stop at 'confidential': per docs/TOOL_DOCTRINE.md we
// never approve a tool for regulated data, and 'prohibited' marks data that
// enters no tool at all.
const VENDOR_SENSITIVITY = z.enum(["public", "internal", "confidential"]);

const vendorSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  category: z.enum(TOOL_CATEGORIES_DB),
  approval_status: z.enum(APPROVAL_STATUSES),
  short_description: z.string().max(500).optional(),
  default_use_case: z.string().max(500).optional(),
  public_copy_allowed: z.boolean(),
  client_owned_account_required: z.boolean(),
  white_label_allowed: z.boolean().nullable(),
  dpa_status: z.string().max(300).optional(),
  no_training_status: z.string().max(300).optional(),
  admin_controls_status: z.string().max(300).optional(),
  export_path_status: z.string().max(300).optional(),
  max_data_sensitivity: VENDOR_SENSITIVITY,
  support_burden: z.string().max(120).optional(),
  longevity_notes: z.string().max(500).optional(),
  prohibited_use_cases: z.array(z.string().max(200)),
  source_links: z.array(z.string().max(500)),
  internal_notes: z.string().max(4000).optional(),
  public_notes: z.string().max(1000).optional(),
  last_reviewed_at: z.string().optional(),
  next_review_at: z.string().optional(),
});

function parseVendorForm(formData: FormData) {
  const name = text(formData, "name");
  const whiteLabel = text(formData, "white_label_allowed");
  return vendorSchema.safeParse({
    name,
    slug: text(formData, "slug") || slugify(name),
    category: formData.get("category"),
    approval_status: formData.get("approval_status"),
    short_description: optText(formData, "short_description"),
    default_use_case: optText(formData, "default_use_case"),
    public_copy_allowed: checkbox(formData, "public_copy_allowed"),
    client_owned_account_required: checkbox(formData, "client_owned_account_required"),
    white_label_allowed: whiteLabel === "yes" ? true : whiteLabel === "no" ? false : null,
    dpa_status: optText(formData, "dpa_status"),
    no_training_status: optText(formData, "no_training_status"),
    admin_controls_status: optText(formData, "admin_controls_status"),
    export_path_status: optText(formData, "export_path_status"),
    max_data_sensitivity: formData.get("max_data_sensitivity"),
    support_burden: optText(formData, "support_burden"),
    longevity_notes: optText(formData, "longevity_notes"),
    prohibited_use_cases: lines(formData, "prohibited_use_cases"),
    source_links: lines(formData, "source_links"),
    internal_notes: optText(formData, "internal_notes"),
    public_notes: optText(formData, "public_notes"),
    last_reviewed_at: optText(formData, "last_reviewed_at"),
    next_review_at: optText(formData, "next_review_at"),
  });
}

export async function createToolVendor(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = parseVendorForm(formData);
  if (!parsed.success) redirect("/admin/tools/new?error=invalid");

  const { error } = await ctx.supabase.from("tool_vendors").insert(parsed.data);
  if (error) {
    console.error("[admin] create tool vendor failed:", error.message);
    redirect("/admin/tools/new?error=save");
  }
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
}

export async function updateToolVendor(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return;
  const parsed = parseVendorForm(formData);
  if (!parsed.success) redirect(`/admin/tools/${id.data}?error=invalid`);

  const { error } = await ctx.supabase.from("tool_vendors").update(parsed.data).eq("id", id.data);
  if (error) {
    console.error("[admin] update tool vendor failed:", error.message);
    redirect(`/admin/tools/${id.data}?error=save`);
  }
  revalidatePath("/admin/tools");
  redirect(`/admin/tools/${id.data}?saved=1`);
}

/* ── Workflow playbooks ────────────────────────────────────────── */

const playbookStepSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  owner_role: z.string().max(80).default("advisor"),
  tool_category: z.string().max(80).default("other"),
  human_review: z.boolean().default(true),
  output_artifact: z.string().max(200).default(""),
});

const playbookSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  target_icp: z.string().max(300).optional(),
  pain_addressed: z.string().max(1000).optional(),
  description: z.string().max(4000).optional(),
  default_delivery_mode: z.enum(DELIVERY_MODES),
  complexity: z.enum(PLAYBOOK_COMPLEXITIES),
  default_tool_categories: z.array(z.enum(TOOL_CATEGORIES_DB)),
  steps: z.array(playbookStepSchema),
  max_data_sensitivity: VENDOR_SENSITIVITY,
  est_setup_hours_min: z.coerce.number().min(0).max(999).optional(),
  est_setup_hours_max: z.coerce.number().min(0).max(999).optional(),
  price_min_cents: z.number().int().min(0).optional(),
  price_max_cents: z.number().int().min(0).optional(),
  retainer_fit: z.coerce.number().int().min(1).max(5),
  human_review_required: z.boolean(),
  success_metrics: z.array(z.string().max(300)),
  active: z.boolean(),
});

function parsePlaybookForm(formData: FormData) {
  let steps: unknown;
  try {
    const raw = text(formData, "steps");
    steps = raw ? JSON.parse(raw) : [];
  } catch {
    return { success: false as const, error: "steps_json" };
  }
  const name = text(formData, "name");
  const parsed = playbookSchema.safeParse({
    name,
    slug: text(formData, "slug") || slugify(name),
    target_icp: optText(formData, "target_icp"),
    pain_addressed: optText(formData, "pain_addressed"),
    description: optText(formData, "description"),
    default_delivery_mode: formData.get("default_delivery_mode"),
    complexity: formData.get("complexity"),
    default_tool_categories: lines(formData, "default_tool_categories"),
    steps,
    max_data_sensitivity: formData.get("max_data_sensitivity"),
    est_setup_hours_min: optText(formData, "est_setup_hours_min"),
    est_setup_hours_max: optText(formData, "est_setup_hours_max"),
    price_min_cents: dollarsToCents(formData, "price_min_dollars"),
    price_max_cents: dollarsToCents(formData, "price_max_dollars"),
    retainer_fit: formData.get("retainer_fit") ?? 3,
    human_review_required: checkbox(formData, "human_review_required"),
    success_metrics: lines(formData, "success_metrics"),
    active: checkbox(formData, "active"),
  });
  if (!parsed.success) return { success: false as const, error: "invalid" };
  return { success: true as const, data: parsed.data };
}

export async function createPlaybook(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = parsePlaybookForm(formData);
  if (!parsed.success) redirect(`/admin/playbooks/new?error=${parsed.error}`);

  const { error } = await ctx.supabase.from("workflow_playbooks").insert(parsed.data);
  if (error) {
    console.error("[admin] create playbook failed:", error.message);
    redirect("/admin/playbooks/new?error=save");
  }
  revalidatePath("/admin/playbooks");
  redirect("/admin/playbooks");
}

export async function updatePlaybook(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return;
  const parsed = parsePlaybookForm(formData);
  if (!parsed.success) redirect(`/admin/playbooks/${id.data}?error=${parsed.error}`);

  const { error } = await ctx.supabase
    .from("workflow_playbooks")
    .update(parsed.data)
    .eq("id", id.data);
  if (error) {
    console.error("[admin] update playbook failed:", error.message);
    redirect(`/admin/playbooks/${id.data}?error=save`);
  }
  revalidatePath("/admin/playbooks");
  redirect(`/admin/playbooks/${id.data}?saved=1`);
}

export async function togglePlaybookActive(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return;

  const { data: playbook } = await ctx.supabase
    .from("workflow_playbooks")
    .select("active")
    .eq("id", id.data)
    .single();
  if (!playbook) return;

  await ctx.supabase
    .from("workflow_playbooks")
    .update({ active: !playbook.active })
    .eq("id", id.data);
  revalidatePath("/admin/playbooks");
}

export async function duplicatePlaybook(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return;

  const { data: source } = await ctx.supabase
    .from("workflow_playbooks")
    .select("*")
    .eq("id", id.data)
    .single();
  if (!source) return;

  const copy = {
    ...source,
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
    name: `${source.name} (copy)`,
    slug: `${source.slug}-copy-${Date.now().toString(36)}`,
    active: false,
  };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;

  const { data: created, error } = await ctx.supabase
    .from("workflow_playbooks")
    .insert(copy)
    .select("id")
    .single();
  if (error || !created) {
    console.error("[admin] duplicate playbook failed:", error?.message);
    return;
  }
  revalidatePath("/admin/playbooks");
  redirect(`/admin/playbooks/${created.id}`);
}

/* ── Client tool instances ─────────────────────────────────────── */

const instanceSchema = z.object({
  organization_id: uuid,
  tool_vendor_id: uuid.optional(),
  tool_name: z.string().min(1).max(160),
  owner_type: z.enum(TOOL_INSTANCE_OWNER_TYPES),
  purpose: z.string().max(500).optional(),
  data_sensitivity: z.enum(["public", "internal", "confidential", "regulated", "prohibited"]),
  status: z.string().min(1).max(60),
  monthly_cost_cents: z.number().int().min(0).optional(),
  review_date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export async function addClientToolInstance(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const vendorId = text(formData, "tool_vendor_id");
  const parsed = instanceSchema.safeParse({
    organization_id: formData.get("organization_id"),
    tool_vendor_id: vendorId || undefined,
    tool_name: text(formData, "tool_name"),
    owner_type: formData.get("owner_type") ?? "client_owned",
    purpose: optText(formData, "purpose"),
    data_sensitivity: formData.get("data_sensitivity") ?? "internal",
    status: text(formData, "status") || "active",
    monthly_cost_cents: dollarsToCents(formData, "monthly_cost_dollars"),
    review_date: optText(formData, "review_date"),
    notes: optText(formData, "notes"),
  });
  if (!parsed.success) return;

  await ctx.supabase.from("client_tool_instances").insert(parsed.data);
  revalidatePath(`/admin/clients/${parsed.data.organization_id}/stack`);
}

export async function updateClientToolInstanceStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      id: uuid,
      organization_id: uuid,
      status: z.string().min(1).max(60),
    })
    .safeParse({
      id: formData.get("id"),
      organization_id: formData.get("organization_id"),
      status: text(formData, "status"),
    });
  if (!parsed.success) return;

  await ctx.supabase
    .from("client_tool_instances")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  revalidatePath(`/admin/clients/${parsed.data.organization_id}/stack`);
}

/* ── Stack recommendations ─────────────────────────────────────── */

const recommendationSchema = z.object({
  organization_id: uuid,
  title: z.string().min(1).max(200),
  summary: z.string().max(4000).optional(),
  delivery_mode: z.enum(DELIVERY_MODES),
  overall_data_sensitivity: z.enum(["public", "internal", "confidential", "regulated", "prohibited"]),
  assumptions: z.array(z.string().max(400)),
  excluded_use_cases: z.array(z.string().max(400)),
  setup_price_min_cents: z.number().int().min(0).optional(),
  setup_price_max_cents: z.number().int().min(0).optional(),
  retainer_min_cents: z.number().int().min(0).optional(),
  retainer_max_cents: z.number().int().min(0).optional(),
});

export async function createStackRecommendation(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = recommendationSchema.safeParse({
    organization_id: formData.get("organization_id"),
    title: text(formData, "title"),
    summary: optText(formData, "summary"),
    delivery_mode: formData.get("delivery_mode"),
    overall_data_sensitivity: formData.get("overall_data_sensitivity") ?? "internal",
    assumptions: lines(formData, "assumptions"),
    excluded_use_cases: lines(formData, "excluded_use_cases"),
    setup_price_min_cents: dollarsToCents(formData, "setup_price_min_dollars"),
    setup_price_max_cents: dollarsToCents(formData, "setup_price_max_dollars"),
    retainer_min_cents: dollarsToCents(formData, "retainer_min_dollars"),
    retainer_max_cents: dollarsToCents(formData, "retainer_max_dollars"),
  });
  if (!parsed.success) return;

  // Safety rail: regulated/prohibited sensitivity (or restricted-area text)
  // forces decline_or_defer, visibly.
  const rail = railDeliveryMode(parsed.data.delivery_mode, {
    sensitivity: parsed.data.overall_data_sensitivity,
    text: `${parsed.data.title} ${parsed.data.summary ?? ""}`,
  });

  // Link the latest intake automatically so the readout can trace lineage.
  const { data: intake } = await ctx.supabase
    .from("audit_intakes")
    .select("id")
    .eq("organization_id", parsed.data.organization_id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await ctx.supabase.from("stack_recommendations").insert({
    ...parsed.data,
    delivery_mode: rail.value,
    summary: rail.railed
      ? `${rail.reason} ${parsed.data.summary ?? ""}`.trim()
      : parsed.data.summary,
    audit_intake_id: intake?.id ?? null,
    status: "draft",
    created_by: ctx.userId,
  });
  if (error) console.error("[admin] create stack recommendation failed:", error.message);
  revalidatePath(`/admin/clients/${parsed.data.organization_id}/stack`);
}

export async function setStackRecommendationStatus(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = z
    .object({
      id: uuid,
      organization_id: uuid,
      status: z.enum(["draft", "reviewed", "shared"]),
    })
    .safeParse({
      id: formData.get("id"),
      organization_id: formData.get("organization_id"),
      status: formData.get("status"),
    });
  if (!parsed.success) return;

  await ctx.supabase
    .from("stack_recommendations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (parsed.data.status === "shared") {
    await logActivity(
      ctx.supabase,
      ctx.userId,
      parsed.data.organization_id,
      "stack_recommendation_shared",
      "stack_recommendation",
      { stack_recommendation_id: parsed.data.id }
    );
  }
  revalidatePath(`/admin/clients/${parsed.data.organization_id}/stack`);
  revalidatePath("/portal/stack");
}

const itemSchema = z.object({
  stack_recommendation_id: uuid,
  organization_id: uuid,
  tool_vendor_id: uuid.optional(),
  playbook_id: uuid.optional(),
  tool_category: z.enum(TOOL_CATEGORIES_DB),
  recommendation_type: z.enum(RECOMMENDATION_TYPES),
  use_case: z.string().max(400),
  reason: z.string().max(2000).optional(),
  data_boundary: z.string().max(1000).optional(),
  monthly_cost_cents: z.number().int().min(0).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export async function addStackRecommendationItem(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const parsed = itemSchema.safeParse({
    stack_recommendation_id: formData.get("stack_recommendation_id"),
    organization_id: formData.get("organization_id"),
    tool_vendor_id: optText(formData, "tool_vendor_id"),
    playbook_id: optText(formData, "playbook_id"),
    tool_category: formData.get("tool_category") ?? "other",
    recommendation_type: formData.get("recommendation_type") ?? "default",
    use_case: text(formData, "use_case"),
    reason: optText(formData, "reason"),
    data_boundary: optText(formData, "data_boundary"),
    monthly_cost_cents: dollarsToCents(formData, "monthly_cost_dollars"),
    sort_order: formData.get("sort_order") || 0,
  });
  if (!parsed.success) return;
  const { playbook_id, organization_id, ...item } = parsed.data;

  // Pull engagement sensitivity for the rails.
  const { data: parent } = await ctx.supabase
    .from("stack_recommendations")
    .select("overall_data_sensitivity")
    .eq("id", item.stack_recommendation_id)
    .single();
  if (!parent) return;

  // Composing from a playbook fills gaps from the library entry.
  if (playbook_id) {
    const { data: playbook } = await ctx.supabase
      .from("workflow_playbooks")
      .select("name, pain_addressed, default_tool_categories, max_data_sensitivity, human_review_required")
      .eq("id", playbook_id)
      .single();
    if (playbook) {
      if (!item.use_case) item.use_case = playbook.name;
      if (!item.reason && playbook.pain_addressed) item.reason = `Addresses: ${playbook.pain_addressed}`;
      const categories = (playbook.default_tool_categories ?? []) as string[];
      if (item.tool_category === "other" && categories.length > 0) {
        const candidate = TOOL_CATEGORIES_DB.find((c) => c === categories[0]);
        if (candidate) item.tool_category = candidate;
      }
      if (playbook.human_review_required && !item.data_boundary) {
        item.data_boundary = `Max sensitivity ${playbook.max_data_sensitivity}; human review required on outputs.`;
      }
    }
  }
  if (!item.use_case) return;

  // Vendor doctrine rails: rejected vendors stay rejected; internal-only
  // vendors are never recommended to clients without their own SOW.
  let vendorRailReason: string | null = null;
  if (item.tool_vendor_id) {
    const { data: vendor } = await ctx.supabase
      .from("tool_vendors")
      .select("approval_status, name")
      .eq("id", item.tool_vendor_id)
      .single();
    if (vendor?.approval_status === "rejected") {
      item.recommendation_type = "rejected";
      vendorRailReason = `Safety rail: vendor "${vendor.name}" is rejected in the catalog.`;
    } else if (vendor?.approval_status === "internal_only") {
      item.recommendation_type = "defer";
      vendorRailReason = `Safety rail: vendor "${vendor.name}" is internal-only — client use requires a security review and its own paid SOW.`;
    }
  }

  // Sensitivity + restricted-area rails force defer, visibly (reason field).
  const rail = railRecommendationType(item.recommendation_type, {
    sensitivity: parent.overall_data_sensitivity,
    text: `${item.use_case} ${item.reason ?? ""} ${item.data_boundary ?? ""}`,
  });
  item.recommendation_type = rail.value;
  item.reason = withRailReason(
    vendorRailReason ? `${vendorRailReason} ${item.reason ?? ""}`.trim() : item.reason,
    rail
  ) ?? undefined;

  await ctx.supabase.from("stack_recommendation_items").insert(item);
  revalidatePath(`/admin/clients/${organization_id}/stack`);
}

export async function removeStackRecommendationItem(formData: FormData): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const id = uuid.safeParse(formData.get("id"));
  const orgId = uuid.safeParse(formData.get("organization_id"));
  if (!id.success || !orgId.success) return;

  await ctx.supabase.from("stack_recommendation_items").delete().eq("id", id.data);
  revalidatePath(`/admin/clients/${orgId.data}/stack`);
}
