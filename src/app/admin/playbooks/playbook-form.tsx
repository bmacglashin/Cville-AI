import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DELIVERY_MODES,
  PLAYBOOK_COMPLEXITIES,
  TOOL_CATEGORIES_DB,
  type WorkflowPlaybook,
} from "@/lib/types/database";
import { titleCase } from "@/lib/utils";

/**
 * Shared create/edit form for workflow_playbooks. Steps are edited as a
 * validated JSON textarea (ordered array of step objects) — deliberately no
 * client-side editor and no separate steps table.
 */
export function PlaybookForm({
  action,
  playbook,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  playbook?: WorkflowPlaybook;
  submitLabel: string;
}) {
  const stepsJson = JSON.stringify(
    playbook?.steps ?? [
      {
        title: "",
        description: "",
        owner_role: "advisor",
        tool_category: "llm_assistant",
        human_review: true,
        output_artifact: "",
      },
    ],
    null,
    2
  );

  return (
    <form action={action} className="space-y-6">
      {playbook && <input type="hidden" name="id" value={playbook.id} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Playbook</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Name *
            <Input name="name" required defaultValue={playbook?.name ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Slug (blank = from name)
            <Input name="slug" defaultValue={playbook?.slug ?? ""} className="mt-1" pattern="[a-z0-9-]*" />
          </label>
          <label className="text-xs text-muted-foreground">
            Target ICP
            <Input name="target_icp" defaultValue={playbook?.target_icp ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Complexity
            <Select name="complexity" defaultValue={playbook?.complexity ?? "medium"} className="mt-1">
              {PLAYBOOK_COMPLEXITIES.map((c) => (
                <option key={c} value={c}>
                  {titleCase(c)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Pain addressed
            <Textarea name="pain_addressed" rows={2} defaultValue={playbook?.pain_addressed ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Description
            <Textarea name="description" rows={3} defaultValue={playbook?.description ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Default delivery mode
            <Select
              name="default_delivery_mode"
              defaultValue={playbook?.default_delivery_mode ?? "existing_tools"}
              className="mt-1"
            >
              {DELIVERY_MODES.map((m) => (
                <option key={m} value={m}>
                  {titleCase(m)}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground">
            Max data sensitivity
            <Select
              name="max_data_sensitivity"
              defaultValue={playbook?.max_data_sensitivity ?? "internal"}
              className="mt-1"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
            </Select>
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Default tool categories (one per line — valid keys:{" "}
            {TOOL_CATEGORIES_DB.join(", ")})
            <Textarea
              name="default_tool_categories"
              rows={3}
              defaultValue={(playbook?.default_tool_categories ?? []).join("\n")}
              className="mt-1 font-mono text-xs"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Steps (ordered JSON array — title, description, owner_role, tool_category,
            human_review, output_artifact)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea name="steps" rows={16} defaultValue={stepsJson} className="font-mono text-xs" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Economics & metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            Est. setup hours (min)
            <Input name="est_setup_hours_min" type="number" step="0.5" min="0" defaultValue={playbook?.est_setup_hours_min ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Est. setup hours (max)
            <Input name="est_setup_hours_max" type="number" step="0.5" min="0" defaultValue={playbook?.est_setup_hours_max ?? ""} className="mt-1" />
          </label>
          <label className="text-xs text-muted-foreground">
            Price min ($)
            <Input
              name="price_min_dollars"
              type="number"
              step="0.01"
              min="0"
              defaultValue={playbook?.price_min_cents != null ? playbook.price_min_cents / 100 : ""}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Price max ($)
            <Input
              name="price_max_dollars"
              type="number"
              step="0.01"
              min="0"
              defaultValue={playbook?.price_max_cents != null ? playbook.price_max_cents / 100 : ""}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Retainer fit (1–5)
            <Select name="retainer_fit" defaultValue={String(playbook?.retainer_fit ?? 3)} className="mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs text-muted-foreground sm:col-span-2">
            Success metrics (one per line)
            <Textarea name="success_metrics" rows={3} defaultValue={(playbook?.success_metrics ?? []).join("\n")} className="mt-1" />
          </label>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="human_review_required"
                defaultChecked={playbook?.human_review_required ?? true}
                className="h-4 w-4"
              />
              Human review required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={playbook?.active ?? true} className="h-4 w-4" />
              Active
            </label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
