'use client';

import { BookOpen, BarChart3, GraduationCap } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <BookOpen className="w-12 h-12 text-emerald-600" />,
    title: 'Teaching Factory',
    description: 'Belajar di lingkungan industri nyata dengan peralatan modern dan standar internasional.',
  },
  {
    icon: <BarChart3 className="w-12 h-12 text-emerald-600" />,
    title: 'Link & Match',
    description: 'Kurikulum disesuaikan dengan kebutuhan industri dan jaminan kerja untuk lulusan terbaik.',
  },
  {
    icon: <GraduationCap className="w-12 h-12 text-emerald-600" />,
    title: 'Sertifikasi Internasional',
    description: 'Dapatkan sertifikasi kompetensi dari Microsoft, Cisco, dan lembaga internasional lainnya.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-lime-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-emerald-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
            Keunggulan Kami
          </div>
          <h2 className="text-4xl font-bold text-emerald-900 mb-4">
            Mengapa Memilih SMK Kami?
          </h2>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
            Kami menyediakan pendidikan berkualitas dengan pendekatan yang relevan terhadap industri
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <ScrollAnimation key={idx} animation="fade-up" delay={idx * 100} className="h-full">
              <div
                className="group bg-white p-8 rounded-lg border-l-4 border-lime-500 hover:shadow-lg transition duration-300 transform hover:-translate-y-1 h-full"
              >
                {/* Icon */}
                <div className="mb-6 group-hover:scale-110 transition duration-300 flex justify-center md:justify-start">
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-emerald-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-emerald-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
