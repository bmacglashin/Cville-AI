import Link from "next/link";
import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createPlaybook } from "@/lib/actions/operating";
import { PlaybookForm } from "../playbook-form";

export const metadata: Metadata = { title: "New playbook · Admin", robots: { index: false } };

export default async function NewPlaybookPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/playbooks" className="text-sm text-muted-foreground hover:underline">
          ← Playbooks
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">New workflow playbook</h1>
      </div>
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
      <PlaybookForm action={createPlaybook} submitLabel="Create playbook" />
    </div>
  );
}
