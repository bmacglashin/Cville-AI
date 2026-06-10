import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Deliverables", robots: { index: false } };

export default async function PortalDeliverablesPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="No deliverables yet" body="Deliverables appear once your audit begins." />;
  }

  const supabase = await createClient();
  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Deliverables</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit reports, SOPs, mockups, and briefs from your engagement.
        </p>
      </div>

      {!deliverables?.length ? (
        <EmptyState title="Nothing delivered yet" body="Your audit report will be the first item here." />
      ) : (
        <div className="space-y-4">
          {deliverables.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{d.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {d.deliverable_type && (
                      <Badge variant="outline">{titleCase(d.deliverable_type)}</Badge>
                    )}
                    <StatusBadge status={d.status} />
                  </div>
                </div>
                {d.description && (
                  <CardDescription className="leading-relaxed">{d.description}</CardDescription>
                )}
                <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                  {d.due_date && <span>Due {formatDate(d.due_date)}</span>}
                  {d.link_url && (
                    <a
                      href={d.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-bronze-700 hover:underline"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
