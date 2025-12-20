'use client';

import { useEffect, useState } from 'react';

interface Stat {
  icon: string;
  value: string;
  label: string;
  description: string;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: '👤',
      value: '1,200+',
      label: 'Siswa Aktif',
      description: 'Dari berbagai daerah',
    },
    {
      icon: '🏢',
      value: '150+',
      label: 'Mitra Industri',
      description: 'Perusahaan ternama',
    },
    {
      icon: '📈',
      value: '95%',
      label: 'Tingkat Serapan Kerja',
      description: 'Alumni tersebar industri',
    },
    {
      icon: '🏆',
      value: '50+',
      label: 'Prestasi',
      description: 'Tingkat nasional & internasional',
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats([
              {
                icon: '👤',
                value: data.stats.siswaAktif || '1,200+',
                label: 'Siswa Aktif',
                description: data.stats.deskripsiSiswa || 'Dari berbagai daerah',
              },
              {
                icon: '🏢',
                value: data.stats.mitraIndustri || '150+',
                label: 'Mitra Industri',
                description: data.stats.deskripsiMitra || 'Perusahaan ternama',
              },
              {
                icon: '📈',
                value: data.stats.serapanKerja || '95%',
                label: 'Tingkat Serapan Kerja',
                description: data.stats.deskripsiSerapan || 'Alumni tersebar industri',
              },
              {
                icon: '🏆',
                value: data.stats.prestasi || '50+',
                label: 'Prestasi',
                description: data.stats.deskripsiPrestasi || 'Tingkat nasional & internasional',
              },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition duration-300 text-center"
            >
              <div className="text-5xl mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {stat.label}
              </h3>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
