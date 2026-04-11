import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://roamingfamilies.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let cityEntries: MetadataRoute.Sitemap = [];
  try {
    const cities = await prisma.city.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { familyScore: 'desc' },
    });
    cityEntries = cities.map((c) => ({
      url: `${BASE}/cities/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch cities from DB:', err);
  }

  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/cities`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    ...cityEntries,
  ];
}
