import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
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
