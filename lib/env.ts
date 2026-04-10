/**
 * Centralised environment variable access.
 *
 * - Public vars  (NEXT_PUBLIC_*) are exported as plain strings — safe in any component.
 * - Server vars  are exported as getter functions — they throw with an actionable hint
 *   when the variable is absent, and must never be imported in 'use client' files.
 *
 * Call `validateEnv()` from instrumentation.ts to surface missing vars at startup
 * rather than at the first request that needs them.
 */

// ─── Public vars ──────────────────────────────────────────────────────────────

export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export const NEXT_PUBLIC_STRIPE_PRO_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';

export const NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://familyroam.com';

// ─── Ingest-only vars (optional in production) ───────────────────────────────

export const NUMBEO_API_KEY = process.env.NUMBEO_API_KEY ?? '';
export const IQAIR_API_KEY = process.env.IQAIR_API_KEY ?? '';

// ─── Server-only vars ────────────────────────────────────────────────────────

function required(name: string, hint: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
        `  Where to get it: ${hint}\n` +
        `  Add it to .env.local (development) or your hosting provider's env settings (production).`
    );
  }
  return value;
}

export function getDatabaseUrl() {
  return required(
    'DATABASE_URL',
    'Supabase → Settings → Database → Connection string (Transaction/Pooled mode)'
  );
}

export function getDirectUrl() {
  return required(
    'DIRECT_URL',
    'Supabase → Settings → Database → Connection string (Session mode, for migrations)'
  );
}

export function getSupabaseServiceRoleKey() {
  return required(
    'SUPABASE_SERVICE_ROLE_KEY',
    'Supabase → Settings → API → Project API keys → service_role'
  );
}

export function getStripeSecretKey() {
  return required(
    'STRIPE_SECRET_KEY',
    'Stripe Dashboard → Developers → API keys → Secret key'
  );
}

export function getStripeWebhookSecret() {
  return required(
    'STRIPE_WEBHOOK_SECRET',
    'Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret'
  );
}

export function getAdminEmail() {
  return required(
    'ADMIN_EMAIL',
    'The e-mail address that should have access to /admin'
  );
}

export function getResendApiKey() {
  return required(
    'RESEND_API_KEY',
    'resend.com → API Keys → Create API Key'
  );
}

// ─── Startup validation ───────────────────────────────────────────────────────

/**
 * Validate every required environment variable and throw immediately if any are
 * missing. Called from instrumentation.ts so failures surface at server start,
 * not at the first request.
 */
export function validateEnv() {
  // Core infrastructure — server must not start without these.
  getDatabaseUrl();
  getDirectUrl();
  getSupabaseServiceRoleKey();
  getAdminEmail();

  // Core public vars.
  const requiredPublic: Array<[string, string]> = [
    [
      'NEXT_PUBLIC_SUPABASE_URL',
      'Supabase → Settings → API → Project URL',
    ],
    [
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'Supabase → Settings → API → Project API keys → anon / public',
    ],
    [
      'NEXT_PUBLIC_APP_URL',
      'Your deployment URL, e.g. https://familyroam.com (no trailing slash)',
    ],
  ];

  for (const [name, hint] of requiredPublic) {
    if (!process.env[name]) {
      throw new Error(
        `Missing required environment variable: ${name}\n` +
          `  Where to get it: ${hint}\n` +
          `  Add it to .env.local (development) or your hosting provider's env settings (production).`
      );
    }
  }

  // Stripe and Resend are validated lazily — their getters throw only when the
  // relevant API routes are actually called. Add them back here once configured.
}
