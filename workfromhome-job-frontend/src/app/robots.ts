import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

  return {
    rules: [
      // Googlebot — full access, block search/filter URLs
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/jobs/",
          "/remote-jobs-in-*",
          "/remote-*-jobs",
          "/remote-jobs-at-*",
          "/about",
          "/contact",
          "/privacy",
          "/editorial-policy",
          "/how-we-source-jobs",
          "/rss.xml",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/*?search=*",
          "/*?page=*",
          "/*?seniority=*",
          "/*?experience=*",
          "/*?minSalary=*",
        ],
      },
      // Bingbot
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/jobs/",
          "/remote-jobs-in-*",
          "/remote-*-jobs",
          "/remote-jobs-at-*",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/*?search=*",
          "/*?page=*",
          "/*?seniority=*",
          "/*?experience=*",
          "/*?minSalary=*",
        ],
      },
      // All other crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/*?search=*",
          "/*?page=*",
          "/*?seniority=*",
          "/*?experience=*",
          "/*?minSalary=*",
        ],
      },
      // Aggressive crawlers — rate limited
      {
        userAgent: "AhrefsBot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/*?search=*", "/*?page=*"],
        crawlDelay: 10,
      },
      {
        userAgent: "SemrushBot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/*?search=*", "/*?page=*"],
        crawlDelay: 10,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
