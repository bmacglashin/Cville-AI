import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import type {
  ClientToolInstance,
  RecommendationType,
  StackRecommendation,
  StackRecommendationItem,
} from "@/lib/types/database";
import { formatCents, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Your operating stack", robots: { index: false } };

const REC_TYPE_VARIANT: Record<RecommendationType, "success" | "default" | "accent" | "danger" | "warning"> = {
  default: "success",
  optional: "default",
  premium: "accent",
  rejected: "danger",
  defer: "warning",
};

/**
 * Read-only view of the client's operating stack: the tools their business
 * runs and any recommendation Ben has deliberately shared. RLS limits this
 * to the member's own org, shared recommendations, and nothing internal.
 */
export default async function PortalStackPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;

  const { organization } = ctx;
  if (!organization) {
    return (
      <EmptyState
        title="No workspace yet"
        body="Your operating stack appears here once your audit is underway."
      />
    );
  }

  const supabase = await createClient();
  const [{ data: instances }, { data: recommendations }] = await Promise.all([
    supabase
      .from("client_tool_instances")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at"),
    supabase
      .from("stack_recommendations")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false }),
  ]);

  const recIds = (recommendations ?? []).map((r) => r.id);
  const { data: items } = recIds.length
    ? await supabase
        .from("stack_recommendation_items")
        .select("*")
        .in("stack_recommendation_id", recIds)
        .order("sort_order")
    : { data: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-ink">Your operating stack</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The tools your business runs and what we&apos;ve recommended — every account owned by
          you. Your accounts. Your data. Our operating method.
        </p>
      </div>

      {/* Recommendations Ben has shared */}
      {((recommendations ?? []) as StackRecommendation[]).map((rec) => {
        const recItems = ((items ?? []) as StackRecommendationItem[]).filter(
          (i) => i.stack_recommendation_id === rec.id
        );
        return (
          <Card key={rec.id}>
            <CardHeader>
              <CardTitle className="text-base">{rec.title}</CardTitle>
              {rec.summary && <CardDescription className="leading-relaxed">{rec.summary}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Setup {formatCents(rec.setup_price_min_cents)}–{formatCents(rec.setup_price_max_cents)}
                </span>
                <span>
                  Operate retainer {formatCents(rec.retainer_min_cents)}
                  {rec.retainer_max_cents && rec.retainer_max_cents !== rec.retainer_min_cents
                    ? `–${formatCents(rec.retainer_max_cents)}`
                    : ""}
                  /mo
                </span>
                <span>Approach: {titleCase(rec.delivery_mode)}</span>
              </div>

              <ul className="space-y-3 border-t border-border pt-4">
                {recItems.map((item) => (
                  <li key={item.id} className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={REC_TYPE_VARIANT[item.recommendation_type]}>
                        {titleCase(item.recommendation_type)}
                      </Badge>
                      <span className="font-medium text-ink">{item.use_case}</span>
                      <span className="text-xs text-muted-foreground">{titleCase(item.tool_category)}</span>
                      {item.monthly_cost_cents != null && (
                        <span className="text-xs text-muted-foreground">
                          ~{formatCents(item.monthly_cost_cents)}/mo
                        </span>
                      )}
                    </div>
                    {item.reason && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
                    )}
                    {item.data_boundary && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine-700" />
                        <span>
                          <span className="font-semibold text-ink">Data boundary:</span> {item.data_boundary}
                        </span>
                      </p>
                    )}
                  </li>
                ))}
                {recItems.length === 0 && (
                  <li className="text-sm text-muted-foreground">Details coming with your readout.</li>
                )}
              </ul>

              {rec.assumptions.length > 0 && (
                <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-ink">Assumptions: </span>
                  {rec.assumptions.join(" · ")}
                </div>
              )}
              {rec.excluded_use_cases.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-ink">Explicitly excluded: </span>
                  {rec.excluded_use_cases.join(" · ")}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {!recommendations?.length && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            No recommended stack has been shared yet — it arrives with your audit readout.
          </CardContent>
        </Card>
      )}

      {/* The tools they run */}
      <section className="space-y-3">
        <h2 className="font-display text-xl text-ink">Tools your business runs</h2>
        <div className="space-y-2">
          {((instances ?? []) as ClientToolInstance[]).map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-ink">{t.tool_name}</span>
                <Badge variant="outline">{titleCase(t.owner_type)}</Badge>
                <Badge
                  variant={
                    t.data_sensitivity === "regulated" || t.data_sensitivity === "prohibited"
                      ? "danger"
                      : t.data_sensitivity === "confidential"
                        ? "warning"
                        : "outline"
                  }
                >
                  {t.data_sensitivity} data
                </Badge>
                <Badge variant="outline">{titleCase(t.status)}</Badge>
              </div>
              {t.purpose && <p className="mt-1 text-xs text-muted-foreground">{t.purpose}</p>}
            </div>
          ))}
          {!instances?.length && (
            <p className="text-sm text-muted-foreground">
              Your tool inventory appears here after intake review.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
