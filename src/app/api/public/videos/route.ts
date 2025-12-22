import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'videos.json');

async function readVideos() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

async function writeVideos(videos: any[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(videos, null, 2), 'utf-8');
  } catch (err) {
    console.error('writeVideos error', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    let videos = await readVideos();

    // Ensure videos are consistently ordered: featured first, then newest
    videos.sort((a: any, b: any) => {
      const fb = Number(Boolean(b.featured));
      const fa = Number(Boolean(a.featured));
      if (fb - fa !== 0) return fb - fa;
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    const url = request.nextUrl;
    const limitParam = url.searchParams.get('limit');
    const pageParam = url.searchParams.get('page');
    const limit = limitParam ? parseInt(limitParam, 10) : NaN;
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;

    if (!Number.isNaN(limit) && limit > 0) {
      const total = videos.length;
      const start = (page - 1) * limit;
      const sliced = videos.slice(start, start + limit);
      return NextResponse.json({ videos: sliced, total }, { status: 200 });
    }

    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    console.error('Videos GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, description, videoUrl, thumbnail, featured } = body;
    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'title and videoUrl required' }, { status: 400 });
    }

    const videos = await readVideos();
    const id = `vid-${Date.now()}`;
    const newItem = { id, title, description: description || '', videoUrl, thumbnail: thumbnail || null, featured: !!featured, createdAt: new Date().toISOString() };
    videos.unshift(newItem);
    await writeVideos(videos);

    return NextResponse.json({ video: newItem }, { status: 201 });
  } catch (error) {
    console.error('Videos POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const videos = await readVideos();
    const filtered = videos.filter((v: any) => v.id !== id);
    await writeVideos(filtered);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error('Videos DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, featured } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const videos = await readVideos();
    const idx = videos.findIndex((v: any) => v.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    videos[idx] = { ...videos[idx], featured: !!featured };
    await writeVideos(videos);

    return NextResponse.json({ video: videos[idx] }, { status: 200 });
  } catch (error) {
    console.error('Videos PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
