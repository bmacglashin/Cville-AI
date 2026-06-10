import { z } from "zod";

export const INDUSTRIES = [
  "Design / build & remodeling",
  "Architecture-adjacent services",
  "Premium home services",
  "Property management",
  "Professional services",
  "Winery / venue / hospitality",
  "Real estate team",
  "Nonprofit / education-adjacent",
  "Other",
] as const;

export const TEAM_SIZES = ["1–5", "6–15", "16–40", "41–100", "100+"] as const;

export const BUDGET_RANGES = [
  "Under $1k",
  "$1k–$5k",
  "$5k–$15k",
  "$15k+",
  "Not sure yet",
] as const;

export const TIMELINES = [
  "ASAP — this month",
  "This quarter",
  "Next 6 months",
  "Exploring for now",
] as const;

export const SENSITIVITY_LEVELS = ["public", "internal", "confidential", "regulated"] as const;

export const PAIN_AREAS = [
  "Proposals & estimating",
  "Customer follow-up",
  "Scheduling & coordination",
  "Project handoffs",
  "Repeated staff questions",
  "Documents & SOPs",
  "Reporting & owner visibility",
  "Billing & collections",
  "Other",
] as const;

export const businessProfileSchema = z.object({
  organization_name: z.string().min(2, "Business name is required").max(120),
  industry: z.enum(INDUSTRIES),
  team_size: z.enum(TEAM_SIZES),
  website: z
    .string()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  city: z.string().max(80).default("Charlottesville"),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export const goalsSchema = z.object({
  goals: z.string().min(10, "Tell us a bit more — a sentence or two helps.").max(4000),
  budget_range: z.enum(BUDGET_RANGES),
  timeline: z.enum(TIMELINES),
  current_ai_usage: z.string().max(4000).optional().or(z.literal("")),
});

export const toolSchema = z.object({
  name: z.string().min(1, "Tool name required").max(120),
  category: z.string().max(80).optional().or(z.literal("")),
  usage_notes: z.string().max(1000).optional().or(z.literal("")),
});

export const workflowSchema = z.object({
  name: z.string().min(2, "Workflow name required").max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  frequency: z.string().max(80).optional().or(z.literal("")),
  hours_per_week: z.coerce.number().min(0).max(168).optional(),
});

export const painPointSchema = z.object({
  area: z.enum(PAIN_AREAS),
  description: z.string().min(3, "Describe the pain point").max(2000),
  severity: z.coerce.number().int().min(1).max(5),
});

export const dataSourceSchema = z.object({
  name: z.string().min(1, "Name required").max(160),
  source_type: z.string().max(80).optional().or(z.literal("")),
  sensitivity: z.enum(SENSITIVITY_LEVELS),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const documentListItemSchema = z.object({
  file_name: z.string().min(1, "Document name required").max(200),
  sensitivity: z.enum(SENSITIVITY_LEVELS),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const intakeSubmissionSchema = z.object({
  profile: businessProfileSchema,
  goals: goalsSchema,
  tools: z.array(toolSchema).max(40).default([]),
  workflows: z.array(workflowSchema).max(40).default([]),
  pain_points: z.array(painPointSchema).max(40).default([]),
  data_sources: z.array(dataSourceSchema).max(40).default([]),
  documents: z.array(documentListItemSchema).max(40).default([]),
  scheduling_preference: z.string().max(500).optional().or(z.literal("")),
  additional_notes: z.string().max(4000).optional().or(z.literal("")),
  data_sensitivity_ack: z
    .boolean()
    .refine((v) => v === true, "Please acknowledge the data handling notice."),
  regulated_data_ack: z
    .boolean()
    .refine((v) => v === true, "Please confirm you will not share regulated data during the MVP."),
});

export type IntakeSubmission = z.infer<typeof intakeSubmissionSchema>;

/** Public "Apply for the Founding AI Operating Audit" form — no account required. */
export const auditApplicationSchema = z.object({
  full_name: z.string().min(2, "Name is required").max(120),
  email: z.email("Valid email required").max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  company: z.string().min(2, "Business name is required").max(160),
  industry: z.enum(INDUSTRIES),
  team_size: z.enum(TEAM_SIZES),
  biggest_bottleneck: z
    .string()
    .min(10, "One or two sentences is plenty — what eats your week?")
    .max(2000),
  message: z.string().max(4000).optional().or(z.literal("")),
});

export type AuditApplication = z.infer<typeof auditApplicationSchema>;

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Name is required").max(120),
  email: z.email("Valid email required").max(200),
  password: z.string().min(8, "At least 8 characters").max(72),
  organization_name: z.string().min(2, "Business name is required").max(120),
});

export const signInSchema = z.object({
  email: z.email("Valid email required").max(200),
  password: z.string().min(1, "Password required").max(72),
});
