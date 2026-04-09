import Stripe from 'stripe';

let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
      typescript: true,
    });
  }
  return _stripe;
}

// Lazily-initialized proxy — safe to import at module level during build.
// The real Stripe client is only created when a property is first accessed.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripeClient(), prop, receiver);
  },
});
