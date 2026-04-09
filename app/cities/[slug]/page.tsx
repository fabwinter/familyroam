import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface CityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CityDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) return {};
  return {
    title: `${city.name}, ${city.country}`,
    description: city.description ?? undefined,
  };
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) notFound();

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{city.country}</p>
        <h1 className="text-4xl font-bold">{city.name}</h1>
      </div>
      {city.description && (
        <p className="text-lg text-muted-foreground mb-10">{city.description}</p>
      )}
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Avg. Monthly Cost</p>
          <p className="text-2xl font-bold mt-1">
            {city.costAvg != null ? `$${city.costAvg.toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Safety Score</p>
          <p className="text-2xl font-bold mt-1">
            {city.safetyScore != null ? `${city.safetyScore}/100` : '—'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Family Score</p>
          <p className="text-2xl font-bold mt-1">
            {city.familyScore != null ? `${city.familyScore}/100` : '—'}
          </p>
        </div>
      </div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Community Reviews</h2>
        <p className="text-muted-foreground">No reviews yet. Be the first!</p>
      </section>
    </div>
  );
}
