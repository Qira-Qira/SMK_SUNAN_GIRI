import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const profile = await prisma.schoolProfile.findFirst();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'School profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      stats: {
        siswaAktif: profile.siswaAktif || '1,200+',
        mitraIndustri: profile.mitraIndustri || '150+',
        serapanKerja: profile.serapanKerja || '95%',
        prestasi: profile.prestasi || '50+',
        deskripsiSiswa: profile.deskripsiSiswa || 'Dari berbagai daerah',
        deskripsiMitra: profile.deskripsiMitra || 'Perusahaan ternama',
        deskripsiSerapan: profile.deskripsiSerapan || 'Alumni tersebar industri',
        deskripsiPrestasi: profile.deskripsiPrestasi || 'Tingkat nasional & internasional',
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    const {
      siswaAktif,
      mitraIndustri,
      serapanKerja,
      prestasi,
      deskripsiSiswa,
      deskripsiMitra,
      deskripsiSerapan,
      deskripsiPrestasi,
    } = body;

    // Find existing school profile
    let profile = await prisma.schoolProfile.findFirst();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'School profile not found' },
        { status: 404 }
      );
    }

    // Update existing profile with stats
    profile = await prisma.schoolProfile.update({
      where: { id: profile.id },
      data: {
        siswaAktif: siswaAktif || profile.siswaAktif,
        mitraIndustri: mitraIndustri || profile.mitraIndustri,
        serapanKerja: serapanKerja || profile.serapanKerja,
        prestasi: prestasi || profile.prestasi,
        deskripsiSiswa: deskripsiSiswa || profile.deskripsiSiswa,
        deskripsiMitra: deskripsiMitra || profile.deskripsiMitra,
        deskripsiSerapan: deskripsiSerapan || profile.deskripsiSerapan,
        deskripsiPrestasi: deskripsiPrestasi || profile.deskripsiPrestasi,
      }
    });

    return NextResponse.json({
      message: 'Stats updated successfully',
      stats: {
        siswaAktif: profile.siswaAktif,
        mitraIndustri: profile.mitraIndustri,
        serapanKerja: profile.serapanKerja,
        prestasi: profile.prestasi,
        deskripsiSiswa: profile.deskripsiSiswa,
        deskripsiMitra: profile.deskripsiMitra,
        deskripsiSerapan: profile.deskripsiSerapan,
        deskripsiPrestasi: profile.deskripsiPrestasi,
      }
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
