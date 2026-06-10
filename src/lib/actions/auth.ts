"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, getSiteUrl } from "@/lib/env";
import { signInSchema, signUpSchema } from "@/lib/validation/intake";
import { ensureOrganization } from "@/lib/actions/org";

export interface AuthResult {
  ok: boolean;
  error?: string;
  confirmEmail?: boolean;
}

const NOT_CONFIGURED =
  "Accounts aren't enabled yet — Supabase isn't connected. See README.md to configure.";

export async function signIn(input: { email: string; password: string; next?: string }): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Invalid email or password." };

  // Route admins to the admin dashboard, clients to the portal.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let destination = input.next && input.next.startsWith("/") ? input.next : "/portal";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin" && !input.next) destination = "/admin";
  }
  redirect(destination);
}

export async function signUp(input: {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
}): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: {
        full_name: parsed.data.full_name,
        organization_name: parsed.data.organization_name,
      },
    },
  });

  if (error) return { ok: false, error: error.message };

  if (data.session) {
    // Email confirmation disabled (local dev) — finish setup now.
    await ensureOrganization();
    redirect("/portal");
  }

  // Hosted default: confirmation email sent; org gets created on first portal visit.
  return { ok: true, confirmEmail: true };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
