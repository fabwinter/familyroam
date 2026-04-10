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
      title: `${city.name}, ${city.country} — Roaming Families`,
      description: city.description ?? undefined,
    },
  };
}

export default async function CityDetailPage({ params }: CityDetailPageProps) {
  const { slug } = await params;

  const cityData = await prisma.city.findUnique({
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
  });

  if (!cityData) notFound();

  // Auth is best-effort: if Supabase is unavailable the page still renders
  // as an unauthenticated (free-tier) visitor — the same pattern used in Nav.
  let user = null;
  let isPro = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true },
      });
      isPro = dbUser?.plan === 'PRO';
    }
  } catch (err) {
    // Auth check failed (e.g. missing env vars, network error, users table not yet seeded).
    // Render as unauthenticated free-tier visitor.
    console.error('City page auth check failed:', err);
  }

  // Server-side paywall: withhold gated data for non-PRO users so it
  // cannot be extracted from the page source / JS bundle.
  const FREE_REVIEW_LIMIT = 2;
  const hubs = isPro ? cityData.hubs : [];
  const visaInfo = isPro ? cityData.visaInfo : [];
  const reviews = isPro
    ? cityData.reviews
    : cityData.reviews.slice(0, FREE_REVIEW_LIMIT);
  const costMin = isPro ? cityData.costMin : null;
  const costMax = isPro ? cityData.costMax : null;
  const homeschoolLegal = isPro ? cityData.homeschoolLegal : null;
  const homeschoolNotes = isPro ? cityData.homeschoolNotes : null;
  const familyVisaAvailable = isPro ? cityData.familyVisaAvailable : null;
  const internetScore = isPro ? cityData.internetScore : null;
  const aqiAvg = isPro ? cityData.aqiAvg : null;

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
        costMin={costMin}
        costAvg={cityData.costAvg}
        costMax={costMax}
        aqiAvg={aqiAvg}
        safetyScore={cityData.safetyScore}
        familyScore={cityData.familyScore}
        internetScore={internetScore}
        homeschoolLegal={homeschoolLegal}
        homeschoolNotes={homeschoolNotes}
        familyVisaAvailable={familyVisaAvailable}
        hubs={hubs}
        reviews={reviews}
        visaInfo={visaInfo}
        isPro={isPro}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
