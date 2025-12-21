'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2,Bot } from 'lucide-react';

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
            // Use all programs returned by CMS
            const allPrograms = data.jurusan.map((program: any, idx: number) => ({
              ...program,
              icon: program.icon || DEFAULT_ICONS[idx % DEFAULT_ICONS.length],
            }));
            setPrograms(allPrograms);
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
          <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Program Keahlian
          </div>
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">
            Pilih Jurusan Sesuai Passion & Karirmu
          </h2>
          <p className="text-emerald-700 max-w-2xl mx-auto">
            Dapatkan pendidikan vokasi yang relevan dengan kebutuhan industri dan siap kerja setelah lulus.
          </p>
        </div>

        {/* Programs Grid (1 column on mobile, 2 on small, 3 on md+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <Loader2 className="animate-spin w-8 h-8 mx-auto text-emerald-600" />
              <p className="mt-3 text-emerald-900">Memuat program...</p>
            </div>
          ) : programs.length > 0 ? (
            programs.map((program, idx) => {
              // Define accent colors for each program - using lime and cyan variations
              const accentColors = [
                'bg-lime-50 border-lime-500 hover:bg-lime-100',
                'bg-emerald-50 border-emerald-500 hover:bg-emerald-100',
                'bg-lime-50 border-lime-500 hover:bg-lime-100',
                'bg-emerald-50 border-emerald-500 hover:bg-emerald-100',
                'bg-lime-50 border-lime-500 hover:bg-lime-100',
              ];
              // Normalize icon -> imageUrl when it looks like a path/URL (uploads may return 'uploads/..' or 'file.jpg')
              const imageUrl = (() => {
                const icon = program.icon || '';
                if (!icon) return null;
                if (icon.startsWith('http') || icon.startsWith('/')) return icon;
                if (icon.includes('/') || icon.includes('.')) return icon.startsWith('/') ? icon : `/${icon}`;
                return null;
              })();

              return (
                <div
                  key={program.id || idx}
                  className={`p-6 rounded-lg border-l-4 transition duration-300 hover:shadow-lg ${
                    accentColors[idx % accentColors.length]
                  }`}
                >
                  <div className="mb-4">
                    {imageUrl ? (
                      <img src={imageUrl} alt={program.nama} className="w-16 h-16 object-cover rounded-full mx-auto mb-4" />
                    ) : (
                      <div className="text-5xl mb-4 text-center">{program.icon}</div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-2">
                    {program.nama}
                  </h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    {program.deskripsi}
                  </p>
                  <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition">
                    Pelajari Lebih Lanjut
                    <span>→</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-emerald-900 py-8">
              Belum ada program
            </div>
          )}
        </div>

        {/* AI Test Button */}
        <div className="flex justify-center">
          <Link href="/ai-recommendation">
            <button className="bg-lime-500 hover:bg-lime-600 text-emerald-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200">
              <Bot className="w-5 h-5" />
              Tes AI Saran Jurusan
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
