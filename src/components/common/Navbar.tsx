'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSchoolProfile();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSchoolProfile = async () => {
    try {
      const res = await fetch('/api/public/school-profile');
      if (res.ok) {
        const data = await res.json();
        setSchoolProfile(data.profile || null);
      }
    } catch (error) {
      console.error('Failed to fetch school profile:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  // Dynamic classes based on scroll state
  const navClasses = scrolled
    ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20 text-emerald-900 py-3'
    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 shadow-lg';

  const linkHoverClass = scrolled
    ? 'hover:text-emerald-600'
    : 'hover:text-emerald-50';

  return (
    <nav className={`sticky w-full z-50 top-0 transition-all duration-300 ${navClasses}`}>
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className={`font-bold text-xl transition duration-300 ${linkHoverClass} flex items-center gap-2`}>
          {schoolProfile?.logo && (
            <img 
              src={schoolProfile.logo} 
              alt="Logo" 
              className="h-10 w-10 object-contain"
            />
          )}
          <span>{schoolProfile?.nama || 'Nama Sekolah Belum di Set'}</span>
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/" className={`transition duration-200 ${linkHoverClass}`}>
            Beranda
          </Link>
          <Link href="/ai-recommendation" className={`transition duration-200 ${linkHoverClass}`}>
            AI Jurusan
          </Link>
          <Link href="/ppdb" className={`transition duration-200 ${linkHoverClass}`}>
            PPDB
          </Link>
          <Link href="/bkk" className={`transition duration-200 ${linkHoverClass}`}>
            BKK
          </Link>

          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin w-5 h-5 text-white" />
            </div>
          ) : (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${scrolled ? 'text-emerald-900' : 'text-emerald-50'}`}>{user.fullName}</span>
                  {user.role.includes('ADMIN') && (
                    <Link href="/admin" className={`transition duration-200 ${linkHoverClass}`}>
                      Admin
                    </Link>
                  )}
                  {user.role === 'ALUMNI' && (
                    <Link href="/tracer-study" className={`transition duration-200 ${linkHoverClass}`}>
                      Tracer Study
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className={`transition duration-200 ${linkHoverClass}`}>
                    Login
                  </Link>
                  <Link href="/register" className="bg-lime-500 hover:bg-lime-600 px-4 py-1 rounded font-medium transition duration-200 text-emerald-900">
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
