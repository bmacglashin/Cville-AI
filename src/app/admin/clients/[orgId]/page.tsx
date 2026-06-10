import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/server";
import { addComment } from "@/lib/actions/comments";
import {
  addContact,
  addDeliverable,
  addDiscoveryNote,
  addOpportunity,
  addProposal,
  addProposalLineItem,
  addRoadmapItem,
  addTask,
  scoreOpportunity,
  updateDeliverableStatus,
  updateOpportunityStatus,
  updateOrgStage,
  updateProposalStatus,
  updateRoadmapStatus,
  updateTaskStatus,
} from "@/lib/actions/admin";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  WORK_STATUSES,
  TASK_STATUSES,
  type OpportunityScore,
} from "@/lib/types/database";
import { formatCents, formatDate, titleCase } from "@/lib/utils";
import { GenerateSummaryButton } from "./generate-summary-button";

export const metadata: Metadata = { title: "Client · Admin", robots: { index: false } };

const SECTIONS = [
  ["overview", "Overview"],
  ["intake", "Intake"],
  ["discovery", "Discovery"],
  ["opportunities", "Opportunities"],
  ["roadmap", "Roadmap"],
  ["proposals", "Proposals"],
  ["deliverables", "Deliverables"],
  ["tasks", "Tasks"],
  ["messages", "Messages"],
  ["activity", "Activity"],
] as const;

function WorkStatusForm({
  action,
  id,
  organizationId,
  current,
  statuses,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  organizationId: string;
  current: string;
  statuses: readonly string[];
}) {
  return (
    <form action={action} className="flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="organization_id" value={organizationId} />
      <Select name="status" defaultValue={current} className="h-8 w-36 text-xs">
        {statuses.map((s) => (
          <option key={s} value={s}>
            {titleCase(s)}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="ghost">
        Set
      </Button>
    </form>
  );
}

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase.from("organizations").select("*").eq("id", orgId).single();
  if (!org) notFound();

  const [
    { data: contacts },
    { data: intake },
    { data: notes },
    { data: opportunities },
    { data: scores },
    { data: roadmap },
    { data: proposals },
    { data: lineItems },
    { data: deliverables },
    { data: tasks },
    { data: comments },
    { data: events },
  ] = await Promise.all([
    supabase.from("contacts").select("*").eq("organization_id", orgId).order("is_primary", { ascending: false }),
    supabase.from("audit_intakes").select("*").eq("organization_id", orgId).order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("discovery_notes").select("*").eq("organization_id", orgId).order("occurred_at", { ascending: false }),
    supabase.from("ai_opportunities").select("*").eq("organization_id", orgId).order("created_at"),
    supabase.from("opportunity_scores").select("*").eq("organization_id", orgId),
    supabase.from("roadmap_items").select("*").eq("organization_id", orgId).order("sort_order"),
    supabase.from("proposals").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
    supabase.from("proposal_line_items").select("*, proposals!inner(organization_id)").eq("proposals.organization_id", orgId).order("sort_order"),
    supabase.from("deliverables").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("organization_id", orgId).order("sort_order"),
    supabase.from("comments").select("id, body, created_at, profiles:author_id (full_name, role)").eq("organization_id", orgId).order("created_at", { ascending: true }),
    supabase.from("activity_events").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(20),
  ]);

  const scoreByOpp = new Map<string, OpportunityScore>(
    ((scores ?? []) as OpportunityScore[]).map((s) => [s.opportunity_id, s])
  );

  let intakeChildren: {
    tools: { id: string; name: string; category: string | null }[];
    workflows: { id: string; name: string; hours_per_week: number | null }[];
    pains: { id: string; area: string | null; description: string; severity: number }[];
    sources: { id: string; name: string; sensitivity: string }[];
  } = { tools: [], workflows: [], pains: [], sources: [] };

  if (intake) {
    const [t, w, p, s] = await Promise.all([
      supabase.from("tools_inventory").select("id,name,category").eq("intake_id", intake.id),
      supabase.from("workflows").select("id,name,hours_per_week").eq("intake_id", intake.id),
      supabase.from("pain_points").select("id,area,description,severity").eq("intake_id", intake.id).order("severity", { ascending: false }),
      supabase.from("data_sources").select("id,name,sensitivity").eq("intake_id", intake.id),
    ]);
    intakeChildren = {
      tools: t.data ?? [],
      workflows: w.data ?? [],
      pains: p.data ?? [],
      sources: s.data ?? [],
    };
  }

  return (
    <div className="space-y-10">
      {/* ── Header / overview ── */}
      <section id="overview" className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-ink">{org.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {org.industry ?? "Industry —"} · {org.team_size ?? "Size —"} ·{" "}
              {org.city ?? "—"}, {org.state ?? ""}
              {org.website && (
                <>
                  {" · "}
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="underline">
                    site
                  </a>
                </>
              )}
            </p>
            {org.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {org.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <form action={updateOrgStage} className="flex items-center gap-2">
              <input type="hidden" name="id" value={org.id} />
              <Select name="pipeline_stage" defaultValue={org.pipeline_stage} className="h-9 w-52 text-sm">
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {PIPELINE_STAGE_LABELS[s]}
                  </option>
                ))}
              </Select>
              <Button type="submit" size="sm">
                Move stage
              </Button>
            </form>
            <GenerateSummaryButton organizationId={org.id} />
          </div>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Sections">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {contacts?.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{c.full_name}</span>
                  {c.is_primary && <Badge variant="accent">primary</Badge>}
                  <span className="text-muted-foreground">
                    {c.role_title ?? ""} {c.email ? `· ${c.email}` : ""} {c.phone ? `· ${c.phone}` : ""}
                  </span>
                  {c.notes && <span className="w-full text-xs text-muted-foreground">{c.notes}</span>}
                </li>
              ))}
              {!contacts?.length && <li className="text-muted-foreground">No contacts yet.</li>}
            </ul>
            <form action={addContact} className="grid gap-2 border-t border-border pt-4 sm:grid-cols-5">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="full_name" placeholder="Name *" required className="h-9 text-sm" />
              <Input name="email" type="email" placeholder="Email" className="h-9 text-sm" />
              <Input name="phone" placeholder="Phone" className="h-9 text-sm" />
              <Input name="role_title" placeholder="Role" className="h-9 text-sm" />
              <Button type="submit" size="sm" variant="outline">
                Add contact
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Intake ── */}
      <section id="intake" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Audit intake</h2>
        {!intake ? (
          <p className="text-sm text-muted-foreground">No intake submitted yet.</p>
        ) : (
          <Card>
            <CardContent className="space-y-4 p-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={intake.status} />
                <span className="text-muted-foreground">
                  Submitted {formatDate(intake.submitted_at)} · Budget {intake.budget_range} ·{" "}
                  {intake.timeline}
                </span>
                {intake.regulated_data_ack && <Badge variant="success">acks signed</Badge>}
              </div>
              <p className="leading-relaxed">
                <span className="font-medium text-ink">Goals: </span>
                {intake.goals}
              </p>
              {intake.current_ai_usage && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-ink">AI today: </span>
                  {intake.current_ai_usage}
                </p>
              )}
              {intake.scheduling_preference && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-ink">Scheduling: </span>
                  {intake.scheduling_preference}
                </p>
              )}
              <div className="grid gap-4 border-t border-border pt-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tools ({intakeChildren.tools.length})
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {intakeChildren.tools.map((t) => (
                      <li key={t.id}>
                        {t.name}
                        {t.category && <span className="text-muted-foreground"> · {t.category}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Workflows ({intakeChildren.workflows.length})
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {intakeChildren.workflows.map((w) => (
                      <li key={w.id}>
                        {w.name}
                        {w.hours_per_week != null && (
                          <span className="text-muted-foreground"> · {w.hours_per_week}h/wk</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pain points ({intakeChildren.pains.length})
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {intakeChildren.pains.map((p) => (
                      <li key={p.id}>
                        <Badge variant={p.severity >= 4 ? "danger" : "outline"} className="mr-1.5">
                          {p.severity}
                        </Badge>
                        {p.area}: <span className="text-muted-foreground">{p.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Data sources ({intakeChildren.sources.length})
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {intakeChildren.sources.map((s) => (
                      <li key={s.id}>
                        {s.name}{" "}
                        <Badge
                          variant={
                            s.sensitivity === "regulated"
                              ? "danger"
                              : s.sensitivity === "confidential"
                                ? "warning"
                                : "outline"
                          }
                        >
                          {s.sensitivity}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── Discovery notes ── */}
      <section id="discovery" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Discovery notes</h2>
        <div className="space-y-3">
          {notes?.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge>{titleCase(n.call_type)}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(n.occurred_at)}</span>
                </div>
                <p className="mt-2 leading-relaxed">{n.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addDiscoveryNote} className="space-y-2">
              <input type="hidden" name="organization_id" value={org.id} />
              <div className="flex gap-2">
                <Select name="call_type" defaultValue="discovery" className="h-9 w-44 text-sm">
                  {["fit_call", "discovery", "owner_interview", "working_session", "other"].map((t) => (
                    <option key={t} value={t}>
                      {titleCase(t)}
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea name="summary" required rows={3} placeholder="Call notes…" />
              <Button type="submit" size="sm">
                Add note
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Opportunities ── */}
      <section id="opportunities" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">AI opportunities</h2>
        <div className="space-y-4">
          {opportunities?.map((opp) => {
            const score = scoreByOpp.get(opp.id);
            return (
              <Card key={opp.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink">
                        {opp.title}
                        {score && (
                          <Badge className="ml-2" variant={score.total_score != null && score.total_score >= 7 ? "success" : "default"}>
                            total {score.total_score}
                          </Badge>
                        )}
                      </h3>
                      {opp.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{opp.description}</p>
                      )}
                    </div>
                    <WorkStatusForm
                      action={updateOpportunityStatus}
                      id={opp.id}
                      organizationId={org.id}
                      current={opp.status}
                      statuses={WORK_STATUSES}
                    />
                  </div>
                  <form
                    action={scoreOpportunity}
                    className="mt-4 grid items-end gap-2 border-t border-border pt-4 sm:grid-cols-7"
                  >
                    <input type="hidden" name="opportunity_id" value={opp.id} />
                    <input type="hidden" name="organization_id" value={org.id} />
                    {(
                      [
                        ["impact", score?.impact],
                        ["effort", score?.effort],
                        ["risk", score?.risk],
                        ["data_readiness", score?.data_readiness],
                      ] as const
                    ).map(([field, value]) => (
                      <label key={field} className="text-xs text-muted-foreground">
                        {titleCase(field)}
                        <Select name={field} defaultValue={String(value ?? 3)} className="mt-1 h-8 text-xs">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </Select>
                      </label>
                    ))}
                    <label className="text-xs text-muted-foreground">
                      Owner hrs/wk
                      <Input
                        name="owner_hours_saved_weekly"
                        type="number"
                        step="0.5"
                        min="0"
                        defaultValue={score?.owner_hours_saved_weekly ?? ""}
                        className="mt-1 h-8 text-xs"
                      />
                    </label>
                    <label className="text-xs text-muted-foreground sm:col-span-1">
                      Note
                      <Input name="notes" defaultValue={score?.notes ?? ""} className="mt-1 h-8 text-xs" />
                    </label>
                    <Button type="submit" size="sm" variant="outline">
                      {score ? "Rescore" : "Score"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addOpportunity} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="title" required placeholder="New opportunity title *" className="h-9 text-sm" />
              <Input name="description" placeholder="One-line description" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Add opportunity
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Roadmap ── */}
      <section id="roadmap" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Roadmap</h2>
        <div className="space-y-2">
          {roadmap?.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <span className="mr-2 font-medium text-ink">{item.title}</span>
                <Badge variant="outline">{item.phase}</Badge>
                {item.target_window && (
                  <span className="ml-2 text-xs text-muted-foreground">{item.target_window}</span>
                )}
                {item.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              <WorkStatusForm
                action={updateRoadmapStatus}
                id={item.id}
                organizationId={org.id}
                current={item.status}
                statuses={WORK_STATUSES}
              />
            </div>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addRoadmapItem} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="title" required placeholder="Roadmap item *" className="h-9 text-sm" />
              <Select name="phase" defaultValue="now" className="h-9 text-sm">
                <option value="now">Now</option>
                <option value="next">Next</option>
                <option value="later">Later</option>
              </Select>
              <Input name="target_window" placeholder="e.g., Weeks 1–2" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Add item
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Proposals ── */}
      <section id="proposals" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Proposals</h2>
        <div className="space-y-4">
          {proposals?.map((p) => {
            const items = (lineItems ?? []).filter((li) => li.proposal_id === p.id);
            return (
              <Card key={p.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCents(p.total_amount_cents)} ·{" "}
                        {p.sent_at ? `sent ${formatDate(p.sent_at)}` : "not sent"}
                        {p.valid_until ? ` · valid until ${formatDate(p.valid_until)}` : ""}
                      </p>
                    </div>
                    <form action={updateProposalStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="organization_id" value={org.id} />
                      <Select name="status" defaultValue={p.status} className="h-8 w-32 text-xs">
                        {["draft", "sent", "accepted", "declined"].map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" size="sm" variant="ghost">
                        Set
                      </Button>
                    </form>
                  </div>
                  {p.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                  )}
                  {items.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                      {items.map((li) => (
                        <li key={li.id} className="flex justify-between gap-3">
                          <span>
                            {li.description}
                            {li.quantity > 1 ? ` ×${li.quantity}` : ""}
                          </span>
                          <span className="font-medium text-ink">
                            {formatCents(li.unit_amount_cents * li.quantity, { showZero: true })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form
                    action={addProposalLineItem}
                    className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-[2fr_80px_120px_auto]"
                  >
                    <input type="hidden" name="proposal_id" value={p.id} />
                    <input type="hidden" name="organization_id" value={org.id} />
                    <Input name="description" required placeholder="Line item *" className="h-8 text-xs" />
                    <Input name="quantity" type="number" min="1" defaultValue="1" className="h-8 text-xs" />
                    <Input
                      name="unit_amount_dollars"
                      type="number"
                      step="0.01"
                      placeholder="$ (neg = credit)"
                      className="h-8 text-xs"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Add line
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addProposal} className="grid gap-2 sm:grid-cols-[2fr_2fr_120px_auto]">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="title" required placeholder="Proposal title *" className="h-9 text-sm" />
              <Input name="summary" placeholder="One-line summary" className="h-9 text-sm" />
              <Input name="total_amount_dollars" type="number" step="0.01" placeholder="Total $" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Create proposal
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Deliverables ── */}
      <section id="deliverables" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Deliverables</h2>
        <div className="space-y-2">
          {deliverables?.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <span className="font-medium text-ink">{d.title}</span>
                {d.deliverable_type && (
                  <Badge variant="outline" className="ml-2">
                    {titleCase(d.deliverable_type)}
                  </Badge>
                )}
                {d.due_date && (
                  <span className="ml-2 text-xs text-muted-foreground">due {formatDate(d.due_date)}</span>
                )}
              </div>
              <WorkStatusForm
                action={updateDeliverableStatus}
                id={d.id}
                organizationId={org.id}
                current={d.status}
                statuses={WORK_STATUSES}
              />
            </div>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addDeliverable} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="title" required placeholder="Deliverable title *" className="h-9 text-sm" />
              <Input name="deliverable_type" placeholder="Type (audit_report, sop…)" className="h-9 text-sm" />
              <Input name="due_date" type="date" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Add deliverable
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Tasks ── */}
      <section id="tasks" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Tasks</h2>
        <div className="space-y-2">
          {tasks?.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <span className="font-medium text-ink">{t.title}</span>
                <Badge variant={t.owner === "client" ? "accent" : "outline"} className="ml-2">
                  {t.owner}
                </Badge>
                {t.due_date && (
                  <span className="ml-2 text-xs text-muted-foreground">due {formatDate(t.due_date)}</span>
                )}
              </div>
              <WorkStatusForm
                action={updateTaskStatus}
                id={t.id}
                organizationId={org.id}
                current={t.status}
                statuses={TASK_STATUSES}
              />
            </div>
          ))}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addTask} className="grid gap-2 sm:grid-cols-[2fr_120px_1fr_auto]">
              <input type="hidden" name="organization_id" value={org.id} />
              <Input name="title" required placeholder="Task *" className="h-9 text-sm" />
              <Select name="owner" defaultValue="advisor" className="h-9 text-sm">
                <option value="advisor">Advisor</option>
                <option value="client">Client</option>
              </Select>
              <Input name="due_date" type="date" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Add task
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Messages ── */}
      <section id="messages" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Messages (visible to client)</h2>
        <div className="space-y-2">
          {comments?.map((c) => {
            const author = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
            return (
              <div key={c.id} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-ink">
                    {author?.role === "admin" ? "Ben" : author?.full_name || "Client"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                </div>
                <p className="mt-1 leading-relaxed">{c.body}</p>
              </div>
            );
          })}
        </div>
        <Card>
          <CardContent className="p-4">
            <form action={addComment} className="space-y-2">
              <input type="hidden" name="organization_id" value={org.id} />
              <Textarea name="body" required rows={2} placeholder="Message to client…" />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Activity ── */}
      <section id="activity" className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Recent activity</h2>
        <ul className="space-y-1.5 text-sm">
          {events?.map((e) => (
            <li key={e.id} className="flex items-baseline gap-3 text-muted-foreground">
              <span className="shrink-0 text-xs">{formatDate(e.created_at)}</span>
              <span>
                <span className="font-medium text-ink">{titleCase(e.event_type)}</span>
                {e.entity_type ? ` · ${e.entity_type}` : ""}
              </span>
            </li>
          ))}
          {!events?.length && <li className="text-muted-foreground">No activity logged yet.</li>}
        </ul>
      </section>
    </div>
  );
}
