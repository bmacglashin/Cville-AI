import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";

const VARIANTS: Record<string, "default" | "accent" | "outline" | "success" | "warning" | "danger" | "dark"> = {
  // work_status
  backlog: "outline",
  advisor_review: "default",
  client_review: "accent",
  in_progress: "default",
  done: "success",
  // task_status
  todo: "outline",
  blocked: "danger",
  // intake_status
  draft: "outline",
  submitted: "default",
  in_review: "default",
  complete: "success",
  // lead_status
  new: "accent",
  contacted: "default",
  qualified: "default",
  converted: "success",
  closed: "outline",
  // proposal_status
  sent: "default",
  accepted: "success",
  declined: "outline",
  // pipeline highlights
  closed_lost: "outline",
  retainer_active: "success",
  implementation_active: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={VARIANTS[status] ?? "outline"}>{titleCase(status)}</Badge>;
}
