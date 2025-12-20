'use client';

import Navbar from '@/components/common/Navbar';
import { useState } from 'react';

interface UploadedFile {
  name: string;
  size: number;
}

export default function PPDBPage() {
  const [formData, setFormData] = useState({
    nisn: '',
    nik: '',
    fullName: '',
    birthDate: '',
    birthPlace: '',
    parentName: '',
    parentPhone: '',
    parentAddress: '',
    previousSchool: '',
    averageScore: '',
    majorChoice1: '',
    majorChoice2: '',
    majorChoice3: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: UploadedFile}>({
    kkFile: { name: '', size: 0 },
    aktaFile: { name: '', size: 0 },
    raportFile: { name: '', size: 0 },
    ijazahFile: { name: '', size: 0 },
    fotoCalonFile: { name: '', size: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (maksimal 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${fieldName} terlalu besar (maksimal 5MB)`);
        return;
      }

      // Validasi format file
      const allowedFormats = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedFormats.includes(file.type)) {
        setError(`Format file ${fieldName} tidak didukung (PDF, JPG, PNG saja)`);
        return;
      }

      setUploadedFiles({
        ...uploadedFiles,
        [fieldName]: {
          name: file.name,
          size: file.size,
        },
      });
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validasi dokumen wajib
      if (!uploadedFiles.kkFile.name) {
        setError('Kartu Keluarga harus diunggah');
        setIsLoading(false);
        return;
      }

      // Buat FormData untuk mengirim file dan form data
      const formDataToSend = new FormData();
      
      // Tambah form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });

      // Tambah file references (dalam aplikasi real, file benar-benar di-upload ke storage)
      Object.entries(uploadedFiles).forEach(([key, value]) => {
        if (value.name) {
          formDataToSend.append(key, value.name);
        }
      });

      const res = await fetch('/api/ppdb/register', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Pendaftaran gagal');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setSuccess(data);
      setFormData({
        nisn: '',
        nik: '',
        fullName: '',
        birthDate: '',
        birthPlace: '',
        parentName: '',
        parentPhone: '',
        parentAddress: '',
        previousSchool: '',
        averageScore: '',
        majorChoice1: '',
        majorChoice2: '',
        majorChoice3: '',
      });
      setUploadedFiles({
        kkFile: { name: '', size: 0 },
        aktaFile: { name: '', size: 0 },
        raportFile: { name: '', size: 0 },
        ijazahFile: { name: '', size: 0 },
        fotoCalonFile: { name: '', size: 0 },
      });
    } catch (error) {
      setError('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 p-8 rounded">
            <h2 className="text-2xl font-bold text-green-700 mb-4">✓ Pendaftaran Berhasil</h2>
            <p className="mb-4">Terima kasih telah mendaftar di PPDB SMK Sunan Giri</p>
            <div className="bg-white p-4 rounded mb-4">
              <p className="mb-2">
                <strong>Nomor Pendaftaran:</strong> {success.registrationNumber}
              </p>
              <p className="mb-2">
                <strong>Status:</strong> {success.status}
              </p>
              <p>
                <strong>Waktu Pendaftaran:</strong>{' '}
                {new Date(success.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Anda akan menerima notifikasi tentang status verifikasi melalui email terdaftar.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
          <h1 className="text-3xl font-bold mb-2">PPDB Online SMK Sunan Giri</h1>
          <p className="text-gray-600 mb-8">Silakan isi data pribadi dan upload dokumen yang diperlukan</p>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Biodata Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Biodata Calon Siswa</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">NISN *</label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">NIK *</label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Lahir *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tempat Lahir *</label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent Info Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Data Orang Tua/Wali</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nama Orang Tua/Wali *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">No. Telepon Orang Tua *</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Asal Sekolah *</label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Alamat Orang Tua *</label>
                <input
                  type="text"
                  name="parentAddress"
                  value={formData.parentAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* Academic Section */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-bold mb-4">Informasi Akademik</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rata-Rata Nilai Rapor (0-100) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="averageScore"
                  value={formData.averageScore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-4">Pilihan Program Keahlian (Jurusan)</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Pilihan 1 (Wajib) *</label>
                  <select
                    name="majorChoice1"
                    value={formData.majorChoice1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Akuntansi">Akuntansi</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                    <option value="Teknik Otomotif">Teknik Otomotif</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pilihan 2</label>
                    <select
                      name="majorChoice2"
                      value={formData.majorChoice2}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Akuntansi">Akuntansi</option>
                      <option value="Desain Grafis">Desain Grafis</option>
                      <option value="Teknik Otomotif">Teknik Otomotif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Pilihan 3</label>
                    <select
                      name="majorChoice3"
                      value={formData.majorChoice3}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Akuntansi">Akuntansi</option>
                      <option value="Desain Grafis">Desain Grafis</option>
                      <option value="Teknik Otomotif">Teknik Otomotif</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Upload Dokumen</h2>
              <p className="text-sm text-gray-600 mb-4">Format: PDF, JPG, PNG | Maksimal ukuran: 5MB per file</p>
              
              <div className="space-y-4">
                {/* Kartu Keluarga */}
                <div className="border-2 border-dashed rounded p-4">
                  <label className="block text-sm font-medium mb-2">
                    Kartu Keluarga (KK) * <span className="text-red-500">Wajib</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'kkFile')}
                    className="w-full"
                  />
                  {uploadedFiles.kkFile.name && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.kkFile.name}</p>
                  )}
                </div>

                {/* Akta Kelahiran */}
                <div className="border-2 border-dashed rounded p-4">
                  <label className="block text-sm font-medium mb-2">Akta Kelahiran</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'aktaFile')}
                    className="w-full"
                  />
                  {uploadedFiles.aktaFile.name && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.aktaFile.name}</p>
                  )}
                </div>

                {/* Raport */}
                <div className="border-2 border-dashed rounded p-4">
                  <label className="block text-sm font-medium mb-2">Raport Terbaru (Semester Terakhir)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'raportFile')}
                    className="w-full"
                  />
                  {uploadedFiles.raportFile.name && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.raportFile.name}</p>
                  )}
                </div>

                {/* Ijazah */}
                <div className="border-2 border-dashed rounded p-4">
                  <label className="block text-sm font-medium mb-2">Ijazah</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'ijazahFile')}
                    className="w-full"
                  />
                  {uploadedFiles.ijazahFile.name && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.ijazahFile.name}</p>
                  )}
                </div>

                {/* Foto Calon Siswa */}
                <div className="border-2 border-dashed rounded p-4">
                  <label className="block text-sm font-medium mb-2">Foto Calon Siswa (3x4 atau 4x6)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'fotoCalonFile')}
                    className="w-full"
                  />
                  {uploadedFiles.fotoCalonFile.name && (
                    <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.fotoCalonFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 font-bold text-lg transition"
            >
              {isLoading ? 'Sedang Memproses...' : '✓ Daftar PPDB'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
