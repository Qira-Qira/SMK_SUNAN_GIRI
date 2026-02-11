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

    // Get alumni status breakdown
    const alumniStatuses = await prisma.tracerStudy.groupBy({
      by: ['status'],
      _count: true,
    });

    // Map alumni statuses to readable format
    const alumniStats = {
      working: 0,
      studying: 0,
      entrepreneur: 0,
      searching: 0,
    };

    alumniStatuses.forEach((item: any) => {
      if (item.status === 'Bekerja') {
        alumniStats.working = item._count;
      } else if (item.status === 'Kuliah') {
        alumniStats.studying = item._count;
      } else if (item.status === 'Wirausaha') {
        alumniStats.entrepreneur = item._count;
      } else if (item.status === 'Mencari Kerja') {
        alumniStats.searching = item._count;
      }
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
        alumniStats,
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
