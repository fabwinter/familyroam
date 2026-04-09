/**
 * ingest-teleport.ts
 *
 * Fetches city scores from the Teleport Public API and upserts them into
 * the `cities` table via Prisma.
 *
 * Teleport API docs: https://developers.teleport.org/api/
 *
 * Usage:
 *   npm run ingest:teleport
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TELEPORT_API = 'https://api.teleport.org/api';

interface TeleportUrbanArea {
  ua: { href: string; name: string };
}

interface TeleportScores {
  categories: Array<{ color: string; name: string; score_out_of_10: number }>;
  teleport_city_score: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Teleport API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log('⬇️  Fetching urban areas from Teleport…');

  const { _embedded } = await fetchJson<{ _embedded: { 'ua:urban-areas': TeleportUrbanArea[] } }>(
    `${TELEPORT_API}/urban_areas/`
  );
  const urbanAreas = _embedded['ua:urban-areas'];
  console.log(`Found ${urbanAreas.length} urban areas`);

  for (const area of urbanAreas) {
    try {
      const uaHref = area.ua.href;
      const name = area.ua.name;

      // Fetch detailed scores
      const scoresRes = await fetchJson<TeleportScores>(`${uaHref}scores/`);
      const scores = scoresRes.categories;

      const safetyCategory = scores.find((c) => c.name === 'Safety');
      const qualityCategory = scores.find((c) => c.name === 'Quality of Life');

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await prisma.city.upsert({
        where: { slug },
        create: {
          slug,
          name,
          country: '',         // enriched by other ingestion scripts
          countryCode: 'XX',
          latitude: 0,
          longitude: 0,
          safetyScore: safetyCategory ? safetyCategory.score_out_of_10 * 10 : null,
          qualityOfLife: qualityCategory ? qualityCategory.score_out_of_10 * 10 : null,
        },
        update: {
          safetyScore: safetyCategory ? safetyCategory.score_out_of_10 * 10 : undefined,
          qualityOfLife: qualityCategory ? qualityCategory.score_out_of_10 * 10 : undefined,
        },
      });

      console.log(`✅ Upserted: ${name}`);
    } catch (err) {
      console.error(`❌ Failed for ${area.ua.name}:`, err);
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
