import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // only alumni or perusahaan or admin can upload application files
    if (!['ALUMNI', 'PERUSAHAAN', 'ADMIN', 'ADMIN_UTAMA'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // Allowed document MIME types
    const allowedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type && !allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    if ((file as any).size !== undefined && (file as any).size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    if (buffer.length > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filenameSafe = `${Date.now()}-${(file.name || 'upload').replace(/[^a-zA-Z0-9.\-_]/g, '-')}`;
    const outPath = path.join(uploadsDir, filenameSafe);
    await fs.writeFile(outPath, buffer);

    const url = `/uploads/${filenameSafe}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('BKK upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
