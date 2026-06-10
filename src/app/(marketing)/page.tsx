import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Hammer,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { ToolCategoriesSection } from "@/components/marketing/tool-categories";
import {
  SITE,
  OFFERS,
  EXAMPLE_WORKFLOWS,
  WHO_FOR,
  NOT_FOR,
  PIPELINE_PUBLIC,
  POSITIONING,
} from "@/lib/content";
import { formatCents } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Agent Ally — a tool-agnostic AI operating partner for owner-led businesses",
  description:
    "Start with a paid AI Operating Audit. We recommend the right client-owned tool stack, configure safe workflows, document the system, train your team, and stay on to operate it. Founder-led, Charlottesville-based.",
};

const PAIN_POINTS = [
  {
    icon: ClipboardList,
    title: "Proposals take weeks",
    body: "Every estimate routes through you, because the pricing judgment lives in your head. Jobs go to whoever answers first.",
  },
  {
    icon: Phone,
    title: "Follow-up falls through",
    body: "Inquiries that aren't ready today never hear from you again. Nobody owns the second touch.",
  },
  {
    icon: Hammer,
    title: "Handoffs drop details",
    body: "Sales to production, production to close-out — every handoff leaks information, and the rework comes out of margin.",
  },
  {
    icon: Sparkles,
    title: "You're the answer desk",
    body: "Thirty interruptions a day for things that are written down somewhere — if anyone could find them.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pb-20 sm:pt-24">
          <div className="max-w-3xl">
            <Badge variant="accent" className="mb-6">
              <MapPin className="h-3 w-3" />
              Charlottesville &amp; Albemarle County · Founding cohort: 5 clients
            </Badge>
            <h1 className="font-display text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              A tool-agnostic AI operating partner for Charlottesville owner-led businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {SITE.subhead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/apply">
                <Button size="lg" className="w-full sm:w-auto">
                  {SITE.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/quickstart#examples">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {SITE.secondaryCta}
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Founding audit: <span className="font-semibold text-ink">$950</span>{" "}
              <span className="text-muted-foreground/70">(standard $1,250)</span> · $500 credited
              toward implementation within 14 days.
            </p>
          </div>
        </Section>
      </div>

      {/* ── Positioning strip ──────────────────────────────────── */}
      <div className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {[
            ["Audit first", "Judgment before tools. Paid, scoped, and useful with or without us."],
            ["Existing tools first", "Your accounts, your data. We use the right tool, not one tool — custom builds only when the business case is clear."],
            ["Human review built in", "Nothing customer-facing ships without a person in the loop."],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem ────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="The real problem"
          title="You're not short on AI tools. You're short on hours that belong to you."
          lede="Most local businesses don't need more software. They need judgment, prioritization, and one practical workflow that removes real operational drag — starting with the work that keeps routing through the owner."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PAIN_POINTS.map((p) => (
            <Card key={p.title} className="card-hover">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-pine-50">
                  <p.icon className="h-5 w-5 text-pine-700" />
                </div>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription className="leading-relaxed">{p.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── How it works ───────────────────────────────────────── */}
      <div className="section-tint">
        <Section>
          <SectionHeading
            eyebrow="How an engagement works"
            title="Start with the audit. Build only where the ROI and risk profile justify it."
          />
          <ol className="mt-12 grid gap-5 md:grid-cols-4">
            {PIPELINE_PUBLIC.map((item, i) => (
              <li key={item.step} className="relative rounded-xl border border-border bg-card p-6">
                <span className="font-display text-3xl text-bronze-500">{i + 1}</span>
                <h3 className="mt-3 text-base font-semibold text-ink">{item.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {/* ── Product ladder ─────────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="What we offer"
          title="A deliberately short menu."
          lede="Three engagements, in order. Nobody skips the audit — that's how we both avoid expensive guesses."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {OFFERS.map((offer, i) => (
            <Card
              key={offer.slug}
              className={`card-hover flex flex-col ${i === 0 ? "border-pine-600/40 ring-1 ring-pine-600/20" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={i === 0 ? "default" : "outline"}>
                    {i === 0 ? "Start here" : i === 1 ? "After the audit" : "Post-audit path"}
                  </Badge>
                  {i === 0 && <Badge variant="accent">Founding offer</Badge>}
                </div>
                <CardTitle className="mt-3 font-display text-xl">{offer.name}</CardTitle>
                <CardDescription className="leading-relaxed">{offer.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-2xl font-semibold text-ink">
                  {formatCents(offer.foundingPriceCents)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                    {offer.standardPriceNote ?? formatCents(offer.standardPriceCents)}
                  </span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{offer.priceNote}</p>
                <Link href={offer.href} className="mt-5 block">
                  <Button variant={i === 0 ? "primary" : "outline"} className="w-full">
                    {offer.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Example workflows ──────────────────────────────────── */}
      <div className="section-dark">
        <Section>
          <SectionHeading
            dark
            eyebrow="Make it concrete"
            title="The kind of workflows we build."
            lede="Every one of these drafts for a human, answers from approved content only, or organizes what already exists. None of them act on their own."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {EXAMPLE_WORKFLOWS.slice(0, 3).map((wf) => (
              <div
                key={wf.title}
                className="rounded-xl border border-pine-700/60 bg-pine-900/60 p-6"
              >
                <h3 className="text-base font-semibold text-[#f2efe7]">{wf.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-bronze-400">
                  {wf.forWhom}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-pine-100/80">{wf.description}</p>
                <p className="mt-4 border-t border-pine-700/60 pt-3 text-sm font-medium text-[#f2efe7]">
                  {wf.ownerWin}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quickstart#examples">
              <Button variant="light">
                See all seven example workflows
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo/ops-brief">
              <Button variant="ghost" className="text-pine-100 hover:bg-pine-800/60 hover:text-white">
                View a sample Owner Weekly Ops Brief
              </Button>
            </Link>
          </div>
        </Section>
      </div>

      {/* ── Tool-agnostic doctrine ─────────────────────────────── */}
      <ToolCategoriesSection />

      {/* ── Who it's for / not for ─────────────────────────────── */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who this is for" title="Owner-led, operationally real." />
            <ul className="mt-8 space-y-4">
              {WHO_FOR.map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="What we don't do" title="Said plainly, up front." />
            <ul className="mt-8 space-y-4">
              {NOT_FOR.map((item) => (
                <li key={item} className="flex gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger/70" />
                  <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── Founder credibility ────────────────────────────────── */}
      <div className="section-tint">
        <Section>
          <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="Who you're working with"
                title="Founder-led, by design."
                lede="Agent Ally is run by Ben — Darden MBA, former Deloitte consultant leading go-to-market AI work, and a hands-on builder of AI workflows. Every audit, every owner interview, and every implementation in the founding cohort is delivered by him personally."
              />
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                That's a constraint, and it's the point: you get senior judgment about what's worth
                building, what isn't, and what should stay a human process — not a junior team
                running a playbook. It's also why the founding cohort is capped at five businesses.
              </p>
              <Link href="/founders-note" className="mt-6 inline-block">
                <Button variant="outline">
                  Read the founder's note
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <ShieldCheck className="mb-2 h-8 w-8 text-pine-700" />
                <CardTitle>Our data stance</CardTitle>
                <CardDescription className="leading-relaxed">
                  {POSITIONING.ownership} We rank your data by sensitivity before anything is
                  built, exclude regulated and sensitive data from early work, vet every tool
                  against our data-risk framework, and require human review on anything
                  customer-facing. If a workflow isn't safe to automate yet, the audit says so —
                  that answer is part of what you're paying for.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/privacy" className="text-sm font-medium text-bronze-700 hover:underline">
                  Read our privacy &amp; data handling notice →
                </Link>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>

      {/* ── Founding offer ─────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-bronze-500/30 bg-accent-soft/50 p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Badge variant="accent" className="mb-4">
                <CalendarCheck className="h-3 w-3" />
                Founding client offer
              </Badge>
              <h2 className="font-display text-3xl leading-tight text-ink">
                $950 AI Operating Audit for the first five Charlottesville businesses.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Standard price is $1,250. Founding clients also lock founding pricing on any
                implementation started within six months, and $500 of the audit is credited toward
                implementation signed within 14 days. Subject to fit — the application and fit call
                exist so neither of us wastes a dollar or an afternoon.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/apply">
                <Button size="lg" className="w-full">
                  {SITE.primaryCta}
                </Button>
              </Link>
              <Link href="/audit">
                <Button size="lg" variant="outline" className="w-full">
                  What's in the audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
