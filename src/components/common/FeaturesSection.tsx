'use client';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '📚',
    title: 'Teaching Factory',
    description: 'Belajar di lingkungan industri nyata dengan peralatan modern dan standar internasional.',
  },
  {
    icon: '📊',
    title: 'Link & Match',
    description: 'Kurikulum disesuaikan dengan kebutuhan industri dan jaminan kerja untuk lulusan terbaik.',
  },
  {
    icon: '🎓',
    title: 'Sertifikasi Internasional',
    description: 'Dapatkan sertifikasi kompetensi dari Microsoft, Cisco, dan lembaga internasional lainnya.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            Keunggulan Kami
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih SMK Kami?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan pendidikan berkualitas dengan pendekatan yang relevan terhadap industri
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-gray-50 p-8 rounded-lg hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
