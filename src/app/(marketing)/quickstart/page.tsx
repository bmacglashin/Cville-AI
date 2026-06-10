import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { OFFERS, EXAMPLE_WORKFLOWS } from "@/lib/content";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "AI Workflow Quickstart — one workflow, two weeks",
  description:
    "One practical AI workflow from your audit roadmap, built and working in your business in two weeks. Proposal assistants, SOP assistants, inquiry triage, handoff checklists, and more. $3,500 founding price.",
};

export default function QuickstartPage() {
  const quickstart = OFFERS[1];

  return (
    <>
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pt-20">
          <div className="max-w-3xl">
            <Badge className="mb-5">After the audit</Badge>
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              The AI Workflow Quickstart.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              One workflow from your audit roadmap. Two weeks. Working in tools your business
              already owns, with a written SOP your team can run without us. No custom platform,
              no rip-and-replace, no twelve-month transformation program.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply">
                <Button size="lg">
                  Start with the audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#examples">
                <Button size="lg" variant="outline">See example workflows</Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Founding price: <span className="font-semibold text-ink">{formatCents(quickstart.foundingPriceCents)}</span>{" "}
              <span className="text-muted-foreground/70">(standard $4,500–$5,000)</span> · Quickstarts
              follow an audit so we're building the right thing.
            </p>
          </div>
        </Section>
      </div>

      {/* What's included */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="The deal" title="Scoped tight, on purpose." />
            <ul className="mt-8 space-y-4">
              {quickstart.includes.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Why one workflow" title="Because big-bang AI projects fail in small businesses." />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              The pattern we refuse to repeat: a vendor sells a &ldquo;transformation,&rdquo; six
              tools get half-installed, the team quietly goes back to the old way, and the owner
              concludes AI was hype. One workflow in two weeks gives you the opposite: something
              your team actually uses, a real read on ROI, and earned trust before anything bigger
              is on the table.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              AI should reduce owner dependency — not create another system to babysit. If a second
              workflow makes sense, we'll see it in the numbers from the first one.
            </p>
          </div>
        </div>
      </Section>

      {/* Example workflows */}
      <div className="section-tint">
        <Section id="examples">
          <SectionHeading
            eyebrow="Example workflows"
            title="Seven workflows we build, in plain language."
            lede="All of them draft for a human, answer from approved content only, or organize what already exists. None act on their own. These are illustrations — your audit determines which one is actually worth building first."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_WORKFLOWS.map((wf) => (
              <Card key={wf.title} className="card-hover flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base">{wf.title}</CardTitle>
                  <p className="text-xs font-medium uppercase tracking-wide text-bronze-700">
                    {wf.forWhom}
                  </p>
                  <CardDescription className="leading-relaxed">{wf.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="border-t border-border pt-3 text-sm font-medium text-ink">
                    {wf.ownerWin}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 rounded-xl border border-border bg-card p-6 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 h-5 w-5 shrink-0 text-pine-700" />
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Want to see what a deliverable looks like? We built a sample{" "}
                <strong className="text-ink">Owner Weekly Ops Brief</strong> for a fictional
                design/build company — fully dummy data, no live systems.
              </p>
            </div>
            <Link href="/demo/ops-brief" className="mt-4 block sm:mt-0">
              <Button variant="outline">
                View the sample brief
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Section>
      </div>

      {/* Two-week shape */}
      <Section>
        <SectionHeading eyebrow="The two weeks" title="What the build actually looks like." />
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            ["Days 1–2", "Scope lock", "We confirm the workflow, the tool it runs in (existing tools first, set up in your accounts), the data it may touch (non-sensitive only), the human-review points, and what 'working' means."],
            ["Days 3–7", "Build & first pass", "We build with your real examples — scrubbed where needed — and you react to drafts, not diagrams."],
            ["Days 8–10", "Team testing", "The people who'll run it daily test it. We tune for how your business talks, prices, and decides."],
            ["Days 11–14", "SOP & handoff", "Written SOP, owner walkthrough, and a check-in cadence for two weeks of post-launch adjustment."],
          ].map(([label, title, body]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-6">
              <Badge variant="outline">{label}</Badge>
              <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="The Quickstart starts with the audit."
        body="That's not a sales funnel — it's quality control. The audit is how we know which workflow is worth $3,500 of your money and two weeks of your team's attention."
      />
    </>
  );
}
