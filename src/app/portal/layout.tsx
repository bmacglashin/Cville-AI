import Link from "next/link";
import {
  FlaskConical,
  Home,
  ListChecks,
  Map,
  MessageSquare,
  FileText,
  Files,
  Lightbulb,
  ClipboardList,
} from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { signOut } from "@/lib/actions/auth";

const NAV = [
  { href: "/portal", label: "Overview", icon: Home },
  { href: "/portal/intake", label: "Your intake", icon: ClipboardList },
  { href: "/portal/opportunities", label: "Opportunities", icon: Lightbulb },
  { href: "/portal/roadmap", label: "Roadmap", icon: Map },
  { href: "/portal/deliverables", label: "Deliverables", icon: FileText },
  { href: "/portal/tasks", label: "Tasks", icon: ListChecks },
  { href: "/portal/documents", label: "Documents", icon: Files },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;

  return (
    <div className="min-h-screen bg-background">
      {/* Permanent prototype banner — this room shares deliverables; it is never the product. */}
      <div className="bg-pine-900 px-4 py-2 text-center text-xs font-medium text-pine-100">
        <FlaskConical className="mr-1.5 inline h-3.5 w-3.5" />
        Client Delivery Room (prototype) — where we share approved deliverables, your roadmap, and
        operating notes. Not a standalone AI platform; it does not connect to your business
        systems unless separately scoped.
      </div>

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {ctx.profile.full_name || ctx.profile.email}
            </span>
            {ctx.profile.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-bronze-700 hover:underline">
                Admin →
              </Link>
            )}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-8 px-5 py-8 sm:px-8">
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="space-y-1" aria-label="Portal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Portal mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
