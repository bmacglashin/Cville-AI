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
export type DataSensitivity = "public" | "internal" | "confidential" | "regulated";
export type RoadmapPhase = "now" | "next" | "later";
export type DocumentStatus = "listed" | "uploaded" | "reviewed";
export type CallType = "fit_call" | "discovery" | "owner_interview" | "working_session" | "other";

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
