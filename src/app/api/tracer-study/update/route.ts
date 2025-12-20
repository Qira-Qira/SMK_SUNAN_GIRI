import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tahunLulus, jurusanId, status, namaPerusahaan, jabatan, gaji, relevansi } = body;

    // Check if user already has tracer study entry
    const existingEntry = await prisma.tracerStudy.findUnique({
      where: { userId: user.id },
    });

    if (existingEntry) {
      // Update existing entry
      const updated = await prisma.tracerStudy.update({
        where: { userId: user.id },
        data: {
          tahunLulus: parseInt(tahunLulus),
          jurusanId,
          status,
          namaPerusahaan,
          jabatan,
          gaji: gaji ? parseFloat(gaji) : null,
          relevansi,
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // Create new entry
    const tracerEntry = await prisma.tracerStudy.create({
      data: {
        userId: user.id,
        tahunLulus: parseInt(tahunLulus),
        jurusanId,
        status,
        namaPerusahaan,
        jabatan,
        gaji: gaji ? parseFloat(gaji) : null,
        relevansi,
      },
    });

    return NextResponse.json(tracerEntry, { status: 201 });
  } catch (error) {
    console.error('Tracer study error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tracerEntry = await prisma.tracerStudy.findUnique({
      where: { userId: user.id },
      include: { jurusan: true },
    });

    if (!tracerEntry) {
      return NextResponse.json(
        { error: 'Tracer study entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tracerEntry, { status: 200 });
  } catch (error) {
    console.error('Tracer study get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
