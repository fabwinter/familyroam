import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase';
import CityTabs from '@/components/CityTabs';

interface CityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CityDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug }, select: { name: true, country: true, description: true } });
  if (!city) return {};
  return {
    title: `${city.name}, ${city.country}`,
    description: city.description ?? undefined,
    openGraph: {
      title: `${city.name}, ${city.country} — FamilyRoam`,
      description: city.description ?? undefined,
    },
  };
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { slug } = await params;

  const [cityData, supabase] = await Promise.all([
    prisma.city.findUnique({
      where: { slug },
      include: {
        hubs: { take: 20 },
        reviews: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        visaInfo: { take: 50 },
      },
    }),
    createServerSupabaseClient(),
  ]);

  if (!cityData) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const dbUser = user
    ? await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
    : null;

  const isPro = dbUser?.plan === 'PRO';

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">{cityData.country}</p>
        <h1 className="text-4xl font-bold">{cityData.name}</h1>
      </div>
      {cityData.description && (
        <p className="text-lg text-muted-foreground mb-10">{cityData.description}</p>
      )}

      <CityTabs
        cityId={cityData.id}
        citySlug={cityData.slug}
        costMin={cityData.costMin}
        costAvg={cityData.costAvg}
        costMax={cityData.costMax}
        aqiAvg={cityData.aqiAvg}
        safetyScore={cityData.safetyScore}
        familyScore={cityData.familyScore}
        internetScore={cityData.internetScore}
        hubs={cityData.hubs}
        reviews={cityData.reviews}
        visaInfo={cityData.visaInfo}
        isPro={isPro}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
