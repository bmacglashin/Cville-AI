import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your intake", robots: { index: false } };

export default async function PortalIntakePage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return (
      <EmptyState title="No intake yet" body="Start your audit intake to populate this page.">
        <Link href="/start-audit"><Button>Start the audit intake</Button></Link>
      </EmptyState>
    );
  }

  const supabase = await createClient();
  const orgId = ctx.organization.id;

  const { data: intake } = await supabase
    .from("audit_intakes")
    .select("*")
    .eq("organization_id", orgId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!intake) {
    return (
      <EmptyState
        title="No intake submitted yet"
        body="The intake takes 15–20 minutes and feeds your entire audit."
      >
        <Link href="/start-audit"><Button>Start the audit intake</Button></Link>
      </EmptyState>
    );
  }

  const [{ data: tools }, { data: workflows }, { data: pains }, { data: sources }] =
    await Promise.all([
      supabase.from("tools_inventory").select("*").eq("intake_id", intake.id),
      supabase.from("workflows").select("*").eq("intake_id", intake.id),
      supabase.from("pain_points").select("*").eq("intake_id", intake.id).order("severity", { ascending: false }),
      supabase.from("data_sources").select("*").eq("intake_id", intake.id),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Your intake</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submitted {formatDate(intake.submitted_at)}
          </p>
        </div>
        <StatusBadge status={intake.status} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Goals & context</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{intake.goals}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline">Budget: {intake.budget_range}</Badge>
            <Badge variant="outline">Timeline: {intake.timeline}</Badge>
            {intake.scheduling_preference && (
              <Badge variant="outline">Scheduling: {intake.scheduling_preference}</Badge>
            )}
          </div>
          {intake.current_ai_usage && (
            <p className="text-muted-foreground">
              <span className="font-medium text-ink">AI today:</span> {intake.current_ai_usage}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tools ({tools?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {tools?.map((t) => (
                <li key={t.id}>
                  <span className="font-medium text-ink">{t.name}</span>
                  {t.category && <span className="text-muted-foreground"> · {t.category}</span>}
                  {t.usage_notes && <p className="text-xs text-muted-foreground">{t.usage_notes}</p>}
                </li>
              ))}
              {!tools?.length && <li className="text-muted-foreground">None listed.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Workflows ({workflows?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {workflows?.map((w) => (
                <li key={w.id}>
                  <span className="font-medium text-ink">{w.name}</span>
                  {w.hours_per_week != null && (
                    <span className="text-muted-foreground"> · ~{w.hours_per_week} hrs/wk</span>
                  )}
                  {w.description && <p className="text-xs text-muted-foreground">{w.description}</p>}
                </li>
              ))}
              {!workflows?.length && <li className="text-muted-foreground">None listed.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pain points ({pains?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {pains?.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3">
                  <div>
                    {p.area && <span className="font-medium text-ink">{p.area}: </span>}
                    <span className="text-muted-foreground">{p.description}</span>
                  </div>
                  <Badge variant={p.severity >= 4 ? "danger" : "outline"}>{p.severity}/5</Badge>
                </li>
              ))}
              {!pains?.length && <li className="text-muted-foreground">None listed.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Data sources ({sources?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2.5 text-sm">
              {sources?.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-medium text-ink">{s.name}</span>
                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
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
              {!sources?.length && <li className="text-muted-foreground">None listed.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {intake.additional_notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Additional notes</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {intake.additional_notes}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
