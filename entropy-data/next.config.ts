import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("plotly.js-dist-min"); // Replace with any other client-only library
    }
    return config;
  },
};

export default nextConfig;
