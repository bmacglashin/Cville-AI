import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import type { AiOpportunity, OpportunityScore } from "@/lib/types/database";

export const metadata: Metadata = { title: "Opportunities", robots: { index: false } };

export default async function PortalOpportunitiesPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="Nothing here yet" body="Opportunities appear after your audit." />;
  }

  const supabase = await createClient();
  const [{ data: opportunities }, { data: scores }] = await Promise.all([
    supabase
      .from("ai_opportunities")
      .select("*")
      .eq("organization_id", ctx.organization.id)
      .order("created_at"),
    supabase.from("opportunity_scores").select("*").eq("organization_id", ctx.organization.id),
  ]);

  const scoreByOpp = new Map<string, OpportunityScore>(
    (scores ?? []).map((s) => [s.opportunity_id, s])
  );
  const sorted = [...((opportunities ?? []) as AiOpportunity[])].sort(
    (a, b) =>
      (scoreByOpp.get(b.id)?.total_score ?? -99) - (scoreByOpp.get(a.id)?.total_score ?? -99)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">AI opportunities</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Use cases identified in your audit, scored on impact, effort, risk, and data readiness.
          Higher total = better first bet. Scores are advisor judgment, not magic.
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          body="These are produced during your audit's analysis week."
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((opp) => {
            const score = scoreByOpp.get(opp.id);
            return (
              <Card key={opp.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{opp.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {score && (
                        <Badge variant={score.total_score != null && score.total_score >= 7 ? "success" : "default"}>
                          score {score.total_score}
                        </Badge>
                      )}
                      <StatusBadge status={opp.status} />
                    </div>
                  </div>
                  {opp.description && (
                    <CardDescription className="leading-relaxed">{opp.description}</CardDescription>
                  )}
                </CardHeader>
                {score && (
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      {(
                        [
                          ["Impact", score.impact],
                          ["Effort", score.effort],
                          ["Risk", score.risk],
                          ["Data readiness", score.data_readiness],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-muted/50 p-3">
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-0.5 font-semibold text-ink">{value}/5</dd>
                        </div>
                      ))}
                    </dl>
                    {score.owner_hours_saved_weekly != null && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Est. owner time recovered: ~{score.owner_hours_saved_weekly} hrs/week
                      </p>
                    )}
                    {score.notes && (
                      <p className="mt-2 text-sm italic text-muted-foreground">“{score.notes}”</p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
