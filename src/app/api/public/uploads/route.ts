import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // Validate file type and size
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const maxSize = 2 * 1024 * 1024; // 2MB

    // Read buffer first so we can check actual size
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
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
