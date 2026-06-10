import { Wrench } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/marketing/section";
import { POSITIONING, TOOL_CATEGORIES, TOOL_CATEGORY_DISCLAIMER } from "@/lib/content";

/**
 * "We use the right tool, not one tool." — the tool-agnostic doctrine section.
 * Lists tool CATEGORIES generically; specific vendors are never named in
 * public copy (recommendations happen case-by-case inside an engagement).
 */
export function ToolCategoriesSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Tool-agnostic, on purpose"
        title={POSITIONING.rightTool}
        lede={`${POSITIONING.ownership} We recommend from the whole market, set everything up in accounts your business owns, and keep the judgment — not the software — as the thing you're paying for.`}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOL_CATEGORIES.map((cat) => (
          <Card key={cat.name} className="card-hover">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-pine-50">
                <Wrench className="h-5 w-5 text-pine-700" />
              </div>
              <CardTitle className="text-base">{cat.name}</CardTitle>
              <CardDescription className="leading-relaxed">{cat.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        {TOOL_CATEGORY_DISCLAIMER}
      </p>
    </Section>
  );
}
