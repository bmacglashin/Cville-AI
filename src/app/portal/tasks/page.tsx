import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/lib/types/database";

export const metadata: Metadata = { title: "Tasks", robots: { index: false } };

function TaskList({ items }: { items: Task[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={t.owner === "client" ? "accent" : "outline"}>
              {t.owner === "client" ? "Yours" : "Ben's"}
            </Badge>
            {t.due_date && (
              <span className="text-xs text-muted-foreground">due {formatDate(t.due_date)}</span>
            )}
            <StatusBadge status={t.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function PortalTasksPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="No tasks yet" body="Engagement tasks appear here." />;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("sort_order");

  const tasks = (data ?? []) as Task[];
  const open = tasks.filter((t) => t.status !== "done");
  const closed = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Tasks & next steps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who owes what. To update a task, drop a note in Messages — Ben keeps this list current.
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" body="Next steps land here once your engagement starts." />
      ) : (
        <>
          <TaskList items={open} />
          {closed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Completed ({closed.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList items={closed} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
