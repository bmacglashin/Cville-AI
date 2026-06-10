import Script from "next/script";

/**
 * Privacy-friendly analytics placeholder. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 * (e.g. "agentally.co") to enable Plausible. No cookies, no PII.
 * Swap for another provider later if preferred.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
