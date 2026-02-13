import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';
import { generateRegistrationNumber, parseRegistrationNumber } from '@/lib/ppdb-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.formData();
    
    const nisn = body.get('nisn') as string;
    const nik = body.get('nik') as string;
    const fullName = body.get('fullName') as string;
    const birthDate = body.get('birthDate') as string;
    const birthPlace = body.get('birthPlace') as string;
    const parentName = body.get('parentName') as string;
    const parentPhone = body.get('parentPhone') as string;
    const parentAddress = body.get('parentAddress') as string;
    const previousSchool = body.get('previousSchool') as string;
    const averageScore = body.get('averageScore') as string;
    const majorChoice1 = body.get('majorChoice1') as string;
    const majorChoice2 = body.get('majorChoice2') as string;
    const majorChoice3 = body.get('majorChoice3') as string;
    const kkFile = body.get('kkFile') as string;
    const aktaFile = body.get('aktaFile') as string;
    const raportFile = body.get('raportFile') as string;
    const ijazahFile = body.get('ijazahFile') as string;
    const fotoCalonFile = body.get('fotoCalonFile') as string;

    // Find jurusan by nama
    const jurusan1 = majorChoice1 ? await prisma.jurusan.findFirst({
      where: { nama: majorChoice1 }
    }) : null;
    const jurusan2 = majorChoice2 ? await prisma.jurusan.findFirst({
      where: { nama: majorChoice2 }
    }) : null;
    const jurusan3 = majorChoice3 ? await prisma.jurusan.findFirst({
      where: { nama: majorChoice3 }
    }) : null;

    if (!jurusan1) {
      return NextResponse.json(
        { error: 'Pilihan jurusan 1 tidak valid' },
        { status: 400 }
      );
    }

    // Check if user already has PPDB entry
    const existingEntry = await prisma.pPDBEntry.findUnique({
      where: { userId: user.id },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Anda sudah mendaftar PPDB' },
        { status: 409 }
      );
    }

    // Create PPDB entry
    const registrationNo = await generateRegistrationNumber();
    const parsed = parseRegistrationNumber(registrationNo);
    
    const ppdbEntry = await prisma.pPDBEntry.create({
      data: {
        registrationNo,
        registrationYear: parsed!.year,
        registrationSeq: parsed!.seq,
        userId: user.id,
        nisn,
        nik,
        birthDate: new Date(birthDate),
        birthPlace,
        parentName,
        parentPhone,
        parentAddress,
        previousSchool,
        averageScore: parseFloat(averageScore),
        jurusanId1: jurusan1.id,
        jurusanId2: jurusan2?.id || null,
        jurusanId3: jurusan3?.id || null,
        status: 'PENDING_VERIFIKASI',
        kkFile: kkFile || null,
        aktaFile: aktaFile || null,
        raportFile: raportFile || null,
        ijazahFile: ijazahFile || null,
        fotoCalonFile: fotoCalonFile || null,
      },
    });

    return NextResponse.json(
      {
        registrationNumber: ppdbEntry.registrationNo,
        status: ppdbEntry.status,
        createdAt: ppdbEntry.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('PPDB registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
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

    // Check if user is admin
    if (!user.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all PPDB entries for admin
    const ppdbEntries = await prisma.pPDBEntry.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        jurusan1: true,
        jurusan2: true,
        jurusan3: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to include email and fullName at top level for easier display
    const mappedEntries = ppdbEntries.map(entry => ({
      id: entry.id,
      registrationNumber: entry.registrationNo,
      email: entry.user?.email || 'N/A',
      fullName: entry.user?.fullName || 'N/A',
      nisn: entry.nisn,
      nik: entry.nik,
      majorChoice1: entry.jurusan1?.nama || 'N/A',
      majorChoice2: entry.jurusan2?.nama || '-',
      majorChoice3: entry.jurusan3?.nama || '-',
      status: entry.status,
      createdAt: entry.createdAt,
      birthDate: entry.birthDate,
      birthPlace: entry.birthPlace,
      parentName: entry.parentName,
      parentPhone: entry.parentPhone,
      parentAddress: entry.parentAddress,
      previousSchool: entry.previousSchool,
      averageScore: entry.averageScore,
      kkFile: entry.kkFile,
      aktaFile: entry.aktaFile,
      raportFile: entry.raportFile,
      ijazahFile: entry.ijazahFile,
      fotoCalonFile: entry.fotoCalonFile,
      userId: entry.userId,
    }));

    return NextResponse.json(
      { entries: mappedEntries },
      { status: 200 }
    );
  } catch (error) {
    console.error('PPDB get error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!user.role.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING_VERIFIKASI', 'VERIFIKASI_LANJUT', 'LULUS', 'CADANGAN', 'DITOLAK'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updatedEntry = await prisma.pPDBEntry.update({
      where: { id },
      data: { status: status as any },
    });

    return NextResponse.json(
      { message: 'Status updated', entry: updatedEntry },
      { status: 200 }
    );
  } catch (error) {
    console.error('PPDB update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as any).message },
      { status: 500 }
    );
  }
}
