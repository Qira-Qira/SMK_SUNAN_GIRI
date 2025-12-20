"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  thumbnail?: string | null;
  createdAt: string;
};

export default function NewsDetail() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params?.slug[0] : (params?.slug as string | undefined);
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/public/news?id=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setNews(data.news || null);
      } catch (e) {
        console.error('Fetch news error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug]);

  if (loading) return <main className="container mx-auto py-12 px-4 text-emerald-900">Memuat...</main>;
  if (!news) return <main className="container mx-auto py-12 px-4"><h1 className="text-2xl font-bold text-emerald-900">Berita tidak ditemukan</h1></main>;

  return (
    <main className="container mx-auto py-12 px-4">
      <article className="bg-white rounded-lg shadow p-8 border-l-4 border-lime-500">
        {news.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.thumbnail} alt={news.title} className="w-full h-64 object-cover rounded mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-4 text-emerald-900">{news.title}</h1>
        <div className="text-sm text-emerald-9000 mb-6">{new Date(news.createdAt).toLocaleString()}</div>
        <div className="prose max-w-none text-emerald-800" dangerouslySetInnerHTML={{ __html: news.content }} />
        <div className="mt-6">
          <a href="/news" className="text-sm text-lime-600 hover:text-lime-700 underline">← Kembali ke Berita</a>
        </div>
      </article>
    </main>
  );
}
