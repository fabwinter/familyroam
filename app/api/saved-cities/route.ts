import { createServerSupabaseClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cityId } = await request.json();
  if (!cityId) {
    return NextResponse.json({ error: 'cityId required' }, { status: 400 });
  }

  await prisma.savedCity.upsert({
    where: { userId_cityId: { userId: user.id, cityId } },
    create: { userId: user.id, cityId },
    update: {},
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cityId } = await request.json();
  if (!cityId) {
    return NextResponse.json({ error: 'cityId required' }, { status: 400 });
  }

  await prisma.savedCity.deleteMany({
    where: { userId: user.id, cityId },
  });

  return NextResponse.json({ saved: false });
}
