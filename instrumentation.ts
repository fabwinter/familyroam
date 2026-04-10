/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * We use this to validate all required environment variables before any request
 * is served, so missing config surfaces immediately rather than on first use.
 */
export async function register() {
  // Only run in the Node.js runtime (not Edge, not client).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env');
    validateEnv();
  }
}
