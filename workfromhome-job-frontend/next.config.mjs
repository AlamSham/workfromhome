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
    ];
  },
  async rewrites() {
    return [
      {
        source: '/remote-jobs-in-:country',
        destination: '/country/:country',
      },
    ];
  },
};

export default nextConfig;
