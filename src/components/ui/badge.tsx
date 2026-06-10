import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-pine-100 text-pine-800",
        accent: "bg-accent-soft text-bronze-700",
        outline: "border border-border text-muted-foreground",
        success: "bg-emerald-50 text-success border border-emerald-100",
        warning: "bg-amber-50 text-warning border border-amber-100",
        danger: "bg-red-50 text-danger border border-red-100",
        dark: "bg-pine-900 text-pine-100",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
