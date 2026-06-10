"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  businessProfileSchema,
  goalsSchema,
  toolSchema,
  workflowSchema,
  painPointSchema,
  dataSourceSchema,
  documentListItemSchema,
  INDUSTRIES,
  TEAM_SIZES,
  BUDGET_RANGES,
  TIMELINES,
  PAIN_AREAS,
  SENSITIVITY_LEVELS,
  type IntakeSubmission,
} from "@/lib/validation/intake";
import { submitAuditIntake } from "./actions";

type Tool = z.infer<typeof toolSchema>;
type Workflow = z.infer<typeof workflowSchema>;
type PainPoint = z.infer<typeof painPointSchema>;
type DataSourceItem = z.infer<typeof dataSourceSchema>;
type DocumentItem = z.infer<typeof documentListItemSchema>;

interface WizardState {
  profile: {
    organization_name: string;
    industry: (typeof INDUSTRIES)[number];
    team_size: (typeof TEAM_SIZES)[number];
    website: string;
    city: string;
    description: string;
  };
  goals: {
    goals: string;
    budget_range: (typeof BUDGET_RANGES)[number];
    timeline: (typeof TIMELINES)[number];
    current_ai_usage: string;
  };
  tools: Tool[];
  workflows: Workflow[];
  pain_points: PainPoint[];
  data_sources: DataSourceItem[];
  documents: DocumentItem[];
  scheduling_preference: string;
  additional_notes: string;
  data_sensitivity_ack: boolean;
  regulated_data_ack: boolean;
}

const STEPS = [
  "Business profile",
  "Goals & context",
  "Tools you use",
  "Recurring workflows",
  "Pain points",
  "Data & documents",
  "Review & submit",
] as const;

const DRAFT_KEY = "agent-ally-intake-draft-v1";

function emptyState(defaults?: { organizationName?: string }): WizardState {
  return {
    profile: {
      organization_name: defaults?.organizationName ?? "",
      industry: INDUSTRIES[0],
      team_size: TEAM_SIZES[1],
      website: "",
      city: "Charlottesville",
      description: "",
    },
    goals: {
      goals: "",
      budget_range: BUDGET_RANGES[1],
      timeline: TIMELINES[1],
      current_ai_usage: "",
    },
    tools: [],
    workflows: [],
    pain_points: [],
    data_sources: [],
    documents: [],
    scheduling_preference: "",
    additional_notes: "",
    data_sensitivity_ack: false,
    regulated_data_ack: false,
  };
}

function Err({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

export function IntakeWizard({ organizationName }: { organizationName?: string }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(() => emptyState({ organizationName }));
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Draft persistence — survive accidental tab closes. localStorage can only
  // be read after mount (SSR has no window), so a one-time setState here is
  // the standard hydration pattern.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as WizardState;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({
          ...saved,
          profile: {
            ...saved.profile,
            organization_name: saved.profile.organization_name || prev.profile.organization_name,
          },
        }));
      }
    } catch {
      // corrupted draft — start clean
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    } catch {
      // storage full/blocked — non-fatal
    }
  }, [state, hydrated]);

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  function validateStep(): boolean {
    setStepError(null);
    if (step === 0) {
      const r = businessProfileSchema.safeParse(state.profile);
      if (!r.success) {
        setStepError(r.error.issues[0]?.message ?? "Check the business profile fields.");
        return false;
      }
    }
    if (step === 1) {
      const r = goalsSchema.safeParse(state.goals);
      if (!r.success) {
        setStepError(r.error.issues[0]?.message ?? "Check the goals fields.");
        return false;
      }
    }
    if (step === 3 && state.workflows.length === 0) {
      setStepError("Add at least one recurring workflow — it's the heart of the audit.");
      return false;
    }
    if (step === 4 && state.pain_points.length === 0) {
      setStepError("Add at least one pain point so we know where it hurts.");
      return false;
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0 });
  }

  function back() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  }

  async function handleSubmit() {
    setStepError(null);
    if (!state.data_sensitivity_ack || !state.regulated_data_ack) {
      setStepError("Please check both acknowledgments — they're required for MVP engagements.");
      return;
    }
    setSubmitting(true);
    const payload: IntakeSubmission = {
      profile: {
        ...state.profile,
        website: state.profile.website || undefined,
      },
      goals: state.goals,
      tools: state.tools,
      workflows: state.workflows,
      pain_points: state.pain_points,
      data_sources: state.data_sources,
      documents: state.documents,
      scheduling_preference: state.scheduling_preference,
      additional_notes: state.additional_notes,
      data_sensitivity_ack: true,
      regulated_data_ack: true,
    };
    const result = await submitAuditIntake(payload);
    setSubmitting(false);
    if (result.ok) {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {}
      setDone(true);
      window.scrollTo({ top: 0 });
    } else {
      setStepError(result.error ?? "Submission failed — please try again.");
    }
  }

  if (done) {
    return (
      <Card>
        <CardContent className="p-8 text-center sm:p-12">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h2 className="mt-4 font-display text-3xl text-ink">Intake received.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Thank you — this is exactly what the audit needs. Ben will review your intake and reach
            out within one business day to schedule your 90-minute owner interview
            {state.scheduling_preference ? ` (noted: ${state.scheduling_preference})` : ""}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/portal">
              <Button size="lg">Go to your workspace</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Back to the site
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-pine-700 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="org_name">Business name *</Label>
                <Input
                  id="org_name"
                  className="mt-1.5"
                  value={state.profile.organization_name}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      profile: { ...s.profile, organization_name: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    id="industry"
                    className="mt-1.5"
                    value={state.profile.industry}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        profile: {
                          ...s.profile,
                          industry: e.target.value as WizardState["profile"]["industry"],
                        },
                      }))
                    }
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team_size">Team size *</Label>
                  <Select
                    id="team_size"
                    className="mt-1.5"
                    value={state.profile.team_size}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        profile: {
                          ...s.profile,
                          team_size: e.target.value as WizardState["profile"]["team_size"],
                        },
                      }))
                    }
                  >
                    {TEAM_SIZES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    className="mt-1.5"
                    placeholder="https://"
                    value={state.profile.website}
                    onChange={(e) =>
                      setState((s) => ({ ...s, profile: { ...s.profile, website: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    className="mt-1.5"
                    value={state.profile.city}
                    onChange={(e) =>
                      setState((s) => ({ ...s, profile: { ...s.profile, city: e.target.value } }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">What does the business do? (2–3 sentences)</Label>
                <Textarea
                  id="description"
                  className="mt-1.5"
                  rows={3}
                  value={state.profile.description}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      profile: { ...s.profile, description: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <Label htmlFor="goals">
                  If the audit nails one thing, what should it be? *
                </Label>
                <Textarea
                  id="goals"
                  className="mt-1.5"
                  rows={4}
                  placeholder="e.g., I want proposals out the door in under a week without me writing every word…"
                  value={state.goals.goals}
                  onChange={(e) =>
                    setState((s) => ({ ...s, goals: { ...s.goals, goals: e.target.value } }))
                  }
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="budget">Implementation budget, if the ROI is there *</Label>
                  <Select
                    id="budget"
                    className="mt-1.5"
                    value={state.goals.budget_range}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        goals: {
                          ...s.goals,
                          budget_range: e.target.value as WizardState["goals"]["budget_range"],
                        },
                      }))
                    }
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeline">Timeline *</Label>
                  <Select
                    id="timeline"
                    className="mt-1.5"
                    value={state.goals.timeline}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        goals: {
                          ...s.goals,
                          timeline: e.target.value as WizardState["goals"]["timeline"],
                        },
                      }))
                    }
                  >
                    {TIMELINES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ai_usage">How is AI used in the business today, if at all?</Label>
                <Textarea
                  id="ai_usage"
                  className="mt-1.5"
                  rows={3}
                  placeholder="e.g., A couple of us use ChatGPT for emails. No policy, nothing systematic."
                  value={state.goals.current_ai_usage}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      goals: { ...s.goals, current_ai_usage: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <ListEditor<Tool>
              items={state.tools}
              onChange={(tools) => setState((s) => ({ ...s, tools }))}
              schema={toolSchema}
              emptyItem={{ name: "", category: "", usage_notes: "" }}
              title="What software runs the business?"
              hint="CRM, project management, accounting, spreadsheets that secretly run everything — all of it counts."
              renderSummary={(t) => (
                <>
                  <span className="font-medium text-ink">{t.name}</span>
                  {t.category ? <span className="text-muted-foreground"> · {t.category}</span> : null}
                </>
              )}
              fields={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Tool name *</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Buildertrend"
                      value={item.name}
                      onChange={(e) => set({ ...item, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Project management"
                      value={item.category ?? ""}
                      onChange={(e) => set({ ...item, category: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>How it's used (and underused)</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Scheduling only — daily logs ignored"
                      value={item.usage_notes ?? ""}
                      onChange={(e) => set({ ...item, usage_notes: e.target.value })}
                    />
                  </div>
                </div>
              )}
            />
          )}

          {step === 3 && (
            <ListEditor<Workflow>
              items={state.workflows}
              onChange={(workflows) => setState((s) => ({ ...s, workflows }))}
              schema={workflowSchema}
              emptyItem={{ name: "", description: "", frequency: "", hours_per_week: undefined }}
              title="Which recurring workflows eat the most time? *"
              hint="Think of anything done by hand more than once a week: proposals, follow-ups, scheduling, handoffs, reporting."
              renderSummary={(w) => (
                <>
                  <span className="font-medium text-ink">{w.name}</span>
                  {w.hours_per_week ? (
                    <span className="text-muted-foreground"> · ~{w.hours_per_week} hrs/week</span>
                  ) : null}
                </>
              )}
              fields={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Workflow name *</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., Proposal & estimate assembly"
                      value={item.name}
                      onChange={(e) => set({ ...item, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>How often?</Label>
                    <Input
                      className="mt-1.5"
                      placeholder="e.g., 4–6 per month"
                      value={item.frequency ?? ""}
                      onChange={(e) => set({ ...item, frequency: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Hours per week (rough)</Label>
                    <Input
                      className="mt-1.5"
                      type="number"
                      min={0}
                      max={168}
                      value={item.hours_per_week ?? ""}
                      onChange={(e) =>
                        set({
                          ...item,
                          hours_per_week: e.target.value === "" ? undefined : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>How does it work today?</Label>
                    <Textarea
                      className="mt-1.5"
                      rows={2}
                      placeholder="Who does it, what tools, where it breaks down…"
                      value={item.description ?? ""}
                      onChange={(e) => set({ ...item, description: e.target.value })}
                    />
                  </div>
                </div>
              )}
            />
          )}

          {step === 4 && (
            <ListEditor<PainPoint>
              items={state.pain_points}
              onChange={(pain_points) => setState((s) => ({ ...s, pain_points }))}
              schema={painPointSchema}
              emptyItem={{ area: PAIN_AREAS[0], description: "", severity: 3 }}
              title="Where does it hurt? *"
              hint="Rate each pain 1 (annoying) to 5 (costing real money or sleep)."
              renderSummary={(p) => (
                <>
                  <span className="font-medium text-ink">{p.area}</span>
                  <Badge variant={p.severity >= 4 ? "danger" : "outline"} className="ml-2">
                    severity {p.severity}/5
                  </Badge>
                </>
              )}
              fields={(item, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Area *</Label>
                    <Select
                      className="mt-1.5"
                      value={item.area}
                      onChange={(e) => set({ ...item, area: e.target.value as PainPoint["area"] })}
                    >
                      {PAIN_AREAS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Severity (1–5) *</Label>
                    <Select
                      className="mt-1.5"
                      value={String(item.severity)}
                      onChange={(e) => set({ ...item, severity: Number(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {["annoying", "frustrating", "costly", "painful", "critical"][n - 1]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>What happens, concretely? *</Label>
                    <Textarea
                      className="mt-1.5"
                      rows={2}
                      placeholder="e.g., Proposals take 2–3 weeks; we lost two jobs last quarter to faster bids."
                      value={item.description}
                      onChange={(e) => set({ ...item, description: e.target.value })}
                    />
                  </div>
                </div>
              )}
            />
          )}

          {step === 5 && (
            <div className="space-y-8">
              <Alert variant="warning">
                <AlertTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  List documents — don&apos;t upload them
                </AlertTitle>
                <AlertDescription>
                  <p>
                    During the MVP we collect <strong>names and descriptions only</strong>. No file
                    contents. Anything marked &ldquo;confidential&rdquo; or &ldquo;regulated&rdquo;
                    is automatically excluded from AI work — that's the point of asking.
                  </p>
                </AlertDescription>
              </Alert>

              <ListEditor<DataSourceItem>
                items={state.data_sources}
                onChange={(data_sources) => setState((s) => ({ ...s, data_sources }))}
                schema={dataSourceSchema}
                emptyItem={{ name: "", source_type: "", sensitivity: "internal", notes: "" }}
                title="Where does business knowledge live?"
                hint="Drives, inboxes, binders, someone's head — and how sensitive each source is."
                renderSummary={(d) => (
                  <>
                    <span className="font-medium text-ink">{d.name}</span>
                    <Badge
                      variant={
                        d.sensitivity === "regulated"
                          ? "danger"
                          : d.sensitivity === "confidential"
                            ? "warning"
                            : "outline"
                      }
                      className="ml-2"
                    >
                      {d.sensitivity}
                    </Badge>
                  </>
                )}
                fields={(item, set) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Source *</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="e.g., SOPs in Google Drive"
                        value={item.name}
                        onChange={(e) => set({ ...item, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Sensitivity *</Label>
                      <Select
                        className="mt-1.5"
                        value={item.sensitivity}
                        onChange={(e) =>
                          set({ ...item, sensitivity: e.target.value as DataSourceItem["sensitivity"] })
                        }
                      >
                        {SENSITIVITY_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Notes</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="e.g., Incomplete; half of it lives in my head"
                        value={item.notes ?? ""}
                        onChange={(e) => set({ ...item, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              />

              <ListEditor<DocumentItem>
                items={state.documents}
                onChange={(documents) => setState((s) => ({ ...s, documents }))}
                schema={documentListItemSchema}
                emptyItem={{ file_name: "", sensitivity: "internal", notes: "" }}
                title="Documents you might want reviewed later (names only)"
                hint="e.g., 'Sample proposal — scrubbed', 'Production handoff checklist v2'."
                renderSummary={(d) => <span className="font-medium text-ink">{d.file_name}</span>}
                fields={(item, set) => (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Document name *</Label>
                      <Input
                        className="mt-1.5"
                        value={item.file_name}
                        onChange={(e) => set({ ...item, file_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Sensitivity *</Label>
                      <Select
                        className="mt-1.5"
                        value={item.sensitivity}
                        onChange={(e) =>
                          set({ ...item, sensitivity: e.target.value as DocumentItem["sensitivity"] })
                        }
                      >
                        {SENSITIVITY_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed">
                <h3 className="font-semibold text-ink">Quick recap</h3>
                <ul className="mt-3 space-y-1.5 text-muted-foreground">
                  <li>
                    <strong className="text-ink">{state.profile.organization_name || "—"}</strong> ·{" "}
                    {state.profile.industry} · {state.profile.team_size} people
                  </li>
                  <li>{state.tools.length} tools · {state.workflows.length} workflows · {state.pain_points.length} pain points</li>
                  <li>
                    {state.data_sources.length} data sources · {state.documents.length} documents listed
                  </li>
                  <li>Budget: {state.goals.budget_range} · Timeline: {state.goals.timeline}</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="scheduling">Scheduling preference for your 90-minute interview</Label>
                <Input
                  id="scheduling"
                  className="mt-1.5"
                  placeholder="e.g., Tuesday or Thursday mornings"
                  value={state.scheduling_preference}
                  onChange={(e) =>
                    setState((s) => ({ ...s, scheduling_preference: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="notes">Anything else Ben should know going in?</Label>
                <Textarea
                  id="notes"
                  className="mt-1.5"
                  rows={3}
                  value={state.additional_notes}
                  onChange={(e) => setState((s) => ({ ...s, additional_notes: e.target.value }))}
                />
              </div>

              <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-amber-950">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-pine-700"
                    checked={state.data_sensitivity_ack}
                    onChange={(e) =>
                      setState((s) => ({ ...s, data_sensitivity_ack: e.target.checked }))
                    }
                  />
                  <span>
                    I understand that data I share is classified by sensitivity, and that
                    confidential or regulated sources are excluded from AI work during this early
                    period. *
                  </span>
                </label>
                <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-amber-950">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-pine-700"
                    checked={state.regulated_data_ack}
                    onChange={(e) =>
                      setState((s) => ({ ...s, regulated_data_ack: e.target.checked }))
                    }
                  />
                  <span>
                    I agree not to upload or send regulated or sensitive data (health, student,
                    personnel, financial-account, or children&apos;s data) during the MVP. *
                  </span>
                </label>
              </div>
            </div>
          )}

          {stepError && (
            <Alert variant="danger" className="mt-6">
              <AlertDescription>{stepError}</AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit intake"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Generic repeatable-list editor ───────────────────────────── */

function ListEditor<T extends object>({
  items,
  onChange,
  schema,
  emptyItem,
  title,
  hint,
  fields,
  renderSummary,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  schema: z.ZodType<T>;
  emptyItem: T;
  title: string;
  hint: string;
  fields: (item: T, set: (item: T) => void) => React.ReactNode;
  renderSummary: (item: T) => React.ReactNode;
}) {
  const [draft, setDraft] = useState<T>(emptyItem);
  const [error, setError] = useState<string | null>(null);

  function add() {
    const parsed = schema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields above.");
      return;
    }
    onChange([...items, parsed.data]);
    setDraft(emptyItem);
    setError(null);
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0 truncate">{renderSummary(item)}</div>
              <button
                type="button"
                aria-label="Remove item"
                className="shrink-0 rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-danger"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-dashed border-border p-4">
        {fields(draft, setDraft)}
        <Err message={error} />
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={add}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
