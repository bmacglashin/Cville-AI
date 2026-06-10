import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { PIPELINE_STAGE_LABELS, type Organization } from "@/lib/types/database";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients · Admin", robots: { index: false } };

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("updated_at", { ascending: false });
  const orgs = (data ?? []) as Organization[];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Clients & prospects</h1>

      {orgs.length === 0 ? (
        <EmptyState title="No organizations yet" body="Convert a lead or wait for an intake signup." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link key={org.id} href={`/admin/clients/${org.id}`}>
              <Card className="card-hover h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-ink">{org.name}</h2>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {org.industry ?? "—"} {org.team_size ? `· ${org.team_size}` : ""}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge>{PIPELINE_STAGE_LABELS[org.pipeline_stage]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(org.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
