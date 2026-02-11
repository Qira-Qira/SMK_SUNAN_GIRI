import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Debug: Check total tracer study records
    const allRecords = await prisma.tracerStudy.findMany({
      include: { user: { select: { fullName: true } } }
    });
    console.log('Total tracer study records:', allRecords.length);
    console.log('All records:', allRecords.map(r => ({ 
      id: r.id,
      nama: r.user?.fullName,
      status: r.status, 
      namaPerusahaan: r.namaPerusahaan,
      jabatan: r.jabatan,
      namaInstitusi: r.namaInstitusi,
      namaUsaha: r.namaUsaha,
    })));

    // Fetch alumni with complete data (any status with relevant fields filled)
    const alumniStories = await prisma.tracerStudy.findMany({
      where: {
        OR: [
          // Bekerja - needs namaPerusahaan and jabatan
          { status: 'Bekerja', namaPerusahaan: { not: null }, jabatan: { not: null } },
          // Kuliah - needs namaInstitusi
          { status: 'Kuliah', namaInstitusi: { not: null } },
          // Wirausaha - needs namaUsaha
          { status: 'Wirausaha', namaUsaha: { not: null } },
          // Mencari Kerja - no specific fields needed
          { status: 'Mencari Kerja' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            photoUrl: true,
          },
        },
        jurusan: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    console.log('Filtered alumni stories:', alumniStories.length);
    console.log('Stories:', alumniStories.map(s => ({ 
      nama: s.user.fullName, 
      status: s.status,
      namaPerusahaan: s.namaPerusahaan,
      jabatan: s.jabatan 
    })));

    // Transform data for frontend
    const formattedStories = alumniStories.map(story => {
      let displayPosisi = '';
      let displayPerusahaan = '';
      let displayGaji = null;
      let displayRelevansi = null;

      if (story.status === 'Bekerja') {
        displayPosisi = story.jabatan || '';
        displayPerusahaan = story.namaPerusahaan || '';
        displayGaji = story.gaji;
        displayRelevansi = story.relevansi;
      } else if (story.status === 'Kuliah') {
        displayPosisi = 'Sedang Kuliah';
        displayPerusahaan = story.namaInstitusi || 'Institusi Pendidikan';
      } else if (story.status === 'Wirausaha') {
        displayPosisi = 'Wirausaha';
        displayPerusahaan = story.namaUsaha || 'Usaha Sendiri';
      } else if (story.status === 'Mencari Kerja') {
        displayPosisi = 'Mencari Kerja';
        displayPerusahaan = 'Terbuka untuk Peluang';
      }

      return {
        id: story.id,
        nama: story.user.fullName,
        email: story.user.email,
        photoUrl: story.user.photoUrl,
        jurusan: story.jurusan.nama,
        status: story.status,
        perusahaan: displayPerusahaan,
        jabatan: displayPosisi,
        relevansi: displayRelevansi,
        gaji: displayGaji,
        tahunLulus: story.tahunLulus,
        // Include original fields for frontend
        namaPerusahaan: story.namaPerusahaan,
        namaInstitusi: story.namaInstitusi,
        namaUsaha: story.namaUsaha,
      };
    });

    return NextResponse.json(
      { alumniStories: formattedStories },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get alumni stories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
