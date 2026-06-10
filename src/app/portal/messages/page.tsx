import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { SetupNotice } from "@/components/setup-notice";
import { getPortalContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";
import { addComment } from "@/lib/actions/comments";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function PortalMessagesPage() {
  const ctx = await getPortalContext();
  if (ctx === "unconfigured") return <SetupNotice />;
  if (!ctx.organization) {
    return <EmptyState title="No messages" body="Messages with Ben will live here." />;
  }

  const supabase = await createClient();
  // Note: no profiles join here — RLS hides other users' profiles from
  // clients, so authorship is derived from author_id instead.
  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A running thread with Ben. For anything urgent, email or call — this isn't monitored
          24/7.
        </p>
      </div>

      <div className="space-y-3">
        {comments?.length ? (
          comments.map((c) => {
            // The thread is between this org's members and the advisor; anything
            // not written by the signed-in user renders as the advisor side.
            const isMine = c.author_id === ctx.userId;
            return (
              <div
                key={c.id}
                className={cn(
                  "max-w-xl rounded-xl border p-4",
                  isMine ? "ml-auto border-border bg-card" : "border-pine-200 bg-pine-50"
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-ink">
                    {isMine ? "You" : "Ben (Copp Oak Advisory)"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed">{c.body}</p>
              </div>
            );
          })
        ) : (
          <EmptyState title="No messages yet" body="Start the thread below." />
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <form action={addComment} className="space-y-3">
            <input type="hidden" name="organization_id" value={ctx.organization.id} />
            <Textarea
              name="body"
              required
              maxLength={4000}
              rows={3}
              placeholder="Write a message… (please don't paste sensitive or regulated content)"
            />
            <div className="flex justify-end">
              <Button type="submit">Send message</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
