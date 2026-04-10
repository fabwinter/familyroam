const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure instrumentation.ts runs for env validation on server start.
  experimental: { instrumentationHook: true },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'teleport.org',
      },
    ],
  },
};

module.exports = withMDX(nextConfig);
