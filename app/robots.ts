import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://roamingfamilies.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/planner', '/admin', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
