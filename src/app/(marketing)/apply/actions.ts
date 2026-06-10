"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { notifyAdminOfApplication } from "@/lib/email";
import { auditApplicationSchema, type AuditApplication } from "@/lib/validation/intake";

export interface ApplyResult {
  ok: boolean;
  error?: string;
}

export async function submitAuditApplication(input: AuditApplication): Promise<ApplyResult> {
  const parsed = auditApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  if (!isSupabaseConfigured()) {
    // Graceful degradation pre-launch: log and direct the applicant to email.
    console.warn("[apply] Supabase not configured — application not persisted:", parsed.data.email);
    return {
      ok: false,
      error:
        "Applications aren't connected yet. Please email ben@coppoakadvisory.com directly — same five-minute conversation.",
    };
  }

  const supabase = await createClient();
  const d = parsed.data;

  // Anon-key insert; the leads RLS policy allows insert-only for applicants.
  const { error } = await supabase.from("leads").insert({
    full_name: d.full_name,
    email: d.email,
    phone: d.phone || null,
    company: d.company,
    industry: d.industry,
    team_size: d.team_size,
    biggest_bottleneck: d.biggest_bottleneck,
    message: d.message || null,
    source: "website_application",
  });

  if (error) {
    console.error("[apply] insert failed:", error.message);
    return { ok: false, error: "Something went wrong saving your application. Please email ben@coppoakadvisory.com." };
  }

  await notifyAdminOfApplication({
    full_name: d.full_name,
    email: d.email,
    company: d.company,
    industry: d.industry,
    biggest_bottleneck: d.biggest_bottleneck,
  });

  return { ok: true };
}
