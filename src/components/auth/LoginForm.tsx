'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }

      const data = await res.json();
      
      // Redirect based on user role
      if (data.user?.role === 'ADMIN_UTAMA' || data.user?.role === 'ADMIN_PPDB' || data.user?.role === 'ADMIN_BKK') {
        router.push('/admin');
      } else {
        router.push('/ppdb');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg border border-emerald-200">
      <h2 className="text-3xl font-bold mb-6 text-emerald-900">Login</h2>

      {error && <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-4 border border-red-200 font-medium">{error}</div>}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-emerald-900 mb-3">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
          placeholder="Masukkan username"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-emerald-900 mb-3">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
          placeholder="Masukkan password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-lime-500 hover:bg-lime-600 text-emerald-900 py-3 rounded-lg font-semibold transition duration-200 disabled:bg-emerald-400 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" /> Sedang Memproses...
          </>
        ) : (
          'Login'
        )}
      </button>

      <div className="mt-6 text-center">
        <p className="text-emerald-700 font-medium">
          Tidak punya akun?{' '}
          <a href="/register" className="text-lime-600 hover:text-lime-700 font-bold hover:underline">
            Daftar di sini
          </a>
        </p>
      </div>
    </form>
  );
}
