import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — FamilyRoam',
};

export default async function AdminPage() {
  const [userCount, cityCount, reviewCount, pendingHubCount] = await Promise.all([
    prisma.user.count(),
    prisma.city.count(),
    prisma.review.count(),
    prisma.hub.count({ where: { verified: false } }),
  ]);

  const proUsers = await prisma.user.count({ where: { plan: 'PRO' } });

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-4 mb-12">
        {[
          { label: 'Total Users', value: userCount },
          { label: 'Pro Users', value: proUsers },
          { label: 'Cities', value: cityCount },
          { label: 'Reviews', value: reviewCount },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-6">
            <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Hub Submissions</h2>
            <span className="text-sm font-medium text-yellow-600">
              {pendingHubCount} pending
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Review and approve worldschool hub submissions from the community.
          </p>
          <Link
            href="/admin/hubs"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Review hubs →
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Reviews</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {reviewCount} total
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Moderate community reviews and remove any that violate guidelines.
          </p>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Moderate reviews →
          </Link>
        </div>
      </div>
    </div>
  );
}
