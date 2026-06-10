"use server";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/**
 * Returns the current user's organization id, creating the organization
 * (named from signup metadata) plus their owner membership on first need.
 * RLS: users may insert an organization with created_by = themselves and
 * may add themselves as a member of an org they created.
 */
export async function ensureOrganization(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) return membership.organization_id;

  const orgName =
    (user.user_metadata?.organization_name as string | undefined)?.trim() ||
    `${(user.user_metadata?.full_name as string | undefined)?.trim() || user.email} — business`;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: orgName,
      slug: `${slugify(orgName)}-${user.id.slice(0, 6)}`,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    console.error("[org] create failed:", orgError?.message);
    return null;
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    console.error("[org] membership failed:", memberError.message);
    return null;
  }

  return org.id;
}
