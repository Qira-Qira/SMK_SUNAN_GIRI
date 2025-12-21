'use client';

import Navbar from '@/components/common/Navbar';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import {
  Bot,
  BarChart3,
  Pin,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Building2,
  FileText,
  Loader2
} from 'lucide-react';
import CountUp from '@/components/common/CountUp';

export default function AIRecommendationPage() {
  const [formData, setFormData] = useState({
    nilaiAkademik: 75,
    nilaiPeminatan: 75,
    nilaiBakat: 75,
    minatTeknologi: false,
    minatBisnis: false,
    minatDesain: false,
    minatKesehatan: false,
    minatOtomotif: false,
    kemampuanLogika: false,
    kemampuanKreativitas: false,
    kemampuanKomunikasi: false,
    kemampuanKepemimpinan: false,
    gajaBelajar: 'visual',
    citaCita: 'berwirausaha',
    preferensi: 'praktik',
    catatan: '',
  });

  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-recommendation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', data);
        toast.error('Gagal: ' + (data.error || 'Error tidak diketahui'));
        return;
      }

      if (data.recommendations) {
        setResults(data.recommendations);
      } else {
        toast.info('Tidak ada data rekomendasi yang diterima');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mendapatkan rekomendasi: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (results) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4 text-emerald-900">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 text-center text-emerald-900">Rekomendasi Jurusan Anda</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {results.map((result: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition border-t-4 border-lime-500">
                  <h3 className="text-2xl font-bold mb-3 text-emerald-900">{result.jurusan}</h3>
                  <div className="text-lime-600 font-bold text-3xl mb-4">
                    <CountUp end={result.score} suffix="%" />
                  </div>
                  <p className="text-emerald-700 text-sm mb-6 leading-relaxed">{result.alasan}</p>
                  <button
                    onClick={() => {
                      setResults(null);
                      setFormData({
                        nilaiAkademik: 75,
                        nilaiPeminatan: 75,
                        nilaiBakat: 75,
                        minatTeknologi: false,
                        minatBisnis: false,
                        minatDesain: false,
                        minatKesehatan: false,
                        minatOtomotif: false,
                        kemampuanLogika: false,
                        kemampuanKreativitas: false,
                        kemampuanKomunikasi: false,
                        kemampuanKepemimpinan: false,
                        gajaBelajar: 'visual',
                        citaCita: 'berwirausaha',
                        preferensi: 'praktik',
                        catatan: '',
                      });
                    }}
                    className="w-full bg-lime-500 hover:bg-lime-600 text-emerald-900 px-4 py-3 rounded-lg font-semibold transition duration-200"
                  >
                    Uji Lagi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
        {/* Header */}
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-4 flex justify-center">
            <Bot className="w-16 h-16 text-emerald-100" />
          </div>
          <h1 className="text-5xl font-bold mb-4">AI Saran Jurusan SMK</h1>
          <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
            Temukan jurusan yang cocok dengan minat, bakat, dan kemampuan Anda menggunakan teknologi kecerdasan buatan
          </p>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-3xl mx-auto bg-white text-emerald-900 rounded-lg shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Nilai Input Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-900">
                  <BarChart3 className="w-6 h-6 text-emerald-600" /> Formulir Analisis Jurusan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Nilai Akademik (0-100)</label>
                    <input
                      type="number"
                      name="nilaiAkademik"
                      min="0"
                      max="100"
                      value={formData.nilaiAkademik}
                      onChange={handleInputChange}
                      className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Nilai Peminatan (0-100)</label>
                    <input
                      type="number"
                      name="nilaiPeminatan"
                      min="0"
                      max="100"
                      value={formData.nilaiPeminatan}
                      onChange={handleInputChange}
                      className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-900 mb-3">Nilai Bakat (0-100)</label>
                    <input
                      type="number"
                      name="nilaiBakat"
                      min="0"
                      max="100"
                      value={formData.nilaiBakat}
                      onChange={handleInputChange}
                      className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                    />
                  </div>
                </div>
              </div>

              {/* Minat Section */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Pin className="w-5 h-5 text-emerald-600" /> Pilih Minat Anda (Boleh Lebih Dari Satu)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'minatTeknologi', label: 'Teknologi & IT' },
                    { key: 'minatBisnis', label: 'Bisnis & Akuntansi' },
                    { key: 'minatDesain', label: 'Desain Grafis' },
                    { key: 'minatKesehatan', label: 'Kesehatan' },
                    { key: 'minatOtomotif', label: 'Teknik Otomotif' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.key}
                        checked={(formData as any)[item.key]}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Kemampuan Section */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-emerald-600" /> Kemampuan Utama Anda
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  {[
                    { key: 'kemampuanLogika', label: 'Logika & Analisis' },
                    { key: 'kemampuanKreativitas', label: 'Kreativitas' },
                    { key: 'kemampuanKomunikasi', label: 'Komunikasi' },
                    { key: 'kemampuanKepemimpinan', label: 'Kepemimpinan' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.key}
                        checked={(formData as any)[item.key]}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gaya Belajar */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" /> Gaya Belajar Anda
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'visual', label: 'Visual (Belajar Lewat Gambar/Video)' },
                    { value: 'auditori', label: 'Auditori (Belajar Lewat Mendengar)' },
                    { value: 'kinestetik', label: 'Kinestetik (Belajar Lewat Praktik)' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gajaBelajar"
                        value={opt.value}
                        checked={formData.gajaBelajar === opt.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cita-cita Karier */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" /> Cita-Cita Karier
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'berwirausaha', label: 'Berwirausaha' },
                    { value: 'pegawainegeri', label: 'Pegawai Negeri/BUMN' },
                    { value: 'swasta', label: 'Pekerja Swasta' },
                    { value: 'lanjutkuliah', label: 'Lanjut Kuliah' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="citaCita"
                        value={opt.value}
                        checked={formData.citaCita === opt.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferensi Kerja */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" /> Preferensi Jenis Pekerjaan
                </h3>
                <div className="space-y-2">
                  {[
                    { value: 'praktik', label: 'Praktik Langsung (Hands-on)' },
                    { value: 'teori', label: 'Teori & Riset' },
                    { value: 'campuran', label: 'Campuran' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferensi"
                        value={opt.value}
                        checked={formData.preferensi === opt.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> Catatan Tambahan
                </h3>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  placeholder="Tulis catatan atau informasi tambahan lainnya..."
                  rows={4}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-lime-500 text-emerald-900 py-3 rounded font-bold hover:bg-lime-600 disabled:bg-emerald-400 transition duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Memproses...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" /> Lihat Rekomendasi Jurusan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
