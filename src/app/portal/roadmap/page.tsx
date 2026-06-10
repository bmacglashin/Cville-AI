import type { Metadata } from "next";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import type { RoadmapItem, RoadmapPhase } from "@/lib/types/database";

export const metadata: Metadata = { title: "Roadmap", robots: { index: false } };

const PHASES: { key: RoadmapPhase; label: string; hint: string }[] = [
  { key: "now", label: "Now", hint: "Next 30 days" },
  { key: "next", label: "Next", hint: "30–90 days" },
  { key: "later", label: "Later", hint: "When the foundations exist" },
];

export default async function PortalRoadmapPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="No roadmap yet" body="Your roadmap is built during the audit." />;
  }

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("roadmap_items")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order");

  const roadmap = (items ?? []) as RoadmapItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Implementation roadmap</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Sequenced deliberately: each phase earns the next. &ldquo;Later&rdquo; items usually wait
          on data or process foundations — not on budget.
        </p>
      </div>

      {roadmap.length === 0 ? (
        <EmptyState title="No roadmap items yet" body="The 30-day roadmap arrives with your audit readout." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {PHASES.map((phase) => {
            const phaseItems = roadmap.filter((r) => r.phase === phase.key);
            return (
              <div key={phase.key}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h2 className="font-display text-xl text-ink">{phase.label}</h2>
                  <span className="text-xs text-muted-foreground">{phase.hint}</span>
                </div>
                <div className="space-y-3">
                  {phaseItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm">{item.title}</CardTitle>
                          <StatusBadge status={item.status} />
                        </div>
                        {item.description && (
                          <CardDescription className="text-xs leading-relaxed">
                            {item.description}
                          </CardDescription>
                        )}
                        {item.target_window && (
                          <Badge variant="outline" className="mt-1 w-fit">
                            {item.target_window}
                          </Badge>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                  {phaseItems.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Nothing in this phase.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
