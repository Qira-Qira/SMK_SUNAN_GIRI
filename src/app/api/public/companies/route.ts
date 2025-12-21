import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const jurusanId = searchParams.get('jurusanId');
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const where: any = { role: 'PERUSAHAAN' };

    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (jurusanId) {
      // only companies that have at least one job posting in this jurusan
      where.jobPostings = { some: { jurusanId } };
    }

    const total = await prisma.user.count({ where });

    const companies = await prisma.user.findMany({
      where,
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ companies, total }, { status: 200 });
  } catch (error) {
    console.error('Companies public get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
