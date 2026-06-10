import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand({
  title = "Five founding audit slots. Then the price goes up.",
  body = "Apply in five minutes. We'll schedule a free 20-minute fit call, and we'll both decide whether the audit makes sense. If it doesn't, we'll say so.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="section-dark">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl leading-tight text-[#f2efe7] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-pine-100/80">{body}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/apply">
              <Button size="lg" variant="accent" className="w-full sm:w-auto">
                Apply for the Founding Audit
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/quickstart#examples">
              <Button size="lg" variant="light" className="w-full sm:w-auto">
                See example workflows
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
