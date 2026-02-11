'use client';

import Navbar from '@/components/common/Navbar';
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['Bekerja', 'Kuliah', 'Wirausaha', 'Mencari Kerja'];
const RELEVANSI_OPTIONS = ['Sangat Relevan', 'Relevan', 'Tidak Relevan'];

export default function TracerStudyPage() {
  const router = useRouter();
  
  // Auth & User
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Jurusan
  const [jurusan, setJurusan] = useState<any[]>([]);
  
  // Form
  const [formData, setFormData] = useState({
    tahunLulus: new Date().getFullYear(),
    jurusanId: '',
    status: '',
    namaPerusahaan: '',
    jabatan: '',
    gaji: '',
    relevansi: '',
    namaInstitusi: '', // Untuk Kuliah
    namaUsaha: '', // Untuk Wirausaha
  });
  
  // UI States
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Alumni Stories
  const [alumniStories, setAlumniStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  // Testimonial
  const [testimonialData, setTestimonialData] = useState({
    testimoni: '',
    rating: 5,
  });
  const [isLoadingTestimonial, setIsLoadingTestimonial] = useState(false);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [testimonialError, setTestimonialError] = useState('');
  const [existingTestimonial, setExistingTestimonial] = useState<any>(null);

  // Fetch current user and verify role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          
          if (data.user?.role !== 'ALUMNI') {
            router.push('/login');
            return;
          }
          
          setCurrentUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  // Fetch jurusan
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await fetch('/api/public/jurusan', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setJurusan(data.jurusan || []);
        }
      } catch (error) {
        console.error('Error fetching jurusan:', error);
      }
    };

    fetchJurusan();
  }, []);

  // Fetch alumni stories
  useEffect(() => {
    const fetchAlumniStories = async () => {
      setIsLoadingStories(true);
      try {
        // Add cache-busting parameter
        const res = await fetch(`/api/tracer-study/alumni-stories?limit=3&t=${Date.now()}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          console.log('Initial alumni stories loaded:', data);
          setAlumniStories(data.alumniStories || []);
        }
      } catch (error) {
        console.error('Error fetching alumni stories:', error);
      } finally {
        setIsLoadingStories(false);
      }
    };

    fetchAlumniStories();
  }, []);

  // Fetch existing testimonial for current user
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchExistingTestimonial = async () => {
      setIsLoadingTestimonial(true);
      try {
        const res = await fetch(`/api/public/testimonials?userId=${currentUser.id}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const userTestimonial = data.testimonials?.find((t: any) => t.userId === currentUser.id);
          if (userTestimonial) {
            setExistingTestimonial(userTestimonial);
            setTestimonialData({
              testimoni: userTestimonial.testimoni || userTestimonial.isi || '',
              rating: userTestimonial.rating || 5,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching testimonial:', error);
      } finally {
        setIsLoadingTestimonial(false);
      }
    };

    fetchExistingTestimonial();
  }, [currentUser?.id]);

  // Fetch existing tracer study data
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchTracerStudyData = async () => {
      setIsLoadingData(true);
      setError('');
      
      try {
        const res = await fetch('/api/tracer-study/update', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          
          if (data) {
            setFormData({
              tahunLulus: data.tahunLulus || new Date().getFullYear(),
              jurusanId: data.jurusanId || '',
              status: data.status || '',
              namaPerusahaan: data.namaPerusahaan || '',
              jabatan: data.jabatan || '',
              gaji: data.gaji?.toString() || '',
              relevansi: data.relevansi || '',
              namaInstitusi: data.namaInstitusi || '',
              namaUsaha: data.namaUsaha || '',
            });
          }
        } else if (res.status === 404) {
          // No data yet, keep default values
        } else {
          setError('Gagal mengambil data tracer study');
        }
      } catch (error) {
        console.error('Error fetching tracer study data:', error);
        setError('Terjadi kesalahan saat mengambil data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTracerStudyData();
  }, [currentUser?.id]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.tahunLulus) errors.tahunLulus = 'Tahun lulus wajib diisi';
    if (!formData.jurusanId) errors.jurusanId = 'Jurusan wajib dipilih';
    if (!formData.status) errors.status = 'Status saat ini wajib dipilih';

    if (formData.status === 'Bekerja') {
      if (!formData.namaPerusahaan?.trim()) {
        errors.namaPerusahaan = 'Nama perusahaan wajib diisi';
      }
      if (!formData.jabatan?.trim()) {
        errors.jabatan = 'Jabatan wajib diisi';
      }
      if (!formData.relevansi) {
        errors.relevansi = 'Relevansi jurusan wajib dipilih';
      }
    } else if (formData.status === 'Kuliah') {
      if (!formData.namaInstitusi?.trim()) {
        errors.namaInstitusi = 'Nama institusi pendidikan wajib diisi';
      }
    } else if (formData.status === 'Wirausaha') {
      if (!formData.namaUsaha?.trim()) {
        errors.namaUsaha = 'Nama usaha wajib diisi';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear irrelevant fields based on status
    if (name === 'status') {
      setFormData(prev => {
        const newData = { ...prev };
        if (value === 'Bekerja') {
          // Keep work fields, clear others
          newData.namaInstitusi = '';
          newData.namaUsaha = '';
        } else if (value === 'Kuliah') {
          // Clear work fields, keep institusi
          newData.namaPerusahaan = '';
          newData.jabatan = '';
          newData.gaji = '';
          newData.relevansi = '';
          newData.namaUsaha = '';
        } else if (value === 'Wirausaha') {
          // Clear work fields, keep usaha
          newData.namaPerusahaan = '';
          newData.jabatan = '';
          newData.gaji = '';
          newData.relevansi = '';
          newData.namaInstitusi = '';
        } else {
          // Mencari Kerja - clear everything
          newData.namaPerusahaan = '';
          newData.jabatan = '';
          newData.gaji = '';
          newData.relevansi = '';
          newData.namaInstitusi = '';
          newData.namaUsaha = '';
        }
        return newData;
      });
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setError('Mohon periksa kembali data yang Anda isi');
      return;
    }

    if (!testimonialData.testimoni.trim()) {
      setError('Testimoni tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build submit data based on status
      const submitData: any = {
        tahunLulus: formData.tahunLulus,
        jurusanId: formData.jurusanId,
        status: formData.status,
      };

      if (formData.status === 'Bekerja') {
        submitData.namaPerusahaan = formData.namaPerusahaan;
        submitData.jabatan = formData.jabatan;
        submitData.gaji = formData.gaji ? parseInt(formData.gaji) : null;
        submitData.relevansi = formData.relevansi;
      } else if (formData.status === 'Kuliah') {
        submitData.namaInstitusi = formData.namaInstitusi;
      } else if (formData.status === 'Wirausaha') {
        submitData.namaUsaha = formData.namaUsaha;
      }

      // Submit tracer study data
      const res = await fetch('/api/tracer-study/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        // Submit testimonial data after successful tracer study update
        const method = existingTestimonial ? 'PUT' : 'POST';
        const testimonialUrl = existingTestimonial 
          ? `/api/public/testimonials?id=${existingTestimonial.id}`
          : '/api/public/testimonials';

        const testimonialRes = await fetch(testimonialUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            isi: testimonialData.testimoni,
            rating: testimonialData.rating,
          }),
        });

        if (testimonialRes.ok) {
          const data = await testimonialRes.json();
          setExistingTestimonial(data.testimonial || data);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 5000);
          
          // Add a small delay to ensure database update is committed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Refresh alumni stories after successful update
          try {
            const storiesRes = await fetch(`/api/tracer-study/alumni-stories?limit=6&t=${Date.now()}`, {
              credentials: 'include',
            });
            if (storiesRes.ok) {
              const storiesData = await storiesRes.json();
              console.log('Alumni stories refreshed:', storiesData);
              setAlumniStories(storiesData.alumniStories || []);
            } else {
              console.error('Failed to fetch alumni stories:', storiesRes.status);
            }
          } catch (error) {
            console.error('Error refreshing alumni stories:', error);
          }
        } else {
          const data = await testimonialRes.json();
          setError(data.error || 'Gagal menyimpan testimoni');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan data tracer study');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestimonialChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTestimonialData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestimonialError('');
    setTestimonialSuccess(false);

    if (!testimonialData.testimoni.trim()) {
      setTestimonialError('Testimoni tidak boleh kosong');
      return;
    }

    setIsSubmittingTestimonial(true);

    try {
      const method = existingTestimonial ? 'PUT' : 'POST';
      const url = existingTestimonial 
        ? `/api/public/testimonials?id=${existingTestimonial.id}`
        : '/api/public/testimonials';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isi: testimonialData.testimoni,
          rating: testimonialData.rating,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExistingTestimonial(data.testimonial || data);
        setTestimonialSuccess(true);
        setTimeout(() => setTestimonialSuccess(false), 5000);
      } else {
        const data = await res.json();
        setTestimonialError(data.error || 'Gagal menyimpan testimoni');
      }
    } catch (error) {
      console.error('Error:', error);
      setTestimonialError('Terjadi kesalahan saat menyimpan testimoni');
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  if (isAuthLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-emerald-600 text-lg flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'ALUMNI') {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
      'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
      'bg-gradient-to-br from-pink-400 to-pink-600 text-white',
      'bg-gradient-to-br from-green-400 to-green-600 text-white',
      'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
      'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-emerald-900">Tracer Study Alumni</h1>
            <p className="text-emerald-600 mt-2">Halo, <span className="font-semibold">{currentUser?.fullName}</span></p>
          </div>

          {success && (
            <div className="bg-lime-50 text-lime-900 p-4 rounded-lg mb-6 border border-lime-200 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" /> Data tracer study Anda berhasil disimpan
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-6 border border-red-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg border border-emerald-200 space-y-6">
            {/* Tahun Lulus & Jurusan */}
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h3 className="text-sm font-bold text-emerald-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
                Informasi Dasar
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Tahun Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tahunLulus"
                    value={formData.tahunLulus}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 ${
                      validationErrors.tahunLulus ? 'border-red-300' : 'border-emerald-300'
                    }`}
                    min="1990"
                    max={new Date().getFullYear()}
                  />
                  {validationErrors.tahunLulus && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.tahunLulus}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">
                    Jurusan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="jurusanId"
                    value={formData.jurusanId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-emerald-900 ${
                      validationErrors.jurusanId ? 'border-red-300' : 'border-emerald-300'
                    }`}
                  >
                    <option value="">-- Pilih Jurusan --</option>
                    {jurusan.map((j: any) => (
                      <option key={j.id} value={j.id}>
                        {j.nama}
                      </option>
                    ))}
                  </select>
                  {validationErrors.jurusanId && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.jurusanId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Saat Ini */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Status Saat Ini <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 ${
                  validationErrors.status ? 'border-red-300' : 'border-blue-300'
                }`}
              >
                <option value="">-- Pilih Status --</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {validationErrors.status && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.status}</p>
              )}
            </div>

            {/* Conditional: Status-specific Section */}
            {formData.status === 'Bekerja' && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4">
                <h3 className="text-sm font-bold text-purple-900 flex items-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Informasi Pekerjaan
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaPerusahaan"
                    value={formData.namaPerusahaan}
                    onChange={handleChange}
                    placeholder="Contoh: PT Teknologi Indonesia"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900 placeholder-purple-500 ${
                      validationErrors.namaPerusahaan ? 'border-red-300' : 'border-purple-300'
                    }`}
                  />
                  {validationErrors.namaPerusahaan && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.namaPerusahaan}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-purple-900 mb-2">
                      Jabatan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder="Contoh: Software Engineer"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900 placeholder-purple-500 ${
                        validationErrors.jabatan ? 'border-red-300' : 'border-purple-300'
                      }`}
                    />
                    {validationErrors.jabatan && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.jabatan}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-purple-900 mb-2">Gaji (Opsional)</label>
                    <input
                      type="number"
                      name="gaji"
                      value={formData.gaji}
                      onChange={handleChange}
                      placeholder="Contoh: 5000000"
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900 placeholder-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-900 mb-2">
                    Relevansi Jurusan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relevansi"
                    value={formData.relevansi}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900 ${
                      validationErrors.relevansi ? 'border-red-300' : 'border-purple-300'
                    }`}
                  >
                    <option value="">-- Pilih Relevansi --</option>
                    {RELEVANSI_OPTIONS.map(rel => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                  {validationErrors.relevansi && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.relevansi}</p>
                  )}
                </div>
              </div>
            )}

            {formData.status === 'Kuliah' && (
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-300 space-y-4">
                <h3 className="text-sm font-bold text-blue-900 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Informasi Pendidikan
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Universitas / Institusi Pendidikan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaInstitusi"
                    value={formData.namaInstitusi}
                    onChange={handleChange}
                    placeholder="Contoh: Universitas Indonesia, ITB"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900 placeholder-blue-500 ${
                      validationErrors.namaInstitusi ? 'border-red-300' : 'border-blue-300'
                    }`}
                  />
                  {validationErrors.namaInstitusi && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.namaInstitusi}</p>
                  )}
                </div>
              </div>
            )}

            {formData.status === 'Wirausaha' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-300 space-y-4">
                <h3 className="text-sm font-bold text-amber-900 flex items-center">
                  <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                  Informasi Usaha
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-2">
                    Nama Usaha / Bisnis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="namaUsaha"
                    value={formData.namaUsaha}
                    onChange={handleChange}
                    placeholder="Contoh: Toko Online Fashion, Warung Makan"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-500 ${
                      validationErrors.namaUsaha ? 'border-red-300' : 'border-amber-300'
                    }`}
                  />
                  {validationErrors.namaUsaha && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.namaUsaha}</p>
                  )}
                </div>
              </div>
            )}

            {/* Testimoni Section */}
            <div className="bg-lime-50 p-4 rounded-lg border border-lime-200 space-y-4">
              <h3 className="text-sm font-bold text-lime-900 flex items-center">
                <span className="w-2 h-2 bg-lime-600 rounded-full mr-2"></span>
                Bagikan Testimonimu <span className="text-red-500">*</span>
              </h3>

              {/* Testimoni Text */}
              <div>
                <label className="block text-sm font-semibold text-lime-900 mb-2">
                  Testimoni <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="testimoni"
                  value={testimonialData.testimoni}
                  onChange={handleTestimonialChange}
                  placeholder="Bagikan pengalaman Anda tentang sekolah ini..."
                  rows={4}
                  className="w-full px-4 py-3 border border-lime-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-emerald-900 placeholder-emerald-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-lime-900 mb-2">Rating</label>
                <select
                  name="rating"
                  value={testimonialData.rating}
                  onChange={handleTestimonialChange}
                  className="w-full px-4 py-2 border border-lime-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 text-emerald-900"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {'⭐'.repeat(num)} {num} Bintang
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-lime-500 text-emerald-900 py-3 rounded-lg hover:bg-lime-600 disabled:bg-emerald-400 disabled:cursor-not-allowed font-bold transition duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Simpan Data & Testimoni
                </>
              ) : (
                'Simpan Data & Testimoni'
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
