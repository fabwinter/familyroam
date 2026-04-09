const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // Ensure Prisma's native query engine binary is bundled into every
  // serverless function that Vercel creates from this Next.js output.
  // Without this, Next.js output-file tracing may omit the .so.node file.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/client/**/*'],
  },
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

module.exports = withMDX(nextConfig);
