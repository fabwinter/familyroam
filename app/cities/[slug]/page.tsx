import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface CityDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Placeholder – replace with `prisma.city.findUnique({ where: { slug } })`
async function getCity(slug: string) {
  const cities: Record<string, { name: string; country: string; description: string; costAvg: number; safetyScore: number; familyScore: number }> = {
    lisbon: {
      name: 'Lisbon',
      country: 'Portugal',
      description:
        'Lisbon is a sun-drenched, family-friendly capital with excellent international schools, affordable living by Western European standards, and a welcoming expat community.',
      costAvg: 2800,
      safetyScore: 82,
      familyScore: 78,
    },
    'chiang-mai': {
      name: 'Chiang Mai',
      country: 'Thailand',
      description:
        'Chiang Mai offers a relaxed lifestyle, world-class street food, vibrant co-working culture, and very low cost of living — popular with digital nomad families.',
      costAvg: 1500,
      safetyScore: 74,
      familyScore: 80,
    },
    medellin: {
      name: 'Medellín',
      country: 'Colombia',
      description:
        'Once notorious, Medellín has transformed into a modern, innovative city with spring-like weather year-round and a growing international community.',
      costAvg: 1800,
      safetyScore: 58,
      familyScore: 70,
    },
  };
  return cities[slug] ?? null;
}

export async function generateMetadata({ params }: CityDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) return {};
  return {
    title: `${city.name}, ${city.country}`,
    description: city.description,
  };
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { slug } = await params;
  const city = await getCity(slug);
  if (!city) notFound();

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{city.country}</p>
        <h1 className="text-4xl font-bold">{city.name}</h1>
      </div>
      <p className="text-lg text-muted-foreground mb-10">{city.description}</p>
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Avg. Monthly Cost</p>
          <p className="text-2xl font-bold mt-1">${city.costAvg.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Safety Score</p>
          <p className="text-2xl font-bold mt-1">{city.safetyScore}/100</p>
        </div>
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Family Score</p>
          <p className="text-2xl font-bold mt-1">{city.familyScore}/100</p>
        </div>
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Community Reviews</h2>
        <p className="text-muted-foreground">No reviews yet. Be the first!</p>
      </section>
    </div>
  );
}
