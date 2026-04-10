/**
 * scripts/seed.ts
 *
 * Seeds the database with a curated set of cities popular with
 * worldschooling families.  Each city has realistic scores so the
 * directory, filters, and city detail pages work immediately.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import { computeFamilyScore } from '../lib/scoring';
import { fetchUnsplashCityImageUrl, unsplashCityUrl } from '../lib/utils';

const prisma = new PrismaClient();

interface SeedCity {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  continent: string;
  latitude: number;
  longitude: number;
  population: number;
  description: string;
  costMin: number;
  costAvg: number;
  costMax: number;
  safetyScore: number;
  internetScore: number;
  qualityOfLife: number;
  aqiAvg: number;
  homeschoolLegal: boolean;
  homeschoolNotes: string;
  familyVisaAvailable: boolean;
}

const CITIES: SeedCity[] = [
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    continent: 'europe',
    latitude: 38.7223,
    longitude: -9.1393,
    population: 545_000,
    description:
      'Sunny coastal capital with a strong family-friendly expat community, excellent public transport, and affordable living for Western Europe.',
    costMin: 1800,
    costAvg: 2800,
    costMax: 4200,
    safetyScore: 82,
    internetScore: 78,
    qualityOfLife: 80,
    aqiAvg: 32,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal in Portugal. Families must register with the local school.',
    familyVisaAvailable: true,
  },
  {
    slug: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    countryCode: 'TH',
    continent: 'asia',
    latitude: 18.7883,
    longitude: 98.9853,
    population: 131_000,
    description:
      'The original digital nomad hub — incredibly affordable, rich in culture, and home to multiple international schools and co-learning spaces.',
    costMin: 800,
    costAvg: 1400,
    costMax: 2500,
    safetyScore: 75,
    internetScore: 72,
    qualityOfLife: 68,
    aqiAvg: 85,
    homeschoolLegal: true,
    homeschoolNotes: 'Thai law requires children to attend school but rarely enforces on foreign families.',
    familyVisaAvailable: true,
  },
  {
    slug: 'medellin',
    name: 'Medellín',
    country: 'Colombia',
    countryCode: 'CO',
    continent: 'americas',
    latitude: 6.2442,
    longitude: -75.5812,
    population: 2_500_000,
    description:
      'Spring-like weather year-round, growing family expat community, and remarkably low cost of living.',
    costMin: 1000,
    costAvg: 1800,
    costMax: 3000,
    safetyScore: 55,
    internetScore: 68,
    qualityOfLife: 62,
    aqiAvg: 55,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal in Colombia. No registration required for foreign residents.',
    familyVisaAvailable: true,
  },
  {
    slug: 'bali',
    name: 'Bali (Canggu)',
    country: 'Indonesia',
    countryCode: 'ID',
    continent: 'asia',
    latitude: -8.6478,
    longitude: 115.1385,
    population: 4_300_000,
    description:
      'Tropical island with a massive worldschooling community, affordable cost of living, and nature-based learning opportunities.',
    costMin: 1000,
    costAvg: 2000,
    costMax: 3500,
    safetyScore: 65,
    internetScore: 60,
    qualityOfLife: 65,
    aqiAvg: 45,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is common among foreign families. Several co-learning spaces available.',
    familyVisaAvailable: false,
  },
  {
    slug: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    continent: 'europe',
    latitude: 41.3851,
    longitude: 2.1734,
    population: 1_600_000,
    description:
      'Vibrant Mediterranean city with world-class culture, beaches, excellent healthcare, and a thriving international school scene.',
    costMin: 2200,
    costAvg: 3500,
    costMax: 5500,
    safetyScore: 72,
    internetScore: 80,
    qualityOfLife: 85,
    aqiAvg: 38,
    homeschoolLegal: false,
    homeschoolNotes: 'Homeschooling occupies a legal grey area in Spain. Some families unschool without issues.',
    familyVisaAvailable: true,
  },
  {
    slug: 'playa-del-carmen',
    name: 'Playa del Carmen',
    country: 'Mexico',
    countryCode: 'MX',
    continent: 'americas',
    latitude: 20.6296,
    longitude: -87.0739,
    population: 304_000,
    description:
      'Caribbean beach town popular with worldschooling families. Easy US time zones, warm year-round, and growing co-learning options.',
    costMin: 1200,
    costAvg: 2200,
    costMax: 3800,
    safetyScore: 58,
    internetScore: 65,
    qualityOfLife: 70,
    aqiAvg: 28,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal in Mexico. Many foreign families operate under tourist visa with no issues.',
    familyVisaAvailable: true,
  },
  {
    slug: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    countryCode: 'MY',
    continent: 'asia',
    latitude: 3.139,
    longitude: 101.6869,
    population: 1_800_000,
    description:
      'Modern, multicultural capital with excellent international schools, affordable healthcare, and fantastic food.',
    costMin: 1000,
    costAvg: 1800,
    costMax: 3200,
    safetyScore: 70,
    internetScore: 75,
    qualityOfLife: 72,
    aqiAvg: 60,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal and increasingly popular. The MM2H visa makes long-term stays easy.',
    familyVisaAvailable: true,
  },
  {
    slug: 'tbilisi',
    name: 'Tbilisi',
    country: 'Georgia',
    countryCode: 'GE',
    continent: 'europe',
    latitude: 41.7151,
    longitude: 44.8271,
    population: 1_100_000,
    description:
      'Incredibly affordable European capital with visa-free stays for most nationalities, warm culture, and growing expat scene.',
    costMin: 700,
    costAvg: 1200,
    costMax: 2000,
    safetyScore: 78,
    internetScore: 70,
    qualityOfLife: 60,
    aqiAvg: 42,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal. Georgia offers 1-year visa-free stays for many passport holders.',
    familyVisaAvailable: true,
  },
  {
    slug: 'buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    countryCode: 'AR',
    continent: 'americas',
    latitude: -34.6037,
    longitude: -58.3816,
    population: 3_000_000,
    description:
      'Cultural capital of South America with European architecture, family parks, and extremely affordable living due to favorable exchange rates.',
    costMin: 800,
    costAvg: 1500,
    costMax: 2800,
    safetyScore: 50,
    internetScore: 65,
    qualityOfLife: 65,
    aqiAvg: 35,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal in Argentina. Registration with the local education authority is recommended.',
    familyVisaAvailable: false,
  },
  {
    slug: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    countryCode: 'CZ',
    continent: 'europe',
    latitude: 50.0755,
    longitude: 14.4378,
    population: 1_300_000,
    description:
      'Stunning historic city in the heart of Europe with excellent public transport, low crime, and a growing international community.',
    costMin: 1800,
    costAvg: 2800,
    costMax: 4500,
    safetyScore: 85,
    internetScore: 82,
    qualityOfLife: 82,
    aqiAvg: 40,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal with regular assessment requirements.',
    familyVisaAvailable: true,
  },
  {
    slug: 'da-nang',
    name: 'Da Nang',
    country: 'Vietnam',
    countryCode: 'VN',
    continent: 'asia',
    latitude: 16.0544,
    longitude: 108.2022,
    population: 1_100_000,
    description:
      'Beachside city with incredibly low costs, improving infrastructure, and a relaxed pace perfect for families.',
    costMin: 600,
    costAvg: 1100,
    costMax: 2000,
    safetyScore: 72,
    internetScore: 68,
    qualityOfLife: 60,
    aqiAvg: 50,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling for foreign families is not regulated. Several international schools available.',
    familyVisaAvailable: false,
  },
  {
    slug: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    countryCode: 'ZA',
    continent: 'africa',
    latitude: -33.9249,
    longitude: 18.4241,
    population: 4_600_000,
    description:
      'Stunning natural beauty, world-class outdoor activities for families, and favorable exchange rates for USD/EUR earners.',
    costMin: 1200,
    costAvg: 2000,
    costMax: 3500,
    safetyScore: 40,
    internetScore: 62,
    qualityOfLife: 65,
    aqiAvg: 25,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal and well-established. Must register with the provincial education department.',
    familyVisaAvailable: false,
  },
  {
    slug: 'tulum',
    name: 'Tulum',
    country: 'Mexico',
    countryCode: 'MX',
    continent: 'americas',
    latitude: 20.2115,
    longitude: -87.4654,
    population: 46_000,
    description:
      'Bohemian beach town with cenotes, ruins, and a tight-knit worldschooling community.',
    costMin: 1500,
    costAvg: 2500,
    costMax: 4000,
    safetyScore: 55,
    internetScore: 55,
    qualityOfLife: 68,
    aqiAvg: 22,
    homeschoolLegal: true,
    homeschoolNotes: 'Same as greater Mexico — homeschooling is legal. Limited formal co-learning spaces.',
    familyVisaAvailable: true,
  },
  {
    slug: 'porto',
    name: 'Porto',
    country: 'Portugal',
    countryCode: 'PT',
    continent: 'europe',
    latitude: 41.1579,
    longitude: -8.6291,
    population: 249_000,
    description:
      'Charming coastal city, slightly more affordable than Lisbon, with great food, walkability, and a warm expat community.',
    costMin: 1500,
    costAvg: 2400,
    costMax: 3800,
    safetyScore: 84,
    internetScore: 76,
    qualityOfLife: 78,
    aqiAvg: 30,
    homeschoolLegal: true,
    homeschoolNotes: 'Same regulations as the rest of Portugal. Register with the local school.',
    familyVisaAvailable: true,
  },
  {
    slug: 'tallinn',
    name: 'Tallinn',
    country: 'Estonia',
    countryCode: 'EE',
    continent: 'europe',
    latitude: 59.437,
    longitude: 24.7536,
    population: 437_000,
    description:
      'Digital-first society with e-Residency, medieval old town, excellent internet, and family-friendly parks.',
    costMin: 1600,
    costAvg: 2500,
    costMax: 4000,
    safetyScore: 88,
    internetScore: 90,
    qualityOfLife: 78,
    aqiAvg: 18,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal. Estonia is very progressive with digital education tools.',
    familyVisaAvailable: true,
  },
  {
    slug: 'melbourne',
    name: 'Melbourne',
    country: 'Australia',
    countryCode: 'AU',
    continent: 'oceania',
    latitude: -37.8136,
    longitude: 144.9631,
    population: 5_000_000,
    description:
      'World-class city for families with top schools, parks, beaches, and an incredibly high quality of life.',
    costMin: 2800,
    costAvg: 4500,
    costMax: 7000,
    safetyScore: 80,
    internetScore: 78,
    qualityOfLife: 90,
    aqiAvg: 28,
    homeschoolLegal: true,
    homeschoolNotes: 'Homeschooling is legal and well-regulated in Victoria. Registration required.',
    familyVisaAvailable: true,
  },
];

async function main() {
  console.log(`🌱 Seeding ${CITIES.length} cities…\n`);

  for (const city of CITIES) {
    const familyScore = computeFamilyScore({
      safetyScore: city.safetyScore,
      aqiAvg: city.aqiAvg,
      costAvg: city.costAvg,
      internetScore: city.internetScore,
      qualityOfLife: city.qualityOfLife,
    });

    const imageUrl =
      (await fetchUnsplashCityImageUrl(city.name, city.country)) ??
      unsplashCityUrl(city.name);

    await prisma.city.upsert({
      where: { slug: city.slug },
      create: { ...city, familyScore, imageUrl },
      update: { ...city, familyScore, imageUrl },
    });

    console.log(
      `  ✅ ${city.name} (${city.country}) — familyScore: ${familyScore ?? 'n/a'}`
    );
  }

  console.log(`\n🎉 Seeded ${CITIES.length} cities successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
