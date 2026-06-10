import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketing/logo";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ensureOrganization } from "@/lib/actions/org";
import { IntakeWizard } from "./intake-wizard";

export const metadata: Metadata = {
  title: "Audit intake",
  robots: { index: false },
};

export default async function StartAuditPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/start-audit");

  const organizationId = await ensureOrganization();

  let alreadySubmitted = false;
  let organizationName: string | undefined;
  if (organizationId) {
    const [{ data: intake }, { data: org }] = await Promise.all([
      supabase
        .from("audit_intakes")
        .select("id")
        .eq("organization_id", organizationId)
        .limit(1)
        .maybeSingle(),
      supabase.from("organizations").select("name").eq("id", organizationId).single(),
    ]);
    alreadySubmitted = Boolean(intake);
    organizationName = org?.name;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Logo />
          <Link href="/portal" className="text-sm font-medium text-muted-foreground hover:text-ink">
            Your workspace →
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="mb-8">
          <Badge variant="accent" className="mb-3">
            AI Operating Audit · Intake
          </Badge>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            Tell us how the business actually runs.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            15–20 minutes, save-as-you-go. Honest, rough answers beat polished ones — this feeds
            your opportunity map, data-risk ranking, and 30-day roadmap. Don&apos;t paste anything
            sensitive or regulated; we ask for names and descriptions, never file contents.
          </p>
        </div>

        {alreadySubmitted ? (
          <Alert variant="success">
            <AlertTitle>Your intake is already in.</AlertTitle>
            <AlertDescription>
              <p className="mt-1">
                Ben has your submission{organizationName ? ` for ${organizationName}` : ""}. If
                something important changed, add it as a message in your workspace.
              </p>
              <Link href="/portal" className="mt-4 inline-block">
                <Button>Go to your workspace</Button>
              </Link>
            </AlertDescription>
          </Alert>
        ) : (
          <IntakeWizard organizationName={organizationName} />
        )}
      </main>
    </div>
  );
}
