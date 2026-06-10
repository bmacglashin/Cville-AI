import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  type Organization,
} from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pipeline · Admin", robots: { index: false } };

export default async function AdminPipelinePage() {
  const supabase = await createClient();

  const [{ data: orgs }, { count: newLeads }, { count: intakesToReview }] = await Promise.all([
    supabase.from("organizations").select("*").order("updated_at", { ascending: false }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("audit_intakes")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
  ]);

  const organizations = (orgs ?? []) as Organization[];
  const active = organizations.filter(
    (o) => !["closed_lost", "new_inquiry"].includes(o.pipeline_stage)
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Validation goal: 3 paid audits, $2,850+ collected, 1 implementation proposal requested.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/leads">
            <Badge variant={newLeads ? "accent" : "outline"} className="px-3 py-1.5 text-sm">
              {newLeads ?? 0} new lead{newLeads === 1 ? "" : "s"}
            </Badge>
          </Link>
          <Badge variant="outline" className="px-3 py-1.5 text-sm">
            {intakesToReview ?? 0} intake{intakesToReview === 1 ? "" : "s"} to review
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 text-sm">
            {active} active engagement{active === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageOrgs = organizations.filter((o) => o.pipeline_stage === stage);
            return (
              <div key={stage} className="w-60 shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {PIPELINE_STAGE_LABELS[stage]}
                  </h2>
                  <span className="text-xs text-muted-foreground">{stageOrgs.length}</span>
                </div>
                <div className="space-y-3">
                  {stageOrgs.map((org) => (
                    <Link key={org.id} href={`/admin/clients/${org.id}`} className="block">
                      <Card className="card-hover">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">{org.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {org.industry ?? "—"}
                            {org.team_size ? ` · ${org.team_size}` : ""}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDate(org.updated_at)}
                          </p>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                  {stageOrgs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground/60">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
