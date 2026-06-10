import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { updateToolVendor } from "@/lib/actions/operating";
import type { ToolVendor } from "@/lib/types/database";
import { VendorForm } from "../vendor-form";

export const metadata: Metadata = { title: "Edit tool · Admin", robots: { index: false } };

export default async function EditToolVendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ toolId: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { toolId } = await params;
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.from("tool_vendors").select("*").eq("id", toolId).single();
  if (!data) notFound();
  const vendor = data as ToolVendor;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/tools" className="text-sm text-muted-foreground hover:underline">
          ← Tool catalog
        </Link>
        <h1 className="mt-2 font-display text-3xl text-ink">{vendor.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {vendor.public_copy_allowed
            ? "May be named in client-facing materials."
            : "Never name this vendor in public copy or client-facing UI (categories only)."}
        </p>
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
            {error === "invalid"
              ? "Check required fields (name; slug must be lowercase letters, numbers, hyphens)."
              : "Saving failed — the slug may already exist."}
          </AlertDescription>
        </Alert>
      )}
      <VendorForm action={updateToolVendor} vendor={vendor} submitLabel="Save changes" />
    </div>
  );
}
