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
      {/* Blue Ridge double-ridge "A" */}
      <path
        d="M6 23 L13.5 9.5 L17.5 17"
        stroke="#f2efe7"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 23 L19.5 11.5 L26 23"
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
        Agent Ally
      </span>
    </Link>
  );
}
