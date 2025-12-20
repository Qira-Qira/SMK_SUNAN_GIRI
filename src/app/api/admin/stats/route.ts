import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !user.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [
      ppdbCount,
      applicationsCount,
      alumniCount,
      jobPostingsCount,
      usersCount,
    ] = await Promise.all([
      prisma.pPDBEntry.count(),
      prisma.jobApplication.count(),
      prisma.tracerStudy.count(),
      prisma.jobPosting.count({ where: { isActive: true } }),
      prisma.user.count(),
    ]);

    // Get status distribution
    const ppdbStatuses = await prisma.pPDBEntry.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json(
      {
        totalStats: {
          ppdbCount,
          applicationsCount,
          alumniCount,
          jobPostingsCount,
          usersCount,
        },
        ppdbDistribution: ppdbStatuses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
