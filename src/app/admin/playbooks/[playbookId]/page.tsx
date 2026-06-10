import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { updatePlaybook } from "@/lib/actions/operating";
import type { WorkflowPlaybook } from "@/lib/types/database";
import { PlaybookForm } from "../playbook-form";

export const metadata: Metadata = { title: "Edit playbook · Admin", robots: { index: false } };

export default async function EditPlaybookPage({
  params,
  searchParams,
}: {
  params: Promise<{ playbookId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { playbookId } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("workflow_playbooks")
    .select("*")
    .eq("id", playbookId)
    .single();
  if (!data) notFound();
  const playbook = data as WorkflowPlaybook;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/playbooks" className="text-sm text-muted-foreground hover:underline">
          ← Playbooks
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">{playbook.name}</h1>
      </div>
      {saved && (
        <Alert variant="success">
          <AlertDescription>Saved.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="danger">
          <AlertTitle>Not saved</AlertTitle>
          <AlertDescription>
            {error === "steps_json"
              ? "Steps must be valid JSON (an array of step objects)."
              : error === "invalid"
                ? "Check required fields — name, valid slug, valid tool-category keys, and step shapes."
                : "Saving failed — the slug may already exist."}
          </AlertDescription>
        </Alert>
      )}
      <PlaybookForm action={updatePlaybook} playbook={playbook} submitLabel="Save changes" />
    </div>
  );
}
