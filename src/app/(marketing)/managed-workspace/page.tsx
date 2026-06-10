import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { ToolCategoriesSection } from "@/components/marketing/tool-categories";
import { OFFERS, POSITIONING } from "@/lib/content";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Managed AI Workspace + Operate — a post-audit path",
  description:
    "Client-owned tools configured into a documented AI operating stack, with a monthly operating cadence behind it. Founding setup $8,500; Operate retainer from $1,500/month. Post-audit only — not a private platform.",
};

export default function ManagedWorkspacePage() {
  const offer = OFFERS[2];

  return (
    <>
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pt-20">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-5">
              <Lock className="h-3 w-3" />
              Post-audit path — not sold standalone
            </Badge>
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              The Managed AI Workspace.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              For owners who've completed an audit, proven ROI on at least one workflow, and want
              their proven workflows configured into one documented operating stack — built in
              tools your business owns, with us operating and improving it month over month.
            </p>
            <p className="mt-4 text-sm font-medium text-ink">{POSITIONING.ownership}</p>
          </div>
        </Section>
      </div>

      <Section>
        <Alert variant="warning" className="mb-12">
          <AlertTitle>Read this first</AlertTitle>
          <AlertDescription>
            <p>
              This is not a private platform, and we don't sell it to new clients. It only makes
              sense after an audit has mapped your data risk and at least one Quickstart has proven
              your team will actually use this. If you're new here, start with the{" "}
              <Link href="/audit" className="font-medium underline">AI Operating Audit</Link>.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="What it is"
              title="Your proven workflows, documented and operated as one system — in your own tools."
            />
            <ul className="mt-8 space-y-4">
              {offer.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              &ldquo;Client-owned&rdquo; is the operative phrase. Every tool is set up in accounts
              your business controls — your logins, your data, your billing relationships. What we
              bring is the operating method: which workflows run where, what data each tool may
              touch, the prompts and SOPs your team follows, the human-review rules, and a monthly
              cadence that keeps it all working. Cancel the retainer and the workflows keep
              running, because they were always yours.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {POSITIONING.existingFirst} Where an audit shows a genuine gap that off-the-shelf
              tools can't close, a custom build (typically Supabase/Next.js) can be scoped — under
              its own paid statement of work, after the audit, and only when ROI, data risk,
              scope, and budget all justify it. That's the exception, and we treat it that way.
            </p>
          </div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Founding pricing</CardTitle>
              <CardDescription>Available only after an AI Operating Audit.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-ink">
                {formatCents(offer.foundingPriceCents)} <span className="text-base font-normal text-muted-foreground">setup</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-through">
                {formatCents(offer.standardPriceCents)} standard
              </p>
              <p className="mt-4 text-2xl font-semibold text-ink">
                $1,500<span className="text-base font-normal text-muted-foreground">/month Operate retainer</span>
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                The retainer covers the monthly operating cadence: workflow health checks,
                output-quality review, prompt and SOP updates, team refreshers, and a prioritized
                improvement backlog. Cancel with 30 days&apos; notice — everything keeps working in
                your accounts and your team has the SOPs to run it.
              </p>
              <Link href="/apply" className="mt-6 block">
                <Button variant="outline" className="w-full">
                  Start with the audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Section>

      <div className="section-tint">
        <Section>
          <SectionHeading
            eyebrow="The path here"
            title="How a business earns its way to a Managed AI Workspace."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["1. Audit", "Data-risk ranking, scored use cases, and a recommended stack establish what's safe and worth building."],
              ["2. Quickstart(s)", "One workflow in your existing tools proves ROI and — more importantly — that your team adopts it."],
              ["3. Managed AI Workspace", "The proven workflows get documented as one operating stack, with training and a monthly operating cadence."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <ToolCategoriesSection />

      <section className="section-dark">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl leading-tight text-[#f2efe7]">
                The honest first step is the audit.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-pine-100/80">
                If a Managed AI Workspace is in your future, the audit is where it starts — and if
                it isn't, the audit will save you from buying one.
              </p>
            </div>
            <Link href="/apply">
              <Button size="lg" variant="accent">
                Apply for the Founding Audit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
