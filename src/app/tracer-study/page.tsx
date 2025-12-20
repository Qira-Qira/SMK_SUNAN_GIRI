'use client';

import Navbar from '@/components/common/Navbar';
import { useState } from 'react';

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
          <h1 className="text-3xl font-bold mb-8">Tracer Study Alumni</h1>

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              Data tracer study berhasil disimpan
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tahun Lulus</label>
                <input
                  type="number"
                  name="tahunLulus"
                  value={formData.tahunLulus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Jurusan</label>
                <select
                  name="jurusanId"
                  value={formData.jurusanId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option>-- Pilih --</option>
                  <option value="1">Teknik Informatika</option>
                  <option value="2">Akuntansi</option>
                  <option value="3">Desain Grafis</option>
                  <option value="4">Teknik Otomotif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status Saat Ini</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
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
                  <label className="block text-sm font-medium mb-2">Nama Perusahaan</label>
                  <input
                    type="text"
                    name="namaPerusahaan"
                    value={formData.namaPerusahaan}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Jabatan</label>
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Gaji (Opsional)</label>
                    <input
                      type="number"
                      name="gaji"
                      value={formData.gaji}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Relevansi Jurusan</label>
                  <select
                    name="relevansi"
                    value={formData.relevansi}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
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
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold"
            >
              {isLoading ? 'Simpan...' : 'Simpan Data'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
