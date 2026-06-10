import "server-only";
import { isResendConfigured } from "@/lib/env";

/**
 * Email scaffold (Resend). No key required to run the app:
 * without RESEND_API_KEY, sends become structured console logs so local
 * flows still complete. Set RESEND_API_KEY + EMAIL_FROM to go live.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({ to, subject, text }: SendEmailInput): Promise<{ ok: boolean }> {
  if (!isResendConfigured()) {
    console.info(`[email:stub] to=${to} subject="${subject}"\n${text}`);
    return { ok: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? "Copp Oak Advisory <onboarding@resend.dev>";

  const { error } = await resend.emails.send({ from, to, subject, text });
  if (error) {
    console.error("[email] send failed:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function notifyAdminOfApplication(input: {
  full_name: string;
  email: string;
  company: string;
  industry: string;
  biggest_bottleneck: string;
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.info("[email:stub] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification.");
    return { ok: true };
  }
  return sendEmail({
    to: adminEmail,
    subject: `New audit application: ${input.company}`,
    text: [
      `New founding audit application`,
      ``,
      `Name: ${input.full_name}`,
      `Email: ${input.email}`,
      `Company: ${input.company}`,
      `Industry: ${input.industry}`,
      `Biggest bottleneck: ${input.biggest_bottleneck}`,
      ``,
      `Respond within one business day. View in admin: /admin/leads`,
    ].join("\n"),
  });
}
