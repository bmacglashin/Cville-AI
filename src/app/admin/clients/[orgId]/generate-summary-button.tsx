"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runGenerateAuditSummary } from "@/lib/actions/admin";

/**
 * Stub UI for future AI-assisted audit drafting. Calls a server stub that
 * intentionally returns "not implemented" during validation — the audit is
 * written by the advisor. See src/lib/ai/generate-audit-summary.ts.
 */
export function GenerateSummaryButton({ organizationId }: { organizationId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMessage(await runGenerateAuditSummary(organizationId));
          setBusy(false);
        }}
      >
        <Sparkles className="h-4 w-4" />
        Generate audit summary (stub)
      </Button>
      {message && (
        <p className="mt-2 max-w-sm rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
