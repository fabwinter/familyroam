/**
 * ingest-iqair.ts
 *
 * Fetches air quality (AQI) data from the IQAir API and upserts it into the
 * `cities` table via Prisma.
 *
 * IQAir API docs: https://api-docs.iqair.com/
 * Requires: IQAIR_API_KEY environment variable
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/ingest-iqair.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IQAIR_API = 'https://api.airvisual.com/v2';
const API_KEY = process.env.IQAIR_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing IQAIR_API_KEY environment variable');
  process.exit(1);
}

interface IQAirCityData {
  data: {
    city: string;
    state: string;
    country: string;
    current: {
      pollution: {
        aqius: number;
        mainus: string;
      };
    };
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`IQAir API error: ${res.status} ${url}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('⬇️  Loading cities from DB…');

  const cities = await prisma.city.findMany({
    select: { id: true, slug: true, name: true, country: true },
  });

  console.log(`Found ${cities.length} cities in DB`);

  let updated = 0;
  let skipped = 0;

  for (const city of cities) {
    await delay(1000);

    try {
      // IQAir requires state; use empty string to let API infer it
      const url =
        `${IQAIR_API}/city?city=${encodeURIComponent(city.name)}` +
        `&state=&country=${encodeURIComponent(city.country)}&key=${API_KEY}`;

      const cityData = await fetchJson<IQAirCityData>(url);
      const aqi = cityData.data.current.pollution.aqius;

      await prisma.city.upsert({
        where: { slug: city.slug },
        create: {
          slug: city.slug,
          name: city.name,
          country: city.country,
          countryCode: 'XX',
          latitude: 0,
          longitude: 0,
          aqiAvg: aqi,
        },
        update: { aqiAvg: aqi },
      });

      console.log(`✅ ${city.name}, ${city.country} — AQI: ${aqi}`);
      updated++;
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 404 || status === 400) {
        console.log(`⚠️  Skipping ${city.name} (${status} — city/state unknown)`);
      } else {
        console.error(`❌ Failed for ${city.name}:`, err);
      }
      skipped++;
    }
  }

  console.log(`\n✅ Updated ${updated} cities, ⚠️ Skipped ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
