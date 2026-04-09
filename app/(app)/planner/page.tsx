import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip Planner',
};

export default function PlannerPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-2">Trip Planner</h1>
      <p className="text-muted-foreground mb-8">
        Build your family's relocation or travel itinerary city by city.
      </p>
      <div className="rounded-xl border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Your planner is empty</h2>
        <p className="text-muted-foreground mb-6">
          Start by adding cities you're interested in to build your personalized plan.
        </p>
        <a
          href="/cities"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Cities
        </a>
      </div>
    </div>
  );
}
