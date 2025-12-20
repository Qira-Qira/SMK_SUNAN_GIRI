"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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
        <h2 className="text-3xl font-bold text-center mb-6">Update Terkini SMK</h2>
        <p className="text-center text-gray-500">Memuat berita...</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-3xl font-bold">Update Terkini SMK</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {news.map((n) => (
          <article key={n.id} className="bg-white rounded-lg shadow overflow-hidden">
            <Link href={`/news/${n.id}`} className="block">
              {n.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.thumbnail} alt={n.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400"> 
                  <span className="text-sm">Gambar Berita</span>
                </div>
              )}
            </Link>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</div>
                {n.featured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Featured</span>}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                <Link href={`/news/${n.id}`}>{n.title}</Link>
              </h3>
              <p className="text-gray-600 text-sm">{n.content ? n.content.slice(0, 140) + (n.content.length > 140 ? '...' : '') : ''}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/news" className="inline-block bg-white border rounded-full px-4 py-2 shadow hover:shadow-md">Lihat Semua Berita →</Link>
      </div>
    </section>
  );
}
