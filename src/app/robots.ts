import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/start-audit", "/auth", "/login", "/signup"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
