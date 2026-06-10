import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { RISK_BOUNDARIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy & data handling",
  description:
    "How Agent Ally collects, uses, and protects information — and the hard boundaries on what data we will and won't work with.",
};

export default function PrivacyPage() {
  return (
    <Section>
      <article className="prose-headings:font-display mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bronze-700">
          Privacy &amp; data handling
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink">
          Plain-English privacy &amp; data handling notice.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Draft notice for the validation period. Last updated June 2026. This will be reviewed by
          counsel before broader launch; questions to ben@agentally.co.
        </p>

        <div className="mt-10 space-y-10 text-base leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-2xl text-ink">What we collect, and why</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong>Application &amp; contact info</strong> — name, email, phone, business name,
                and what you tell us about your operations. Used to evaluate fit and respond to you.
              </li>
              <li>
                <strong>Audit intake data</strong> — tools you use, workflows, pain points, and a
                list (names and descriptions only) of documents you might want reviewed later. Used
                solely to deliver your audit.
              </li>
              <li>
                <strong>Account data</strong> — if you create a client login: email and an
                encrypted password handled by our auth provider (Supabase). We never see or store
                plaintext passwords.
              </li>
              <li>
                <strong>Basic site analytics</strong> — if enabled, cookie-free, privacy-friendly
                page analytics (no advertising trackers, no cross-site profiles, no sale of data).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">What we deliberately do NOT want yet</h2>
            <p className="mt-4">
              During this early period, <strong>do not upload or send us sensitive or regulated
              data</strong>. That includes health information, student records, personnel files,
              financial account credentials, government IDs, and anything about children. The
              intake flow asks you to classify data sensitivity and to acknowledge this in writing
              — that's not bureaucracy, it's the design. Early AI work is performed on dummy data
              or documents you've explicitly approved as non-sensitive.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              {RISK_BOUNDARIES.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Where data lives</h2>
            <p className="mt-4">
              Application and intake data is stored in a Supabase (PostgreSQL) database with
              row-level security: client accounts can only access their own organization's records,
              and administrative access is limited to the founder. Service credentials are never
              exposed to the browser. We don't sell data, share it with advertisers, or use your
              business information to train AI models.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">AI processing</h2>
            <p className="mt-4">
              When AI models are used during an engagement, they are used on approved, non-sensitive
              content, with human review of outputs. Tools are set up in accounts your business
              owns, we will tell you which providers are involved in your specific engagement
              before any of your content touches them, and commercial tiers with no-training terms
              are used. No AI system acts on your business or your customers without a person
              reviewing it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Retention &amp; deletion</h2>
            <p className="mt-4">
              Ask us to delete your application or intake data and we will, within 30 days, unless
              we're legally required to keep specific records. When a client engagement ends, we
              return or delete engagement materials on request and confirm in writing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-ink">Your choices</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>You can request a copy of the data we hold about your business.</li>
              <li>You can request correction or deletion at any time.</li>
              <li>You can decline analytics cookies by default — we don't use any.</li>
              <li>Email ben@agentally.co for any of the above.</li>
            </ul>
          </section>
        </div>
      </article>
    </Section>
  );
}
