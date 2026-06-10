import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileText, Search, Users, Map, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { OFFERS } from "@/lib/content";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Operating Audit — $950 founding price",
  description:
    "A paid, two-week AI Operating Audit for Charlottesville owner-led businesses: owner interview, tool inventory, AI opportunity map with data-risk ranking, top 5 scored use cases, and a 30-day roadmap.",
};

const WEEKS = [
  {
    label: "Before you pay",
    title: "Application & fit call",
    body: "Five-minute application, then a free 20-minute call. We confirm there's enough operational substance for the audit to be worth your money. If there isn't, we'll tell you and point you somewhere useful.",
    icon: Users,
  },
  {
    label: "Week 1",
    title: "Intake & owner interview",
    body: "Structured intake covers your tools, recurring workflows, pain points, and where your business knowledge actually lives. Then a 90-minute owner/operator interview — the most valuable 90 minutes of the engagement, because the real operating model is in your head, not your org chart.",
    icon: Search,
  },
  {
    label: "Week 2",
    title: "Analysis & scoring",
    body: "We build your tool and process inventory, map AI opportunities against it, rank your data sources by sensitivity and risk, and score every candidate use case on impact, effort, risk, and data readiness. Where it helps, we build a small mockup on dummy or approved non-sensitive data so you can react to something real.",
    icon: Map,
  },
  {
    label: "Readout",
    title: "Roadmap & working session",
    body: "You get the written audit and a working session to walk through it: your top five use cases, what to do in the next 30 days, what to defer, and what to never automate. The roadmap is yours regardless of whether we work together again.",
    icon: FileText,
  },
];

export default function AuditPage() {
  const audit = OFFERS[0];

  return (
    <>
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pt-20">
          <div className="max-w-3xl">
            <Badge variant="accent" className="mb-5">Start here · Founding offer</Badge>
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              The AI Operating Audit.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Two weeks. A clear-eyed, written answer to the question every owner is quietly asking:
              <em className="text-ink"> where would AI actually help my business — and where would it waste my money or put my data at risk?</em>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply">
                <Button size="lg">
                  Apply for the Founding Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </div>

      {/* Pricing card + includes */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading eyebrow="What you get" title="A deliverable you can act on — with or without us." />
            <ul className="mt-8 space-y-4">
              {audit.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm leading-relaxed text-amber-900">
                  <strong>Honest possibility:</strong> the audit may conclude that parts of your
                  operation shouldn't use AI yet — wrong data shape, wrong risk profile, or a
                  process fix beats a model. That conclusion costs $950 instead of a $20,000
                  mistake, and the roadmap will say what to do instead.
                </p>
              </div>
            </div>
          </div>
          <Card className="h-fit border-pine-600/40 ring-1 ring-pine-600/20">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Founding pricing</CardTitle>
              <CardDescription>First five Charlottesville clients, subject to fit.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-ink">
                {formatCents(audit.foundingPriceCents)}
                <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                  {formatCents(audit.standardPriceCents)}
                </span>
              </p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  $500 credited toward implementation signed within 14 days
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Founding pricing locked for engagements started within 6 months
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Free fit call before any payment
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Delivered personally by the founder
                </li>
              </ul>
              <Link href="/apply" className="mt-6 block">
                <Button className="w-full" size="lg">Apply now</Button>
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Payment is collected only after the fit call, before Week 1.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Process timeline */}
      <div className="section-tint">
        <Section>
          <SectionHeading
            eyebrow="The process"
            title="Two focused weeks. Four steps."
            lede="Designed around an owner's calendar: one interview, one readout, and homework we do — not you."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {WEEKS.map((week) => (
              <Card key={week.title} className="card-hover">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pine-50">
                      <week.icon className="h-5 w-5 text-pine-700" />
                    </div>
                    <Badge variant="outline">{week.label}</Badge>
                  </div>
                  <CardTitle className="mt-2">{week.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{week.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* What happens after */}
      <Section>
        <SectionHeading
          eyebrow="After the audit"
          title="Three honest outcomes."
          lede="Every audit ends in one of these — and all three are wins compared to guessing."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["You implement with us", "Most clients pick one roadmap item and start a two-week Workflow Quickstart. Your $500 credit applies."],
            ["You implement without us", "The roadmap is specific enough to hand to your own team or another builder. That's deliberate."],
            ["You wait — on purpose", "Sometimes the right answer is 'fix the process first' or 'revisit in two quarters.' You'll know exactly what would change the answer."],
          ].map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="leading-relaxed">{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Ready for a straight answer about AI in your business?"
        body="Apply in five minutes. Free 20-minute fit call. $950 founding audit, credited $500 toward implementation if we build together within 14 days."
      />
    </>
  );
}
