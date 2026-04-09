/**
 * ingest-numbeo.ts
 *
 * Fetches cost-of-living data from the Numbeo API and upserts it into the
 * `cities` table via Prisma.
 *
 * Numbeo API docs: https://www.numbeo.com/api/
 * Requires: NUMBEO_API_KEY environment variable
 *
 * Usage:
 *   npm run ingest:numbeo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NUMBEO_API = 'https://www.numbeo.com/api';
const API_KEY = process.env.NUMBEO_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing NUMBEO_API_KEY environment variable');
  process.exit(1);
}

interface NumbeoCity {
  city: string;
  country: string;
  city_id: number;
}

interface NumbeoCostOfLiving {
  city: string;
  country: string;
  contributors12months: number;
  // Monthly costs for a family (indices)
  monthlyNetSalaryAfterTax?: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Numbeo API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log('⬇️  Fetching cities list from Numbeo…');

  const { cities } = await fetchJson<{ cities: NumbeoCity[] }>(
    `${NUMBEO_API}/cities?api_key=${API_KEY}`
  );

  console.log(`Found ${cities.length} cities`);

  for (const city of cities.slice(0, 200)) {
    try {
      const slug = `${city.city}-${city.country}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');

      const data = await fetchJson<NumbeoCostOfLiving>(
        `${NUMBEO_API}/city_prices?api_key=${API_KEY}&city=${encodeURIComponent(city.city)}&country=${encodeURIComponent(city.country)}`
      );

      // Estimate average monthly cost for a family of 3 (rough heuristic)
      const costAvg = data.monthlyNetSalaryAfterTax
        ? Math.round(data.monthlyNetSalaryAfterTax * 0.75)
        : null;

      await prisma.city.upsert({
        where: { slug },
        create: {
          slug,
          name: city.city,
          country: city.country,
          countryCode: 'XX',
          latitude: 0,
          longitude: 0,
          costAvg,
        },
        update: {
          costAvg: costAvg ?? undefined,
        },
      });

      console.log(`✅ Upserted: ${city.city}, ${city.country}`);
    } catch (err) {
      console.error(`❌ Failed for ${city.city}:`, err);
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
