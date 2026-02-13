'use client';

import Navbar from '@/components/common/Navbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Upload, Loader2 } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  file?: File;
}

interface Jurusan {
  id: string;
  nama: string;
  kode: string;
}

export default function PPDBPage() {
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [jurusanLoading, setJurusanLoading] = useState(true);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
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

  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: UploadedFile }>({
    kkFile: { name: '', size: 0 },
    aktaFile: { name: '', size: 0 },
    raportFile: { name: '', size: 0 },
    ijazahFile: { name: '', size: 0 },
    fotoCalonFile: { name: '', size: 0 },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState('');

  // Fetch jurusan dari API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!res.ok || res.status === 401) {
          // User belum login, redirect ke login
          router.push('/login?redirect=/ppdb');
          return;
        }

        const data = await res.json();
        if (data.user) {
          setIsAuthorized(true);
        } else {
          router.push('/login?redirect=/ppdb');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login?redirect=/ppdb');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch jurusan dari API
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchJurusan = async () => {
      try {
        const res = await fetch('/api/public/jurusan');
        if (res.ok) {
          const data = await res.json();
          setJurusanList(data.jurusan || []);
        }
      } catch (error) {
        console.error('Error fetching jurusan:', error);
      } finally {
        setJurusanLoading(false);
      }
    };

    fetchJurusan();
  }, [isAuthorized]);

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
          file: file, // Simpan file object
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

      // Upload semua file terlebih dahulu
      const uploadedUrls: { [key: string]: string } = {};

      for (const [fieldName, fileData] of Object.entries(uploadedFiles)) {
        if (fileData.file) {
          try {
            const fileFormData = new FormData();
            fileFormData.append('file', fileData.file);
            
            const uploadRes = await fetch('/api/ppdb/upload', {
              method: 'POST',
              credentials: 'include',
              body: fileFormData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              uploadedUrls[fieldName] = uploadData.url;
            } else {
              setError(`Gagal upload file ${fieldName}`);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            setError(`Error saat upload file ${fieldName}`);
            setIsLoading(false);
            return;
          }
        }
      }

      // Buat FormData untuk mengirim form data + URL file
      const formDataToSend = new FormData();

      // Tambah form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });

      // Tambah URL file yang sudah terupload
      Object.entries(uploadedUrls).forEach(([key, url]) => {
        formDataToSend.append(key, url);
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
      console.error('Submit error:', error);
      setError('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4 text-emerald-900">
          <div className="max-w-2xl mx-auto bg-lime-50 border border-lime-300 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-lime-900 mb-4 flex items-center">
              <CheckCircle className="w-8 h-8 mr-3 text-lime-600" /> Pendaftaran Berhasil
            </h2>
            <p className="text-emerald-900 mb-4 font-medium">Terima kasih telah mendaftar di PPDB SMK Sunan Giri</p>
            <div className="bg-white p-4 rounded-lg mb-4 border border-lime-200">
              <p className="mb-2 text-emerald-900">
                <strong>Nomor Pendaftaran:</strong> {success.registrationNumber}
              </p>
              <p className="mb-2 text-emerald-900">
                <strong>Status:</strong> {success.status}
              </p>
              <p className="text-emerald-900">
                <strong>Waktu Pendaftaran:</strong>{' '}
                {new Date(success.createdAt).toLocaleDateString('id-ID')}
              </p>
            </div>
            <p className="text-sm text-emerald-700 font-medium">
              Anda akan menerima notifikasi tentang status verifikasi melalui email terdaftar.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (isCheckingAuth) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4 text-emerald-900">
          <div className="max-w-2xl mx-auto flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-emerald-600" />
            <span className="ml-3 text-lg font-semibold">Memverifikasi akun Anda...</span>
          </div>
        </main>
      </>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg border border-emerald-200">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-emerald-900">PPDB Online SMK Sunan Giri</h1>
          <p className="text-sm sm:text-base text-emerald-700 mb-6 sm:mb-8 font-medium">Silakan isi data pribadi dan upload dokumen yang diperlukan</p>

          {error && <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-6 border border-red-200 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Biodata Section */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold mb-6 text-emerald-900">Biodata Calon Siswa</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Nama Lengkap *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">NISN *</label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    placeholder="Masukkan NISN"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">NIK *</label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    placeholder="Masukkan NIK"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Tanggal Lahir *</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Tempat Lahir *</label>
                  <input
                    type="text"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    placeholder="Masukkan tempat lahir"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent Info Section */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold mb-6 text-emerald-900">Data Orang Tua/Wali</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Nama Orang Tua/Wali *</label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                  placeholder="Masukkan nama orang tua/wali"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">No. Telepon Orang Tua *</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    placeholder="Masukkan nomor telepon"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Asal Sekolah *</label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                    placeholder="Masukkan asal sekolah"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Alamat Orang Tua *</label>
                <input
                  type="text"
                  name="parentAddress"
                  value={formData.parentAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                  placeholder="Masukkan alamat orang tua"
                  required
                />
              </div>
            </div>

            {/* Academic Section */}
            <div className="border-b pb-8">
              <h2 className="text-2xl font-bold mb-6 text-emerald-900">Informasi Akademik</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-emerald-900 mb-3">Rata-Rata Nilai Rapor (0-100) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name="averageScore"
                  value={formData.averageScore}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                  placeholder="Masukkan rata-rata nilai"
                  required
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-6 text-emerald-900">Pilihan Program Keahlian (Jurusan)</h3>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Pilihan 1 (Wajib) *</label>
                  <select
                    name="majorChoice1"
                    value={formData.majorChoice1}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                    required
                    disabled={jurusanLoading}
                  >
                    <option value="">
                      {jurusanLoading ? 'Memuat jurusan...' : '-- Pilih Jurusan --'}
                    </option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.nama}>
                        {j.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Pilihan 2</label>
                    <select
                      name="majorChoice2"
                      value={formData.majorChoice2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                      disabled={jurusanLoading}
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.nama}>
                          {j.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Pilihan 3</label>
                    <select
                      name="majorChoice3"
                      value={formData.majorChoice3}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900"
                      disabled={jurusanLoading}
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.nama}>
                          {j.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-emerald-900">Upload Dokumen</h2>
              <p className="text-sm text-emerald-700 mb-6 font-medium">Format: PDF, JPG, PNG | Maksimal ukuran: 5MB per file</p>

              <div className="space-y-6">
                {/* Kartu Keluarga */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">
                    Kartu Keluarga (KK) * <span className="text-red-600 font-bold">Wajib</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'kkFile')}
                    className="w-full text-emerald-900"
                  />
                  {uploadedFiles.kkFile.name && (
                    <p className="text-sm text-emerald-700 mt-2 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {uploadedFiles.kkFile.name}
                    </p>
                  )}
                </div>

                {/* Akta Kelahiran */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Akta Kelahiran</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'aktaFile')}
                    className="w-full text-emerald-900"
                  />
                  {uploadedFiles.aktaFile.name && (
                    <p className="text-sm text-emerald-700 mt-2 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {uploadedFiles.aktaFile.name}
                    </p>
                  )}
                </div>

                {/* Raport */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Raport Terbaru (Semester Terakhir)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'raportFile')}
                    className="w-full text-emerald-900"
                  />
                  {uploadedFiles.raportFile.name && (
                    <p className="text-sm text-emerald-700 mt-2 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {uploadedFiles.raportFile.name}
                    </p>
                  )}
                </div>

                {/* Ijazah */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Ijazah</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'ijazahFile')}
                    className="w-full text-emerald-900"
                  />
                  {uploadedFiles.ijazahFile.name && (
                    <p className="text-sm text-emerald-700 mt-2 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {uploadedFiles.ijazahFile.name}
                    </p>
                  )}
                </div>

                {/* Foto Calon Siswa */}
                <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-emerald-900 mb-3">Foto Calon Siswa (3x4 atau 4x6)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'fotoCalonFile')}
                    className="w-full text-emerald-900"
                  />
                  {uploadedFiles.fotoCalonFile.name && (
                    <p className="text-sm text-emerald-700 mt-2 font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" /> {uploadedFiles.fotoCalonFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-500 hover:bg-lime-600 text-emerald-900 py-4 rounded-lg hover:shadow-lg font-bold text-lg transition duration-200 disabled:bg-emerald-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Sedang Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" /> Daftar PPDB
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
