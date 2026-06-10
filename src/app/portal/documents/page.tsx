import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { formatDate, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Documents", robots: { index: false } };

export default async function PortalDocumentsPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="No documents listed" body="Documents you list in intake appear here." />;
  }

  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("uploaded_documents")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Documents you've listed for potential review during the engagement.
        </p>
      </div>

      <Alert variant="warning">
        <AlertTitle>File upload is intentionally not enabled yet</AlertTitle>
        <AlertDescription>
          <p>
            During the validation period we track document <em>names</em> only. When a workflow
            needs actual file contents, that exchange happens deliberately with Ben — after the
            data-risk review, never through a drag-and-drop box. Never share regulated or sensitive
            files.
          </p>
        </AlertDescription>
      </Alert>

      {!documents?.length ? (
        <EmptyState
          title="No documents listed"
          body="You can list candidate documents during the audit intake."
        />
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{doc.file_name}</p>
                  {doc.notes && <p className="text-xs text-muted-foreground">{doc.notes}</p>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge
                  variant={
                    doc.sensitivity === "regulated"
                      ? "danger"
                      : doc.sensitivity === "confidential"
                        ? "warning"
                        : "outline"
                  }
                >
                  {doc.sensitivity}
                </Badge>
                <Badge variant="outline">{titleCase(doc.status)}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(doc.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
