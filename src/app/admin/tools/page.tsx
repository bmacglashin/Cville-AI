import Link from "next/link";
import type { Metadata } from "next";
import { Plus, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import {
  APPROVAL_STATUSES,
  TOOL_CATEGORIES_DB,
  type ApprovalStatus,
  type ToolCategory,
  type ToolVendor,
} from "@/lib/types/database";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Tool catalog · Admin", robots: { index: false } };

const APPROVAL_VARIANT: Record<ApprovalStatus, "success" | "default" | "warning" | "dark" | "danger" | "outline"> = {
  approved: "success",
  conditional: "default",
  experimental: "warning",
  internal_only: "dark",
  rejected: "danger",
  needs_review: "outline",
};

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const { category, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("tool_vendors").select("*").order("category").order("name");
  if (category && (TOOL_CATEGORIES_DB as string[]).includes(category)) {
    query = query.eq("category", category as ToolCategory);
  }
  if (status && (APPROVAL_STATUSES as string[]).includes(status)) {
    query = query.eq("approval_status", status as ApprovalStatus);
  }
  const { data } = await query;
  const vendors = (data ?? []) as ToolVendor[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Tool catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal vendor doctrine — vetting status, data ceilings, naming rules. Never
            client-visible. See docs/TOOL_DOCTRINE.md.
          </p>
        </div>
        <Link href="/admin/tools/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add tool
          </Button>
        </Link>
      </div>

      {/* Filters — plain GET form, no client state */}
      <form method="get" className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <label className="text-xs text-muted-foreground">
          Category
          <select
            name="category"
            defaultValue={category ?? ""}
            className="mt-1 block h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="">All</option>
            {TOOL_CATEGORIES_DB.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Approval
          <select
            name="status"
            defaultValue={status ?? ""}
            className="mt-1 block h-8 rounded-md border border-border bg-background px-2 text-xs"
          >
            <option value="">All</option>
            {APPROVAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="sm" variant="outline">
          Filter
        </Button>
        {(category || status) && (
          <Link href="/admin/tools" className="text-xs text-muted-foreground underline">
            Clear
          </Link>
        )}
      </form>

      {vendors.length === 0 ? (
        <EmptyState title="No tools match" body="Adjust the filters or add a tool to the catalog." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3">Max sensitivity</th>
                <th className="px-4 py-3">Public copy?</th>
                <th className="px-4 py-3">Client-owned?</th>
                <th className="px-4 py-3">Last / next review</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tools/${v.id}`} className="font-medium text-ink hover:underline">
                      {v.name}
                    </Link>
                    {(v.approval_status === "internal_only" || v.approval_status === "rejected") && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-danger">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {v.approval_status === "rejected" ? "do not recommend" : "internal only"}
                      </span>
                    )}
                    {v.short_description && (
                      <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{v.short_description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{titleCase(v.category)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={APPROVAL_VARIANT[v.approval_status]}>{titleCase(v.approval_status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={v.max_data_sensitivity === "confidential" ? "warning" : "outline"}>
                      {v.max_data_sensitivity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{v.public_copy_allowed ? "Yes" : <span className="font-medium text-danger">No</span>}</td>
                  <td className="px-4 py-3">{v.client_owned_account_required ? "Required" : "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(v.last_reviewed_at)} / {formatDate(v.next_review_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
