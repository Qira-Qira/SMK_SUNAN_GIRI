import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Advanced mapping dengan scoring bobot
interface JurusanProfile {
  keywords: string[];
  primaryInterest: string;
  abilities: string[];
  learningStyle: string[];
  careerPath: string[];
}

const JURUSAN_PROFILES: { [key: string]: JurusanProfile } = {
  'informatika': {
    keywords: ['informatika', 'it', 'teknologi informasi', 'sistem informasi', 'komputer'],
    primaryInterest: 'membuat_program',
    abilities: ['logika_analisis', 'kreativitas'],
    learningStyle: ['visual', 'campuran'],
    careerPath: ['lanjut_kuliah', 'industri_kreatif', 'pegawai'],
  },
  'teknik elektronika': {
    keywords: ['elektronika', 'elektronik', 'teknik elektronika', 'listrik'],
    primaryInterest: 'memperbaiki_elektronik',
    abilities: ['logika_analisis', 'kesabaran_detail'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
  'desain grafis': {
    keywords: ['desain', 'grafis', 'multimedia', 'seni', 'desain grafis'],
    primaryInterest: 'menggambar_desain',
    abilities: ['kreativitas', 'kesabaran_detail'],
    learningStyle: ['visual', 'kinestetik'],
    careerPath: ['industri_kreatif', 'berwirausaha'],
  },
  'akuntansi': {
    keywords: ['akuntansi', 'keuangan', 'akuntansi keuangan', 'perpajakan'],
    primaryInterest: 'analisis_data',
    abilities: ['logika_analisis', 'kesabaran_detail'],
    learningStyle: ['visual', 'campuran'],
    careerPath: ['pegawai', 'pemerintah', 'berwirausaha'],
  },
  'keperawatan': {
    keywords: ['keperawatan', 'kesehatan', 'perawat', 'farmasi'],
    primaryInterest: 'membantu_orang',
    abilities: ['komunikasi', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'lanjut_kuliah'],
  },
  'teknik otomotif': {
    keywords: ['otomotif', 'otomotiv', 'teknik otomotif', 'mesin', 'kendaraan'],
    primaryInterest: 'merakit_buat',
    abilities: ['logika_analisis', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
  'bisnis': {
    keywords: ['bisnis', 'manajemen', 'marketing', 'admin', 'administrasi'],
    primaryInterest: 'analisis_data',
    abilities: ['komunikasi', 'kepemimpinan'],
    learningStyle: ['visual', 'auditori'],
    careerPath: ['berwirausaha', 'pegawai'],
  },
  'teknik mesin': {
    keywords: ['teknik mesin', 'mesin', 'manufaktur', 'produksi'],
    primaryInterest: 'merakit_buat',
    abilities: ['logika_analisis', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
};

// AI recommendation engine with advanced scoring
async function generateAIRecommendation(quizData: any) {
  const jurusan = await prisma.jurusan.findMany();

  const scores = jurusan.map((j) => {
    let totalScore = 0;
    const normalizedJurusanName = j.nama.toLowerCase();

    // Cek profile jurusan
    let jurusanProfile: JurusanProfile | null = null;
    for (const [key, profile] of Object.entries(JURUSAN_PROFILES)) {
      if (profile.keywords.some(kw => normalizedJurusanName.includes(kw))) {
        jurusanProfile = profile;
        break;
      }
    }

    const reasons: string[] = [];

    // 1. Primary Interest Match - WEIGHT: 40 points
    // Ini adalah faktor paling penting - bisa membedakan sangat signifikan
    if (jurusanProfile && jurusanProfile.primaryInterest === quizData.minat) {
      totalScore += 40; // Perfect match
      reasons.push(`cocok sempurna dengan minat Anda untuk ${quizData.minat.replace(/_/g, ' ')}`);
    } else if (jurusanProfile) {
      totalScore += 5; // No match
    } else {
      totalScore += 2;
    }

    // 2. Abilities Match - WEIGHT: 30 points
    if (jurusanProfile && jurusanProfile.abilities.includes(quizData.kemampuan)) {
      totalScore += 30; // Perfect match
      reasons.push(`memanfaatkan kemampuan ${quizData.kemampuan.replace(/_/g, ' ')}`);
    } else if (jurusanProfile && jurusanProfile.abilities.length > 0) {
      totalScore += 8; // Partial match
    } else {
      totalScore += 2;
    }

    // 3. Learning Style Match - WEIGHT: 20 points
    if (jurusanProfile && jurusanProfile.learningStyle.includes(quizData.gayaBelajar)) {
      totalScore += 20; // Perfect match
      reasons.push(`sesuai gaya belajar ${quizData.gayaBelajar}`);
    } else if (quizData.gayaBelajar === 'campuran') {
      // Tipe belajar campuran cocok untuk semua
      totalScore += 16;
      reasons.push(`sesuai dengan gaya belajar fleksibel Anda`);
    } else if (jurusanProfile && jurusanProfile.learningStyle.length > 0) {
      totalScore += 6; // Partial match
    } else {
      totalScore += 2;
    }

    // 4. Career Path Match - WEIGHT: 7 points
    if (jurusanProfile && jurusanProfile.careerPath.includes(quizData.karier)) {
      totalScore += 7; // Match
      reasons.push(`mendukung cita-cita menjadi ${quizData.karier.replace(/_/g, ' ')}`);
    } else if (jurusanProfile && jurusanProfile.careerPath.length > 0) {
      totalScore += 2; // Partial match
    } else {
      totalScore += 0.5;
    }

    // 5. Work Preference Match - WEIGHT: 3 points
    if (quizData.preferensi === 'praktik' && jurusanProfile && jurusanProfile.learningStyle.includes('kinestetik')) {
      totalScore += 3;
      reasons.push(`menawarkan pengalaman praktik langsung`);
    } else if (quizData.preferensi === 'teori_riset' && jurusanProfile && jurusanProfile.learningStyle.includes('visual')) {
      totalScore += 3;
    } else if (quizData.preferensi === 'campuran_kerja') {
      totalScore += 2;
    } else if (jurusanProfile) {
      totalScore += 1;
    } else {
      totalScore += 0.5;
    }

    const alasan = reasons.length > 0 
      ? `Program ${j.nama} ${reasons.join(', ')}.`
      : `Program ${j.nama} bisa menjadi opsi menarik untuk eksplorasi karir Anda.`;

    return {
      jurusanId: j.id,
      jurusanName: j.nama,
      deskripsi: j.deskripsi,
      score: totalScore,
      alasan: alasan,
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Get top 3
  const topThree = scores.slice(0, 3);

  // Normalize scores sehingga total = 100%
  if (topThree.length > 0) {
    const totalScore = topThree.reduce((sum, item) => sum + item.score, 0);
    const normalized = topThree.map(item => ({
      ...item,
      score: Number(((item.score / totalScore) * 100).toFixed(1)),
    }));
    
    // Jika ada rounding error, adjust yang terakhir
    const sum = normalized.reduce((acc, item) => acc + item.score, 0);
    if (sum !== 100) {
      normalized[normalized.length - 1].score += (100 - sum);
    }
    
    return normalized;
  }

  return topThree;
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
          score: r.score, // Already normalized as number
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
