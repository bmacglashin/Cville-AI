import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { OFFERS } from "@/lib/content";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Owner Command Center Lite — a post-audit path",
  description:
    "A private, human-reviewed AI workspace for owners who've completed an audit and proven ROI on at least one workflow. Founding setup $8,500; Operate retainer from $1,500/month. Not sold standalone.",
};

export default function CommandCenterPage() {
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
              Owner Command Center Lite.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              For owners who've completed an audit, proven ROI on at least one workflow, and want a
              private, human-reviewed AI workspace running parts of the operation — with us
              maintaining and improving it month over month.
            </p>
          </div>
        </Section>
      </div>

      <Section>
        <Alert variant="warning" className="mb-12">
          <AlertTitle>Read this first</AlertTitle>
          <AlertDescription>
            <p>
              We don't sell the Command Center to new clients, and we'd be suspicious of anyone who
              would. It only makes sense after an audit has mapped your data risk and at least one
              Quickstart has proven your team will actually use this. If you're new here, start
              with the <Link href="/audit" className="font-medium underline">AI Operating Audit</Link>.
            </p>
          </AlertDescription>
        </Alert>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading eyebrow="What it is" title="One place where the approved parts of your operation become askable." />
            <ul className="mt-8 space-y-4">
              {offer.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              &ldquo;Approved&rdquo; is the operative word. The corpus contains only documents that
              passed the data-risk review from your audit — no client contracts, no HR records, no
              regulated material. Assistants answer from that corpus and draft for human review.
              Nothing acts on its own, and the monthly meeting exists so a person — Ben — is
              accountable for what the system does and doesn't do.
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
                Retainer covers monitoring, improvement, the monthly optimization meeting, and small
                workflow additions. Cancel with 30 days' notice — everything keeps working and your
                team has the SOPs to run it.
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
            title="How a business earns its way to a Command Center."
          />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["1. Audit", "Data-risk ranking and scored use cases establish what's safe and worth building."],
              ["2. Quickstart(s)", "One workflow proves ROI and — more importantly — that your team adopts it."],
              ["3. Command Center Lite", "The proven workflows get a shared home, a dashboard, and an operating cadence."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display text-xl text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <section className="section-dark">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl leading-tight text-[#f2efe7]">
                The honest first step is the audit.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-pine-100/80">
                If a Command Center is in your future, the audit is where it starts — and if it
                isn't, the audit will save you from buying one.
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
