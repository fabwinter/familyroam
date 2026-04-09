import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return await cookieStore.getAll();
        },
        async setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          await Promise.all(
            cookiesToSet.map(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          );
        },
      },
    }
  );
}

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
