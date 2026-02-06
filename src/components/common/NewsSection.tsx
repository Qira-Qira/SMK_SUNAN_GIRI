"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string | null;
  featured?: boolean | null;
  createdAt: string;
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/public/news?limit=3&page=1');
        const data = await res.json();
        setNews(data.news || []);
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-emerald-900">Update Terkini SMK</h2>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
          <p className="text-center text-emerald-900">Memuat berita...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-emerald-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <div className="text-center">
            <div className="inline-block bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
              Berita & Informasi
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900">Update Terkini SMK</h2>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {news.map((n) => (
          <article key={n.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden border-t-4 border-lime-500">
            <Link href={`/news/${n.id}`} className="block">
              {n.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.thumbnail} alt={n.title} className="w-full h-40 sm:h-48 object-cover" />
              ) : (
                <div className="h-40 sm:h-48 bg-emerald-100 flex items-center justify-center text-emerald-9000 font-medium"> 
                  <span className="text-xs sm:text-sm">Gambar Berita</span>
                </div>
              )}
            </Link>

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="text-xs sm:text-sm text-emerald-600 font-medium">{new Date(n.createdAt).toLocaleDateString('id-ID')}</div>
                {n.featured && <span className="text-xs bg-emerald-100 text-emerald-900 px-2 sm:px-3 py-1 rounded-full font-semibold flex-shrink-0">Featured</span>}
              </div>

              <h3 className="text-base sm:text-lg font-bold mb-3 text-emerald-900 line-clamp-2">
                <Link href={`/news/${n.id}`}>{n.title}</Link>
              </h3>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/news" className="bg-lime-500 hover:bg-lime-600 text-emerald-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200">Lihat Semua Berita →</Link>
      </div>
      </div>
    </section>
  );
}
