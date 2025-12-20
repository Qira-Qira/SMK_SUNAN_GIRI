import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// AI recommendation engine based on form data
async function generateAIRecommendation(quizData: any) {
  const jurusan = await prisma.jurusan.findMany();
  
  // Rule-based scoring system
  const scores = jurusan.map((j) => {
    let score = 0;
    const normalizedJurusanName = j.nama.toLowerCase();

    // Match interests with program
    if (quizData.minatTeknologi && (normalizedJurusanName.includes('teknik') || normalizedJurusanName.includes('informatika'))) {
      score += 35;
    }
    if (quizData.minatBisnis && (normalizedJurusanName.includes('akuntansi') || normalizedJurusanName.includes('bisnis'))) {
      score += 35;
    }
    if (quizData.minatDesain && normalizedJurusanName.includes('desain')) {
      score += 35;
    }
    if (quizData.minatKesehatan && (normalizedJurusanName.includes('kesehatan') || normalizedJurusanName.includes('keperawatan'))) {
      score += 35;
    }
    if (quizData.minatOtomotif && normalizedJurusanName.includes('otomotif')) {
      score += 35;
    }

    // Match abilities with program
    if (quizData.kemampuanLogika) score += 10;
    if (quizData.kemampuanKreativitas) score += 10;
    if (quizData.kemampuanKomunikasi) score += 10;
    if (quizData.kemampuanKepemimpinan) score += 10;

    // Academic values contribution
    const nilaiAkademik = (quizData.nilaiAkademik || 0) / 100;
    const nilaiPeminatan = (quizData.nilaiPeminatan || 0) / 100;
    const nilaiBakat = (quizData.nilaiBakat || 0) / 100;
    score += (nilaiAkademik + nilaiPeminatan + nilaiBakat) / 3 * 15;

    // Career alignment
    if (quizData.citaCita === 'berwirausaha') score += 5;
    if (quizData.preferensi === 'praktik') score += 5;

    return {
      jurusanId: j.id,
      jurusanName: j.nama,
      deskripsi: j.deskripsi,
      score: Math.min(100, Math.max(0, score)),
      alasan: `Program ${j.nama} cocok dengan profil Anda berdasarkan minat, kemampuan, dan nilai akademik.`,
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Generate recommendations
    const recommendations = await generateAIRecommendation(body);

    return NextResponse.json(
      {
        recommendations: recommendations.map((r) => ({
          id: r.jurusanId,
          jurusan: r.jurusanName,
          deskripsi: r.deskripsi,
          score: r.score.toFixed(1),
          alasan: r.alasan,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
