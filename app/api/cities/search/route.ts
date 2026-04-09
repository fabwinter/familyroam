import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  const cities = await prisma.city.findMany({
    where: { name: { contains: q, mode: 'insensitive' } },
    select: { id: true, slug: true, name: true, country: true, costAvg: true },
    take: 8,
  });

  return NextResponse.json(cities);
}
