"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import VideoPlayer, { prefetchEmbed } from '../../components/common/VideoPlayer';

type VideoItem = { id?: string; title?: string; link?: string; url?: string; videoUrl?: string; thumbnail?: string; description?: string; createdAt?: string; featured?: boolean };

function extractYoutubeId(link?: string | null) {
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0];
  } catch (e) {
    // fallback
  }
  const m = (link || '').match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<VideoItem | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/public/videos?limit=${limit}&page=${page}`);
        if (!mounted) return;
        if (!res.ok) {
          setVideos([]);
          setHasMore(false);
          return;
        }
        const data = await res.json();
        let items: VideoItem[] = Array.isArray(data) ? data : (data.videos || []);
        items.sort((a, b) => {
          const fb = Number(Boolean(b.featured));
          const fa = Number(Boolean(a.featured));
          if (fb - fa !== 0) return fb - fa;
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        setVideos(items);
        if (Array.isArray(data)) {
          setHasMore(items.length === limit);
        } else if (typeof data.total === 'number') {
          setHasMore(page * limit < data.total);
        } else {
          setHasMore(items.length === limit);
        }
      } catch (err) {
        console.error('Failed to load videos', err);
        setVideos([]);
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, limit]);

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-900">Semua Video</h1>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">Kembali ke Beranda</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((v) => {
              const link = v.link || v.url || v.videoUrl || '';
              const id = extractYoutubeId(link);
              const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null);
              return (
                <article key={v.id || link} className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden border-t-4 border-lime-500">
                  <div className="relative cursor-pointer" onClick={() => setSelected(v)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelected(v); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb || ''} alt={v.title || 'thumbnail'} loading="lazy" className="w-full h-48 object-cover" />
                    <button type="button" aria-label={`Putar ${v.title || 'video'}`} onClick={() => setSelected(v)} onMouseEnter={() => prefetchEmbed(id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : undefined)} onFocus={() => prefetchEmbed(id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : undefined)} className="absolute inset-0 flex items-center justify-center bg-transparent">
                      <span className="sr-only">Putar</span>
                      <div className="bg-emerald-600/75 rounded-full p-3">
                        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-emerald-600 font-medium">{v.createdAt ? new Date(v.createdAt).toLocaleDateString('id-ID') : ''}</div>
                      {v.featured && <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-semibold">Featured</span>}
                    </div>

                    <h3 className="text-xl font-bold mb-1 text-emerald-900">
                      <button onClick={() => setSelected(v)} className="text-left w-full text-emerald-900 hover:underline">{v.title}</button>
                    </h3>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded disabled:opacity-50"
            >
              ← Sebelumnya
            </button>

            <div className="text-sm">Halaman {page}</div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
            >
              Berikutnya →
            </button>
          </div>
        </>
      )}

      {selected && <VideoPlayer video={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
