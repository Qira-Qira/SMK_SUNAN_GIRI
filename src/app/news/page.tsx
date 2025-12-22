"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type NewsItem = {
  id: string;
  title: string;
  slug?: string;
  content: string;
  thumbnail?: string | null;
  featured?: boolean | null;
  createdAt: string;
};

export default function NewsList() {
  const search = useSearchParams();
  const rawPage = search?.get('page') || '1';
  const page = Number(rawPage) || 1;
  const limit = 3;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/public/news?limit=${limit}&page=${page}`);
        if (!mounted) return;
        if (!res.ok) {
          setNews([]);
          setPages(1);
          return;
        }
        const data = await res.json();
        setNews(data.news || []);
        if (data.pagination && typeof data.pagination.pages === 'number') setPages(data.pagination.pages);
        else if (typeof data.total === 'number') setPages(Math.max(1, Math.ceil(data.total / limit)));
      } catch (err) {
        console.error('Failed to fetch news', err);
        setNews([]);
        setPages(1);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page]);

  const hasPrev = page > 1;
  const hasNext = page < pages;

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">Informasi Terkini</div>
          <h1 className="text-4xl font-bold text-emerald-900">Berita & Informasi</h1>
        </div>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">Kembali ke Beranda</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            {news.map((n) => (
              <article key={n.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border-t-4 border-lime-500 overflow-hidden">
                <Link href={`/news/${n.id}`} className="block">
                  {n.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.thumbnail} alt={n.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="h-48 bg-emerald-100 flex items-center justify-center text-emerald-9000 font-medium">Gambar Berita</div>
                  )}
                </Link>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-emerald-600 font-medium">{new Date(n.createdAt).toLocaleDateString('id-ID')}</div>
                    {n.featured && <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full font-semibold">Featured</span>}
                  </div>

                  <h3 className="text-lg font-bold text-emerald-900 mb-3"><Link href={`/news/${n.id}`}>{n.title}</Link></h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">{n.content ? n.content.slice(0, 160) + (n.content.length > 160 ? '...' : '') : ''}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <Link
              href={`/news?page=${Math.max(1, page - 1)}`}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${hasPrev ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' : 'bg-emerald-100 text-emerald-900 opacity-50 pointer-events-none'}`}
            >
              ← Sebelumnya
            </Link>

            <div className="text-sm">Halaman {page} dari {pages}</div>

            <Link
              href={`/news?page=${page + 1}`}
              className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${hasNext ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 opacity-50 pointer-events-none'}`}
            >
              Berikutnya →
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
