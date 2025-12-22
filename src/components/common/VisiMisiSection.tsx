"use client";

import React, { useEffect, useState } from 'react';

type Profile = {
  visi?: string | null;
  misi?: string | null;
};

export default function VisiMisiSection() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/public/school-profile');
        if (!mounted) return;
        if (!res.ok) return setProfile(null);
        const data = await res.json();
        setProfile(data.profile || null);
      } catch (err) {
        console.error('Failed to load school profile', err);
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 animate-spin mx-auto" />
        </div>
      </div>
    </section>
  );

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Visi</h3>
            <p className="text-emerald-700 leading-relaxed whitespace-pre-line">{profile?.visi || 'Belum ada visi yang diset.'}</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Misi</h3>
            <p className="text-emerald-700 leading-relaxed whitespace-pre-line">{profile?.misi || 'Belum ada misi yang diset.'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
