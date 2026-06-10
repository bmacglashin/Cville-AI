import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Founder's note",
  description:
    "Why Copp Oak Advisory exists, what the founding cohort gets, and the standard the work is held to — from Ben, founder of Copp Oak Advisory in Charlottesville, VA.",
};

export default function FoundersNotePage() {
  return (
    <Section className="py-16 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze-700">
          Founder&apos;s note
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink">
          Why I started Copp Oak Advisory.
        </h1>

        <div className="mt-8 space-y-5 text-base leading-[1.8] text-foreground/90">
          <p>
            I&apos;ve spent the last several years inside the AI wave from two angles: leading
            go-to-market AI work at Deloitte, and building with these tools myself — prompt systems,
            agent workflows, the unglamorous plumbing that makes AI useful instead of impressive.
            Two things became obvious.
          </p>
          <p>
            First: this technology is now genuinely good enough to matter for a 15-person
            design/build firm, not just a Fortune 500. The kind of work that quietly eats an
            owner&apos;s week — drafting proposals, answering the same internal questions, keeping
            follow-up alive, writing things down — is exactly what it does well.
          </p>
          <p>
            Second: almost everything being sold to small businesses under the AI banner is either
            a toy or a trap. Toys: chatbots bolted onto websites, &ldquo;automation&rdquo; that
            breaks the first week. Traps: platforms that ingest your data carelessly, agencies
            selling autonomy nobody should want, transformation roadmaps with no one accountable
            for outcomes.
          </p>
          <p>
            Copp Oak Advisory is my answer to that gap, built in the town where I live. The model is
            deliberately old-fashioned: <strong>paid diagnostic first, then one carefully chosen
            implementation, then earn the next step.</strong> The audit costs $950 because the
            answer is worth paying for — including when the answer is &ldquo;not yet, and
            here&apos;s why.&rdquo; I cap the founding cohort at five businesses because I deliver
            every engagement personally, and that number is what excellent looks like alongside my
            other professional commitments.
          </p>
          <p>
            Full transparency, because you&apos;d find out at the fit call anyway: I&apos;m building
            this practice while holding a senior day job. For you that means three things. The
            founding price reflects it. The engagement structure respects both of our calendars —
            scheduled interviews and readouts, not me hovering in your office. And I&apos;m not
            burning savings to make payroll, so you will never get a recommendation inflated to
            cover my rent. The honest answer is the entire product.
          </p>
          <p>
            What I&apos;m asking from founding clients: real engagement in one 90-minute interview,
            honest data about how the business runs, and a willingness to tell me bluntly what
            isn&apos;t working. What you get: senior judgment usually reserved for companies a
            hundred times your size, applied to the operation you actually run, with your risk —
            your data, your reputation, your client trust — treated as the first constraint, not a
            disclaimer.
          </p>
          <p>
            If that sounds like the kind of help you&apos;ve been looking for, the application takes
            five minutes. If we&apos;re not a fit, I&apos;ll tell you on the call and do my best to
            point you somewhere that is.
          </p>
          <p className="pt-2">
            — Ben
            <br />
            <span className="text-sm text-muted-foreground">Founder, Copp Oak Advisory · Charlottesville, VA</span>
          </p>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link href="/apply">
            <Button size="lg">
              Apply for the Founding Audit
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
    </Section>
  );
}
