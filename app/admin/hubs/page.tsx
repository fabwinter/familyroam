import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Hub Submissions — Admin',
};

async function approveHub(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await prisma.hub.update({ where: { id }, data: { verified: true } });
  revalidatePath('/admin/hubs');
}

async function rejectHub(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await prisma.hub.delete({ where: { id } });
  revalidatePath('/admin/hubs');
}

export default async function AdminHubsPage() {
  const hubs = await prisma.hub.findMany({
    where: { verified: false },
    include: { city: { select: { name: true, country: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Admin
        </Link>
        <h1 className="text-3xl font-bold">Hub Submissions</h1>
        <span className="text-sm text-muted-foreground">({hubs.length} pending)</span>
      </div>

      {hubs.length === 0 ? (
        <p className="text-muted-foreground">No pending hub submissions.</p>
      ) : (
        <div className="space-y-6">
          {hubs.map((hub) => (
            <div key={hub.id} className="rounded-lg border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{hub.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {hub.city.name}, {hub.city.country}
                  </p>
                  {hub.description && (
                    <p className="text-sm mt-2">{hub.description}</p>
                  )}
                  {hub.website && (
                    <a
                      href={hub.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 block"
                    >
                      {hub.website}
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {hub.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={approveHub}>
                    <input type="hidden" name="id" value={hub.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={rejectHub}>
                    <input type="hidden" name="id" value={hub.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
