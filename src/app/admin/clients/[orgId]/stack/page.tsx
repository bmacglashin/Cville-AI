import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import {
  addClientToolInstance,
  addStackRecommendationItem,
  createStackRecommendation,
  removeStackRecommendationItem,
  setStackRecommendationStatus,
  updateClientToolInstanceStatus,
} from "@/lib/actions/operating";
import { isDeferSensitivity } from "@/lib/safety";
import {
  DELIVERY_MODES,
  RECOMMENDATION_TYPES,
  TOOL_CATEGORIES_DB,
  TOOL_INSTANCE_OWNER_TYPES,
  type ClientToolInstance,
  type OpportunityScore,
  type RecommendationType,
  type StackRecommendation,
  type StackRecommendationItem,
  type ToolVendor,
  type WorkflowPlaybook,
} from "@/lib/types/database";
import { formatCents, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Client stack · Admin", robots: { index: false } };

const REC_TYPE_VARIANT: Record<RecommendationType, "success" | "default" | "accent" | "danger" | "warning"> = {
  default: "success",
  optional: "default",
  premium: "accent",
  rejected: "danger",
  defer: "warning",
};

export default async function AdminClientStackPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const [
    { data: instances },
    { data: recommendations },
    { data: vendors },
    { data: playbooks },
    { data: pains },
    { data: opportunities },
    { data: scores },
  ] = await Promise.all([
    supabase.from("client_tool_instances").select("*").eq("organization_id", orgId).order("created_at"),
    supabase.from("stack_recommendations").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }),
    supabase.from("tool_vendors").select("*").order("name"),
    supabase.from("workflow_playbooks").select("*").eq("active", true).order("name"),
    supabase.from("pain_points").select("*").eq("organization_id", orgId).order("severity", { ascending: false }).limit(6),
    supabase.from("ai_opportunities").select("*").eq("organization_id", orgId).order("created_at"),
    supabase.from("opportunity_scores").select("*").eq("organization_id", orgId),
  ]);

  const recIds = (recommendations ?? []).map((r) => r.id);
  const { data: itemRows } = recIds.length
    ? await supabase
        .from("stack_recommendation_items")
        .select("*")
        .in("stack_recommendation_id", recIds)
        .order("sort_order")
    : { data: [] };

  const vendorById = new Map((vendors ?? []).map((v) => [v.id, v as ToolVendor]));
  const scoreByOpp = new Map(
    ((scores ?? []) as OpportunityScore[]).map((s) => [s.opportunity_id, s])
  );

  return (
    <div className="space-y-10">
      <div>
        <Link href={`/admin/clients/${orgId}`} className="text-sm text-muted-foreground hover:underline">
          ← {org.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-ink">Operating stack</h1>
          <Link href={`/admin/clients/${orgId}/readout`}>
            <Button variant="outline" size="sm">
              Audit readout builder →
            </Button>
          </Link>
        </div>
      </div>

      {/* Safety rails — always visible while composing */}
      <Alert variant="warning">
        <AlertTitle className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Safety rails are active
        </AlertTitle>
        <AlertDescription>
          <p>
            Anything with <strong>regulated</strong> or <strong>prohibited</strong> data
            sensitivity is forced to <strong>defer / decline-or-defer</strong>, and items touching
            HR, tenant screening, credit/lending, healthcare, legal, or student records are
            deferred automatically with the rail reason written into the item. Rejected and
            internal-only catalog vendors cannot be recommended.
          </p>
        </AlertDescription>
      </Alert>

      {/* Audit context for composing */}
      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top pain points (from intake)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(pains ?? []).map((p) => (
                <li key={p.id}>
                  <Badge variant={p.severity >= 4 ? "danger" : "outline"} className="mr-1.5">
                    {p.severity}
                  </Badge>
                  {p.area ? `${p.area}: ` : ""}
                  <span className="text-muted-foreground">{p.description}</span>
                </li>
              ))}
              {!pains?.length && <li className="text-muted-foreground">No intake pain points yet.</li>}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scored opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(opportunities ?? []).map((o) => {
                const score = scoreByOpp.get(o.id);
                return (
                  <li key={o.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{o.title}</span>
                    {score ? (
                      <Badge variant={(score.total_score ?? 0) >= 7 ? "success" : "outline"}>
                        total {score.total_score}
                      </Badge>
                    ) : (
                      <Badge variant="outline">unscored</Badge>
                    )}
                  </li>
                );
              })}
              {!opportunities?.length && (
                <li className="text-muted-foreground">No opportunities yet — score them on the client page.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ── Client tool instances ── */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Tools this business runs</h2>
        <div className="space-y-2">
          {((instances ?? []) as ClientToolInstance[]).map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <span className="font-medium text-ink">{t.tool_name}</span>
                <Badge variant="outline" className="ml-2">
                  {titleCase(t.owner_type)}
                </Badge>
                <Badge
                  variant={isDeferSensitivity(t.data_sensitivity) ? "danger" : t.data_sensitivity === "confidential" ? "warning" : "outline"}
                  className="ml-1.5"
                >
                  {t.data_sensitivity}
                </Badge>
                {t.tool_vendor_id && vendorById.get(t.tool_vendor_id) && (
                  <Badge variant="dark" className="ml-1.5">
                    catalog: {vendorById.get(t.tool_vendor_id)!.approval_status}
                  </Badge>
                )}
                {t.purpose && <p className="mt-1 text-xs text-muted-foreground">{t.purpose}</p>}
                {t.notes && <p className="mt-0.5 text-xs text-muted-foreground">{t.notes}</p>}
              </div>
              <div className="flex items-center gap-3">
                {t.monthly_cost_cents != null && (
                  <span className="text-xs text-muted-foreground">{formatCents(t.monthly_cost_cents)}/mo</span>
                )}
                <form action={updateClientToolInstanceStatus} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="organization_id" value={orgId} />
                  <Select name="status" defaultValue={t.status} className="h-8 w-36 text-xs">
                    {["active", "trial", "needs_migration", "retiring", "retired"].map((s) => (
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
            </div>
          ))}
          {!instances?.length && (
            <p className="text-sm text-muted-foreground">No tools recorded yet — add from the intake inventory.</p>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add tool instance</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addClientToolInstance} className="grid gap-2 sm:grid-cols-3">
              <input type="hidden" name="organization_id" value={orgId} />
              <Input name="tool_name" required placeholder="Tool name *" className="h-9 text-sm" />
              <Select name="tool_vendor_id" defaultValue="" className="h-9 text-sm">
                <option value="">No catalog link</option>
                {(vendors ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.approval_status})
                  </option>
                ))}
              </Select>
              <Select name="owner_type" defaultValue="client_owned" className="h-9 text-sm">
                {TOOL_INSTANCE_OWNER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </Select>
              <Input name="purpose" placeholder="Purpose" className="h-9 text-sm" />
              <Select name="data_sensitivity" defaultValue="internal" className="h-9 text-sm">
                {["public", "internal", "confidential", "regulated", "prohibited"].map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)} data
                  </option>
                ))}
              </Select>
              <Input name="monthly_cost_dollars" type="number" step="0.01" min="0" placeholder="$/month" className="h-9 text-sm" />
              <Input name="review_date" type="date" className="h-9 text-sm" />
              <Input name="notes" placeholder="Notes" className="h-9 text-sm" />
              <Button type="submit" size="sm">
                Add tool
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ── Stack recommendations ── */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Stack recommendations</h2>

        {((recommendations ?? []) as StackRecommendation[]).map((rec) => {
          const items = ((itemRows ?? []) as StackRecommendationItem[]).filter(
            (i) => i.stack_recommendation_id === rec.id
          );
          const railed = rec.delivery_mode === "decline_or_defer" || isDeferSensitivity(rec.overall_data_sensitivity);
          return (
            <Card key={rec.id} className={railed ? "border-red-200" : ""}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{rec.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                      <Badge variant={rec.status === "shared" ? "success" : rec.status === "reviewed" ? "default" : "outline"}>
                        {titleCase(rec.status)}
                      </Badge>
                      <Badge variant={rec.delivery_mode === "decline_or_defer" ? "danger" : "outline"}>
                        {titleCase(rec.delivery_mode)}
                      </Badge>
                      <Badge variant={isDeferSensitivity(rec.overall_data_sensitivity) ? "danger" : "outline"}>
                        {rec.overall_data_sensitivity} data
                      </Badge>
                      <span className="text-muted-foreground">
                        setup {formatCents(rec.setup_price_min_cents)}–{formatCents(rec.setup_price_max_cents)} · retainer{" "}
                        {formatCents(rec.retainer_min_cents)}–{formatCents(rec.retainer_max_cents)}/mo
                      </span>
                    </div>
                  </div>
                  <form action={setStackRecommendationStatus} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={rec.id} />
                    <input type="hidden" name="organization_id" value={orgId} />
                    <Select name="status" defaultValue={rec.status} className="h-8 w-32 text-xs">
                      <option value="draft">Draft</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shared">Shared</option>
                    </Select>
                    <Button type="submit" size="sm" variant="ghost">
                      Set
                    </Button>
                  </form>
                </div>

                {railed && (
                  <Alert variant="danger">
                    <AlertTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Safety rail engaged
                    </AlertTitle>
                    <AlertDescription>
                      This recommendation involves regulated/prohibited data or restricted areas —
                      delivery is decline-or-defer and must stay that way.
                    </AlertDescription>
                  </Alert>
                )}

                {rec.summary && <p className="text-sm leading-relaxed text-muted-foreground">{rec.summary}</p>}

                {rec.assumptions.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-ink">Assumptions: </span>
                    {rec.assumptions.join(" · ")}
                  </div>
                )}
                {rec.excluded_use_cases.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-ink">Excluded: </span>
                    {rec.excluded_use_cases.join(" · ")}
                  </div>
                )}

                {/* Items */}
                <ul className="space-y-2 border-t border-border pt-3">
                  {items.map((item) => {
                    const vendor = item.tool_vendor_id ? vendorById.get(item.tool_vendor_id) : undefined;
                    return (
                      <li key={item.id} className="flex flex-wrap items-start justify-between gap-2 text-sm">
                        <div className="min-w-0">
                          <Badge variant={REC_TYPE_VARIANT[item.recommendation_type]} className="mr-1.5">
                            {titleCase(item.recommendation_type)}
                          </Badge>
                          <span className="font-medium text-ink">{item.use_case}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {titleCase(item.tool_category)}
                            {vendor ? ` · ${vendor.name}` : ""}
                            {item.monthly_cost_cents != null ? ` · ${formatCents(item.monthly_cost_cents)}/mo` : ""}
                          </span>
                          {item.reason && (
                            <p className={`mt-0.5 text-xs ${item.reason.startsWith("Safety rail") ? "font-medium text-danger" : "text-muted-foreground"}`}>
                              {item.reason}
                            </p>
                          )}
                          {item.data_boundary && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              <span className="font-semibold">Data boundary:</span> {item.data_boundary}
                            </p>
                          )}
                        </div>
                        <form action={removeStackRecommendationItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="organization_id" value={orgId} />
                          <Button type="submit" size="sm" variant="ghost" className="text-xs text-muted-foreground">
                            Remove
                          </Button>
                        </form>
                      </li>
                    );
                  })}
                  {items.length === 0 && <li className="text-sm text-muted-foreground">No items yet.</li>}
                </ul>

                {/* Add item — from playbook, catalog vendor, or category */}
                <form action={addStackRecommendationItem} className="grid gap-2 border-t border-border pt-3 sm:grid-cols-3">
                  <input type="hidden" name="stack_recommendation_id" value={rec.id} />
                  <input type="hidden" name="organization_id" value={orgId} />
                  <Select name="playbook_id" defaultValue="" className="h-9 text-sm">
                    <option value="">No playbook</option>
                    {((playbooks ?? []) as WorkflowPlaybook[]).map((p) => (
                      <option key={p.id} value={p.id}>
                        Playbook: {p.name}
                      </option>
                    ))}
                  </Select>
                  <Select name="tool_vendor_id" defaultValue="" className="h-9 text-sm">
                    <option value="">No specific vendor</option>
                    {(vendors ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.approval_status})
                      </option>
                    ))}
                  </Select>
                  <Select name="tool_category" defaultValue="other" className="h-9 text-sm">
                    {TOOL_CATEGORIES_DB.map((c) => (
                      <option key={c} value={c}>
                        {titleCase(c)}
                      </option>
                    ))}
                  </Select>
                  <Select name="recommendation_type" defaultValue="default" className="h-9 text-sm">
                    {RECOMMENDATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {titleCase(t)}
                      </option>
                    ))}
                  </Select>
                  <Input name="use_case" placeholder="Use case (blank = playbook name)" className="h-9 text-sm sm:col-span-2" />
                  <Input name="reason" placeholder="Reason (required for rejected/defer)" className="h-9 text-sm sm:col-span-2" />
                  <Input name="data_boundary" placeholder="Data boundary" className="h-9 text-sm" />
                  <Input name="monthly_cost_dollars" type="number" step="0.01" min="0" placeholder="$/month" className="h-9 text-sm" />
                  <Input name="sort_order" type="number" min="0" placeholder="Sort" className="h-9 text-sm" />
                  <Button type="submit" size="sm">
                    Add item
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}

        {/* New recommendation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New stack recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createStackRecommendation} className="grid gap-2 sm:grid-cols-2">
              <input type="hidden" name="organization_id" value={orgId} />
              <Input name="title" required placeholder="Title *" className="h-9 text-sm sm:col-span-2" />
              <Textarea name="summary" rows={2} placeholder="Summary — existing tools first; what this stack does and doesn't do" className="sm:col-span-2" />
              <label className="text-xs text-muted-foreground">
                Delivery mode
                <Select name="delivery_mode" defaultValue="existing_tools" className="mt-1 h-9 text-sm">
                  {DELIVERY_MODES.map((m) => (
                    <option key={m} value={m}>
                      {titleCase(m)}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="text-xs text-muted-foreground">
                Overall data sensitivity (regulated/prohibited ⇒ decline-or-defer)
                <Select name="overall_data_sensitivity" defaultValue="internal" className="mt-1 h-9 text-sm">
                  {["public", "internal", "confidential", "regulated", "prohibited"].map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="text-xs text-muted-foreground">
                Assumptions (one per line)
                <Textarea name="assumptions" rows={3} className="mt-1" />
              </label>
              <label className="text-xs text-muted-foreground">
                Excluded use cases (one per line)
                <Textarea name="excluded_use_cases" rows={3} className="mt-1" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input name="setup_price_min_dollars" type="number" step="0.01" min="0" placeholder="Setup min $" className="h-9 text-sm" />
                <Input name="setup_price_max_dollars" type="number" step="0.01" min="0" placeholder="Setup max $" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input name="retainer_min_dollars" type="number" step="0.01" min="0" placeholder="Retainer min $/mo" className="h-9 text-sm" />
                <Input name="retainer_max_dollars" type="number" step="0.01" min="0" placeholder="Retainer max $/mo" className="h-9 text-sm" />
              </div>
              <Button type="submit" size="sm" className="sm:col-span-2 sm:justify-self-start">
                Create recommendation (draft)
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
