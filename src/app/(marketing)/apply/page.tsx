import type { Metadata } from "next";
import { CalendarCheck, MailOpen, PhoneCall, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/marketing/section";
import { getCalendlyUrl } from "@/lib/env";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Apply for the Founding AI Operating Audit",
  description:
    "Apply in five minutes. Free 20-minute fit call. $950 founding AI Operating Audit for Charlottesville owner-led businesses — first five clients only.",
};

const STEPS = [
  {
    icon: MailOpen,
    title: "1. Apply (5 minutes)",
    body: "The form below. We respond within one business day — a real reply, not a sequence.",
  },
  {
    icon: PhoneCall,
    title: "2. Fit call (20 minutes, free)",
    body: "We both decide whether the audit is worth your money. If it isn't, we'll say so and suggest alternatives.",
  },
  {
    icon: CalendarCheck,
    title: "3. Payment & scheduling",
    body: "$950 founding price, invoiced after the fit call. We schedule your intake and 90-minute owner interview.",
  },
  {
    icon: Search,
    title: "4. The audit (2 weeks)",
    body: "Intake, interview, analysis — ending in a written roadmap and a working session to walk through it.",
  },
];

export default function ApplyPage() {
  const calendlyUrl = getCalendlyUrl();

  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Badge variant="accent" className="mb-5">
            Founding cohort · 5 slots
          </Badge>
          <h1 className="font-display text-4xl leading-[1.1] text-ink">
            Apply for the Founding AI Operating Audit.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            For Charlottesville-area owner-led businesses — design/build and premium home services
            get first priority. Five minutes now, a fit call this week, and a straight answer about
            where AI helps your operation.
          </p>

          <div className="mt-10 space-y-5">
            {STEPS.map((step) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pine-50">
                  <step.icon className="h-5 w-5 text-pine-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          {calendlyUrl ? (
            <p className="mt-8 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Prefer to talk first?{" "}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-bronze-700 underline"
              >
                Book the fit call directly
              </a>{" "}
              and skip the form.
            </p>
          ) : (
            <p className="mt-8 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Prefer email? Reach Ben directly at{" "}
              <a href="mailto:ben@agentally.co" className="font-semibold text-bronze-700 underline">
                ben@agentally.co
              </a>
              .
            </p>
          )}
        </div>

        <Card className="h-fit">
          <CardContent className="p-6 sm:p-8">
            <ApplyForm calendlyUrl={calendlyUrl} />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
