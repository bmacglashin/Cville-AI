import Link from "next/link";
import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createToolVendor } from "@/lib/actions/operating";
import { VendorForm } from "../vendor-form";

export const metadata: Metadata = { title: "Add tool · Admin", robots: { index: false } };

export default async function NewToolVendorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/tools" className="text-sm text-muted-foreground hover:underline">
          ← Tool catalog
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">Add a tool to the catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New tools default to <strong>needs_review</strong> — run docs/VENDOR_VETTING_CHECKLIST.md
          before recommending to a paying client.
        </p>
      </div>
      {error && (
        <Alert variant="danger">
          <AlertTitle>Not saved</AlertTitle>
          <AlertDescription>
            {error === "invalid"
              ? "Check required fields (name; slug must be lowercase letters, numbers, hyphens)."
              : "Saving failed — the slug may already exist."}
          </AlertDescription>
        </Alert>
      )}
      <VendorForm action={createToolVendor} submitLabel="Add tool" />
    </div>
  );
}
