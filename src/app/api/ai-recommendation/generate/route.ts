import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Advanced mapping dengan scoring bobot - IMPROVED VERSION
interface JurusanProfile {
  keywords: string[];
  primaryInterest: string[];  // Changed to array untuk multiple matches
  abilities: string[];
  learningStyle: string[];
  careerPath: string[];
}

const JURUSAN_PROFILES: { [key: string]: JurusanProfile } = {
  'informatika': {
    keywords: ['informatika', 'it', 'teknologi informasi', 'sistem informasi', 'komputer'],
    primaryInterest: ['membuat_program', 'analisis_data'],
    abilities: ['logika_analisis', 'kreativitas'],
    learningStyle: ['visual', 'campuran'],
    careerPath: ['lanjut_kuliah', 'industri_kreatif', 'pegawai'],
  },
  'rekayasa perangkat lunak': {
    keywords: ['rekayasa perangkat lunak', 'rpl', 'software engineering', 'web developer', 'aplikasi', 'programming'],
    primaryInterest: ['membuat_program'],
    abilities: ['logika_analisis', 'kreativitas'],
    learningStyle: ['visual', 'kinestetik', 'campuran'],
    careerPath: ['lanjut_kuliah', 'industri_kreatif', 'pegawai', 'berwirausaha'],
  },
  'teknik komputer dan jaringan': {
    keywords: ['teknik komputer', 'jaringan', 'tkj', 'network', 'cloud computing', 'server'],
    primaryInterest: ['membuat_program', 'memperbaiki_elektronik'],
    abilities: ['logika_analisis', 'kesabaran_detail'],
    learningStyle: ['kinestetik', 'visual', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha', 'lanjut_kuliah'],
  },
  'teknik elektronika': {
    keywords: ['elektronika', 'elektronik', 'teknik elektronika', 'listrik', 'perangkat keras', 'hardware'],
    primaryInterest: ['memperbaiki_elektronik', 'merakit_buat'],
    abilities: ['logika_analisis', 'kesabaran_detail'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
  'desain grafis': {
    keywords: ['desain', 'grafis', 'multimedia', 'seni', 'desain grafis', 'visual', 'animasi'],
    primaryInterest: ['menggambar_desain'],
    abilities: ['kreativitas', 'kesabaran_detail'],
    learningStyle: ['visual', 'kinestetik'],
    careerPath: ['industri_kreatif', 'berwirausaha'],
  },
  'akuntansi': {
    keywords: ['akuntansi', 'keuangan', 'akuntansi keuangan', 'perpajakan', 'pembukuan'],
    primaryInterest: ['analisis_data'],
    abilities: ['logika_analisis', 'kesabaran_detail'],
    learningStyle: ['visual', 'campuran'],
    careerPath: ['pegawai', 'pemerintah', 'berwirausaha'],
  },
  'keperawatan': {
    keywords: ['keperawatan', 'kesehatan', 'perawat', 'farmasi', 'medis'],
    primaryInterest: ['membantu_orang'],
    abilities: ['komunikasi', 'kerja_sama_tim', 'kesabaran_detail'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'lanjut_kuliah'],
  },
  'teknik otomotif': {
    keywords: ['otomotif', 'otomotiv', 'teknik otomotif', 'mesin', 'kendaraan', 'bengkel'],
    primaryInterest: ['merakit_buat', 'memperbaiki_elektronik'],
    abilities: ['logika_analisis', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
  'bisnis': {
    keywords: ['bisnis', 'manajemen', 'marketing', 'admin', 'administrasi', 'usaha'],
    primaryInterest: ['analisis_data', 'membantu_orang'],
    abilities: ['komunikasi', 'kepemimpinan', 'kerja_sama_tim'],
    learningStyle: ['visual', 'auditori'],
    careerPath: ['berwirausaha', 'pegawai'],
  },
  'teknik mesin': {
    keywords: ['teknik mesin', 'mesin', 'manufaktur', 'produksi', 'industri'],
    primaryInterest: ['merakit_buat'],
    abilities: ['logika_analisis', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
  'teknik sepeda motor': {
    keywords: ['sepeda motor', 'motor', 'teknik motor', 'otomotif sepeda motor', 'mekanik motor'],
    primaryInterest: ['merakit_buat', 'memperbaiki_elektronik'],
    abilities: ['logika_analisis', 'kesabaran_detail', 'kerja_sama_tim'],
    learningStyle: ['kinestetik', 'campuran'],
    careerPath: ['pegawai', 'berwirausaha'],
  },
};

// AI recommendation engine with IMPROVED scoring
async function generateAIRecommendation(quizData: any) {
  const jurusan = await prisma.jurusan.findMany();

  const scores = jurusan.map((j) => {
    let totalScore = 0;
    const normalizedJurusanName = j.nama.toLowerCase().trim();

    // FIND MATCHING PROFILE untuk jurusan ini
    let jurusanProfile: JurusanProfile | null = null;
    let matchedKeyword: string = '';
    
    // Check all profiles to find best match
    for (const [key, profile] of Object.entries(JURUSAN_PROFILES)) {
      for (const keyword of profile.keywords) {
        if (normalizedJurusanName.includes(keyword)) {
          jurusanProfile = profile;
          matchedKeyword = key;
          break; // Gunakan yang paling specific
        }
      }
      if (jurusanProfile) break;
    }

    // FALLBACK: Jika jurusan tidak ada di profile, buat default profile dari nama jurusan
    if (!jurusanProfile) {
      // Dynamic profiling berdasarkan keywords dalam nama jurusan
      const defaultProfile: JurusanProfile = {
        keywords: [normalizedJurusanName],
        primaryInterest: [],
        abilities: ['logika_analisis'],
        learningStyle: ['campuran'], // Default accept semua gaya belajar
        careerPath: ['pegawai', 'berwirausaha'], // Default career paths
      };
      
      // Smart detection dari kata-kata kunci dalam nama
      if (normalizedJurusanName.includes('teknologi') || normalizedJurusanName.includes('teknik') || normalizedJurusanName.includes('komputer')) {
        defaultProfile.primaryInterest = ['membuat_program', 'merakit_buat'];
        defaultProfile.learningStyle = ['visual', 'kinestetik', 'campuran'];
      } else if (normalizedJurusanName.includes('desain') || normalizedJurusanName.includes('seni')) {
        defaultProfile.primaryInterest = ['menggambar_desain'];
        defaultProfile.abilities = ['kreativitas', 'kesabaran_detail'];
        defaultProfile.learningStyle = ['visual', 'kinestetik'];
      } else if (normalizedJurusanName.includes('bisnis') || normalizedJurusanName.includes('administrasi') || normalizedJurusanName.includes('keuangan')) {
        defaultProfile.primaryInterest = ['analisis_data', 'membantu_orang'];
        defaultProfile.abilities = ['komunikasi', 'logika_analisis'];
        defaultProfile.learningStyle = ['visual', 'auditori', 'campuran'];
      } else if (normalizedJurusanName.includes('kesehatan') || normalizedJurusanName.includes('perawatan')) {
        defaultProfile.primaryInterest = ['membantu_orang'];
        defaultProfile.abilities = ['komunikasi', 'kerja_sama_tim'];
        defaultProfile.learningStyle = ['kinestetik', 'campuran'];
      } else if (normalizedJurusanName.includes('elektro') || normalizedJurusanName.includes('listrik')) {
        defaultProfile.primaryInterest = ['memperbaiki_elektronik', 'merakit_buat'];
        defaultProfile.abilities = ['logika_analisis', 'kesabaran_detail'];
        defaultProfile.learningStyle = ['kinestetik', 'visual', 'campuran'];
      } else {
        // Generic profile untuk jurusan lain
        defaultProfile.primaryInterest = ['merakit_buat', 'analisis_data', 'membantu_orang'];
        defaultProfile.learningStyle = ['kinestetik', 'visual', 'campuran'];
      }
      
      jurusanProfile = defaultProfile;
      matchedKeyword = normalizedJurusanName;
    }

    const reasons: string[] = [];

    // SCORING SYSTEM dengan bobot yang jelas
    // Total bobot: 100 points maximum

    // 1. PRIMARY INTEREST MATCH - WEIGHT: 40 points (PALING PENTING)
    if (jurusanProfile && jurusanProfile.primaryInterest.includes(quizData.minat)) {
      totalScore += 40;
      reasons.push(`sangat cocok dengan minat Anda di bidang ${quizData.minat.replace(/_/g, ' ')}`);
    } else if (jurusanProfile && jurusanProfile.primaryInterest.length > 0) {
      // Partial match dengan interest lain
      totalScore += 8;
    } else {
      totalScore += 1;
    }

    // 2. ABILITIES MATCH - WEIGHT: 30 points
    if (jurusanProfile && jurusanProfile.abilities.includes(quizData.kemampuan)) {
      totalScore += 30;
      reasons.push(`memanfaatkan kemampuan utama Anda dalam ${quizData.kemampuan.replace(/_/g, ' ')}`);
    } else if (jurusanProfile && jurusanProfile.abilities.length > 0) {
      totalScore += 10; // Partial match
    } else {
      totalScore += 2;
    }

    // 3. LEARNING STYLE MATCH - WEIGHT: 20 points
    if (jurusanProfile && jurusanProfile.learningStyle.includes(quizData.gayaBelajar)) {
      totalScore += 20;
      reasons.push(`metode pembelajaran ${quizData.gayaBelajar} sesuai dengan bidang ini`);
    } else if (quizData.gayaBelajar === 'campuran') {
      // Tipe belajar campuran cocok untuk semua jurusan
      totalScore += 18;
      reasons.push(`menawarkan kombinasi teori dan praktik sesuai gaya belajar Anda`);
    } else if (jurusanProfile && jurusanProfile.learningStyle.length > 0) {
      totalScore += 8;
    } else {
      totalScore += 2;
    }

    // 4. CAREER PATH MATCH - WEIGHT: 7 points
    if (jurusanProfile && jurusanProfile.careerPath.includes(quizData.karier)) {
      totalScore += 7;
      reasons.push(`mendukung tujuan karir Anda untuk ${quizData.karier.replace(/_/g, ' ')}`);
    } else if (jurusanProfile && jurusanProfile.careerPath.length > 0) {
      totalScore += 3;
    } else {
      totalScore += 1;
    }

    // 5. WORK PREFERENCE MATCH - WEIGHT: 3 points
    if (jurusanProfile) {
      if (quizData.preferensi === 'praktik' && jurusanProfile.learningStyle.includes('kinestetik')) {
        totalScore += 3;
        reasons.push(`menawarkan pengalaman praktik langsung yang Anda inginkan`);
      } else if (quizData.preferensi === 'teori_riset' && jurusanProfile.learningStyle.includes('visual')) {
        totalScore += 3;
        reasons.push(`fokus pada teori dan riset`);
      } else if (quizData.preferensi === 'campuran_kerja') {
        totalScore += 2;
        reasons.push(`menyeimbangkan teori dan praktik`);
      } else if (quizData.preferensi === 'outdoor') {
        if (['teknik otomotif', 'teknik mesin'].includes(matchedKeyword)) {
          totalScore += 2;
        }
      } else if (quizData.preferensi === 'kantor') {
        if (['bisnis', 'akuntansi', 'informatika'].includes(matchedKeyword)) {
          totalScore += 2;
        }
      }
    }

    const alasan = reasons.length > 0 
      ? `Program ${j.nama} ${reasons.join(', ')}.`
      : `Program ${j.nama} bisa menjadi pilihan yang menarik untuk pengembangan karir Anda.`;

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

  // Debug: Log top 5 untuk checking
  console.log('Top 5 recommendations:');
  scores.slice(0, 5).forEach((s, i) => {
    console.log(`${i+1}. ${s.jurusanName}: ${s.score} points - ${s.alasan}`);
  });

  // Get top 3
  const topThree = scores.slice(0, 3);

  // Normalize scores sehingga total = 100%
  if (topThree.length > 0 && topThree[0].score > 0) {
    const totalScore = topThree.reduce((sum, item) => sum + item.score, 0);
    const normalized = topThree.map(item => ({
      ...item,
      score: Number(((item.score / totalScore) * 100).toFixed(1)),
    }));
    
    // Jika ada rounding error, adjust yang terakhir
    const sum = normalized.reduce((acc, item) => acc + item.score, 0);
    if (Math.abs(sum - 100) > 0.1) {
      normalized[normalized.length - 1].score = Number((100 - (sum - normalized[normalized.length - 1].score)).toFixed(1));
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
