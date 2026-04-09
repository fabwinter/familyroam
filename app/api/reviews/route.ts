import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cityId = request.nextUrl.searchParams.get('cityId');
  if (!cityId) {
    return NextResponse.json({ error: 'cityId required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { cityId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } });
  if (dbUser?.plan !== 'PRO') {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
  }

  const { cityId, rating, title, body, visitedAt } = await request.json();

  if (!cityId || !body || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      cityId,
      userId: user.id,
      rating,
      title: title || null,
      body,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
