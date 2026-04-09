import type { Metadata } from 'next';
import CityCard from '@/components/CityCard';
import FilterSidebar from '@/components/FilterSidebar';

export const metadata: Metadata = {
  title: 'City Directory',
  description: 'Browse and filter the best cities for families living abroad.',
};

// Placeholder data – replace with Prisma query once DB is connected
const SAMPLE_CITIES = [
  {
    slug: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    costAvg: 2800,
    safetyScore: 82,
    familyScore: 78,
    imageUrl: null,
  },
  {
    slug: 'chiang-mai',
    name: 'Chiang Mai',
    country: 'Thailand',
    costAvg: 1500,
    safetyScore: 74,
    familyScore: 80,
    imageUrl: null,
  },
  {
    slug: 'medellin',
    name: 'Medellín',
    country: 'Colombia',
    costAvg: 1800,
    safetyScore: 58,
    familyScore: 70,
    imageUrl: null,
  },
];

export default function CitiesPage() {
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
          {SAMPLE_CITIES.map((city) => (
            <CityCard key={city.slug} {...city} />
          ))}
        </div>
      </div>
    </div>
  );
}
