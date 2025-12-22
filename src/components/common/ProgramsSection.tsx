'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Loader2, Bot, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Program {
  id: string;
  kode?: string;
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
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showModal, setShowModal] = useState(false);

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

              const kode = (program as any).kode || program.id || '';
              return (
                <div
                  key={program.id || idx}
                  className={`p-6 rounded-lg border-l-4 transition duration-300 hover:shadow-lg ${
                    accentColors[idx % accentColors.length]
                  }`}
                >
                  <div className="mb-4 text-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt={program.nama} className="w-20 h-20 object-cover rounded-full mx-auto mb-2" />
                    ) : (
                      <div className="text-5xl mb-2 text-center">{program.icon}</div>
                    )}
                    <div className="text-xs text-emerald-600 font-bold tracking-wider">{kode.toUpperCase()}</div>
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900 mb-2 text-center">
                    {program.nama}
                  </h3>
                  <div className="flex justify-center">
                    <button
                      onClick={() => { setSelectedProgram(program); setShowModal(true); }}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2 transition"
                    >
                      Detail <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-emerald-900 py-8">
              Belum ada program
            </div>
          )}
        </div>

        {/* Detail Modal (portal + accessible behavior like VideoPlayer) */}
        {showModal && selectedProgram && (
          <ProgramModal
            program={selectedProgram}
            onClose={() => {
              setShowModal(false);
              setSelectedProgram(null);
            }}
          />
        )}

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

function ProgramModal({ program, onClose }: { program: any; onClose(): void }) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);

    prevActiveRef.current = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => {
      setVisible(true);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    });

    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(() => {
      setShouldRender(false);
      try { prevActiveRef.current?.focus?.(); } catch (e) {}
      onClose();
    }, 220);
  };

  // focus trap
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = el.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [shouldRender]);

  if (!shouldRender) return null;

  const srcImage = (() => {
    const icon = program.icon || '';
    if (!icon) return null;
    if (icon.startsWith('http') || icon.startsWith('/')) return icon;
    if (icon.includes('/') || icon.includes('.')) return icon.startsWith('/') ? icon : `/${icon}`;
    return null;
  })();

  const modal = (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} aria-modal="true" role="dialog">
      <div className={`absolute inset-0 bg-black transition-opacity duration-200 ${visible ? 'opacity-60' : 'opacity-0'}`} aria-hidden="true"></div>
      <div ref={containerRef} className={`relative w-full max-w-3xl mx-4 transform transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-white rounded overflow-hidden shadow-lg">
          <div className="p-4 flex justify-end">
            <button ref={closeBtnRef} onClick={handleClose} className="text-emerald-700 hover:text-emerald-900"><X /></button>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 flex flex-col items-center">
              {srcImage ? (
                <img src={srcImage} alt={program.nama} className="w-28 h-28 object-cover rounded-full mb-4" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center text-4xl mb-4">{program.icon}</div>
              )}
              <div className="text-sm text-emerald-600 font-bold">{(program as any).kode ? (program as any).kode.toUpperCase() : program.id.toUpperCase()}</div>
              <h3 className="text-xl font-bold text-emerald-900 mt-2 text-center">{program.nama}</h3>
            </div>
            <div className="md:col-span-2">
              <div className="bg-gradient-to-r from-emerald-50 to-lime-50 p-4 rounded-md shadow-sm mb-4">
                <h4 className="text-sm font-bold text-emerald-900 mb-2">Tujuan Konsentrasi Keahlian</h4>
                <div className="prose prose-emerald max-w-none text-emerald-700 leading-relaxed whitespace-pre-line">{program.deskripsi || '-'}</div>
              </div>

              <div className="mt-4 flex gap-3 items-center">
                <Link href="/ppdb" className="inline-block bg-lime-500 hover:bg-lime-600 text-emerald-900 px-5 py-2 rounded-lg font-semibold shadow">Daftar Sekarang</Link>
                <button onClick={handleClose} className="inline-block bg-white border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg">Tutup</button>
                {/* <div className="ml-auto text-sm text-emerald-600">Pilihan terbaik untuk karirmu — daftar sekarang!</div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">{visible ? 'Detail jurusan terbuka' : ''}</div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
