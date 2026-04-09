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
 *   npm run ingest:iqair
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IQAIR_API = 'https://api.airvisual.com/v2';
const API_KEY = process.env.IQAIR_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing IQAIR_API_KEY environment variable');
  process.exit(1);
}

interface IQAirCountry {
  country: string;
}

interface IQAirCity {
  city: string;
}

interface IQAirCityData {
  data: {
    city: string;
    country: string;
    current: {
      pollution: {
        aqius: number; // US AQI
        mainus: string;
      };
    };
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IQAir API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('⬇️  Fetching countries from IQAir…');

  const { data: countries } = await fetchJson<{ data: IQAirCountry[] }>(
    `${IQAIR_API}/countries?key=${API_KEY}`
  );

  for (const { country } of countries.slice(0, 10)) {
    await delay(1200); // respect rate limits

    let cities: IQAirCity[] = [];
    try {
      const res = await fetchJson<{ data: IQAirCity[] }>(
        `${IQAIR_API}/cities?country=${encodeURIComponent(country)}&key=${API_KEY}`
      );
      cities = res.data;
    } catch {
      console.warn(`⚠️  Could not fetch cities for ${country}`);
      continue;
    }

    for (const { city } of cities.slice(0, 5)) {
      await delay(1200);
      try {
        const cityData = await fetchJson<IQAirCityData>(
          `${IQAIR_API}/city?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&key=${API_KEY}`
        );

        const aqi = cityData.data.current.pollution.aqius;
        const slug = `${city}-${country}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        await prisma.city.upsert({
          where: { slug },
          create: {
            slug,
            name: city,
            country,
            countryCode: 'XX',
            latitude: 0,
            longitude: 0,
            aqiAvg: aqi,
          },
          update: { aqiAvg: aqi },
        });

        console.log(`✅ ${city}, ${country} — AQI: ${aqi}`);
      } catch (err) {
        console.error(`❌ Failed for ${city}, ${country}:`, err);
      }
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
