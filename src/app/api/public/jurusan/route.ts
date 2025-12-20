import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const jurusan = await prisma.jurusan.findMany({
      include: {
        _count: {
          select: {
            ppdbEntries: true,
            tracerStudy: true,
          },
        },
      },
    });

    return NextResponse.json({ jurusan }, { status: 200 });
  } catch (error) {
    console.error('Jurusan get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { nama, deskripsi, kode } = body;

    if (!nama || !deskripsi || !kode) {
      return NextResponse.json(
        { error: 'Nama, deskripsi, and kode required' },
        { status: 400 }
      );
    }

    const jurusan = await prisma.jurusan.create({
      data: {
        nama,
        deskripsi,
        kode,
      },
    });

    return NextResponse.json({ jurusan }, { status: 201 });
  } catch (error) {
    console.error('Jurusan create error:', error);
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { nama, deskripsi, kode } = body;

    const jurusan = await prisma.jurusan.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi && { deskripsi }),
        ...(kode && { kode }),
      },
    });

    return NextResponse.json({ jurusan }, { status: 200 });
  } catch (error) {
    console.error('Jurusan update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.jurusan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jurusan deleted' }, { status: 200 });
  } catch (error) {
    console.error('Jurusan delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
