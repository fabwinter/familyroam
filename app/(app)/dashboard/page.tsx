import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Plan } from '@prisma/client';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import CityCard from '@/components/CityCard';
import BillingPortalButton from './_BillingPortalButton';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  let user = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error('Dashboard: auth check failed:', err);
  }

  if (!user) {
    redirect('/auth/login');
  }

  let reviewCount = 0;
  let savedCities: Array<{
    userId: string;
    cityId: string;
    createdAt: Date;
    city: {
      id: string;
      slug: string;
      name: string;
      country: string;
      costAvg: number | null;
      safetyScore: number | null;
      familyScore: number | null;
      imageUrl: string | null;
    };
  }> = [];
  let dbUser: { plan: Plan; stripeCustomerId: string | null } | null = null;

  try {
    [reviewCount, savedCities, dbUser] = await Promise.all([
      prisma.review.count({ where: { userId: user.id } }),
      prisma.savedCity.findMany({
        where: { userId: user.id },
        include: {
          city: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { plan: true, stripeCustomerId: true },
      }),
    ]);
  } catch (err) {
    console.error('Dashboard: database query failed:', err);
  }

  const plan = dbUser?.plan ?? 'FREE';
  const savedCount = savedCities.length;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Saved Cities</h2>
          <p className="mt-2 text-3xl font-bold">{savedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Reviews Written</h2>
          <p className="mt-2 text-3xl font-bold">{reviewCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Plan</h2>
          <p className="mt-2 text-3xl font-bold capitalize">{plan.toLowerCase()}</p>
        </div>
      </div>

      {/* Saved cities grid */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Saved Cities</h2>
        {savedCount === 0 ? (
          <p className="text-muted-foreground">
            You haven&apos;t saved any cities yet.{' '}
            <Link href="/cities" className="text-primary hover:underline">
              Explore cities →
            </Link>
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedCities.map(({ city }) => (
              <CityCard key={city.slug} {...city} />
            ))}
          </div>
        )}
      </div>

      {/* PRO subscription management */}
      {plan === 'PRO' && dbUser?.stripeCustomerId && (
        <div className="mt-8 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Subscription</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re on the Pro plan. Manage billing, update payment methods,
            or cancel anytime.
          </p>
          <BillingPortalButton />
        </div>
      )}

      {plan === 'FREE' && (
        <div className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-6">
          <h2 className="text-lg font-semibold mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock visa info, hub directories, the trip planner, and unlimited saved cities.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View plans →
          </a>
        </div>
      )}
    </div>
  );
}
