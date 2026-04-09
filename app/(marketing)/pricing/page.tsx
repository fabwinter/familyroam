import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for FamilyRoam.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Explore cities and get a taste of the platform.',
    features: [
      'Browse all city profiles',
      'Basic cost-of-living data',
      'Community reviews',
      '5 saved cities',
    ],
    cta: 'Get started',
    href: '/auth/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'Everything you need to plan your family's move.',
    features: [
      'Everything in Free',
      'Advanced filters & comparisons',
      'Visa info by passport',
      'AI-powered trip planner',
      'Unlimited saved cities',
      'Hub & co-living directory',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/auth/signup?plan=pro',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Start free. Upgrade when you're ready.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-8 flex flex-col gap-6 ${
              plan.highlighted
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border bg-card'
            }`}
          >
            <div>
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="mt-3 text-muted-foreground">{plan.description}</p>
            </div>
            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> {f}
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              className={`inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${
                plan.highlighted
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
