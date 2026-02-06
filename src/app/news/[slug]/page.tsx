"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/common/Navbar';

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

  if (loading) return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 sm:py-12 px-4 text-emerald-900">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
        </div>
      </main>
    </>
  );
  if (!news) return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 sm:py-12 px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-900">Berita tidak ditemukan</h1>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 sm:py-12 px-4">
      <article className="bg-white rounded-lg shadow p-4 sm:p-8 border-l-4 border-lime-500">
        {news.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.thumbnail} alt={news.title} className="w-full aspect-video sm:aspect-[16/9] object-cover rounded mb-6" />
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-emerald-900">{news.title}</h1>
        <div className="text-xs sm:text-sm text-emerald-600 mb-6 font-medium">{new Date(news.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="prose prose-sm sm:prose max-w-none text-emerald-800 text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: news.content }} />
        <div className="mt-6 sm:mt-8">
          <a href="/news" className="text-xs sm:text-sm text-lime-600 hover:text-lime-700 underline font-medium">← Kembali ke Berita</a>
        </div>
      </article>
    </main>
    </>
  );
}
