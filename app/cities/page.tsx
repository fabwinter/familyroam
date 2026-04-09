import type { Metadata } from 'next';
import CityCard from '@/components/CityCard';
import FilterSidebar from '@/components/FilterSidebar';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'City Directory',
  description: 'Browse and filter the best cities for families living abroad.',
};

export default async function CitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: { familyScore: 'desc' },
    take: 50,
    select: {
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
        Find the perfect city for your family's next chapter.
      </p>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar />
        </aside>
        <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {cities.map((city) => (
            <CityCard key={city.slug} {...city} />
          ))}
        </div>
      </div>
    </div>
  );
}
