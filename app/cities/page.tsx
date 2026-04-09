import type { Metadata } from 'next';
import { Suspense } from 'react';
import CityCard from '@/components/CityCard';
import FilterSidebar from '@/components/FilterSidebar';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'City Directory',
  description: 'Browse and filter the best cities for families living abroad.',
};

interface CitiesPageProps {
  searchParams: Promise<{
    continent?: string;
    maxCost?: string;
    minSafety?: string;
    sortBy?: string;
  }>;
}

export default async function CitiesPage({ searchParams }: CitiesPageProps) {
  const { continent, maxCost, minSafety, sortBy } = await searchParams;

  type SortField = 'familyScore' | 'costAvg' | 'safetyScore' | 'aqiAvg';
  const VALID_SORT: Record<string, { field: SortField; order: 'asc' | 'desc' }> = {
    familyScore: { field: 'familyScore', order: 'desc' },
    cost: { field: 'costAvg', order: 'asc' },
    safety: { field: 'safetyScore', order: 'desc' },
    aqi: { field: 'aqiAvg', order: 'asc' },
  };
  const sort = (sortBy && VALID_SORT[sortBy]) ? VALID_SORT[sortBy] : VALID_SORT.familyScore;

  const cities = await prisma.city.findMany({
    where: {
      ...(continent ? { continent: { equals: continent, mode: 'insensitive' } } : {}),
      ...(maxCost ? { costAvg: { lte: Number(maxCost) } } : {}),
      ...(minSafety ? { safetyScore: { gte: Number(minSafety) } } : {}),
    },
    orderBy: { [sort.field]: sort.order },
    take: 100,
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      costAvg: true,
      safetyScore: true,
      familyScore: true,
      imageUrl: true,
    },
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">City Directory</h1>
      <p className="text-muted-foreground mb-8">
        Find the perfect city for your family&apos;s next chapter.
      </p>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense fallback={<div className="w-64 space-y-6 animate-pulse" />}>
            <FilterSidebar />
          </Suspense>
        </aside>
        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {cities.length === 0 ? (
            <p className="text-muted-foreground col-span-full">
              No cities match your filters.
            </p>
          ) : (
            cities.map((city) => <CityCard key={city.slug} {...city} />)
          )}
        </div>
      </div>
    </div>
  );
}
