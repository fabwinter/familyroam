import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Find your family&apos;s next home base
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        FamilyRoam helps families living abroad discover the best cities
        worldwide — ranked by safety, cost of living, schools, and more.
      </p>
      <div className="flex gap-4">
        <Link
          href="/cities"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium shadow hover:bg-primary/90 transition-colors"
        >
          Explore Cities
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          View Pricing
        </Link>
      </div>
    </div>
  );
}
