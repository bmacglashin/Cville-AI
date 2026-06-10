import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Terms & disclaimers",
  description:
    "Draft terms of use and service disclaimers for Agent Ally's website and advisory engagements.",
};

export default function TermsPage() {
  return (
    <Section>
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze-700">
          Terms &amp; disclaimers
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink">
          Terms of use &amp; engagement disclaimers.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Draft for the validation period — engagement-specific terms (MSA, SOW, confidentiality)
          are executed separately before paid work begins. This draft will be reviewed by counsel
          before broader launch.
        </p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-2xl text-ink">1. What this website is</h2>
            <p className="mt-4">
              This site describes advisory and implementation services offered by Agent Ally
              (Charlottesville, VA) and lets you apply for an engagement. Content here is general
              information, not advice for your specific situation. Submitting an application
              doesn't create an engagement; engagements begin only when both parties sign a
              statement of work and payment terms are agreed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">2. Not legal, tax, financial, or compliance advice</h2>
            <p className="mt-4">
              Agent Ally provides operational and technology advisory services. Nothing we publish
              or deliver constitutes legal, tax, accounting, investment, insurance, or regulatory
              compliance advice. Where engagements touch areas with legal or regulatory
              implications, we'll tell you to involve your attorney or accountant — and mean it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">3. AI outputs require human judgment</h2>
            <p className="mt-4">
              AI systems generate drafts, summaries, and recommendations that can be wrong,
              incomplete, or out of date. Deliverables and workflows we build are designed with
              human review steps, and clients are responsible for reviewing AI-assisted output
              before relying on it or sending it to third parties. We do not build or operate
              systems that act on a client's business or customers without human review.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">4. No regulated-data services</h2>
            <p className="mt-4">
              Our current services are not designed for, and must not be used with, protected
              health information, student education records, consumer credit data, or similar
              regulated data categories. We make no HIPAA, FERPA, GLBA, or similar compliance
              representations. Don't send us this data; if you do despite this notice, we'll delete
              it and may pause the engagement to sort out what happened.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">5. No guarantees of outcome</h2>
            <p className="mt-4">
              We promise honest analysis, competent implementation, and clearly scoped
              deliverables. We do not promise revenue increases, cost reductions, or specific
              business outcomes — anyone who does is selling you something other than consulting.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">6. Intellectual property</h2>
            <p className="mt-4">
              Audit deliverables and workflow SOPs produced for your engagement belong to you on
              full payment, and tool accounts configured during an engagement belong to your
              business from day one. Our underlying methods, templates, prompt frameworks,
              playbooks, and vetting criteria remain ours. Third-party tools remain governed by
              their vendors' terms — we are not affiliated with, and do not resell or sublicense,
              any tool vendor. Engagement-specific IP terms are set out in the SOW.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">7. Limitation of liability</h2>
            <p className="mt-4">
              To the maximum extent permitted by law, Agent Ally's total liability arising out of
              any engagement is limited to the fees paid for that engagement, and neither party is
              liable for indirect or consequential damages. Final language will appear in the MSA.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">8. Changes</h2>
            <p className="mt-4">
              We may update these terms as the practice formalizes (entity formation, insurance,
              counsel review are in progress). Material changes will be dated on this page.
            </p>
          </section>
        </div>
      </article>
    </Section>
  );
}
