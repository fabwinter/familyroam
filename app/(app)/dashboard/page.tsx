import type { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [reviewCount, savedCount, dbUser] = await Promise.all([
    user ? prisma.review.count({ where: { userId: user.id } }) : 0,
    user ? prisma.savedCity.count({ where: { userId: user.id } }).catch(() => 0) : 0,
    user
      ? prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
      : null,
  ]);

  const plan = dbUser?.plan ?? 'FREE';

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
          <p className="text-muted-foreground">
            <Link href="/cities" className="text-primary hover:underline">
              Browse your saved cities →
            </Link>
          </p>
        )}
      </div>
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
