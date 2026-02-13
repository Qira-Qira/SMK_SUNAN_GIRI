import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';

// Helper function to get year-wise data
const getYearlyStats = async () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 4; // Get last 5 years
  const years = Array.from({ length: 5 }, (_, i) => startYear + i);

  const ppdbYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.pPDBEntry.count({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  const usersYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  const jobPostingsYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.jobPosting.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  const jobApplicationsYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.jobApplication.count({
        where: {
          appliedAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  const alumniYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.tracerStudy.count({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  const siswaAktifYearly = await Promise.all(
    years.map(async (year) => ({
      year,
      count: await prisma.user.count({
        where: {
          role: 'SISWA_AKTIF',
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      }),
    }))
  );

  return {
    ppdbYearly,
    usersYearly,
    jobPostingsYearly,
    jobApplicationsYearly,
    alumniYearly,
    siswaAktifYearly,
  };
};

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

    // Get yearly statistics
    const yearlyStats = await getYearlyStats();

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
        yearlyStats,
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
