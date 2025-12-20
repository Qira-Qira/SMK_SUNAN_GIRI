import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'ALUMNI') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { jobPostingId, cvFile, coverLetter } = body;

    // Check if already applied
    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobPostingId_userId: {
          jobPostingId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 409 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobPostingId,
        userId: user.id,
        cvFile,
        coverLetter,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Job application error:', error);
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

    const applications = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      include: {
        jobPosting: {
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
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error) {
    console.error('Job application get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
