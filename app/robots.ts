import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils/seo";

/** robots.txt — public site crawlable; dashboards, auth pages and APIs excluded. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/college", "/portal", "/login", "/forgot-password", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
