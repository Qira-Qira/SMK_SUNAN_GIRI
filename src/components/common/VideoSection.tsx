"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import VideoPlayer, { prefetchEmbed } from './VideoPlayer';

type VideoItem = {
  id?: string;
  title?: string;
  link?: string;
  url?: string;
  videoUrl?: string;
  thumbnail?: string;
  description?: string;
};

function toEmbed(link?: string | null, autoplay = false) {
  if (!link) return null;
  try {
    const u = new URL(link);
    // youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
    }
    // youtu.be/ID
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
    }
  } catch (e) {
    // ignore
  }
  // fallback regex
  const m = link.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
  return null;
}

function extractYoutubeId(link?: string | null) {
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0];
  } catch (e) {
    // fallback
  }
  const m = link.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export default function VideoSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VideoItem | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/public/videos?limit=6&page=1');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setVideos(data as VideoItem[]);
          else setVideos(data.videos || []);
        }
      } catch (err) {
        console.error('Failed to fetch videos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-emerald-900">Video</h2>
        <div className="flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-emerald-900">Video</h2>
        <a href="/videos" className="text-sm text-emerald-600 hover:underline">Lihat Semua Video</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((v) => {
          const link = v.link || v.url || v.videoUrl || '';
          const id = extractYoutubeId(link);
          const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);
          return (
            <div key={v.id || link} className="bg-white rounded-lg overflow-hidden shadow">
              <div
                className="relative cursor-pointer"
                onClick={() => setSelected(v)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelected(v); }}
              >
                {thumb ? (
                  <img src={thumb} alt={v.title || 'thumbnail'} loading="lazy" className="w-full h-auto object-cover aspect-video" />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-emerald-900 p-4">Tidak ada preview untuk video ini.</div>
                )}
                <button
                  type="button"
                  aria-label={`Putar ${v.title || 'video'}`}
                  onClick={() => setSelected(v)}
                  onMouseEnter={() => prefetchEmbed(toEmbed(link))}
                  onFocus={() => prefetchEmbed(toEmbed(link))}
                  className="absolute inset-0 flex items-center justify-center bg-transparent"
                >
                  <span className="sr-only">Putar</span>
                  <div className="bg-emerald-600/75 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="p-3">
                <div className="text-sm font-medium text-emerald-900">{v.title}</div>
                {v.description && <div className="text-xs text-emerald-600 mt-1">{(v.description || '').substring(0, 100)}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <VideoPlayer video={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
