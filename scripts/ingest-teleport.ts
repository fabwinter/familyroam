/**
 * ingest-teleport.ts
 *
 * Fetches city scores from the Teleport Public API and upserts them into
 * the `cities` table via Prisma.
 *
 * Teleport API docs: https://developers.teleport.org/api/
 * No API key required.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/ingest-teleport.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TELEPORT_API = 'https://api.teleport.org/api';

interface TeleportUrbanAreaLink {
  href: string;
  name: string;
}

interface TeleportUrbanArea {
  full_name: string;
  ua_id: string;
  _links: {
    'ua:self': TeleportUrbanAreaLink;
  };
}

interface TeleportScoreCategory {
  color: string;
  name: string;
  score_out_of_10: number;
}

interface TeleportScores {
  categories: TeleportScoreCategory[];
  teleport_city_score: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Teleport API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

/** Strip country suffix after comma: "Amsterdam, Netherlands" → "amsterdam" */
function normalise(name: string): string {
  return name.split(',')[0].trim().toLowerCase();
}

async function main() {
  console.log('⬇️  Fetching urban areas from Teleport…');

  const listRes = await fetchJson<{
    _embedded: { 'ua:urban-areas': TeleportUrbanArea[] };
  }>(`${TELEPORT_API}/urban_areas/`);

  const urbanAreas = listRes._embedded['ua:urban-areas'];
  console.log(`Found ${urbanAreas.length} urban areas`);

  // Build a lookup map from normalised city name → DB city
  const dbCities = await prisma.city.findMany({ select: { id: true, slug: true, name: true } });
  const cityByName = new Map(dbCities.map((c) => [c.name.toLowerCase(), c]));
  const cityBySlug = new Map(dbCities.map((c) => [c.slug, c]));

  let updated = 0;
  let skipped = 0;

  for (const area of urbanAreas) {
    const fullName = area.full_name;
    const href = area._links['ua:self'].href;
    const normName = normalise(fullName);

    // Match against DB by name (case-insensitive, country suffix stripped)
    const dbCity = cityByName.get(normName) ?? cityBySlug.get(normName.replace(/[^a-z0-9]+/g, '-'));

    if (!dbCity) {
      console.log(`⚠️  No DB match for Teleport area: ${fullName}`);
      skipped++;
      continue;
    }

    try {
      const scoresRes = await fetchJson<TeleportScores>(`${href}scores/`);
      const scores = scoresRes.categories;

      const getScore = (categoryName: string) =>
        scores.find((c) => c.name === categoryName)?.score_out_of_10 ?? null;

      const safetyRaw = getScore('Safety');
      const internetRaw = getScore('Internet Access');
      const outdoorsRaw = getScore('Outdoors & Nature');
      const envRaw = getScore('Environmental Quality');
      const familyRaw = getScore('Family');

      // "Outdoors & Nature" + "Environmental Quality" averaged → qualityOfLife
      const qualityRaw =
        outdoorsRaw !== null && envRaw !== null
          ? (outdoorsRaw + envRaw) / 2
          : (outdoorsRaw ?? envRaw);

      await prisma.city.upsert({
        where: { slug: dbCity.slug },
        create: {
          slug: dbCity.slug,
          name: dbCity.name,
          country: '',
          countryCode: 'XX',
          latitude: 0,
          longitude: 0,
          safetyScore: safetyRaw !== null ? safetyRaw * 10 : null,
          internetScore: internetRaw !== null ? internetRaw * 10 : null,
          qualityOfLife: qualityRaw !== null ? qualityRaw * 10 : null,
          familyScore: familyRaw !== null ? familyRaw * 10 : null,
        },
        update: {
          safetyScore: safetyRaw !== null ? safetyRaw * 10 : undefined,
          internetScore: internetRaw !== null ? internetRaw * 10 : undefined,
          qualityOfLife: qualityRaw !== null ? qualityRaw * 10 : undefined,
          familyScore: familyRaw !== null ? familyRaw * 10 : undefined,
        },
      });

      console.log(`✅ Updated: ${fullName}`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for ${fullName}:`, err);
      skipped++;
    }
  }

  console.log(`\n✅ Updated ${updated} cities, ⚠️ Skipped ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
