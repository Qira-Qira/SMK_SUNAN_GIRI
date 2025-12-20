'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Program {
  id: string;
  nama: string;
  deskripsi: string;
  icon?: string;
}

const DEFAULT_ICONS = [
  '🧠',
  '🌐',
  '🏍️',
  '💰',
  '🎨',
  '🔧',
  '📱',
  '🏥'
];

export default function ProgramsSection() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch('/api/public/jurusan');
        if (res.ok) {
          const data = await res.json();
          if (data.jurusan && Array.isArray(data.jurusan)) {
            // Take first 5 programs
            const limitedPrograms = data.jurusan.slice(0, 5).map((program: any, idx: number) => ({
              ...program,
              icon: program.icon || DEFAULT_ICONS[idx % DEFAULT_ICONS.length],
            }));
            setPrograms(limitedPrograms);
          }
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Program Keahlian
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pilih Jurusan Sesuai Passion & Karirmu
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dapatkan pendidikan vokasi yang relevan dengan kebutuhan industri dan siap kerja setelah lulus.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              Memuat program...
            </div>
          ) : programs.length > 0 ? (
            programs.map((program, idx) => (
              <div
                key={program.id || idx}
                className={`p-6 rounded-lg border-l-4 transition duration-300 hover:shadow-lg ${
                  idx === 0
                    ? 'bg-blue-50 border-blue-500'
                    : idx === 1
                    ? 'bg-green-50 border-green-500'
                    : idx === 2
                    ? 'bg-orange-50 border-orange-500'
                    : idx === 3
                    ? 'bg-purple-50 border-purple-500'
                    : 'bg-pink-50 border-pink-500'
                }`}
              >
                <div className="text-5xl mb-4">{program.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {program.nama}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {program.deskripsi}
                </p>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition">
                  Pelajari Lebih Lanjut
                  <span>→</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              Belum ada program
            </div>
          )}
        </div>

        {/* AI Test Button */}
        <div className="flex justify-center">
          <Link href="/ai-recommendation">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <span>ℹ️</span>
              Tes AI Saran Jurusan
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
