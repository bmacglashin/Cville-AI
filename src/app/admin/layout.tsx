import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/portal");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-pine-950 print:hidden">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-8">
            <Logo light />
            <nav className="flex items-center gap-5" aria-label="Admin">
              <Link href="/admin" className="text-sm font-medium text-pine-100 hover:text-white">
                Pipeline
              </Link>
              <Link
                href="/admin/leads"
                className="text-sm font-medium text-pine-100 hover:text-white"
              >
                Leads
              </Link>
              <Link
                href="/admin/clients"
                className="text-sm font-medium text-pine-100 hover:text-white"
              >
                Clients
              </Link>
              <Link
                href="/admin/tools"
                className="text-sm font-medium text-pine-100 hover:text-white"
              >
                Tools
              </Link>
              <Link
                href="/admin/playbooks"
                className="text-sm font-medium text-pine-100 hover:text-white"
              >
                Playbooks
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-pine-100/70 sm:inline">Internal — Agent Ally ops</span>
            <form action={signOut}>
              <Button variant="light" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
