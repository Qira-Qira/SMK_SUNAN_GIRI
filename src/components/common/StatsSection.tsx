'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, TrendingUp, Trophy } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import CountUp from './CountUp';

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
}

export default function StatsSection() {
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: <Users className="w-12 h-12 text-emerald-600" />,
      value: '1,200+',
      label: 'Siswa Aktif',
      description: 'Dari berbagai daerah',
    },
    {
      icon: <Building2 className="w-12 h-12 text-emerald-600" />,
      value: '150+',
      label: 'Mitra Industri',
      description: 'Perusahaan ternama',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-emerald-600" />,
      value: '95%',
      label: 'Tingkat Serapan Kerja',
      description: 'Alumni tersebar industri',
    },
    {
      icon: <Trophy className="w-12 h-12 text-emerald-600" />,
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
                icon: <Users className="w-12 h-12 text-emerald-600" />,
                value: data.stats.siswaAktif || '1,200+',
                label: 'Siswa Aktif',
                description: data.stats.deskripsiSiswa || 'Dari berbagai daerah',
              },
              {
                icon: <Building2 className="w-12 h-12 text-emerald-600" />,
                value: data.stats.mitraIndustri || '150+',
                label: 'Mitra Industri',
                description: data.stats.deskripsiMitra || 'Perusahaan ternama',
              },
              {
                icon: <TrendingUp className="w-12 h-12 text-emerald-600" />,
                value: data.stats.serapanKerja || '95%',
                label: 'Tingkat Serapan Kerja',
                description: data.stats.deskripsiSerapan || 'Alumni tersebar industri',
              },
              {
                icon: <Trophy className="w-12 h-12 text-emerald-600" />,
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
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-lime-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <ScrollAnimation key={idx} animation="fade-up" delay={idx * 100} className="h-full">
              <div
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition duration-300 text-center border-t-4 border-lime-500 h-full"
              >
                <div className="mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-emerald-900 mb-2">
                  {(() => {
                    const match = stat.value.match(/^([0-9,.]+)(.*)$/);
                    if (match) {
                      const end = parseInt(match[1].replace(/,/g, '').replace(/\./g, ''), 10);
                      // Note: Handling both comma and dot as potential separators slightly loosely here.
                      // Ideally we know the locale. Assuming '1,200' -> 1200.
                      // If '1.200' (ID format), we also remove dot.
                      // Let's strip non-digits for the number value to be safe for animation target.
                      const numSafe = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
                      return <CountUp end={numSafe} suffix={match[2]} />;
                    }
                    return stat.value;
                  })()}
                </div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                  {stat.label}
                </h3>
                <p className="text-emerald-600 text-sm">{stat.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
