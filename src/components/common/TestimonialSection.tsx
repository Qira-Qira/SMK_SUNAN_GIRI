'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  nama: string;
  posisi: string;
  perusahaan: string;
  tahunLulus: string;
  testimoni: string;
  rating: number;
}

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/public/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestimonials = testimonials.slice(startIndex, endIndex);

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

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            Testimoni Alumni
          </div>
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">
            Kisah Sukses Alumni Kami
          </h2>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Dengarkan cerita inspiratif dari alumni kami yang telah sukses di berbagai industri
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {currentTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-lime-50 p-8 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-lime-500"
            >
              {/* Header with Avatar and Info */}
              <div className="flex items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0 ${getAvatarColor(
                    testimonial.nama
                  )}`}
                >
                  {getInitials(testimonial.nama)}
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">{testimonial.nama}</h3>
                  <p className="text-sm text-emerald-700">{testimonial.posisi}</p>
                  <p className="text-xs text-emerald-600">
                    {testimonial.perusahaan} • {testimonial.tahunLulus}
                  </p>
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-emerald-700 italic mb-4 leading-relaxed">
                "{testimonial.testimoni}"
              </p>

              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-lime-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-medium transition duration-200 ${
                  currentPage === i + 1
                    ? 'bg-lime-500 text-white'
                    : 'border border-emerald-300 text-emerald-700 hover:bg-lime-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-lime-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
