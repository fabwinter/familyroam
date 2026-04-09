import type { Metadata } from 'next';
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

  const reviewCount = user
    ? await prisma.review.count({ where: { userId: user.id } })
    : 0;

  const plan: string = (user?.user_metadata?.plan as string | undefined) ?? 'Free';

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Saved Cities</h2>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Reviews Written</h2>
          <p className="mt-2 text-3xl font-bold">{reviewCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Plan</h2>
          <p className="mt-2 text-3xl font-bold">{plan}</p>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Saved Cities</h2>
        <p className="text-muted-foreground">
          You haven't saved any cities yet.{' '}
          <a href="/cities" className="text-primary hover:underline">
            Explore cities →
          </a>
        </p>
      </div>
    </div>
  );
}
