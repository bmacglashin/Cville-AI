"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const commentSchema = z.object({
  organization_id: z.uuid(),
  body: z.string().min(1, "Write something first.").max(4000),
});

/** Shared by portal (client messages) and admin (advisor notes to client). */
export async function addComment(formData: FormData): Promise<void> {
  const parsed = commentSchema.safeParse({
    organization_id: formData.get("organization_id"),
    body: String(formData.get("body") ?? "").trim(),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("comments").insert({
    organization_id: parsed.data.organization_id,
    author_id: user.id,
    entity_type: "organization",
    body: parsed.data.body,
  });
  if (error) console.error("[comments] insert failed:", error.message);

  revalidatePath("/portal/messages");
  revalidatePath(`/admin/clients/${parsed.data.organization_id}`);
}
