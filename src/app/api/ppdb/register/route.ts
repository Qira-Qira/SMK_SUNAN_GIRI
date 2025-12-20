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
    const {
      nisn,
      nik,
      birthDate,
      birthPlace,
      parentName,
      parentPhone,
      parentAddress,
      previousSchool,
      averageScore,
      jurusanId1,
      jurusanId2,
      jurusanId3,
    } = body;

    // Check if user already has PPDB entry
    const existingEntry = await prisma.pPDBEntry.findUnique({
      where: { userId: user.id },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: 'User already registered for PPDB' },
        { status: 409 }
      );
    }

    // Create PPDB entry
    const ppdbEntry = await prisma.pPDBEntry.create({
      data: {
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
        jurusanId1,
        jurusanId2: jurusanId2 || null,
        jurusanId3: jurusanId3 || null,
        status: 'PENDING_VERIFIKASI',
      },
    });

    return NextResponse.json(
      {
        registrationNo: ppdbEntry.registrationNo,
        status: ppdbEntry.status,
        createdAt: ppdbEntry.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('PPDB registration error:', error);
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

    const ppdbEntry = await prisma.pPDBEntry.findUnique({
      where: { userId: user.id },
      include: {
        jurusan1: true,
      },
    });

    if (!ppdbEntry) {
      return NextResponse.json(
        { error: 'PPDB entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(ppdbEntry, { status: 200 });
  } catch (error) {
    console.error('PPDB get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
