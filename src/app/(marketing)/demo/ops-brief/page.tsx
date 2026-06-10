import Link from "next/link";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  ClipboardList,
  Eye,
  FileQuestion,
  FileWarning,
  MessageCircleQuestion,
  PhoneMissed,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Sample: Owner Weekly Ops Brief (fictional demo)",
  description:
    "A sample Owner Weekly Ops Brief for a fictional design/build company — the kind of Monday-morning digest an Agent Ally engagement can produce. 100% dummy data.",
};

function BriefSection({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-6 py-6 last:border-b-0 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-50">
          <Icon className="h-4 w-4 text-pine-700" />
        </div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {badge && <Badge variant="warning">{badge}</Badge>}
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export default function OpsBriefDemoPage() {
  return (
    <>
      <Section className="pb-8">
        <div className="mx-auto max-w-3xl">
          <Badge variant="accent" className="mb-4">
            <Eye className="h-3 w-3" />
            Sample deliverable
          </Badge>
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            The Owner Weekly Ops Brief.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            This is what a Monday morning can look like after an engagement: one brief, assembled
            from your approved sources, showing where the week's risk and opportunity actually are.
            Below is a complete sample for a fictional company.
          </p>

          <Alert variant="warning" className="mt-6">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fictional demonstration
            </AlertTitle>
            <AlertDescription>
              <p>
                &ldquo;Blue Ridge Custom Builders&rdquo; and every figure below are invented for
                illustration. No live client systems are connected to this page, and producing a
                brief like this for a real business requires an audit, approved data sources, and a
                human-review process first.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="mx-auto max-w-3xl">
          {/* ── The brief document ── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Document header */}
            <div className="section-dark px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze-400">
                    Owner Weekly Ops Brief — sample
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[#f2efe7]">
                    Blue Ridge Custom Builders
                  </h2>
                </div>
                <div className="text-right text-xs text-pine-100/70">
                  <p>Week of June 8 (fictional)</p>
                  <p>Prepared from approved sources only</p>
                </div>
              </div>
              <p className="mt-4 rounded-lg bg-pine-950/50 p-3 text-sm leading-relaxed text-pine-100/90">
                <strong className="text-[#f2efe7]">The week in one sentence:</strong> Two proposals
                worth ~$210k are stalled past your own 10-day standard, three warm inquiries have
                gone quiet, and the Hartman handoff is missing two sign-offs — those three items
                deserve your attention before anything else.
              </p>
            </div>

            <BriefSection icon={ClipboardList} title="Proposal delays" badge="2 stalled">
              <ul className="space-y-2">
                <li>
                  <strong>Mercer kitchen + addition (~$145k)</strong> — site visit was 14 days ago;
                  draft sits at 60%. Blocker noted: cabinet allowance pricing.{" "}
                  <em>Days over standard: 4.</em>
                </li>
                <li>
                  <strong>Foxfield screened porch (~$65k)</strong> — awaiting your pricing review
                  since Tuesday. Client emailed Friday asking for timing.{" "}
                  <em>Days over standard: 2.</em>
                </li>
                <li className="text-muted-foreground">
                  Trend: average proposal turnaround this month is 12.5 days vs. your 10-day
                  standard. The drafting step — not the site visit — is where the time goes.
                </li>
              </ul>
            </BriefSection>

            <BriefSection icon={PhoneMissed} title="Customer follow-up gaps" badge="3 going cold">
              <ul className="space-y-2">
                <li>
                  <strong>Keswick bath remodel inquiry</strong> — quoted range 11 days ago, no
                  reply, no second touch logged. Draft follow-up is queued for your review.
                </li>
                <li>
                  <strong>Ivy deck rebuild</strong> — said &ldquo;deciding this month&rdquo; 3 weeks
                  ago. No contact since.
                </li>
                <li>
                  <strong>Spring home-show lead (Tomlin)</strong> — never received the portfolio
                  packet that was promised.
                </li>
              </ul>
            </BriefSection>

            <BriefSection icon={MessageCircleQuestion} title="Repeated staff questions (this week's top 3)">
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  &ldquo;What's the change-order approval threshold?&rdquo; — asked 6 times.
                  Documented answer exists; nobody can find it.
                </li>
                <li>
                  &ldquo;Which tile supplier for the Hartman master bath?&rdquo; — asked 4 times;
                  answer currently lives only in Dana's text messages.
                </li>
                <li>
                  &ldquo;Do we bill permit fees at cost or with markup?&rdquo; — asked 3 times;
                  <strong> no written answer exists</strong> (flagged for SOP backlog).
                </li>
              </ol>
            </BriefSection>

            <BriefSection icon={Workflow} title="Project handoff risks" badge="1 active">
              <ul className="space-y-2">
                <li>
                  <strong>Hartman whole-home remodel → production this Thursday.</strong> Handoff
                  checklist is missing two items: client's panel-relocation decision (verbal only)
                  and the revised tile spec sign-off. Last quarter, exactly this pattern produced a
                  $9k absorbed change order on the Caldwell job.
                </li>
              </ul>
            </BriefSection>

            <BriefSection icon={FileQuestion} title="SOP gaps surfaced this week">
              <ul className="space-y-2">
                <li>Permit-fee billing policy — no written version (see staff questions).</li>
                <li>Warranty-call triage — three different staff gave three different answers.</li>
                <li>
                  Subcontractor COI verification — done from memory; one expired certificate found
                  on file.
                </li>
              </ul>
            </BriefSection>

            <BriefSection icon={CheckSquare} title="Automation opportunities observed">
              <ul className="space-y-2">
                <li>
                  Proposal drafting from scrubbed past projects (recurring theme — 9 hrs/week of
                  owner time).
                </li>
                <li>Follow-up drafts auto-queued at day 7 of silence, human-reviewed before send.</li>
                <li>Handoff checklist auto-generated per project stage, with named sign-offs.</li>
              </ul>
            </BriefSection>

            {/* Recommended actions */}
            <section className="bg-accent-soft/40 px-6 py-6 sm:px-8">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                Recommended next 3 actions
              </h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  <strong>Today:</strong> 30 minutes on Mercer cabinet pricing — it unblocks the
                  largest stalled proposal. (Foxfield needs only your sign-off: 10 minutes.)
                </li>
                <li>
                  <strong>Before Thursday:</strong> get the Hartman panel decision in writing and
                  the tile sign-off into the checklist — don't release the handoff without both.
                </li>
                <li>
                  <strong>This week:</strong> approve the three queued follow-up drafts and the
                  permit-fee SOP draft — 20 minutes total, closes the oldest gaps.
                </li>
              </ol>
            </section>

            {/* Human review notice */}
            <section className="border-t border-border bg-muted/60 px-6 py-5 sm:px-8">
              <div className="flex gap-3">
                <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-ink">Human-review notes (always included)</p>
                  <p className="mt-1">
                    This brief is assembled by AI from approved sources and reviewed before
                    delivery. Dollar figures and dates should be verified against source systems
                    before client communication. The queued follow-up drafts are <strong>drafts</strong> —
                    nothing is sent without a person approving it. Items touching pricing,
                    contracts, or personnel are flagged for owner decision, never automated.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ── Post-demo CTA ── */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="font-display text-2xl text-ink">
              A brief like this is earned, not installed.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              It takes an audit (to map your data and risk), usually a Quickstart or two (to build
              the workflows that feed it), and a human-review cadence. That path starts with a
              five-minute application.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/apply">
                <Button size="lg">
                  Apply for the Founding Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/quickstart#examples">
                <Button size="lg" variant="outline">
                  See the workflows behind it
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
