import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your workspace", robots: { index: false } };

export default async function PortalOverviewPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;

  const { organization, profile } = ctx;

  if (!organization) {
    return (
      <EmptyState
        title="Let's set up your workspace"
        body="Start your audit intake and your workspace will assemble itself around it."
      >
        <Link href="/start-audit">
          <Button>Start the audit intake</Button>
        </Link>
      </EmptyState>
    );
  }

  const supabase = await createClient();
  const [{ data: intake }, { data: scores }, { data: deliverables }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("audit_intakes")
        .select("id,status,submitted_at")
        .eq("organization_id", organization.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("opportunity_scores")
        .select("total_score")
        .eq("organization_id", organization.id),
      supabase
        .from("deliverables")
        .select("id,title,status,due_date")
        .eq("organization_id", organization.id)
        .order("updated_at", { ascending: false })
        .limit(4),
      supabase
        .from("tasks")
        .select("id,title,status,owner,due_date")
        .eq("organization_id", organization.id)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
    ]);

  // Simple readiness proxy until formal audit scoring lands: average scored
  // opportunity total (-8..14) mapped to 0–100.
  const readiness =
    scores && scores.length > 0
      ? Math.round(
          ((scores.reduce((sum, s) => sum + (s.total_score ?? 0), 0) / scores.length + 8) / 22) * 100
        )
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">
          {organization.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}. Here's
          where things stand.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Engagement stage</CardDescription>
            <CardTitle className="text-lg">
              {PIPELINE_STAGE_LABELS[organization.pipeline_stage]}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Audit intake</CardDescription>
            <CardTitle className="text-lg">
              {intake ? (
                <span className="flex items-center gap-2">
                  <StatusBadge status={intake.status} />
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatDate(intake.submitted_at)}
                  </span>
                </span>
              ) : (
                <Link href="/start-audit" className="text-bronze-700 underline">
                  Start intake →
                </Link>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>AI readiness signal</CardDescription>
            <CardTitle className="text-lg">
              {readiness !== null ? (
                <>
                  {readiness}
                  <span className="text-sm font-normal text-muted-foreground">/100 · from scored use cases</span>
                </>
              ) : (
                <Badge variant="outline">Pending audit</Badge>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent deliverables</CardTitle>
            <Link href="/portal/deliverables" className="text-sm text-bronze-700 hover:underline">
              All <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {deliverables?.length ? (
              <ul className="space-y-3">
                {deliverables.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-ink">{d.title}</span>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Deliverables appear here once your audit is underway.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Open tasks</CardTitle>
            <Link href="/portal/tasks" className="text-sm text-bronze-700 hover:underline">
              All <ArrowRight className="inline h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {tasks?.length ? (
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-ink">{t.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t.owner === "client" ? "yours" : "Ben's"}
                        {t.due_date ? ` · due ${formatDate(t.due_date)}` : ""}
                      </span>
                    </span>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No open tasks. Enjoy it.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
