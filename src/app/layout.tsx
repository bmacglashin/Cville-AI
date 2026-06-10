import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Agent Ally — AI operating systems for serious local businesses",
    template: "%s | Agent Ally",
  },
  description:
    "Charlottesville-based AI advisory and implementation. We start with a paid AI Operating Audit, then advise, implement, and operate practical AI systems for owner-led businesses.",
  keywords: [
    "AI consulting Charlottesville",
    "AI audit",
    "AI implementation",
    "small business AI",
    "AI advisory Virginia",
    "Agent Ally",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Agent Ally",
    title: "Agent Ally — AI operating systems for serious local businesses",
    description:
      "Audit first. Then advise, implement, and operate. Practical AI for Charlottesville's owner-led businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Ally — AI operating systems for serious local businesses",
    description:
      "Audit first. Then advise, implement, and operate. Practical AI for Charlottesville's owner-led businesses.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
