'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

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

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          SMK Sunan Giri
        </Link>

        <div className="flex gap-4">
          <Link href="/" className="hover:underline">
            Beranda
          </Link>
          <Link href="/ai-recommendation" className="hover:underline">
            AI Jurusan
          </Link>
          <Link href="/ppdb" className="hover:underline">
            PPDB
          </Link>
          <Link href="/bkk" className="hover:underline">
            BKK
          </Link>

          {!isLoading && (
            <>
              {user ? (
                <>
                  <span className="text-sm">{user.fullName}</span>
                  {user.role.includes('ADMIN') && (
                    <Link href="/admin" className="hover:underline">
                      Admin
                    </Link>
                  )}
                  {user.role === 'ALUMNI' && (
                    <Link href="/tracer-study" className="hover:underline">
                      Tracer Study
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                  <Link href="/register" className="hover:underline">
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
