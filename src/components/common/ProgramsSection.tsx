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
          <div className="inline-block bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
            Program Keahlian
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-4">
            Pilih Jurusan Sesuai Passion & Karirmu
          </h2>
          <p className="text-sm sm:text-base text-emerald-700 max-w-2xl mx-auto px-2">
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
      <div ref={containerRef} className={`relative w-full max-w-2xl mx-2 sm:mx-4 max-h-[90vh] transform transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} overflow-y-auto flex flex-col`}>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl">
          {/* Header dengan Close Button */}
          <div className="bg-gradient-to-r from-emerald-600 to-lime-500 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-50 shadow-md ">
            <h2 className="text-white text-lg sm:text-2xl font-bold truncate pr-2">{program.nama}</h2>
            <button 
              ref={closeBtnRef} 
              onClick={handleClose} 
              className="text-white hover:bg-white/20 p-2 rounded-lg transition duration-200 flex-shrink-0"
              aria-label="Close modal"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Image & Code Section */}
              <div className="flex flex-col items-center md:col-span-1">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center mb-4 shadow-md flex-shrink-0">
                  {srcImage ? (
                    <img src={srcImage} alt={program.nama} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full" />
                  ) : (
                    <div className="text-4xl sm:text-6xl">{program.icon}</div>
                  )}
                </div>
                <div className="text-xs font-bold text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-2">
                  {(program as any).kode ? (program as any).kode.toUpperCase() : program.id.substring(0, 4).toUpperCase()}
                </div>
              </div>

              {/* Description Section */}
              <div className="md:col-span-2">
                {/* Tujuan Section */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 sm:mb-3">Tujuan Konsentrasi Keahlian</h3>
                  <p className="text-emerald-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm md:text-base">
                    {program.deskripsi || 'Deskripsi tidak tersedia'}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Ringkas</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs text-emerald-700">
                    <div>
                      <span className="font-semibold text-emerald-900">Jenis:</span> <span className="block sm:inline">Vokasi</span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-900">Durasi:</span> <span className="block sm:inline">3 Tahun</span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-900">Sertifikasi:</span> <span className="block sm:inline">Industri</span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-900">Karir:</span> <span className="block sm:inline">Kerja</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
                  <button 
                    onClick={handleClose}
                    className="w-48 order-2 sm:order-1  sm:flex-1 bg-white border-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-200"
                  >
                    Tutup
                  </button>
                  <Link href="/ppdb" onClick={handleClose} className="order-1 sm:order-2 w-48 sm:flex-1 bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition duration-200 text-center inline-block">
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">{visible ? `Detail jurusan ${program.nama} terbuka` : ''}</div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
