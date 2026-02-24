import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Only ADMIN_UTAMA and ADMIN_BKK can list companies
    // ADMIN_UTAMA = Super admin (access all)
    // ADMIN_BKK = Manages job postings and companies partnerships
    await requireRole('ADMIN_UTAMA', 'ADMIN_BKK');

    const companies = await prisma.user.findMany({
      where: { role: 'PERUSAHAAN' },
      select: { 
        id: true, 
        fullName: true, 
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error('Companies list error:', error);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
