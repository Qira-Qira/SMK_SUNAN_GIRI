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
    if (!payload || payload.role !== 'PERUSAHAAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);

    let applications = await prisma.jobApplication.findMany({
      where: {
        jobPosting: {
          perusahaanId: companyId, // Filter by company
        },
        ...(statusFilter && { status: statusFilter }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        jobPosting: {
          select: {
            id: true,
            posisi: true,
            perusahaan: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('Get company applications error:', error);
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
    if (!payload || payload.role !== 'PERUSAHAAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');
    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);

    if (!applicationId) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    // Verify that the application belongs to this company's job posting
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        jobPosting: true,
      },
    });

    if (!application || application.jobPosting.perusahaanId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status diperlukan' }, { status: 400 });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        jobPosting: {
          select: {
            id: true,
            posisi: true,
          },
        },
      },
    });

    return NextResponse.json({ application: updatedApplication }, { status: 200 });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
