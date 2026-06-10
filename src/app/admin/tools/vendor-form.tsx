import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPROVAL_STATUSES,
  TOOL_CATEGORIES_DB,
  type ToolVendor,
} from "@/lib/types/database";
import { titleCase } from "@/lib/utils";

/**
 * Shared create/edit form for tool_vendors. Plain HTML form + server action
 * (no client state). jsonb list fields are edited one-entry-per-line.
 */
export function VendorForm({
  action,
  vendor,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  vendor?: ToolVendor;
  submitLabel: string;
}) {
  const lines = (values: string[] | null | undefined) => (values ?? []).join("\n");
  const dateValue = (value: string | null | undefined) => (value ? value.slice(0, 10) : "");

  return (
    <form action={action} className="space-y-6">
      {vendor && <input type="hidden" name="id" value={vendor.id} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity & doctrine</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Name *
            <Input name="name" required defaultValue={vendor?.name ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Slug (blank = from name)
            <Input name="slug" defaultValue={vendor?.slug ?? ""} className="mt-1" pattern="[a-z0-9-]*" />
          </label>
          <label className="text-xs text-muted-foreground">
            Category
            <Select name="category" defaultValue={vendor?.category ?? "other"} className="mt-1">
              {TOOL_CATEGORIES_DB.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground">
            Approval status
            <Select name="approval_status" defaultValue={vendor?.approval_status ?? "needs_review"} className="mt-1">
              {APPROVAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Short description
            <Input name="short_description" defaultValue={vendor?.short_description ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Default use case
            <Input name="default_use_case" defaultValue={vendor?.default_use_case ?? ""} className="mt-1" />
          </label>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="public_copy_allowed"
                defaultChecked={vendor?.public_copy_allowed ?? false}
                className="h-4 w-4"
              />
              Public copy allowed (may be named in client-facing materials)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="client_owned_account_required"
                defaultChecked={vendor?.client_owned_account_required ?? true}
                className="h-4 w-4"
              />
              Client-owned account required
            </label>
            <label className="flex items-center gap-2 text-sm">
              Vendor terms permit rebrand/resale
              <Select
                name="white_label_allowed"
                defaultValue={
                  vendor?.white_label_allowed == null ? "unknown" : vendor.white_label_allowed ? "yes" : "no"
                }
                className="h-8 w-28 text-xs"
              >
                <option value="unknown">Unknown</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vetting (docs/VENDOR_VETTING_CHECKLIST.md)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            DPA status
            <Input name="dpa_status" defaultValue={vendor?.dpa_status ?? ""} className="mt-1" placeholder="needs_review — …" />
          </label>
          <label className="text-xs text-muted-foreground">
            No-training terms
            <Input name="no_training_status" defaultValue={vendor?.no_training_status ?? ""} className="mt-1" placeholder="needs_review — …" />
          </label>
          <label className="text-xs text-muted-foreground">
            Admin controls
            <Input name="admin_controls_status" defaultValue={vendor?.admin_controls_status ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Export path
            <Input name="export_path_status" defaultValue={vendor?.export_path_status ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Max data sensitivity (ceiling — regulated is never approved)
            <Select name="max_data_sensitivity" defaultValue={vendor?.max_data_sensitivity ?? "internal"} className="mt-1">
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
            </Select>
          </label>
          <label className="text-xs text-muted-foreground">
            Support burden
            <Input name="support_burden" defaultValue={vendor?.support_burden ?? ""} className="mt-1" placeholder="low / medium / high" />
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Longevity notes
            <Input name="longevity_notes" defaultValue={vendor?.longevity_notes ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Prohibited use cases (one per line)
            <Textarea name="prohibited_use_cases" rows={4} defaultValue={lines(vendor?.prohibited_use_cases)} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Source links (one per line)
            <Textarea name="source_links" rows={4} defaultValue={lines(vendor?.source_links)} className="mt-1" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & review cadence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Internal notes (never client-visible)
            <Textarea name="internal_notes" rows={4} defaultValue={vendor?.internal_notes ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Public notes (safe to surface in deliverables)
            <Textarea name="public_notes" rows={2} defaultValue={vendor?.public_notes ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Last reviewed
            <Input name="last_reviewed_at" type="date" defaultValue={dateValue(vendor?.last_reviewed_at)} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Next review
            <Input name="next_review_at" type="date" defaultValue={dateValue(vendor?.next_review_at)} className="mt-1" />
          </label>
        </CardContent>
      </Card>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
