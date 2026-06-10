import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye, EyeOff, FileText, Printer, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import { isAiDraftingEnabled } from "@/lib/env";
import {
  generateAuditReadout,
  setAuditReadoutStatus,
  toggleReadoutClientVisible,
  updateAuditReadout,
} from "@/lib/actions/operating";
import { READOUT_STATUSES, type AuditReadout } from "@/lib/types/database";
import { formatDate, titleCase } from "@/lib/utils";
import { CopyMarkdownButton } from "./copy-markdown-button";

export const metadata: Metadata = { title: "Audit readout · Admin", robots: { index: false } };

export default async function AdminClientReadoutPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .single();
  if (!org) notFound();

  const { data } = await supabase
    .from("audit_readouts")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  const readouts = (data ?? []) as AuditReadout[];

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/admin/clients/${orgId}`} className="text-sm text-muted-foreground hover:underline">
          ← {org.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-ink">Audit Readout Builder</h1>
          <Link href={`/admin/clients/${orgId}/stack`}>
            <Button variant="outline" size="sm">
              ← Stack builder
            </Button>
          </Link>
        </div>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Generation is <strong>deterministic</strong> — it assembles your intake, discovery,
          opportunity scores, roadmap, and the latest stack recommendation into the standard
          sections. No model writes a word. Edit the draft, then move it draft → reviewed → sent;
          the client sees nothing until you flip &ldquo;client visible.&rdquo;
        </p>
        {!isAiDraftingEnabled() && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            AI drafting is disabled (AI_DRAFTING_ENABLED=false) — the deterministic generator is
            the supported path.
          </p>
        )}
      </div>

      <form action={generateAuditReadout}>
        <input type="hidden" name="organization_id" value={orgId} />
        <Button type="submit">
          <FileText className="h-4 w-4" />
          Generate readout draft from engagement data
        </Button>
      </form>

      {readouts.length === 0 && (
        <Alert>
          <AlertTitle>No readouts yet</AlertTitle>
          <AlertDescription>
            Generate the first draft above. It pulls from the intake, discovery notes, scored
            opportunities, roadmap, and the latest stack recommendation — the more of those exist,
            the more complete the draft.
          </AlertDescription>
        </Alert>
      )}

      {readouts.map((readout) => (
        <Card key={readout.id}>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              {readout.title}
              <span className="ml-2 inline-flex flex-wrap items-center gap-1.5 align-middle">
                <Badge variant={readout.status === "sent" ? "success" : readout.status === "reviewed" ? "default" : "outline"}>
                  {titleCase(readout.status)}
                </Badge>
                <Badge variant={readout.client_visible ? "success" : "outline"}>
                  {readout.client_visible ? "Client visible" : "Internal only"}
                </Badge>
                <span className="text-xs font-normal text-muted-foreground">
                  created {formatDate(readout.created_at)}
                  {readout.reviewed_at ? ` · reviewed ${formatDate(readout.reviewed_at)}` : ""}
                </span>
              </span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <CopyMarkdownButton markdown={readout.generated_markdown} />
              <Link href={`/admin/clients/${orgId}/readout/${readout.id}/print`}>
                <Button size="sm" variant="outline">
                  <Printer className="h-3.5 w-3.5" />
                  Print view
                </Button>
              </Link>
              <form action={setAuditReadoutStatus} className="flex items-center gap-1.5">
                <input type="hidden" name="id" value={readout.id} />
                <input type="hidden" name="organization_id" value={orgId} />
                <Select name="status" defaultValue={readout.status} className="h-8 w-28 text-xs">
                  {READOUT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </Select>
                <Button type="submit" size="sm" variant="ghost">
                  Set
                </Button>
              </form>
              <form action={toggleReadoutClientVisible}>
                <input type="hidden" name="id" value={readout.id} />
                <input type="hidden" name="organization_id" value={orgId} />
                <Button type="submit" size="sm" variant={readout.client_visible ? "outline" : "primary"}>
                  {readout.client_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {readout.client_visible ? "Hide from client" : "Make client visible"}
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updateAuditReadout} className="space-y-3">
              <input type="hidden" name="id" value={readout.id} />
              <input type="hidden" name="organization_id" value={orgId} />
              <Input name="title" defaultValue={readout.title} required className="text-sm" />
              <Textarea
                name="generated_markdown"
                defaultValue={readout.generated_markdown}
                rows={24}
                className="font-mono text-xs leading-relaxed"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm">
                  Save edits
                </Button>
                <span className="text-xs text-muted-foreground">
                  Edits overwrite the generated draft — regenerate to start over from data.
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
