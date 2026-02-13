import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAuthUser } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - allow any authenticated user
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - allow PDF and images
    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ]);
    
    const maxSize = 5 * 1024 * 1024; // 5MB for PPDB documents

    // Read buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type && !allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: `Format ${file.type} tidak didukung. Gunakan PDF, JPG, atau PNG` },
        { status: 415 }
      );
    }

    if ((file as any).size !== undefined && (file as any).size > maxSize) {
      return NextResponse.json(
        { error: 'File terlalu besar (maksimal 5MB)' },
        { status: 413 }
      );
    }

    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: 'File terlalu besar (maksimal 5MB)' },
        { status: 413 }
      );
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Create safe filename with timestamp
    const filenameSafe = `${Date.now()}-${(file.name || 'upload')
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .toLowerCase()}`;
    
    const outPath = path.join(uploadsDir, filenameSafe);
    await fs.writeFile(outPath, buffer);

    const url = `/uploads/${filenameSafe}`;
    
    return NextResponse.json(
      { url, message: 'File berhasil diupload' },
      { status: 201 }
    );
  } catch (error) {
    console.error('PPDB Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal upload file - terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
