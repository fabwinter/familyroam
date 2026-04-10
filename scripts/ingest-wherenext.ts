/**
 * ingest-wherenext.ts
 *
 * Fetches cost-of-living and visa data from the WhereNext Open API (no key
 * required) and upserts into the `cities` and `visa_info` tables via Prisma.
 *
 * WhereNext API: https://getwherenext.com/api/data
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/ingest-wherenext.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = 'https://getwherenext.com/api/data';

// ─── API response shapes ──────────────────────────────────────────────────────

interface WNColEntry {
  city: string;
  country?: string;
  cost_min?: number;
  cost_max?: number;
  cost_avg?: number;
}

interface WNCityPriceEntry {
  city: string;
  country?: string;
  monthly_total?: number;
}

interface WNVisaEntry {
  city: string;
  country?: string;
  passport_country: string;
  visa_required: boolean;
  stay_days?: number;
  visa_type?: string;
  notes?: string;
  source_url?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WhereNext API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function main() {
  console.log('⬇️  Fetching data from WhereNext Open API…');

  // Load all DB cities for matching
  const dbCities = await prisma.city.findMany({
    select: { id: true, slug: true, name: true },
  });

  const cityByName = new Map(dbCities.map((c) => [c.name.toLowerCase(), c]));
  const cityBySlug = new Map(dbCities.map((c) => [c.slug, c]));

  function findCity(name: string) {
    return (
      cityByName.get(name.toLowerCase()) ??
      cityBySlug.get(name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    );
  }

  // ── 1. Cost-of-living ──────────────────────────────────────────────────────
  console.log('\n⬇️  Fetching cost-of-living…');
  const colData = await fetchJson<WNColEntry[]>(`${BASE_URL}/cost-of-living`);

  // ── 2. City prices (per-city calibration) ─────────────────────────────────
  console.log('⬇️  Fetching city-prices…');
  const priceData = await fetchJson<WNCityPriceEntry[]>(`${BASE_URL}/city-prices`);
  const priceMap = new Map<string, number>();
  for (const p of priceData) {
    if (p.monthly_total != null) {
      priceMap.set(p.city.toLowerCase(), p.monthly_total);
    }
  }

  let costUpdated = 0;
  let costSkipped = 0;

  for (const entry of colData) {
    const city = findCity(entry.city);
    if (!city) {
      console.log(`⚠️  No DB match for cost-of-living city: ${entry.city}`);
      costSkipped++;
      continue;
    }

    // Prefer per-city calibrated monthly_total, fall back to country-level
    const calibrated = priceMap.get(entry.city.toLowerCase());

    const costAvg =
      calibrated != null
        ? Math.round(calibrated)
        : entry.cost_avg != null
        ? Math.round(entry.cost_avg)
        : null;

    await prisma.city.upsert({
      where: { slug: city.slug },
      create: {
        slug: city.slug,
        name: city.name,
        country: '',
        countryCode: 'XX',
        latitude: 0,
        longitude: 0,
        costMin: entry.cost_min != null ? Math.round(entry.cost_min) : null,
        costMax: entry.cost_max != null ? Math.round(entry.cost_max) : null,
        costAvg,
      },
      update: {
        costMin: entry.cost_min != null ? Math.round(entry.cost_min) : undefined,
        costMax: entry.cost_max != null ? Math.round(entry.cost_max) : undefined,
        costAvg: costAvg ?? undefined,
      },
    });

    costUpdated++;
  }

  console.log(`Cost-of-living: ✅ Updated ${costUpdated}, ⚠️ Skipped ${costSkipped}`);

  // ── 3. Visa requirements ──────────────────────────────────────────────────
  console.log('\n⬇️  Fetching visa requirements…');
  const visaData = await fetchJson<WNVisaEntry[]>(`${BASE_URL}/visa-requirements`);

  let visaUpdated = 0;
  let visaSkipped = 0;

  for (const entry of visaData) {
    const city = findCity(entry.city);
    if (!city) {
      console.log(`⚠️  No DB match for visa city: ${entry.city}`);
      visaSkipped++;
      continue;
    }

    const passportCountry = entry.passport_country.toUpperCase().slice(0, 2);
    if (passportCountry.length < 2) {
      console.log(`⚠️  Invalid passport_country "${entry.passport_country}" for ${entry.city} — skipping`);
      visaSkipped++;
      continue;
    }

    await prisma.visaInfo.upsert({
      where: {
        cityId_passportCountry: {
          cityId: city.id,
          passportCountry,
        },
      },
      create: {
        cityId: city.id,
        passportCountry,
        visaRequired: entry.visa_required,
        stayDays: entry.stay_days ?? null,
        visaType: entry.visa_type ?? null,
        notes: entry.notes ?? null,
        sourceUrl: entry.source_url ?? null,
      },
      update: {
        visaRequired: entry.visa_required,
        stayDays: entry.stay_days ?? undefined,
        visaType: entry.visa_type ?? undefined,
        notes: entry.notes ?? undefined,
        sourceUrl: entry.source_url ?? undefined,
      },
    });

    visaUpdated++;
  }

  console.log(`Visa info: ✅ Updated ${visaUpdated}, ⚠️ Skipped ${visaSkipped}`);
  console.log(
    `\n✅ Updated ${costUpdated + visaUpdated} records, ⚠️ Skipped ${costSkipped + visaSkipped}`
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
