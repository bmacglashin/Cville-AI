import "server-only";
import { isStripeConfigured } from "@/lib/env";

/**
 * Stripe scaffold — NOT live. No key required to run the app.
 *
 * Validation-period reality: audit payments can simply be a Stripe Payment
 * Link sent after the fit call (set NEXT_PUBLIC_STRIPE_AUDIT_PAYMENT_LINK).
 * This module exists so programmatic checkout is a config change, not a
 * rewrite, when volume justifies it.
 *
 * TODO(launch): create Product "AI Operating Audit" in Stripe, set
 * STRIPE_SECRET_KEY + STRIPE_AUDIT_PRICE_ID, then wire createAuditCheckout
 * into the post-fit-call flow. Add a webhook route (checkout.session.completed)
 * that moves the org's pipeline_stage to 'audit_paid'.
 */

export async function createAuditCheckout(params: {
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string } | { error: string }> {
  if (!isStripeConfigured()) {
    return {
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_AUDIT_PRICE_ID, or use a Stripe Payment Link for the validation period.",
    };
  }

  const priceId = process.env.STRIPE_AUDIT_PRICE_ID;
  if (!priceId) return { error: "STRIPE_AUDIT_PRICE_ID is not set." };

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  if (!session.url) return { error: "Stripe did not return a checkout URL." };
  return { url: session.url };
}
