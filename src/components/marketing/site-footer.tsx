import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SITE } from "@/lib/content";

const GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Work with us",
    links: [
      { href: "/audit", label: "AI Operating Audit" },
      { href: "/quickstart", label: "AI Workflow Quickstart" },
      { href: "/managed-workspace", label: "Managed AI Workspace (post-audit)" },
      { href: "/apply", label: "Apply / book a fit call" },
    ],
  },
  {
    heading: "Who it's for",
    links: [
      { href: "/design-build", label: "Design/build & premium home services" },
      { href: "/demo/ops-brief", label: "Sample: Owner Weekly Ops Brief" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Agent Ally" },
      { href: "/founders-note", label: "Founder's note" },
      { href: "/privacy", label: "Privacy & data handling" },
      { href: "/terms", label: "Terms & disclaimers" },
      { href: "/login", label: "Client login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-[#f3efe6]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.tagline} Founder-led. Audit first. One workflow at a time.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {SITE.region}
            </p>
          </div>
          {GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Agent Ally. All rights reserved.</p>
          <p className="max-w-md leading-relaxed">
            Your accounts. Your data. Our operating method. We do not work with regulated data
            (health, student, lending, legal) in current engagements, and we never deploy AI that
            acts without a person reviewing it.
          </p>
        </div>
      </div>
    </footer>
  );
}
