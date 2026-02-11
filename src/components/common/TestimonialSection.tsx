'use client';

import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';

interface AlumniCard {
  id: string;
  nama: string;
  jurusan: string;
  tahunLulus: number;
  // From tracer study
  status: string;
  perusahaan?: string;
  jabatan?: string;
  namaInstitusi?: string;
  namaUsaha?: string;
  gaji?: number;
  relevansi?: string;
  // From testimonial
  testimoni?: string;
  rating?: number;
}

export default function TestimonialSection() {
  const [alumniCards, setAlumniCards] = useState<AlumniCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both data sources in parallel
        const [storiesRes, testimonialRes] = await Promise.all([
          fetch('/api/tracer-study/alumni-stories?limit=30'),
          fetch('/api/public/testimonials?limit=30'),
        ]);

        let storiesData: any[] = [];
        let testimonialData: any[] = [];

        if (storiesRes.ok) {
          const data = await storiesRes.json();
          storiesData = data.alumniStories || [];
        }

        if (testimonialRes.ok) {
          const data = await testimonialRes.json();
          testimonialData = data.testimonials || [];
        }

        // Combine: Create a map of alumni by nama to avoid duplicates
        const alumniMap = new Map<string, AlumniCard>();

        // Add all stories using nama as key
        storiesData.forEach((story: any) => {
          const namaKey = story.nama.toLowerCase().trim();
          if (!alumniMap.has(namaKey)) {
            alumniMap.set(namaKey, {
              id: story.id,
              nama: story.nama,
              jurusan: story.jurusan,
              tahunLulus: story.tahunLulus,
              status: story.status || '',
              perusahaan: story.perusahaan,
              jabatan: story.jabatan,
              namaInstitusi: story.namaInstitusi,
              namaUsaha: story.namaUsaha,
              gaji: story.gaji,
              relevansi: story.relevansi,
            });
          }
        });

        // Add testimonials to matching alumni by nama
        testimonialData.forEach((testimonial: any) => {
          const namaKey = testimonial.nama.toLowerCase().trim();
          if (alumniMap.has(namaKey)) {
            const existing = alumniMap.get(namaKey)!;
            // Use testimoni field if available, fallback to isi
            existing.testimoni = testimonial.testimoni || testimonial.isi;
            existing.rating = testimonial.rating || 5;
          } else {
            // If testimonial exists but no story, create a minimal card
            alumniMap.set(namaKey, {
              id: testimonial.id,
              nama: testimonial.nama,
              jurusan: testimonial.jurusan || '',
              tahunLulus: testimonial.tahunLulus ? parseInt(testimonial.tahunLulus) : new Date().getFullYear(),
              status: 'Unknown',
              testimoni: testimonial.testimoni || testimonial.isi,
              rating: testimonial.rating || 5,
            });
          }
        });

        // Convert map to array
        const combined = Array.from(alumniMap.values());
        setAlumniCards(combined);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(alumniCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = alumniCards.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const getStatusDisplay = (alumni: AlumniCard) => {
    const status = alumni.status;
    
    if (status === 'Bekerja' && alumni.jabatan && alumni.perusahaan) {
      return {
        title: alumni.jabatan,
        subtitle: alumni.perusahaan,
        color: 'text-emerald-700 bg-emerald-50',
        badge: 'Bekerja',
      };
    } else if (status === 'Kuliah' && alumni.namaInstitusi) {
      return {
        title: 'Sedang Kuliah',
        subtitle: alumni.namaInstitusi,
        color: 'text-blue-700 bg-blue-50',
        badge: 'Kuliah',
      };
    } else if (status === 'Wirausaha' && alumni.namaUsaha) {
      return {
        title: 'Wirausaha',
        subtitle: alumni.namaUsaha,
        color: 'text-amber-700 bg-amber-50',
        badge: 'Wirausaha',
      };
    } else if (status === 'Mencari Kerja') {
      return {
        title: 'Mencari Kerja',
        subtitle: 'Terbuka untuk Peluang',
        color: 'text-gray-700 bg-gray-50',
        badge: 'Mencari Kerja',
      };
    }
    return null;
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Kisah Sukses Alumni Kami
          </div>
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">
            Dari Sekolah ke Masa Depan
          </h2>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Lihat kisah inspiratif alumni kami yang telah mencapai kesuksesan di berbagai bidang
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Alumni Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentItems.map((alumni) => {
                const statusDisplay = getStatusDisplay(alumni);

                return (
                  <div
                    key={alumni.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-emerald-100"
                  >
                    {/* Header Section - Profile */}
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${getAvatarColor(alumni.nama)}`}
                        >
                          {getInitials(alumni.nama)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{alumni.nama}</h3>
                          <p className="text-sm text-emerald-100 truncate">{alumni.jurusan}</p>
                          <p className="text-xs text-emerald-200">Lulus {alumni.tahunLulus}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-4">
                      {/* Status/Career Info */}
                      {statusDisplay && (
                        <div className={`p-3 rounded-lg ${statusDisplay.color}`}>
                          <p className="text-xs font-semibold text-emerald-700 uppercase mb-1">
                            {statusDisplay.badge}
                          </p>
                          <p className="font-bold text-emerald-900 text-sm mb-1">
                            {statusDisplay.title}
                          </p>
                          <p className="text-sm text-emerald-800">
                            {statusDisplay.subtitle}
                          </p>
                          {alumni.gaji && alumni.status === 'Bekerja' && (
                            <p className="text-xs mt-2 text-emerald-700 font-semibold">
                              💰 Rp {(alumni.gaji / 1000000).toFixed(1)}M+
                            </p>
                          )}
                          {alumni.relevansi && alumni.status === 'Bekerja' && (
                            <div className="mt-2">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                                  alumni.relevansi === 'Sangat Relevan'
                                    ? 'bg-green-200 text-green-800'
                                    : alumni.relevansi === 'Relevan'
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-amber-200 text-amber-800'
                                }`}
                              >
                                {alumni.relevansi}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Testimonial Section */}
                      {alumni.testimoni && (
                        <div className="border-t border-emerald-100 pt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold text-emerald-600 uppercase">Testimoni</p>
                            {alumni.rating && renderStarRating(alumni.rating)}
                          </div>
                          <p className="text-sm text-emerald-900 italic leading-relaxed">
                            "{alumni.testimoni}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {alumniCards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-emerald-700 text-lg">Belum ada data alumni</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium text-sm"
                >
                  ← Sebelumnya
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition duration-200 text-sm ${
                        currentPage === i + 1
                          ? 'bg-emerald-600 text-white'
                          : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium text-sm"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
