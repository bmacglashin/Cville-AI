import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { RISK_BOUNDARIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About — why Agent Ally exists",
  description:
    "Agent Ally is a founder-led AI advisory and implementation practice in Charlottesville, VA. Audit first, one workflow at a time, human review always.",
};

const PRINCIPLES = [
  {
    title: "Judgment before tools",
    body: "Most local businesses don't need more AI tools. They need someone who can look at the operation, the data, and the risk profile and say: this, not that, in this order. That judgment is the product — the software is just how it ships.",
  },
  {
    title: "The right tool, not one tool",
    body: "We're tool-agnostic on purpose. Everything is set up in accounts your business owns — your logins, your data — and we recommend from the whole market. Existing tools first; custom builds only when ROI, data risk, scope, and budget make the case.",
  },
  {
    title: "Paid from day one",
    body: "We start with a paid audit because free assessments are sales theater. When you pay for the work, you get the real answer — including 'don't automate this yet.'",
  },
  {
    title: "One workflow at a time",
    body: "Adoption beats ambition. A single working workflow your team actually uses is worth more than a platform they avoid. We sequence deliberately and earn the next step.",
  },
  {
    title: "Human review, always",
    body: "Nothing customer-facing, financial, or judgment-heavy ships without a person in the loop. AI drafts; people decide. We put it in writing and build it into the workflow itself.",
  },
  {
    title: "Reduce owner dependency",
    body: "The test of every engagement: does the owner get hours and headspace back without acquiring a new system to babysit? If a workflow adds management burden, it failed — whatever the demo looked like.",
  },
  {
    title: "Local and accountable",
    body: "Charlottesville first. The owner interview happens across a real table when possible, and the person who sold the work is the person who delivers it and answers for it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pt-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              An AI practice built the way good local businesses are built.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Agent Ally exists because Charlottesville's owner-led businesses deserve better than
              the two options on offer: hype-driven automation agencies on one side, and
              enterprise consultancies that won't return a call under $200k on the other. We're the
              third option — senior judgment, practical implementation, local accountability.
            </p>
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading
          eyebrow="Operating principles"
          title="Seven things we believe enough to be constrained by."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} className="card-hover">
              <CardHeader>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription className="leading-relaxed">{p.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <div className="section-tint">
        <Section>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Hard boundaries"
                title="What we won't build — for anyone, at any price."
                lede="These aren't fine print. They're the design constraints that make everything else trustworthy."
              />
            </div>
            <ul className="space-y-3.5 lg:pt-10">
              {RISK_BOUNDARIES.map((item) => (
                <li key={item} className="flex gap-3">
                  <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-danger/70" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>

      <Section>
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="The founder"
                title="Built and delivered by Ben."
                lede="Darden MBA. Former Deloitte consultant leading go-to-market AI work. Hands-on builder of AI workflows and agent systems. Charlottesville resident. He wrote a longer note about why this business exists and how it's being built."
              />
            </div>
            <Link href="/founders-note">
              <Button size="lg" variant="outline" className="w-full">
                Read the founder's note
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
