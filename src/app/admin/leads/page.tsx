import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus, convertLeadToOrganization } from "@/lib/actions/admin";
import { LEAD_STATUSES, type Lead } from "@/lib/types/database";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads · Admin", robots: { index: false } };

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Audit applications from the website. Standard: respond within one business day.
        </p>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          body="Applications from /apply land here. Time to send those 50 outreaches — see docs/sales/OUTREACH_EMAILS.md."
        />
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">
                        {lead.company || lead.full_name}
                      </h2>
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(lead.created_at)} · {titleCase(lead.source)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lead.full_name} · <a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lead.industry ?? "Industry —"} · {lead.team_size ?? "Size —"}
                    </p>
                    {lead.biggest_bottleneck && (
                      <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                        <span className="font-medium text-ink">Bottleneck: </span>
                        {lead.biggest_bottleneck}
                      </p>
                    )}
                    {lead.message && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {lead.message}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <form action={updateLeadStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <Select name="status" defaultValue={lead.status} className="h-8 w-36 text-xs">
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" size="sm" variant="outline">
                        Save
                      </Button>
                    </form>
                    {lead.organization_id ? (
                      <Link href={`/admin/clients/${lead.organization_id}`}>
                        <Button size="sm" variant="ghost" className="w-full">
                          Open client →
                        </Button>
                      </Link>
                    ) : (
                      <form action={convertLeadToOrganization}>
                        <input type="hidden" name="id" value={lead.id} />
                        <Button type="submit" size="sm" className="w-full">
                          Convert to client
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
