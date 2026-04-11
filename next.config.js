const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // Tell Next.js/webpack NOT to bundle Prisma — let Node.js resolve it
  // natively at runtime. This is required for Prisma's native query-engine
  // binary to be found on Vercel's serverless runtime.
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  // Belt-and-suspenders: explicitly include the Prisma binary in Vercel's
  // output file tracing so it is copied into every serverless function bundle.
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
