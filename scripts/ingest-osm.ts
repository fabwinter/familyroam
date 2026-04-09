/**
 * ingest-osm.ts
 *
 * Uses the Nominatim (OpenStreetMap) API to geocode cities stored in the DB
 * and fill in missing latitude/longitude, countryCode, and continent fields.
 *
 * Nominatim usage policy: max 1 req/s, set a custom User-Agent.
 *
 * Usage:
 *   npm run ingest:osm
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'familyroam-ingestion/1.0 (contact@familyroam.com)';

interface NominatimResult {
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    country?: string;
    country_code?: string;
  };
}

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  US: 'Americas', CA: 'Americas', MX: 'Americas', BR: 'Americas', AR: 'Americas', CO: 'Americas',
  GB: 'Europe', DE: 'Europe', FR: 'Europe', ES: 'Europe', IT: 'Europe', PT: 'Europe', NL: 'Europe',
  TH: 'Asia', JP: 'Asia', SG: 'Asia', VN: 'Asia', ID: 'Asia', PH: 'Asia', MY: 'Asia', IN: 'Asia',
  AU: 'Oceania', NZ: 'Oceania',
  ZA: 'Africa', NG: 'Africa', KE: 'Africa', GH: 'Africa',
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cities = await prisma.city.findMany({
    where: { OR: [{ latitude: 0 }, { longitude: 0 }] },
    take: 500,
  });

  console.log(`Geocoding ${cities.length} cities…`);

  for (const city of cities) {
    await delay(1100); // Nominatim rate limit: 1 req/s
    try {
      const results = await fetchJson<NominatimResult[]>(
        `${NOMINATIM_API}/search?city=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}&format=json&addressdetails=1&limit=1`
      );

      if (!results.length) {
        console.warn(`⚠️  No results for ${city.name}`);
        continue;
      }

      const { lat, lon, address } = results[0];
      const countryCode = (address.country_code ?? 'XX').toUpperCase();
      const continent = COUNTRY_TO_CONTINENT[countryCode] ?? null;

      await prisma.city.update({
        where: { id: city.id },
        data: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          countryCode,
          continent,
          country: address.country ?? city.country,
        },
      });

      console.log(`✅ Geocoded: ${city.name} → ${lat}, ${lon} (${countryCode})`);
    } catch (err) {
      console.error(`❌ Failed for ${city.name}:`, err);
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
