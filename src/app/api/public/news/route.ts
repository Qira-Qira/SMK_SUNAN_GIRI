import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // If an id (or slug) is provided, return single news item
    const id = searchParams.get('id');
    if (id) {
      const single = await prisma.news.findFirst({ where: { OR: [{ id }, { slug: id }], published: true } });
      return NextResponse.json({ news: single || null }, { status: 200 });
    }

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

    const skip = (page - 1) * limit;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.news.count({ where: { published: true } }),
    ]);

    return NextResponse.json(
      {
        news,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('News get error:', error);
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
    if (!payload || (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, thumbnail, featured, published } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-');

    const news = await prisma.news.create({
      data: {
        title,
        content,
        slug,
        thumbnail: thumbnail || null,
        featured: featured === true,
        published: published === true,
      },
    });

    return NextResponse.json({ news }, { status: 201 });
  } catch (error) {
    console.error('News create error:', error);
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
    if (!payload || (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, thumbnail, featured, published } = body;

    // Find existing item to possibly cleanup old thumbnail
    const existing = await prisma.news.findUnique({ where: { id } });

    // If thumbnail provided and different from existing, delete old file when it's under /uploads
    if (thumbnail !== undefined && existing?.thumbnail && existing.thumbnail !== thumbnail && existing.thumbnail.startsWith('/uploads/')) {
      try {
        const filename = path.basename(existing.thumbnail);
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
        await fs.unlink(filePath).catch(() => {});
      } catch (e) {
        console.error('Failed to delete old thumbnail:', e);
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(title && { slug: title.toLowerCase().replace(/\s+/g, '-') }),
        ...(thumbnail !== undefined && { thumbnail: thumbnail || null }),
        ...(featured !== undefined && { featured: featured === true }),
        ...(published !== undefined && { published: published === true }),
      },
    });

    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('News update error:', error);
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
    if (!payload || (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Find existing to remove thumbnail file if present
    const existing = await prisma.news.findUnique({ where: { id } });
    if (existing?.thumbnail && existing.thumbnail.startsWith('/uploads/')) {
      try {
        const filename = path.basename(existing.thumbnail);
        const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
        await fs.unlink(filePath).catch(() => {});
      } catch (e) {
        console.error('Failed to delete thumbnail on news delete:', e);
      }
    }

    await prisma.news.delete({ where: { id } });

    return NextResponse.json({ message: 'News deleted' }, { status: 200 });
  } catch (error) {
    console.error('News delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
