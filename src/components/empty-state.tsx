import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" />
      <h3 className="mt-3 text-sm font-semibold text-ink">{title}</h3>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
