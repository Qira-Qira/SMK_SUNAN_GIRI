import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredJobPostings, getExpiredJobPostings } from '@/lib/jobs/cleanup';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await cleanupExpiredJobPostings();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Cleanup failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expired = await getExpiredJobPostings();
    return NextResponse.json({ expiredPostings: expired }, { status: 200 });
  } catch (error) {
    console.error('Error getting expired postings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get expired postings',
      },
      { status: 500 }
    );
  }
}
