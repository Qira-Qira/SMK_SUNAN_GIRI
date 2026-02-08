import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Hapus job postings yang sudah melewati deadline
 */
export async function cleanupExpiredJobPostings() {
  try {
    const now = new Date();

    const result = await prisma.jobPosting.deleteMany({
      where: {
        deadline: {
          lt: now, // Less than current time
        },
      },
    });

    console.log(`[Job Cleanup] Deleted ${result.count} expired job postings at ${now.toISOString()}`);
    return {
      success: true,
      deletedCount: result.count,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error('[Job Cleanup] Error:', error);
    throw error;
  }
}

/**
 * Dapatkan daftar job postings yang sudah expired (untuk monitoring)
 */
export async function getExpiredJobPostings() {
  try {
    const now = new Date();

    const expired = await prisma.jobPosting.findMany({
      where: {
        deadline: {
          lt: now,
        },
      },
      select: {
        id: true,
        posisi: true,
        deadline: true,
        perusahaan: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        deadline: 'desc',
      },
    });

    return expired;
  } catch (error) {
    console.error('[Job Cleanup] Error getting expired postings:', error);
    throw error;
  }
}
