import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // only admin can list companies
    await requireRole('ADMIN');

    const companies = await prisma.user.findMany({
      where: { role: 'PERUSAHAAN' },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error('Companies list error:', error);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
