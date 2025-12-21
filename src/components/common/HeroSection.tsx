'use client';

import Link from 'next/link';
import { Zap, Briefcase, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroStats {
    label: string;
    value: string;
}

export default function HeroSection() {
    const [heroData, setHeroData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHeroData();
    }, []);

    const fetchHeroData = async () => {
        try {
            const res = await fetch('/api/public/school-profile');
            if (res.ok) {
                const data = await res.json();
                setHeroData(data.profile);
            }
        } catch (error) {
            console.error('Error fetching hero data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Default hero stats
    const stats: HeroStats[] = [
        { label: 'Tingkat Kelulusan', value: '95%' },
        { label: 'Mitra Industri', value: '150+' },
        { label: 'Prestasi/Tahun', value: '50+' },
        { label: 'Rating Alumni', value: '4.8' },
    ];

    if (isLoading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 text-white flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8" />
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 text-white flex items-center">
            <div className="w-full">


                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Left Content */}
                        <div className="space-y-6 max-w-2xl">
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                    {heroData?.heroTitle || 'Wujudkan Masa'}
                                    &nbsp;
                                    {heroData?.heroSubtitle || 'Bersama SMK Unggulan'}
                                </h1>
                                <p className="text-xl text-emerald-50 mx-auto">
                                    {heroData?.heroDescription ||
                                        'Persiapkan diri untuk era industri 4.0 dengan pendidikan vokasi berkualitas, teaching factory modern, dan jaringan industri yang luas.'}
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4 justify-center">
                                <Link
                                    href="/ai-recommendation"
                                    className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold hover:bg-emerald-50 transition duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Zap className="w-5 h-5" />
                                    Tes AI Jurusan
                                </Link>
                                <Link
                                    href="/bkk"
                                    className="inline-flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-emerald-900 px-6 py-3 rounded-lg font-bold transition duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <Briefcase className="w-5 h-5" />
                                    Career Center
                                </Link>
                            </div>


                        </div>


                    </div>
                </div>


            </div>
        </section>
    );
}
