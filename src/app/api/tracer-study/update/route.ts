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
    const { tahunLulus, jurusanId, status, namaPerusahaan, jabatan, gaji, relevansi, namaInstitusi, namaUsaha } = body;

    // Check if user already has tracer study entry
    const existingEntry = await prisma.tracerStudy.findUnique({
      where: { userId: user.id },
    });

    if (existingEntry) {
      // Update existing entry
      const updateData: any = {
        tahunLulus: parseInt(tahunLulus),
        jurusanId,
        status,
      };

      if (status === 'Bekerja') {
        updateData.namaPerusahaan = namaPerusahaan || null;
        updateData.jabatan = jabatan || null;
        updateData.gaji = gaji ? parseFloat(gaji) : null;
        updateData.relevansi = relevansi || null;
        updateData.namaInstitusi = null;
        updateData.namaUsaha = null;
      } else if (status === 'Kuliah') {
        updateData.namaInstitusi = namaInstitusi || null;
        updateData.namaPerusahaan = null;
        updateData.jabatan = null;
        updateData.gaji = null;
        updateData.relevansi = null;
        updateData.namaUsaha = null;
      } else if (status === 'Wirausaha') {
        updateData.namaUsaha = namaUsaha || null;
        updateData.namaPerusahaan = null;
        updateData.jabatan = null;
        updateData.gaji = null;
        updateData.relevansi = null;
        updateData.namaInstitusi = null;
      } else {
        // Mencari Kerja - clear all
        updateData.namaPerusahaan = null;
        updateData.jabatan = null;
        updateData.gaji = null;
        updateData.relevansi = null;
        updateData.namaInstitusi = null;
        updateData.namaUsaha = null;
      }

      console.log('Updating tracer study for user', user.id, 'with data:', updateData);

      const updated = await prisma.tracerStudy.update({
        where: { userId: user.id },
        data: updateData,
      });
      
      console.log('Updated tracer study:', {
        userId: updated.userId,
        status: updated.status,
        namaPerusahaan: updated.namaPerusahaan,
        jabatan: updated.jabatan,
        namaInstitusi: updated.namaInstitusi,
        namaUsaha: updated.namaUsaha,
      });

      return NextResponse.json(updated, { status: 200 });
    }

    // Create new entry
    const createData: any = {
      userId: user.id,
      tahunLulus: parseInt(tahunLulus),
      jurusanId,
      status,
    };

    if (status === 'Bekerja') {
      createData.namaPerusahaan = namaPerusahaan || null;
      createData.jabatan = jabatan || null;
      createData.gaji = gaji ? parseFloat(gaji) : null;
      createData.relevansi = relevansi || null;
    } else if (status === 'Kuliah') {
      createData.namaInstitusi = namaInstitusi || null;
    } else if (status === 'Wirausaha') {
      createData.namaUsaha = namaUsaha || null;
    }

    console.log('Creating tracer study for user', user.id, 'with data:', createData);

    const tracerEntry = await prisma.tracerStudy.create({
      data: createData,
    });

    console.log('Created tracer study:', {
      userId: tracerEntry.userId,
      status: tracerEntry.status,
      namaPerusahaan: tracerEntry.namaPerusahaan,
      namaInstitusi: tracerEntry.namaInstitusi,
      namaUsaha: tracerEntry.namaUsaha,
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
