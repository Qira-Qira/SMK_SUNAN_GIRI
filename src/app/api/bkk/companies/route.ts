import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_BKK' && payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all companies that have job postings
    const companies = await prisma.user.findMany({
      where: {
        role: 'PERUSAHAAN',
        jobPostings: {
          some: {}
        }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        _count: {
          select: { jobPostings: true }
        }
      }
    });

    return NextResponse.json({ companies }, { status: 200 });
  } catch (error) {
    console.error('Get BKK companies error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
