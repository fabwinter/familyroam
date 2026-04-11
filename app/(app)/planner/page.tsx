import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Plan } from '@prisma/client';
import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import PlannerClient from './_PlannerClient';

export const metadata: Metadata = {
  title: 'Trip Planner',
};

export default async function PlannerPage() {
  let user = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error('Planner: auth check failed:', err);
  }

  // Middleware already redirects unauthenticated users, but guard just in case.
  if (!user) {
    redirect('/auth/login');
  }

  let dbUser: { plan: Plan } | null = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });
  } catch (err) {
    console.error('Planner: database query failed:', err);
  }

  if (dbUser?.plan !== 'PRO') {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-3">Trip Planner</h1>
        <p className="text-muted-foreground mb-6">
          The trip planner is a Pro feature. Upgrade to build your
          family&apos;s itinerary city by city.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  return <PlannerClient />;
}
