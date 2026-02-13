import { prisma } from '@/lib/db/prisma';

/**
 * Generate registration number dengan format PPDB-YYYY-NNNN
 * Contoh: PPDB-2026-0001, PPDB-2026-0002, dst
 * Otomatis reset ke 0001 saat tahun berganti
 */
export async function generateRegistrationNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Hitung registrasi yang sudah ada tahun ini
  const lastRegistration = await prisma.pPDBEntry.findFirst({
    where: {
      registrationYear: currentYear,
    },
    orderBy: {
      registrationSeq: 'desc',
    },
  });

  // Sequence berikutnya
  const nextSeq = (lastRegistration?.registrationSeq || 0) + 1;
  
  // Format: PPDB-2026-0001
  const registrationNo = `PPDB-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  return registrationNo;
}

/**
 * Parse registration number untuk mendapatkan year dan seq
 * Contoh: PPDB-2026-0001 -> { year: 2026, seq: 1 }
 */
export function parseRegistrationNumber(regNo: string): { year: number; seq: number } | null {
  const match = regNo.match(/^PPDB-(\d{4})-(\d{4})$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1]),
    seq: parseInt(match[2]),
  };
}
