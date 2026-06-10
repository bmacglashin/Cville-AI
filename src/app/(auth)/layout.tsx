import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-ink">
            ← Back to site
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-12">{children}</main>
    </div>
  );
}
