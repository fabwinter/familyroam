import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Review Moderation — Admin',
};

async function deleteReview(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await prisma.review.delete({ where: { id } });
  revalidatePath('/admin/reviews');
}

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      city: { select: { name: true } },
      user: { select: { email: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Admin
        </Link>
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-sm">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                    <span className="text-sm font-medium">{review.city.name}</span>
                    <span className="text-xs text-muted-foreground">
                      by {review.user.name ?? review.user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-medium text-sm">{review.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{review.body}</p>
                </div>
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
