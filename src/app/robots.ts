import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / sensitive areas must never be crawled or indexed.
      disallow: [
        "/dashboard",
        "/profile",
        "/qr",
        "/access-log",
        "/admin",
        "/provider",
        "/e/",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
