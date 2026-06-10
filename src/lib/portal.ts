import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Organization, Profile } from "@/lib/types/database";

export interface PortalContext {
  userId: string;
  profile: Profile;
  organization: Organization | null;
}

/**
 * Loads the signed-in user's profile and (first) organization for portal pages.
 * Redirects to /login when signed out. Returns organization=null for brand-new
 * accounts whose org creation hasn't happened yet.
 */
export async function getPortalContext(): Promise<PortalContext | "unconfigured"> {
  if (!isSupabaseConfigured()) return "unconfigured";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal");

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  if (!profile) redirect("/login?next=/portal");

  let organization: Organization | null = null;
  if (membership) {
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", membership.organization_id)
      .single();
    organization = org;
  }

  return { userId: user.id, profile, organization };
}
