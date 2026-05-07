import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      // ── Security headers for all pages ──
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
      // ── Block search/filter URLs at HTTP header level ──
      // This ensures Google sees noindex even before rendering the page
      {
        source: "/",
        has: [{ type: "query", key: "search" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, follow" },
        ],
      },
      {
        source: "/remote-jobs-in-:country",
        has: [{ type: "query", key: "search" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, follow" },
        ],
      },
      {
        source: "/(.*)",
        has: [{ type: "query", key: "page" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, follow" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/country/:country",
        destination: "/remote-jobs-in-:country",
        permanent: true,
      },
      {
        source: "/job-categories/:slug",
        destination: "/remote-:slug-jobs",
        permanent: true,
      },
      {
        source: "/companies/:slug",
        destination: "/remote-jobs-at-:slug",
        permanent: true,
      },
      {
        source: "/job-categories/:slug/country/:country",
        destination: "/remote-:slug-jobs-in-:country",
        permanent: true,
      },
      {
        source: "/companies/:slug/country/:country",
        destination: "/remote-jobs-at-:slug-in-:country",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/remote-jobs-in-:country',
        destination: '/country/:country',
      },
      {
        source: "/remote-:slug-jobs",
        destination: "/job-categories/:slug",
      },
      {
        source: "/remote-jobs-at-:slug",
        destination: "/companies/:slug",
      },
      {
        source: "/remote-:slug-jobs-in-:country",
        destination: "/job-categories/:slug/country/:country",
      },
      {
        source: "/remote-jobs-at-:slug-in-:country",
        destination: "/companies/:slug/country/:country",
      },
    ];
  },
};

export default nextConfig;
