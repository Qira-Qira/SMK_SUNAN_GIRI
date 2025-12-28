"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Copy, Check } from 'lucide-react';

type SchoolProfile = {
  alamat?: string;
  telepon?: string;
  email?: string;
  nama?: string;
  youtube?: string;
  instagram?: string;
};

export default function Footer() {
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/public/school-profile');
        if (!res.ok) return;
        const data = await res.json();
        const p = data?.schoolProfile || data?.profile || data;
        if (mounted) setProfile(p || null);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <footer className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Siap Memulai Karirmu di Industri Digital?</h2>
            <p className="text-emerald-50 mb-4 max-w-xl">Bergabunglah dengan ribuan alumni yang telah sukses berkarir di perusahaan ternama. Temukan jurusan yang tepat dan daftar sekarang.</p>
            <div className="flex gap-3">
              <Link href="/register" className="inline-block bg-white text-emerald-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-emerald-50 transition">Daftar Sekarang</Link>
              <Link href="/ppdb" className="inline-block bg-transparent border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition">Informasi PPDB</Link>
            </div>
          </div>

          <div className="md:col-span-1 bg-white/5 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-emerald-50 mb-3">Kontak Sekolah</h3>
            {loading ? (
              <p className="text-emerald-100 text-sm">Memuat kontak...</p>
            ) : (
              <div className="space-y-3 text-emerald-50">
                <div className="flex items-start gap-3 group">
                  <MapPin className="w-5 h-5 text-emerald-100 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm">{profile?.alamat || 'Alamat belum diatur'}</div>
                    {profile?.alamat && (
                      <button
                        onClick={() => copyToClipboard(profile.alamat!, 'alamat')}
                        className="mt-1 text-xs text-emerald-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        title="Copy alamat"
                      >
                        {copied === 'alamat' ? (
                          <>
                            <Check className="w-3 h-3" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Salin
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <Phone className="w-5 h-5 text-emerald-100 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    {profile?.telepon ? (
                      <>
                        <a href={`tel:${profile.telepon}`} className="text-sm text-emerald-50 hover:underline">{profile.telepon}</a>
                        <button
                          onClick={() => copyToClipboard(profile.telepon!, 'telepon')}
                          className="mt-1 text-xs text-emerald-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          title="Copy nomor telepon"
                        >
                          {copied === 'telepon' ? (
                            <>
                              <Check className="w-3 h-3" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="text-sm">Telepon belum diatur</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <Mail className="w-5 h-5 text-emerald-100 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    {profile?.email ? (
                      <>
                        <a href={`mailto:${profile.email}`} className="text-sm text-emerald-50 hover:underline">{profile.email}</a>
                        <button
                          onClick={() => copyToClipboard(profile.email!, 'email')}
                          className="mt-1 text-xs text-emerald-200 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                          title="Copy email"
                        >
                          {copied === 'email' ? (
                            <>
                              <Check className="w-3 h-3" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="text-sm">Email belum diatur</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-sm font-semibold mb-2">Ikuti Kami</h4>
            <div className="flex items-center justify-center md:justify-end gap-3">
              <a
                href={profile?.youtube || 'https://www.youtube.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a2.993 2.993 0 00-2.106-2.12C19.584 3.5 12 3.5 12 3.5s-7.584 0-9.392.566A2.993 2.993 0 00.502 6.186C0 8.03 0 12 0 12s0 3.97.502 5.814a2.993 2.993 0 002.106 2.12C4.416 20.5 12 20.5 12 20.5s7.584 0 9.392-.566a2.993 2.993 0 002.106-2.12C24 15.97 24 12 24 12s0-3.97-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="hidden md:inline text-sm">YouTube</span>
              </a>

              <a
                href={profile?.instagram || 'https://www.instagram.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor" aria-hidden>
                  <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 3.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm4.75-3.75a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span className="hidden md:inline text-sm">Instagram</span>
              </a>
            </div>
            <p className="text-emerald-100 text-sm mt-4">&copy; {new Date().getFullYear()} {profile?.nama || 'Nama Sekolah Belum di Set'}. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
