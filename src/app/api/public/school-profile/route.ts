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

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('School profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { nama, alamat, telepon, email, heroTitle, heroSubtitle, heroDescription, visi, misi } = body;

    let profile = await prisma.schoolProfile.findFirst();

    if (profile) {
      // Update existing - map incoming field names to schema field names
      profile = await prisma.schoolProfile.update({
        where: { id: profile.id },
        data: {
          ...(heroTitle && { heroTitle }),
          ...(heroSubtitle && { heroSubtitle }),
          ...(heroDescription && { heroDescription }),
          ...(visi && { visi }),
          ...(misi && { misi }),
          ...(telepon && { phoneNumber: telepon }),
          ...(email && { emailSchool: email }),
          ...(alamat && { address: alamat }),
        },
      });
    } else {
      // Profile should exist - don't create
      return NextResponse.json(
        { error: 'School profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('School profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
