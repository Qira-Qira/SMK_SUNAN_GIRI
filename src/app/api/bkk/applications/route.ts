import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_BKK' && payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const applications = await prisma.jobApplication.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        jobPosting: {
          select: { id: true, posisi: true, perusahaan: true },
          include: {
            perusahaan: {
              select: { id: true, fullName: true }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_BKK' && payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        jobPosting: {
          include: { perusahaan: true }
        }
      }
    });

    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
