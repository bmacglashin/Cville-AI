import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
    >
      <rect x="1" y="1" width="30" height="30" rx="8" className="fill-pine-800" />
      {/* Oak: cream canopy over a bronze trunk with spreading roots */}
      <circle cx="16" cy="12.5" r="6.5" stroke="#f2efe7" strokeWidth="2.2" fill="none" />
      <path
        d="M16 19 L16 26 M16 22.5 L11 20.5 M16 22.5 L21 20.5 M16 26 L12.5 27.5 M16 26 L19.5 27.5"
        stroke="#c89a5b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          light ? "text-[#f2efe7]" : "text-ink"
        )}
      >
        Copp Oak Advisory
      </span>
    </Link>
  );
}
