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
  createdAt?: string;
  featured?: boolean;
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
        const res = await fetch('/api/public/videos?limit=3&page=1');
        if (res.ok) {
          const data = await res.json();
          let items: VideoItem[] = Array.isArray(data) ? (data as VideoItem[]) : (data.videos || []);
          items.sort((a, b) => {
            const fb = Number(Boolean(b.featured));
            const fa = Number(Boolean(a.featured));
            if (fb - fa !== 0) return fb - fa;
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          });
          setVideos(items);
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
    <section className="py-12 bg-gradient-to-br from-emerald-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <div className="text-center">
            <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              Video
            </div>
            <h2 className="text-4xl font-bold text-emerald-900">Video Terbaru</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((v) => {
            const link = v.link || v.url || v.videoUrl || '';
            const id = extractYoutubeId(link);
            const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);
            return (
              <article key={v.id || link} className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden border-t-4 border-lime-500">
                <div className="block">
                  <div className="relative cursor-pointer" onClick={() => setSelected(v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(v); }}>
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={v.title || 'thumbnail'} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="h-48 bg-emerald-100 flex items-center justify-center text-emerald-9000 font-medium">
                        <span className="text-sm">Gambar Video</span>
                      </div>
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
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-emerald-600 font-medium">{v.createdAt ? new Date(v.createdAt).toLocaleDateString('id-ID') : ''}</div>
                    {v.featured && <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-semibold">Featured</span>}
                  </div>

                  <h3 className="text-lg font-bold mb-3 text-emerald-900">
                    <button onClick={() => setSelected(v)} className="text-left w-full text-emerald-900 hover:underline">{v.title}</button>
                  </h3>
                </div>

                
              </article>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <a href="/videos" className="inline-block bg-lime-500 hover:bg-lime-600 text-emerald-900 font-medium px-6 py-3 rounded-lg transition duration-200">Lihat Semua Video →</a>
        </div>
      </div>

      {selected && <VideoPlayer video={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
