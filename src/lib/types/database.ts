/**
 * Hand-maintained row types matching supabase/migrations.
 * After connecting a live project you can replace these with generated types:
 *   npx supabase gen types typescript --linked > src/lib/types/database.gen.ts
 *
 * Scope note: this backend is an internal validation + delivery system
 * (CRM, intake, audit delivery) — not a multi-tenant client SaaS.
 */

export type AppRole = "client" | "admin";
export type OrgMemberRole = "owner" | "member";

export type PipelineStage =
  | "new_inquiry"
  | "fit_call_booked"
  | "audit_paid"
  | "intake_submitted"
  | "audit_scheduled"
  | "audit_delivered"
  | "quickstart_proposed"
  | "implementation_active"
  | "retainer_active"
  | "closed_lost";

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "closed";
export type IntakeStatus = "draft" | "submitted" | "in_review" | "complete";
export type WorkStatus = "backlog" | "advisor_review" | "client_review" | "in_progress" | "done";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";
export type DataSensitivity = "public" | "internal" | "confidential" | "regulated" | "prohibited";
export type RoadmapPhase = "now" | "next" | "later";
export type DocumentStatus = "listed" | "uploaded" | "reviewed";
export type CallType = "fit_call" | "discovery" | "owner_interview" | "working_session" | "other";

/* ── Operating layer (tool catalog, playbooks, stack, readouts) ── */

export type ToolCategory =
  | "foundational_workspace"
  | "llm_assistant"
  | "knowledge_base"
  | "automation"
  | "messaging_assistant"
  | "agent_workspace"
  | "project_management"
  | "crm"
  | "communication"
  | "custom_app"
  | "other";

export type ApprovalStatus =
  | "approved"
  | "conditional"
  | "experimental"
  | "internal_only"
  | "rejected"
  | "needs_review";

export type DeliveryMode =
  | "existing_tools"
  | "managed_ai_workspace"
  | "point_solution"
  | "custom_glue"
  | "custom_app"
  | "decline_or_defer";

export type RecommendationType = "default" | "optional" | "premium" | "rejected" | "defer";

export type ToolInstanceOwnerType = "client_owned" | "advisor_managed" | "unknown";
export type StackRecommendationStatus = "draft" | "reviewed" | "shared";
export type ReadoutStatus = "draft" | "reviewed" | "sent" | "archived";
export type PlaybookComplexity = "low" | "medium" | "high" | "custom";

export const PIPELINE_STAGES: PipelineStage[] = [
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
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  new_inquiry: "New Inquiry",
  fit_call_booked: "Fit Call Booked",
  audit_paid: "Audit Paid",
  intake_submitted: "Intake Submitted",
  audit_scheduled: "Audit Scheduled",
  audit_delivered: "Audit Delivered",
  quickstart_proposed: "Quickstart Proposed",
  implementation_active: "Implementation Active",
  retainer_active: "Retainer Active",
  closed_lost: "Closed / Lost",
};

export const WORK_STATUSES: WorkStatus[] = [
  "backlog",
  "advisor_review",
  "client_review",
  "in_progress",
  "done",
];

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "converted", "closed"];

export const DATA_SENSITIVITIES: DataSensitivity[] = [
  "public",
  "internal",
  "confidential",
  "regulated",
  "prohibited",
];

export const TOOL_CATEGORIES_DB: ToolCategory[] = [
  "foundational_workspace",
  "llm_assistant",
  "knowledge_base",
  "automation",
  "messaging_assistant",
  "agent_workspace",
  "project_management",
  "crm",
  "communication",
  "custom_app",
  "other",
];

export const APPROVAL_STATUSES: ApprovalStatus[] = [
  "approved",
  "conditional",
  "experimental",
  "internal_only",
  "rejected",
  "needs_review",
];

export const DELIVERY_MODES: DeliveryMode[] = [
  "existing_tools",
  "managed_ai_workspace",
  "point_solution",
  "custom_glue",
  "custom_app",
  "decline_or_defer",
];

export const RECOMMENDATION_TYPES: RecommendationType[] = [
  "default",
  "optional",
  "premium",
  "rejected",
  "defer",
];

export const PLAYBOOK_COMPLEXITIES: PlaybookComplexity[] = ["low", "medium", "high", "custom"];

export const STACK_RECOMMENDATION_STATUSES: StackRecommendationStatus[] = [
  "draft",
  "reviewed",
  "shared",
];

export const READOUT_STATUSES: ReadoutStatus[] = ["draft", "reviewed", "sent", "archived"];

export const TOOL_INSTANCE_OWNER_TYPES: ToolInstanceOwnerType[] = [
  "client_owned",
  "advisor_managed",
  "unknown",
];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string | null;
  industry: string | null;
  team_size: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  pipeline_stage: PipelineStage;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface Contact {
  id: string;
  organization_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_title: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  industry: string | null;
  team_size: string | null;
  biggest_bottleneck: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditIntake {
  id: string;
  organization_id: string;
  submitted_by: string | null;
  status: IntakeStatus;
  goals: string | null;
  budget_range: string | null;
  timeline: string | null;
  current_ai_usage: string | null;
  scheduling_preference: string | null;
  data_sensitivity_ack: boolean;
  regulated_data_ack: boolean;
  additional_notes: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryNote {
  id: string;
  organization_id: string;
  author_id: string | null;
  call_type: CallType;
  summary: string;
  occurred_at: string;
  created_at: string;
}

export interface ToolInventoryItem {
  id: string;
  intake_id: string | null;
  organization_id: string;
  name: string;
  category: string | null;
  usage_notes: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  intake_id: string | null;
  organization_id: string;
  name: string;
  description: string | null;
  frequency: string | null;
  hours_per_week: number | null;
  created_at: string;
}

export interface PainPoint {
  id: string;
  intake_id: string | null;
  organization_id: string;
  area: string | null;
  description: string;
  severity: number;
  created_at: string;
}

export interface DataSource {
  id: string;
  intake_id: string | null;
  organization_id: string;
  name: string;
  source_type: string | null;
  sensitivity: DataSensitivity;
  notes: string | null;
  created_at: string;
}

export interface UploadedDocument {
  id: string;
  organization_id: string;
  intake_id: string | null;
  uploaded_by: string | null;
  file_name: string;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  sensitivity: DataSensitivity;
  status: DocumentStatus;
  notes: string | null;
  created_at: string;
}

export interface AiOpportunity {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  workflow_type: string | null;
  status: WorkStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface OpportunityScore {
  id: string;
  opportunity_id: string;
  organization_id: string;
  impact: number;
  effort: number;
  risk: number;
  data_readiness: number;
  owner_hours_saved_weekly: number | null;
  total_score: number | null;
  notes: string | null;
  scored_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapItem {
  id: string;
  organization_id: string;
  opportunity_id: string | null;
  title: string;
  description: string | null;
  phase: RoadmapPhase;
  status: WorkStatus;
  target_window: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  title: string;
  summary: string | null;
  status: ProposalStatus;
  total_amount_cents: number | null;
  currency: string;
  valid_until: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalLineItem {
  id: string;
  proposal_id: string;
  service_package_id: string | null;
  description: string;
  quantity: number;
  unit_amount_cents: number;
  sort_order: number;
  created_at: string;
}

export interface Deliverable {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  deliverable_type: string | null;
  status: WorkStatus;
  due_date: string | null;
  link_url: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  roadmap_item_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  owner: "advisor" | "client";
  due_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  organization_id: string;
  author_id: string | null;
  entity_type: string;
  entity_id: string | null;
  body: string;
  created_at: string;
}

export interface ServicePackage {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  founding_price_cents: number | null;
  standard_price_cents: number | null;
  price_note: string | null;
  is_founding_offer: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityEvent {
  id: string;
  organization_id: string | null;
  actor_id: string | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/* ── Operating layer rows ──────────────────────────────────────── */

export interface ToolVendor {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  approval_status: ApprovalStatus;
  short_description: string | null;
  default_use_case: string | null;
  public_copy_allowed: boolean;
  client_owned_account_required: boolean;
  white_label_allowed: boolean | null;
  dpa_status: string | null;
  no_training_status: string | null;
  admin_controls_status: string | null;
  export_path_status: string | null;
  max_data_sensitivity: DataSensitivity;
  support_burden: string | null;
  longevity_notes: string | null;
  prohibited_use_cases: string[];
  source_links: string[];
  internal_notes: string | null;
  public_notes: string | null;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaybookStep {
  title: string;
  description: string;
  owner_role: string;
  tool_category: string;
  human_review: boolean;
  output_artifact: string;
}

export interface WorkflowPlaybook {
  id: string;
  name: string;
  slug: string;
  target_icp: string | null;
  pain_addressed: string | null;
  description: string | null;
  default_delivery_mode: DeliveryMode;
  complexity: PlaybookComplexity;
  default_tool_categories: string[];
  steps: PlaybookStep[];
  max_data_sensitivity: DataSensitivity;
  est_setup_hours_min: number | null;
  est_setup_hours_max: number | null;
  price_min_cents: number | null;
  price_max_cents: number | null;
  retainer_fit: number;
  human_review_required: boolean;
  success_metrics: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientToolInstance {
  id: string;
  organization_id: string;
  tool_vendor_id: string | null;
  tool_name: string;
  owner_type: ToolInstanceOwnerType;
  purpose: string | null;
  data_sensitivity: DataSensitivity;
  status: string;
  monthly_cost_cents: number | null;
  review_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StackRecommendation {
  id: string;
  organization_id: string;
  audit_intake_id: string | null;
  title: string;
  summary: string | null;
  delivery_mode: DeliveryMode;
  overall_data_sensitivity: DataSensitivity;
  assumptions: string[];
  excluded_use_cases: string[];
  setup_price_min_cents: number | null;
  setup_price_max_cents: number | null;
  retainer_min_cents: number | null;
  retainer_max_cents: number | null;
  status: StackRecommendationStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StackRecommendationItem {
  id: string;
  stack_recommendation_id: string;
  tool_vendor_id: string | null;
  tool_category: ToolCategory;
  recommendation_type: RecommendationType;
  use_case: string;
  reason: string | null;
  data_boundary: string | null;
  monthly_cost_cents: number | null;
  sort_order: number;
  created_at: string;
}

export interface AuditReadout {
  id: string;
  organization_id: string;
  audit_intake_id: string | null;
  stack_recommendation_id: string | null;
  title: string;
  generated_markdown: string;
  status: ReadoutStatus;
  client_visible: boolean;
  created_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}
