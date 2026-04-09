import PaywallGate from '@/components/PaywallGate';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  visitedAt: Date | null;
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-yellow-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
          {review.title && <p className="font-medium mt-0.5">{review.title}</p>}
        </div>
        <div className="text-xs text-muted-foreground text-right shrink-0">
          <p>{review.user.name ?? 'Anonymous'}</p>
          {review.visitedAt && (
            <p>
              Visited{' '}
              {new Date(review.visitedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{review.body}</p>
    </div>
  );
}

export default function ReviewList({
  reviews,
  isPro,
}: {
  reviews: Review[];
  isPro: boolean;
}) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet. Be the first!</p>;
  }

  const FREE_LIMIT = 2;
  const visible = reviews.slice(0, FREE_LIMIT);
  const gated = reviews.slice(FREE_LIMIT);

  return (
    <div className="space-y-4">
      {visible.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
      {gated.length > 0 && (
        <PaywallGate isPro={isPro}>
          <div className="space-y-4">
            {gated.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </PaywallGate>
      )}
    </div>
  );
}
