import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || (user.role !== 'PERUSAHAAN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      jurusanId,
      posisi,
      deskripsi,
      requirements,
      salary,
      lokasi,
      tipePekerjaan,
      deadline,
      perusahaanId: bodyPerusahaanId,
    } = body;

    // If the caller is a company user, enforce perusahaanId = user.id
    const perusahaanId = user.role === 'PERUSAHAAN' ? user.id : bodyPerusahaanId || null;
    // If admin provided perusahaanId, verify it exists and has role PERUSAHAAN
    if (user.role === 'ADMIN' && perusahaanId) {
      const company = await prisma.user.findUnique({ where: { id: perusahaanId } });
      if (!company || company.role !== 'PERUSAHAAN') {
        return NextResponse.json({ error: 'Invalid perusahaanId' }, { status: 400 });
      }
    }

    const data: any = {
      perusahaanId,
      jurusanId,
      posisi,
      deskripsi,
      requirements,
      salary: salary ? parseFloat(salary) : null,
      lokasi,
      tipePekerjaan,
    };

    if (deadline) {
      data.deadline = new Date(deadline);
    }

    const jobPosting = await prisma.jobPosting.create({ data });

    return NextResponse.json(jobPosting, { status: 201 });
  } catch (error) {
    console.error('Job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jurusanId = searchParams.get('jurusanId');
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const where: any = { isActive: true };
    if (jurusanId) {
      where.jurusanId = jurusanId;
    }

    if (q) {
      const qLower = q;
      where.OR = [
        { posisi: { contains: qLower, mode: 'insensitive' } },
        { deskripsi: { contains: qLower, mode: 'insensitive' } },
        { perusahaan: { is: { fullName: { contains: qLower, mode: 'insensitive' } } } },
      ];
    }

    const total = await prisma.jobPosting.count({ where });

    const jobPostings = await prisma.jobPosting.findMany({
      where,
      include: {
        jurusan: true,
        perusahaan: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ jobPostings, total }, { status: 200 });
  } catch (error) {
    console.error('Job posting get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
