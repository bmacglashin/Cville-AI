import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MarkdownView } from "@/lib/markdown";
import type { AuditReadout } from "@/lib/types/database";

export const metadata: Metadata = { title: "Readout print view · Admin", robots: { index: false } };

/**
 * Print-friendly readout view (browser print → paper/PDF; deliberately no
 * PDF library). The admin chrome hides itself via print:hidden.
 */
export default async function ReadoutPrintPage({
  params,
}: {
  params: Promise<{ orgId: string; readoutId: string }>;
}) {
  const { orgId, readoutId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_readouts")
    .select("*")
    .eq("id", readoutId)
    .eq("organization_id", orgId)
    .single();
  if (!data) notFound();
  const readout = data as AuditReadout;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href={`/admin/clients/${orgId}/readout`} className="text-sm text-muted-foreground hover:underline">
          ← Readout builder
        </Link>
        <p className="text-xs text-muted-foreground">
          Use your browser&apos;s print dialog (Cmd/Ctrl+P) to print or save as PDF.
        </p>
      </div>
      <article className="rounded-xl border border-border bg-card p-8 print:rounded-none print:border-0 print:bg-white print:p-0">
        <MarkdownView markdown={readout.generated_markdown} />
      </article>
    </div>
  );
}
