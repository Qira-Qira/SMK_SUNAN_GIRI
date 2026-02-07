import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - only ADMIN_UTAMA can see archived jurusan
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch archived (inactive) jurusan
    const archivedJurusan = await prisma.jurusan.findMany({
      where: { isActive: false },
      include: {
        _count: {
          select: {
            ppdbEntries: true,
            tracerStudy: true,
            jobPostings: true,
          },
        },
      },
    });

    return NextResponse.json({ archivedJurusan }, { status: 200 });
  } catch (error) {
    console.error('Archived jurusan get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
