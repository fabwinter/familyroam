/**
 * scripts/backfill-scores.ts
 *
 * Recomputes `familyScore` for every city using the v1 formula in
 * lib/scoring.ts and writes the result back to the database.
 *
 * Safe to rerun — uses upsert/update with no side effects on other fields.
 *
 * Usage:
 *   npm run ingest:backfill
 */

import { PrismaClient } from '@prisma/client';
import { computeFamilyScore } from '../lib/scoring';

const prisma = new PrismaClient();

async function main() {
  console.log('🔢  Backfilling familyScore for all cities…');

  const cities = await prisma.city.findMany({
    select: {
      id: true,
      name: true,
      safetyScore: true,
      aqiAvg: true,
      costAvg: true,
      internetScore: true,
      qualityOfLife: true,
    },
  });

  console.log(`Found ${cities.length} cities`);

  let updated = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const city of cities) {
    try {
      const score = computeFamilyScore({
        safetyScore: city.safetyScore,
        aqiAvg: city.aqiAvg,
        costAvg: city.costAvg,
        internetScore: city.internetScore,
        qualityOfLife: city.qualityOfLife,
      });

      if (score === null) {
        console.warn(`⚠️  No data for "${city.name}" — skipping`);
        skipped++;
        continue;
      }

      await prisma.city.update({
        where: { id: city.id },
        data: { familyScore: score },
      });

      console.log(`✅  ${city.name}: ${score}`);
      updated++;
    } catch (err) {
      console.error(`❌  Failed for "${city.name}":`, err);
      failures.push(city.name);
    }
  }

  console.log('\n─── Summary ──────────────────────────');
  console.log(`Updated : ${updated}`);
  console.log(`Skipped : ${skipped} (insufficient data)`);
  console.log(`Failed  : ${failures.length}`);
  if (failures.length > 0) {
    console.log('Failed cities:', failures.join(', '));
  }
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
