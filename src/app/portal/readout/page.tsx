import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { MarkdownView } from "@/lib/markdown";
import type { AuditReadout } from "@/lib/types/database";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Your audit readout", robots: { index: false } };

/**
 * Client-visible audit readouts, rendered from markdown. RLS only returns
 * rows Ben has deliberately flagged client_visible for this org.
 */
export default async function PortalReadoutPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;

  const { organization } = ctx;
  if (!organization) {
    return (
      <EmptyState
        title="No workspace yet"
        body="Your audit readout appears here once it's been delivered."
      />
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_readouts")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });
  const readouts = (data ?? []) as AuditReadout[];

  if (readouts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-ink">Audit readout</h1>
        <EmptyState
          title="Not delivered yet"
          body="Your written audit readout will appear here when Ben shares it. You'll walk through it together in a working session."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-ink">Audit readout</h1>
      {readouts.map((readout) => (
        <Card key={readout.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {readout.title}
              <Badge variant={readout.status === "sent" ? "success" : "outline"}>
                {titleCase(readout.status)}
              </Badge>
              <span className="text-xs font-normal text-muted-foreground">
                {formatDate(readout.reviewed_at ?? readout.created_at)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownView markdown={readout.generated_markdown} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
