'use client';

import { useState } from 'react';
import Link from 'next/link';

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  async function handleProCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRO_PRICE_ID }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === 'Unauthorized') {
        window.location.href = '/auth/login?next=/pricing';
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Start free. Upgrade when you&apos;re ready.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free plan */}
        <div className="rounded-xl border border-border bg-card p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold">Free</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <p className="mt-3 text-muted-foreground">
              Explore cities and get a taste of the platform.
            </p>
          </div>
          <ul className="space-y-2 flex-1">
            {[
              'Browse all city profiles',
              'Basic cost-of-living data',
              'Community reviews (first 2)',
              '5 saved cities',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Get started
          </Link>
        </div>

        {/* Pro plan */}
        <div className="rounded-xl border border-primary bg-primary/5 shadow-lg p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold">Pro</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">$12</span>
              <span className="text-muted-foreground">/per month</span>
            </div>
            <p className="mt-3 text-muted-foreground">
              Everything you need to plan your family&apos;s move.
            </p>
          </div>
          <ul className="space-y-2 flex-1">
            {[
              'Everything in Free',
              'Advanced filters & comparisons',
              'Visa info by passport',
              'AI-powered trip planner',
              'Unlimited saved cities',
              'Hub & co-living directory',
              'Priority support',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleProCheckout}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Start free trial'}
          </button>
        </div>
      </div>
    </div>
  );
}
