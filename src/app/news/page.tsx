import React from 'react';
import Link from 'next/link';

type Props = { searchParams?: { [key: string]: string | string[] | undefined } };

export default async function NewsList({ searchParams }: Props) {
  // Defensive parse of page param
  let page = 1;
  try {
    const hasPage = !!(searchParams && typeof searchParams === 'object' && Object.prototype.hasOwnProperty.call(searchParams, 'page'));
    const rawAny = hasPage ? (searchParams as any).page : undefined;
    let raw: string | undefined;
    if (Array.isArray(rawAny)) raw = rawAny[0];
    else if (typeof rawAny === 'string') raw = rawAny;
    else raw = undefined;
    page = Number(raw ?? '1') || 1;
  } catch (e) {
    page = 1;
  }

  const limit = 9;
  const skip = (page - 1) * limit;

  // Dynamic import of prisma to avoid bundler/source-map edge cases in dev
  const { prisma } = await import('@/lib/db/prisma');

  const [news, total] = await Promise.all([
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.news.count({ where: { published: true } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">Informasi Terkini</div>
        <h1 className="text-4xl font-bold text-emerald-900">Berita & Informasi</h1>
      </div>

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

      <div className="flex justify-center mt-12 space-x-2">
        {Array.from({ length: pages }).map((_, i) => (
          <Link key={i} href={`/news?page=${i + 1}`} className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${i + 1 === page ? 'bg-lime-500 text-emerald-900' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'}`}>
            {i + 1}
          </Link>
        ))}
      </div>
    </main>
  );
}
