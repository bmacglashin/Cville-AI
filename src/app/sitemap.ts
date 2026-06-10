import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const routes = [
    "",
    "/audit",
    "/quickstart",
    "/design-build",
    "/managed-workspace",
    "/about",
    "/founders-note",
    "/faq",
    "/apply",
    "/demo/ops-brief",
    "/privacy",
    "/terms",
  ];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/audit" || route === "/apply" ? 0.9 : 0.6,
  }));
}
