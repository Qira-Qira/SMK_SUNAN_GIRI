'use client';

import Navbar from '@/components/common/Navbar';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function TracerStudyPage() {
  const [formData, setFormData] = useState({
    tahunLulus: new Date().getFullYear(),
    jurusanId: '',
    status: '',
    namaPerusahaan: '',
    jabatan: '',
    gaji: '',
    relevansi: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/tracer-study/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-emerald-900">Tracer Study Alumni</h1>

          {success && (
            <div className="bg-lime-50 text-lime-900 p-4 rounded-lg mb-6 border border-lime-200 font-medium flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Data tracer study berhasil disimpan
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border border-emerald-200 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Tahun Lulus</label>
                <input
                  type="number"
                  name="tahunLulus"
                  value={formData.tahunLulus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Jurusan</label>
                <select
                  name="jurusanId"
                  value={formData.jurusanId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                  required
                >
                  <option value="">-- Pilih --</option>
                  <option value="1">Teknik Informatika</option>
                  <option value="2">Akuntansi</option>
                  <option value="3">Desain Grafis</option>
                  <option value="4">Teknik Otomotif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-3">Status Saat Ini</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                required
              >
                <option>-- Pilih --</option>
                <option>Bekerja</option>
                <option>Kuliah</option>
                <option>Wirausaha</option>
                <option>Mencari Kerja</option>
              </select>
            </div>

            {formData.status === 'Bekerja' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Nama Perusahaan</label>
                  <input
                    type="text"
                    name="namaPerusahaan"
                    value={formData.namaPerusahaan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Jabatan</label>
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Gaji (Opsional)</label>
                    <input
                      type="number"
                      name="gaji"
                      value={formData.gaji}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Relevansi Jurusan</label>
                  <select
                    name="relevansi"
                    value={formData.relevansi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                  >
                    <option>-- Pilih --</option>
                    <option>Relevan</option>
                    <option>Tidak Relevan</option>
                    <option>Sangat Relevan</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-500 text-emerald-900 py-3 rounded-lg hover:bg-lime-600 disabled:bg-emerald-400 font-bold transition duration-200"
            >
              {isLoading ? 'Simpan...' : 'Simpan Data'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
