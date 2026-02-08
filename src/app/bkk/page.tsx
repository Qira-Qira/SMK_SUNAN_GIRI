'use client';

import Navbar from '@/components/common/Navbar';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/toast';

type Tab = 'lowongan' | 'perusahaan';

export default function BKKPage() {
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('lowongan');
  const [query, setQuery] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState<string | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyQueryInput, setCompanyQueryInput] = useState('');
  const [companySelectedJurusan, setCompanySelectedJurusan] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const [applyFile, setApplyFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchInitial();
  }, []);

  // debounce query input -> query (reduces re-renders while typing)
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(queryInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [queryInput]);

  // debounce company query input -> companyQuery
  useEffect(() => {
    const t = setTimeout(() => {
      setCompanyQuery(companyQueryInput);
      setCompanyPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [companyQueryInput]);

  // fetch jobs from server when page / filters / query change
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(pageSize));
        if (selectedJurusan) params.set('jurusanId', String(selectedJurusan));
        if (selectedJobType) params.set('tipePekerjaan', String(selectedJobType));
        if (query.trim()) params.set('q', query.trim());

        const res = await fetch(`/api/bkk/job-postings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setJobPostings(data.jobPostings || []);
          setTotalJobs(data.total || 0);
        }
      } catch (err) {
        console.error('Fetch jobs error', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'lowongan') fetchJobs();
  }, [page, selectedJurusan, selectedJobType, query, activeTab]);

  // fetch companies from server when company filters change
  

  const fetchInitial = async () => {
    setIsLoading(true);
    try {
      const [jobsRes, jurusanRes] = await Promise.all([
        fetch('/api/bkk/job-postings'),
        fetch('/api/public/jurusan'),
      ]);

      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        // Normalize responses: API may return array or an object { data: [], total } or similar
        let jobArray: any[] = [];
        if (Array.isArray(jobs)) jobArray = jobs;
        else if (Array.isArray(jobs?.data)) jobArray = jobs.data;
        else if (Array.isArray(jobs?.jobPostings)) jobArray = jobs.jobPostings;
        else jobArray = [];
        setJobPostings(jobArray);
      }

      if (jurusanRes.ok) {
        const data = await jurusanRes.json();
        setJurusanList(data.jurusan || []);
      }
    } catch (err) {
      console.error('Error fetching initial BKK data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let list = Array.isArray(jobPostings) ? jobPostings : [];
    if (selectedJurusan) {
      list = list.filter((j) => String(j.jurusanId) === String(selectedJurusan));
    }
    if (selectedJobType) {
      list = list.filter((j) => j.tipePekerjaan === selectedJobType);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((j) => (j.posisi || '').toLowerCase().includes(q) || (j.perusahaan?.fullName || '').toLowerCase().includes(q));
    }
    return list;
  }, [jobPostings, selectedJurusan, selectedJobType, query]);

  const companies = useMemo(() => {
    const map = new Map<string, any>();
    const jobs = Array.isArray(jobPostings) ? jobPostings : [];
    jobs.forEach((j) => {
      const c = j.perusahaan;
      if (c && !map.has(c.id)) map.set(c.id, c);
    });
    return Array.from(map.values());
  }, [jobPostings]);

  const [companyPage, setCompanyPage] = useState(1);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // fetch companies from server when company filters change
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(companyPage));
        params.set('limit', String(pageSize));
        if (companySelectedJurusan) params.set('jurusanId', String(companySelectedJurusan));
        if (companyQuery.trim()) params.set('q', companyQuery.trim());

        const res = await fetch(`/api/public/companies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCompaniesList(data.companies || []);
          setTotalCompanies(data.total || 0);
        }
      } catch (err) {
        console.error('Fetch companies error', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === 'perusahaan') fetchCompanies();
  }, [companyPage, companySelectedJurusan, companyQuery, activeTab]);

  const openDetail = (job: any) => {
    setSelectedJob(job);
  };

  const handleApply = async (job: any) => {
    // if not logged in, redirect to login
    try {
      setIsApplying(true);
      const res = await fetch('/api/bkk/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPostingId: job.id }),
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Lamaran terkirim. Terima kasih!');
        setShowApplyModal(false);
      } else if (res.status === 401 || res.status === 403) {
        window.location.href = '/login';
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal mengirim lamaran');
      }
    } catch (err) {
      console.error('Apply error', err);
      toast.error('Terjadi kesalahan saat mengirim lamaran');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-8 px-4 text-emerald-900">
        <h1 className="text-4xl font-bold mb-8 text-emerald-900">Career Center Alumni</h1>

        <div className="mb-8">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('lowongan')} className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${activeTab === 'lowongan' ? 'bg-lime-500 text-emerald-900 shadow-lg' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
              Lowongan Kerja
            </button>
            <button onClick={() => setActiveTab('perusahaan')} className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${activeTab === 'perusahaan' ? 'bg-lime-500 text-emerald-900 shadow-lg' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
              Perusahaan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin w-6 h-6" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: filters / tabs content */}
            <div className="md:col-span-2">
              {activeTab === 'lowongan' && (
                <div>
                  <div className="mb-4 flex gap-2 items-center flex-wrap">
                    <input value={queryInput} onChange={(e) => setQueryInput(e.target.value)} placeholder="Cari posisi atau perusahaan" className="flex-1 min-w-48 border border-emerald-300 rounded px-3 py-2 text-emerald-900 placeholder-emerald-500" />
                    <select value={selectedJurusan || ''} onChange={(e) => { setSelectedJurusan(e.target.value || null); setPage(1); }} className="border border-emerald-300 rounded px-3 py-2 text-emerald-900">
                      <option value="">Semua Jurusan</option>
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.id}>{j.nama}</option>
                      ))}
                    </select>
                    <select value={selectedJobType || ''} onChange={(e) => { setSelectedJobType(e.target.value || null); setPage(1); }} className="border border-emerald-300 rounded px-3 py-2 text-emerald-900">
                      <option value="">Semua Tipe</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  {filteredJobs.length === 0 && totalJobs === 0 ? (
                    <div className="bg-amber-50 border border-amber-300 p-4 rounded text-amber-900">Belum ada lowongan sesuai filter.</div>
                  ) : (
                    <div className="space-y-4">
                      {(filteredJobs || []).map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-emerald-900 mb-2">{job.posisi}</h3>
                              <p className="text-sm text-emerald-600 mb-3">{job.perusahaan?.fullName} • {job.lokasi}</p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase">Gaji</p>
                                  <p className="text-emerald-900 font-semibold">{job.salary ? `Rp ${Number(job.salary).toLocaleString('id-ID')}` : 'Negotiable'} / {job.salaryPeriod === 'per_hari' ? 'Hari' : job.salaryPeriod === 'per_minggu' ? 'Minggu' : 'Bulan'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase">Tipe Kerja</p>
                                  <p className="text-emerald-900 font-semibold">{job.tipePekerjaan}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase">Diposting</p>
                                  <p className="text-emerald-900 font-semibold">{new Date(job.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase">Deadline</p>
                                  <p className="text-emerald-900 font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID') : 'Tidak ada'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedJob(job); setShowApplyModal(true); }} className="bg-lime-500 text-emerald-900 px-3 py-1 rounded text-sm font-semibold">Lamar</button>
                            <button onClick={() => openDetail(job)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">Detail</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalJobs > pageSize && (
                    <div className="mt-6 flex justify-center items-center gap-3">
                      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-emerald-300 rounded text-emerald-700">Prev</button>
                      {Array.from({ length: Math.ceil(totalJobs / pageSize) }).map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-lime-500 text-emerald-900 border-lime-500' : 'border-emerald-300 text-emerald-700'}`}>{i + 1}</button>
                      ))}
                      <button disabled={page === Math.ceil(totalJobs / pageSize)} onClick={() => setPage(p => Math.min(Math.ceil(totalJobs / pageSize), p + 1))} className="px-3 py-1 border border-emerald-300 rounded text-emerald-700">Next</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'perusahaan' && (
                <div>
                  <div className="mb-4 flex gap-2 items-center">
                    <input value={companyQueryInput} onChange={(e) => { setCompanyQueryInput(e.target.value); }} placeholder="Cari perusahaan" className="flex-1 border border-emerald-300 rounded px-3 py-2 text-emerald-900 placeholder-emerald-500" />
                    <select value={companySelectedJurusan || ''} onChange={(e) => { setCompanySelectedJurusan(e.target.value || null); setCompanyPage(1); }} className="border border-emerald-300 rounded px-3 py-2 text-emerald-900">
                      <option value="">Semua Jurusan</option>
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.id}>{j.nama}</option>
                      ))}
                    </select>
                  </div>

                  {companiesList.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-300 p-4 rounded text-amber-900">Belum ada perusahaan sesuai filter.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {companiesList.map((c) => (
                        <div key={c.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-emerald-900">{c.fullName}</h4>
                            <p className="text-sm text-emerald-600">{c.email}</p>
                          </div>
                          <div>
                            <a href={`mailto:${c.email}`} className="text-sm text-lime-600 hover:text-lime-700 underline">Hubungi</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination for companies */}
                  {totalCompanies > pageSize && (
                    <div className="mt-4 flex justify-center items-center gap-3">
                      <button disabled={companyPage === 1} onClick={() => setCompanyPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-emerald-300 rounded text-emerald-700">Prev</button>
                      {Array.from({ length: Math.ceil(totalCompanies / pageSize) }).map((_, i) => (
                        <button key={i} onClick={() => setCompanyPage(i + 1)} className={`px-3 py-1 border rounded ${companyPage === i + 1 ? 'bg-lime-500 text-emerald-900 border-lime-500' : 'border-emerald-300 text-emerald-700'}`}>{i + 1}</button>
                      ))}
                      <button disabled={companyPage === Math.ceil(totalCompanies / pageSize)} onClick={() => setCompanyPage(p => Math.min(Math.ceil(totalCompanies / pageSize), p + 1))} className="px-3 py-1 border border-emerald-300 rounded text-emerald-700">Next</button>
                    </div>
                  )}
                </div>
              )}

              
            </div>

            {/* Right column: info / help */}
            <aside className="hidden md:block">
              <div className="bg-white p-4 rounded shadow mb-4">
                <h4 className="font-semibold text-emerald-900">Tips Melamar</h4>
                <ul className="text-sm text-emerald-600 mt-2 space-y-2">
                  <li>- Siapkan CV terbaru</li>
                  <li>- Sertakan portofolio jika diperlukan</li>
                  <li>- Periksa deadline</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold text-emerald-900">Filter Jurusan</h4>
                <p className="text-sm text-emerald-600 mt-2">Pilih jurusan untuk melihat lowongan relevan.</p>
              </div>
            </aside>
          </div>
        )}

        {/* Detail Drawer / Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-black/50"></div>
            <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-lg">
                <h3 className="text-2xl font-bold mb-2">{selectedJob.posisi}</h3>
                <p className="text-emerald-100 text-sm">{selectedJob.perusahaan?.fullName}</p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Section 1: Informasi Dasar */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-bold text-emerald-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
                    Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Lokasi Kerja</p>
                      <p className="text-base font-semibold text-emerald-900 mt-1">{selectedJob.lokasi || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Tipe Pekerjaan</p>
                      <p className="text-base font-semibold text-emerald-900 mt-1">{selectedJob.tipePekerjaan}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Kompensasi */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Kompensasi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Gaji</p>
                      <p className="text-base font-semibold text-blue-900 mt-1">
                        {selectedJob.salary ? `Rp ${Number(selectedJob.salary).toLocaleString('id-ID')}` : 'Negotiable'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Periode</p>
                      <p className="text-base font-semibold text-blue-900 mt-1">
                        {selectedJob.salaryPeriod === 'per_hari' ? 'Per Hari' : selectedJob.salaryPeriod === 'per_minggu' ? 'Per Minggu' : 'Per Bulan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Deskripsi Posisi */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-bold text-orange-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                    Deskripsi Posisi
                  </h4>
                  <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.deskripsi}
                  </p>
                </div>

                {/* Section 4: Persyaratan & Kualifikasi */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                      Persyaratan & Kualifikasi
                    </h4>
                    <ul className="space-y-2">
                      {(Array.isArray(selectedJob.requirements) ? selectedJob.requirements : selectedJob.requirements.split(',')).map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-purple-900">
                          <span className="text-purple-600 font-bold mt-1">✓</span>
                          <span className="text-sm">{req.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 5: Jadwal Penting */}
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="text-sm font-bold text-cyan-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full mr-2"></span>
                    Jadwal Penting
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Diposting Pada</p>
                      <p className="text-base font-semibold text-cyan-900 mt-1">
                        {new Date(selectedJob.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Deadline Lamaran</p>
                      <p className={`text-base font-semibold mt-1 ${selectedJob.deadline && new Date(selectedJob.deadline) < new Date() ? 'text-red-600' : 'text-cyan-900'}`}>
                        {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak ada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-2 rounded-b-lg">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-2 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Tutup
                </button>
                <button
                  onClick={() => { setShowApplyModal(true); }}
                  className="px-6 py-2 rounded-lg bg-lime-500 text-emerald-900 font-semibold hover:bg-lime-600 transition"
                >
                  Lamar Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={() => { setShowApplyModal(false); }} className="absolute inset-0 bg-emerald-50/40"></div>
            <div className="relative bg-white rounded shadow max-w-xl w-full p-6 z-50">
              <h3 className="text-lg font-bold">Lamar: {selectedJob.posisi}</h3>
              <p className="text-sm text-emerald-600">{selectedJob.perusahaan?.fullName}</p>
              <div className="mt-4">
                <p className="text-sm text-emerald-700 mb-2">Serahkan CV (PDF/DOC) dan surat lamaran (opsional).</p>
                <div className="grid gap-2">
                  <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setApplyFile(e.target.files ? e.target.files[0] : null)} />
                  <textarea placeholder="Surat lamaran (opsional)" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="w-full border rounded px-3 py-2 h-28"></textarea>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button disabled={isApplying} onClick={async () => {
                    // upload file first if present
                    let uploadedUrl: string | null = null;
                    if (applyFile) {
                      try {
                        const fd = new FormData();
                        fd.append('file', applyFile as any);
                        const upRes = await fetch('/api/bkk/uploads', { method: 'POST', body: fd, credentials: 'include' });
                        if (upRes.ok) {
                          const upData = await upRes.json();
                          uploadedUrl = upData.url;
                        } else {
                          const err = await upRes.json();
                            toast.error(err?.error || 'Gagal mengunggah CV');
                          return;
                        }
                      } catch (err) {
                        console.error('Upload error', err);
                          toast.error('Gagal mengunggah CV');
                        return;
                      }
                    }

                    // now submit application
                    setIsApplying(true);
                    try {
                      const res = await fetch('/api/bkk/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ jobPostingId: selectedJob.id, cvFile: uploadedUrl, coverLetter }),
                      });
                      if (res.ok) {
                          toast.success('Lamaran terkirim. Terima kasih!');
                        setShowApplyModal(false);
                        setApplyFile(null);
                        setCoverLetter('');
                      } else if (res.status === 401 || res.status === 403) {
                        window.location.href = '/login';
                      } else {
                        const err = await res.json();
                          toast.error(err?.error || 'Gagal mengirim lamaran');
                      }
                    } catch (err) {
                      console.error('Apply error', err);
                        toast.error('Terjadi kesalahan saat mengirim lamaran');
                    } finally {
                      setIsApplying(false);
                    }
                  }} className="bg-green-600 text-white px-4 py-2 rounded">{isApplying ? 'Mengirim...' : 'Kirim Lamaran'}</button>
                  <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 rounded border">Batal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
