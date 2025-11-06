import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for custom server deployment
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
