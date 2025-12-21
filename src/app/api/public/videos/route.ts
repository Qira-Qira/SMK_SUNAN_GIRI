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
    const videos = await readVideos();
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
