import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**', // Allow all paths under i.imgur.com
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("plotly.js-dist-min"); // Replace with any other client-only library
      config.externals.push('puppeteer-core');
      config.externals.push('chrome-aws-lambda');
    }
    return config;
  },
};

export default nextConfig;
