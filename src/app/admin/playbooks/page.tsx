import Link from "next/link";
import type { Metadata } from "next";
import { Copy, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { duplicatePlaybook, togglePlaybookActive } from "@/lib/actions/operating";
import type { WorkflowPlaybook } from "@/lib/types/database";
import { formatCents, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Playbooks · Admin", robots: { index: false } };

export default async function AdminPlaybooksPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workflow_playbooks")
    .select("*")
    .order("active", { ascending: false })
    .order("name");
  const playbooks = (data ?? []) as WorkflowPlaybook[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Workflow playbooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The reusable method library behind every stack recommendation. Internal only.
          </p>
        </div>
        <Link href="/admin/playbooks/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New playbook
          </Button>
        </Link>
      </div>

      {playbooks.length === 0 ? (
        <EmptyState title="No playbooks yet" body="Seed data provides ten — or create the first one." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {playbooks.map((p) => (
            <Card key={p.id} className={p.active ? "" : "opacity-60"}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/playbooks/${p.id}`} className="font-semibold text-ink hover:underline">
                      {p.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.target_icp}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={p.active ? "success" : "outline"}>{p.active ? "Active" : "Inactive"}</Badge>
                    <Badge variant="outline">{titleCase(p.complexity)}</Badge>
                  </div>
                </div>
                {p.pain_addressed && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.pain_addressed}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {formatCents(p.price_min_cents)}–{formatCents(p.price_max_cents)}
                  </span>
                  <span>
                    {p.est_setup_hours_min ?? "—"}–{p.est_setup_hours_max ?? "—"} hrs
                  </span>
                  <span>{p.steps.length} steps</span>
                  <span>Retainer fit {p.retainer_fit}/5</span>
                  <span>{titleCase(p.default_delivery_mode)}</span>
                  {p.human_review_required && <Badge variant="outline">human review</Badge>}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <form action={togglePlaybookActive}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      {p.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                  <form action={duplicatePlaybook}>
                    <input type="hidden" name="id" value={p.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </Button>
                  </form>
                  <Link href={`/admin/playbooks/${p.id}`} className="ml-auto">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
