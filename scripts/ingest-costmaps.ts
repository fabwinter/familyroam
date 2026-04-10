/**
 * ingest-costmaps.ts
 *
 * Gap-fills cost, safety, and internet data from the CostMaps API (free tier:
 * 100 calls/day, no credit card required).
 *
 * Only updates fields that are currently null in the DB — will not overwrite
 * values already set by WhereNext or Teleport.
 *
 * Requires: COSTMAPS_API_KEY environment variable
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/ingest-costmaps.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COSTMAPS_API = 'https://api.costmaps.com/v1';
const API_KEY = process.env.COSTMAPS_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing COSTMAPS_API_KEY environment variable');
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CostMaps response shape may vary
interface CostMapsResponse {
  cost_of_living?: {
    monthly_total?: number;
    monthly_total_min?: number;
    monthly_total_max?: number;
  };
  safety?: {
    score?: number;
  };
  internet?: {
    speed_mbps?: number;
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (res.status === 429) {
    console.error('Daily limit reached.');
    process.exit(1);
  }

  if (!res.ok) {
    throw new Error(`CostMaps API error: ${res.status} ${url}`);
  }

  return res.json() as Promise<T>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalise internet speed to a 0–100 score (100 Mbps = 100, linear). */
function speedToScore(mbps: number): number {
  return Math.min(100, Math.round(mbps));
}

async function main() {
  console.log('⬇️  Loading cities from DB…');

  const cities = await prisma.city.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      countryCode: true,
      costMin: true,
      costMax: true,
      safetyScore: true,
      internetScore: true,
    },
  });

  console.log(`Found ${cities.length} cities in DB`);

  let updated = 0;
  let skipped = 0;

  for (const city of cities) {
    // Only fetch if at least one field is missing
    const needsCost = city.costMin === null || city.costMax === null;
    const needsSafety = city.safetyScore === null;
    const needsInternet = city.internetScore === null;

    if (!needsCost && !needsSafety && !needsInternet) {
      skipped++;
      continue;
    }

    await delay(2000);

    try {
      const url =
        `${COSTMAPS_API}/city/${encodeURIComponent(city.name)}` +
        `?country=${encodeURIComponent(city.countryCode)}`;

      const data = await fetchJson<CostMapsResponse>(url);

      if (!data) {
        skipped++;
        continue;
      }

      const updatePayload: {
        costMin?: number;
        costMax?: number;
        safetyScore?: number;
        internetScore?: number;
      } = {};

      if (needsCost) {
        const min = data.cost_of_living?.monthly_total_min;
        const max = data.cost_of_living?.monthly_total_max;
        const total = data.cost_of_living?.monthly_total;

        if (city.costMin === null && (min ?? total) != null) {
          updatePayload.costMin = Math.round((min ?? total)!);
        }
        if (city.costMax === null && (max ?? total) != null) {
          updatePayload.costMax = Math.round((max ?? total)!);
        }
      }

      if (needsSafety && data.safety?.score != null) {
        updatePayload.safetyScore = data.safety.score;
      }

      if (needsInternet && data.internet?.speed_mbps != null) {
        updatePayload.internetScore = speedToScore(data.internet.speed_mbps);
      }

      if (Object.keys(updatePayload).length === 0) {
        console.log(`⚠️  No new data for ${city.name}`);
        skipped++;
        continue;
      }

      await prisma.city.upsert({
        where: { slug: city.slug },
        create: {
          slug: city.slug,
          name: city.name,
          country: '',
          countryCode: city.countryCode,
          latitude: 0,
          longitude: 0,
          ...updatePayload,
        },
        update: updatePayload,
      });

      console.log(`✅ Gap-filled: ${city.name} (${Object.keys(updatePayload).join(', ')})`);
      updated++;
    } catch (err) {
      console.error(`❌ Failed for ${city.name}:`, err);
      skipped++;
    }
  }

  console.log(`\n✅ Updated ${updated} cities, ⚠️ Skipped ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
