'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('City page error:', error);
  }, [error]);

  return (
    <div className="container py-20 text-center max-w-md mx-auto">
      <p className="text-4xl mb-4">😕</p>
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">
        We couldn&apos;t load this city page. Please try again or go back to the directory.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/cities"
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Back to Cities
        </Link>
      </div>
    </div>
  );
}
