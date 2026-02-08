'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="container mx-auto flex justify-between items-center px-2 sm:px-3 md:px-4">
        <Link href="/" className={`font-bold transition duration-300 ${linkHoverClass} flex items-center gap-1 sm:gap-2 flex-1 min-w-0`}>
          {schoolProfile?.logo && (
            <img 
              src={schoolProfile.logo} 
              alt="Logo" 
              className="h-7 sm:h-8 md:h-10 w-auto object-contain flex-shrink-0"
            />
          )}
          {/* Show full name for all screen sizes with proper truncation */}
          <span className="text-xs sm:text-sm md:text-base font-semibold truncate line-clamp-1">
            {schoolProfile?.nama || 'SMK'}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
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
                  {user.role === 'PERUSAHAAN' && (
                    <Link href="/company/dashboard" className={`transition duration-200 ${linkHoverClass}`}>
                      Dashboard Perusahaan
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
                  <Link href="/login" className="bg-lime-500 hover:bg-lime-600 px-4 py-1 rounded font-bold transition duration-200 text-emerald-900">
                    Login
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden transition-all duration-300 max-h-96 overflow-y-auto ${scrolled ? 'bg-white/80' : 'bg-emerald-600'}`}>
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`transition duration-200 ${linkHoverClass} font-medium text-sm sm:text-base py-2`}
            >
              Beranda
            </Link>
            <Link 
              href="/ai-recommendation" 
              onClick={() => setMobileMenuOpen(false)}
              className={`transition duration-200 ${linkHoverClass} font-medium text-sm sm:text-base py-2`}
            >
              AI Jurusan
            </Link>
            <Link 
              href="/ppdb" 
              onClick={() => setMobileMenuOpen(false)}
              className={`transition duration-200 ${linkHoverClass} font-medium text-sm sm:text-base py-2`}
            >
              PPDB
            </Link>
            <Link 
              href="/bkk" 
              onClick={() => setMobileMenuOpen(false)}
              className={`transition duration-200 ${linkHoverClass} font-medium text-sm sm:text-base py-2`}
            >
              BKK
            </Link>

            <div className={`border-t ${scrolled ? 'border-emerald-300' : 'border-emerald-500'} pt-2 sm:pt-3 mt-2`}>
              {isLoading ? (
                <div className="flex items-center py-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                </div>
              ) : (
                <>
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <span className={`text-xs sm:text-sm font-semibold py-1 ${scrolled ? 'text-emerald-900' : 'text-emerald-50'}`}>
                        {user.fullName}
                      </span>
                      {user.role.includes('ADMIN') && (
                        <Link 
                          href="/admin" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`transition duration-200 ${linkHoverClass} font-medium text-sm py-2`}
                        >
                          Admin
                        </Link>
                      )}
                      {user.role === 'PERUSAHAAN' && (
                        <Link 
                          href="/company/dashboard" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`transition duration-200 ${linkHoverClass} font-medium text-sm py-2`}
                        >
                          Dashboard Perusahaan
                        </Link>
                      )}
                      {user.role === 'ALUMNI' && (
                        <Link 
                          href="/tracer-study" 
                          onClick={() => setMobileMenuOpen(false)}
                          className={`transition duration-200 ${linkHoverClass} font-medium text-sm py-2`}
                        >
                          Tracer Study
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-medium transition duration-200 text-left text-sm w-full"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded font-bold transition duration-200 text-emerald-900 block text-center text-sm"
                    >
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
