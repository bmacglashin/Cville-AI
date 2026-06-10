import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "For design/build & premium home services",
  description:
    "AI Operating Audits and Workflow Quickstarts for Charlottesville design/build, remodeling, architecture-adjacent, and premium home-service businesses where the owner is still the unofficial COO.",
};

const SCENES = [
  {
    title: "The proposal bottleneck",
    body: "Every estimate waits on you, because you're the only one who knows how to price the job without losing money. Meanwhile the client got two other bids — and signed with whoever moved first. A proposal assistant drafts from your past projects and pricing rules; you spend twenty minutes reviewing instead of four hours writing.",
  },
  {
    title: "The 4:45pm question parade",
    body: "\"What's our change-order policy?\" \"Where's the spec for the Hartman tile?\" \"Who calls the inspector?\" It's all written down — somewhere. An SOP assistant answers from your approved documents only, and tells you weekly which questions had no written answer. That list becomes your SOP backlog.",
  },
  {
    title: "The handoff that ate the margin",
    body: "Sales knew the client wanted the panel relocated. Production didn't. Now it's a change order you're eating to keep the relationship. A handoff checklist generator turns project details into stage-specific checklists, so what sales promised is what production builds.",
  },
  {
    title: "The follow-up that never happened",
    body: "March inquiry, wasn't ready, said 'maybe fall.' It's fall. Nobody called. An inquiry triage workflow sorts and drafts the follow-up for a human to review and send — so 'not yet' stops becoming 'never.'",
  },
];

export default function DesignBuildPage() {
  return (
    <>
      <div className="hero-gradient">
        <Section className="pb-12 pt-16 sm:pt-20">
          <div className="max-w-3xl">
            <Badge variant="accent" className="mb-5">
              <HardHat className="h-3 w-3" />
              Our first focus
            </Badge>
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              For design/build firms where the owner is still the unofficial COO.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Design/build, remodeling, architecture-adjacent services, and premium trades — the
              businesses where pricing judgment, client trust, and project knowledge all live in one
              person's head. That's where practical AI pays for itself fastest, and where careless
              AI does the most damage. We're built for the first and allergic to the second.
            </p>
            <div className="mt-8">
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

      <Section>
        <SectionHeading
          eyebrow="Sound familiar?"
          title="Four scenes from an owner's week."
          lede="Composites from real owner-led firms. If two or more of these are your Tuesday, the audit will pay for itself."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {SCENES.map((scene) => (
            <Card key={scene.title} className="card-hover">
              <CardHeader>
                <CardTitle>{scene.title}</CardTitle>
                <CardDescription className="leading-relaxed">{scene.body}</CardDescription>
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
                eyebrow="Why this industry"
                title="Your business runs on documents and judgment. Both are AI's home turf — carefully."
              />
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Proposals, specs, change orders, punch lists, SOPs, supplier quotes, site notes:
                design/build firms generate exactly the kind of internal, non-regulated content that
                today's AI handles well — drafting, retrieving, checking, and summarizing it, with a
                human approving every output that leaves the building.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                What we won't touch: employment decisions, payroll decisioning, anything involving
                financial credentials, and anything where an AI would act without review. Your
                license, your insurance, and your reputation are the constraint set we design
                inside.
              </p>
            </div>
            <div>
              <SectionHeading eyebrow="What owners get back" title="The wins we aim for." />
              <ul className="mt-8 space-y-4">
                {[
                  "Proposals out in days, not weeks",
                  "Fewer interruptions — your team finds answers without you",
                  "Cleaner sales-to-production handoffs",
                  "Follow-up that actually happens, with human sign-off",
                  "SOPs that finally get written, because gaps surface automatically",
                  "A Monday brief showing the three things most worth your attention",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm leading-relaxed sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/demo/ops-brief" className="mt-8 inline-block">
                <Button variant="outline">
                  See the sample Owner Weekly Ops Brief
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </div>

      <CtaBand
        title="Five founding slots. Design/build owners get first priority."
        body="The founding audit is $950 — and if it tells you AI isn't ready for your operation yet, that answer comes with a roadmap of what to fix first."
      />
    </>
  );
}
