import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/marketing/section";
import { CtaBand } from "@/components/marketing/cta-band";
import { FAQS } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Copp Oak Advisory's AI Operating Audit, Workflow Quickstarts, pricing, and data handling for Charlottesville businesses.",
};

export default function FaqPage() {
  return (
    <>
      <Section>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions owners actually ask."
          lede="If yours isn't here, ask it on the fit call — the 20 minutes are free and we don't do hard sells."
        />
        <div className="mt-12 max-w-3xl space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-card p-6 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-xl text-bronze-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  );
}
