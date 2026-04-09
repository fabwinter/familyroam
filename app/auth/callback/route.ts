import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Ensure a Prisma User row exists for this auth user (idempotent)
      await prisma.user.upsert({
        where: { id: data.user.id },
        create: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.full_name ?? null,
          avatarUrl: data.user.user_metadata?.avatar_url ?? null,
        },
        update: {},
      });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth', request.url));
}
