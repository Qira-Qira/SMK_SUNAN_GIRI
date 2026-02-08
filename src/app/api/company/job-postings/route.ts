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

    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);

    // Get job postings created by this company (perusahaanId = userId)
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        perusahaanId: companyId,
      },
      include: {
        perusahaan: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        jurusan: {
          select: {
            id: true,
            nama: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ jobPostings }, { status: 200 });
  } catch (error) {
    console.error('Get company job postings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'PERUSAHAAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);

    const body = await request.json();
    const { posisi, lokasi, deskripsi, requirements, salary, salaryPeriod, tipePekerjaan, deadline, jurusanId } = body;

    if (!posisi || !deskripsi) {
      return NextResponse.json(
        { error: 'Posisi dan deskripsi harus diisi' },
        { status: 400 }
      );
    }

    // Convert requirements string to array
    const requirementsArray = requirements
      ? requirements.split(',').map((req: string) => req.trim()).filter((req: string) => req.length > 0)
      : [];

    // Check if company exists
    const company = await prisma.user.findUnique({
      where: { id: companyId },
    });

    if (!company || company.role !== 'PERUSAHAAN') {
      return NextResponse.json(
        { error: 'User bukan perusahaan' },
        { status: 403 }
      );
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        posisi,
        lokasi: lokasi || '',
        deskripsi,
        requirements: requirementsArray,
        salary: salary ? parseFloat(salary) : null,
        salaryPeriod: salaryPeriod || 'per_bulan',
        tipePekerjaan: tipePekerjaan || 'Full-time',
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
        perusahaanId: companyId, // Company ID
        jurusanId: jurusanId || '',
      },
      include: {
        perusahaan: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ jobPosting }, { status: 201 });
  } catch (error) {
    console.error('Create job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'PERUSAHAAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    // Check if job posting belongs to this company
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!existingJob || existingJob.perusahaanId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { posisi, lokasi, deskripsi, requirements, salary, salaryPeriod, tipePekerjaan, deadline, jurusanId } = body;

    const requirementsArray = requirements && typeof requirements === 'string'
      ? requirements.split(',').map((req: string) => req.trim()).filter((req: string) => req.length > 0)
      : Array.isArray(requirements) ? requirements : existingJob.requirements;

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        posisi: posisi || existingJob.posisi,
        lokasi: lokasi || existingJob.lokasi,
        deskripsi: deskripsi || existingJob.deskripsi,
        requirements: requirementsArray,
        salary: salary ? parseFloat(salary) : existingJob.salary,
        salaryPeriod: salaryPeriod || existingJob.salaryPeriod,
        tipePekerjaan: tipePekerjaan || existingJob.tipePekerjaan,
        deadline: deadline ? new Date(deadline) : existingJob.deadline,
        jurusanId: jurusanId || existingJob.jurusanId,
      },
      include: {
        perusahaan: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ jobPosting: updatedJob }, { status: 200 });
  } catch (error) {
    console.error('Update job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'PERUSAHAAN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companyId = typeof payload.id === 'string' ? payload.id : String(payload.id);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    // Check if job posting belongs to this company
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!existingJob || existingJob.perusahaanId !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Job posting deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete job posting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
