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
    default: "Copp Oak Advisory — a tool-agnostic AI operating partner for owner-led businesses",
    template: "%s | Copp Oak Advisory",
  },
  description:
    "Charlottesville-based AI advisory and implementation. We start with a paid AI Operating Audit, then recommend the right client-owned tool stack, configure safe workflows, train your team, and stay on to operate it.",
  keywords: [
    "AI consulting Charlottesville",
    "AI audit",
    "AI implementation",
    "small business AI",
    "AI advisory Virginia",
    "Copp Oak Advisory",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Copp Oak Advisory",
    title: "Copp Oak Advisory — a tool-agnostic AI operating partner for owner-led businesses",
    description:
      "Audit first. Existing tools first. Your accounts, your data, our operating method — practical AI for Charlottesville's owner-led businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Copp Oak Advisory — a tool-agnostic AI operating partner for owner-led businesses",
    description:
      "Audit first. Existing tools first. Your accounts, your data, our operating method — practical AI for Charlottesville's owner-led businesses.",
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
