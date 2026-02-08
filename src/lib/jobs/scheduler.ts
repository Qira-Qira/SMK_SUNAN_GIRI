import cron from 'node-cron';
import { cleanupExpiredJobPostings } from '@/lib/jobs/cleanup';

let cronJob: cron.ScheduledTask | null = null;

/**
 * Mulai scheduler untuk auto-cleanup expired job postings
 * Default: Setiap hari jam 00:00 (tengah malam)
 */
export function startJobCleanupScheduler() {
  if (cronJob) {
    console.log('[Job Scheduler] Scheduler sudah berjalan');
    return;
  }

  // Cron pattern: "0 0 * * *" = Setiap hari jam 00:00
  // Anda bisa ubah pattern sesuai kebutuhan:
  // "*/5 * * * *" = Setiap 5 menit
  // "0 * * * *" = Setiap jam
  // "0 */6 * * *" = Setiap 6 jam
  // "0 0 * * *" = Setiap hari jam 00:00 (recommended)

  cronJob = cron.schedule('0 0 * * *', async () => {
    console.log('[Job Scheduler] ⏰ Memulai cleanup expired job postings...');
    try {
      const result = await cleanupExpiredJobPostings();
      console.log(`[Job Scheduler] ✅ Cleanup selesai: ${result.deletedCount} job dihapus`);
    } catch (error) {
      console.error('[Job Scheduler] ❌ Error cleanup:', error);
    }
  });

  console.log('[Job Scheduler] ✓ Job cleanup scheduler started (daily at 00:00)');
}

/**
 * Stop scheduler
 */
export function stopJobCleanupScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('[Job Scheduler] ✓ Job cleanup scheduler stopped');
  }
}

/**
 * Jalankan cleanup sekali (manual trigger)
 */
export async function runJobCleanupNow() {
  console.log('[Job Scheduler] 🔧 Manual cleanup triggered');
  return await cleanupExpiredJobPostings();
}
