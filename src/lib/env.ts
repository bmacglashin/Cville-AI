/**
 * Central environment access. The app must run (and build) with zero keys:
 * marketing pages are fully static; auth/portal/admin surfaces render a
 * setup notice when Supabase is not configured.
 */

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getCalendlyUrl() {
  return process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
