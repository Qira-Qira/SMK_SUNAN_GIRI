'use client';

import Navbar from '@/components/common/Navbar';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

type Tab = 'lowongan' | 'perusahaan' | 'riwayat';

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

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
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchInitial();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        
        // If ALUMNI, fetch their applications too
        if (data.user.role === 'ALUMNI') {
          fetchUserApplications();
        }
      }
    } catch (err) {
      console.error('Error fetching current user', err);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const res = await fetch('/api/bkk/apply', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUserApplications(data || []);
      }
    } catch (err) {
      console.error('Error fetching applications', err);
    }
  };

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

  const filteredApplications = useMemo(() => {
    let list = Array.isArray(userApplications) ? userApplications : [];
    if (selectedStatus) {
      list = list.filter((app) => app.status === selectedStatus);
    }
    return list;
  }, [userApplications, selectedStatus]);

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

  // Helper function untuk cek apakah sudah apply job tertentu
  const getApplicationStatus = (jobId: string) => {
    return userApplications.find((app) => app.jobPostingId === jobId);
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
      <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 text-emerald-900">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8 text-emerald-900 leading-tight">Career Center Alumni</h1>

        <div className="mb-4 sm:mb-6 lg:mb-8 overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <div className="flex gap-1.5 sm:gap-2 flex-nowrap">
            <button onClick={() => setActiveTab('lowongan')} className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold transition duration-200 text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0 ${activeTab === 'lowongan' ? 'bg-lime-500 text-emerald-900 shadow-lg' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
              Lowongan Kerja
            </button>
            <button onClick={() => setActiveTab('perusahaan')} className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold transition duration-200 text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0 ${activeTab === 'perusahaan' ? 'bg-lime-500 text-emerald-900 shadow-lg' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
              Perusahaan
            </button>
            {currentUser?.role === 'ALUMNI' && (
              <button onClick={() => setActiveTab('riwayat')} className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold transition duration-200 text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0 ${activeTab === 'riwayat' ? 'bg-lime-500 text-emerald-900 shadow-lg' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}>
                Riwayat Lamaran
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16"><Loader2 className="animate-spin w-8 h-8 text-emerald-600" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">{/* Adjusted grid for responsiveness */}
            {/* Left column: filters / tabs content */}
            <div className="lg:col-span-3">
              {activeTab === 'lowongan' && (
                <div>
                  {currentUser && currentUser.role !== 'ALUMNI' && (
                    <div className="mb-3 sm:mb-4 bg-amber-50 border border-amber-300 p-3 sm:p-4 rounded flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-amber-900">Akses Terbatas</p>
                        <p className="text-xs sm:text-sm text-amber-800 mt-1">Hanya alumni dari SMK SUNAN GIRI yang dapat melamar lowongan pekerjaan.</p>
                      </div>
                    </div>
                  )}
                  <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:gap-2">
                    <input value={queryInput} onChange={(e) => setQueryInput(e.target.value)} placeholder="Cari posisi atau perusahaan" className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-lime-500" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                      <select value={selectedJurusan || ''} onChange={(e) => { setSelectedJurusan(e.target.value || null); setPage(1); }} className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-500">
                        <option value="">Semua Jurusan</option>
                        {jurusanList.map((j) => (
                          <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                      </select>
                      <select value={selectedJobType || ''} onChange={(e) => { setSelectedJobType(e.target.value || null); setPage(1); }} className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-500">
                        <option value="">Semua Tipe</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  {filteredJobs.length === 0 && totalJobs === 0 ? (
                    <div className="bg-amber-50 border border-amber-300 p-3 sm:p-4 rounded text-xs sm:text-sm text-amber-900">Belum ada lowongan sesuai filter.</div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {(filteredJobs || []).map((job) => (
                        <div key={job.id} className="bg-white p-3 sm:p-4 lg:p-6 rounded shadow-sm border border-emerald-100 hover:shadow-md transition">
                          <div className="flex flex-col justify-between gap-3 sm:gap-4">
                            <div className="w-full">
                              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-emerald-900 mb-1.5 sm:mb-2 line-clamp-2">{job.posisi}</h3>
                              <p className="text-xs sm:text-sm text-emerald-600 mb-2.5 sm:mb-3 line-clamp-1">{job.perusahaan?.fullName} • {job.lokasi}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Gaji</p>
                                  <p className="text-emerald-900 font-semibold text-xs sm:text-sm line-clamp-1">{job.salary ? `Rp ${Number(job.salary).toLocaleString('id-ID')}` : 'Negotiable'}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Tipe</p>
                                  <p className="text-emerald-900 font-semibold text-xs sm:text-sm line-clamp-1">{job.tipePekerjaan}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Diposting</p>
                                  <p className="text-emerald-900 font-semibold text-xs sm:text-sm">{new Date(job.createdAt).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Deadline</p>
                                  <p className="text-emerald-900 font-semibold text-xs sm:text-sm">{job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID') : '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap mt-3 sm:mt-4">
                            {currentUser?.role === 'ALUMNI' ? (
                              (() => {
                                const appStatus = getApplicationStatus(job.id);
                                return appStatus ? (
                                  <button onClick={() => { setSelectedJob(job); setShowApplyModal(true); }} className="flex-1 sm:flex-none bg-yellow-500 text-emerald-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-semibold hover:bg-yellow-600 transition active:scale-95">Ubah Lamaran</button>
                                ) : (
                                  <button onClick={() => { setSelectedJob(job); setShowApplyModal(true); }} className="flex-1 sm:flex-none bg-lime-500 text-emerald-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-semibold hover:bg-lime-600 transition active:scale-95">Lamar</button>
                                );
                              })()
                            ) : (
                              <button disabled className="flex-1 sm:flex-none bg-gray-300 text-gray-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-semibold cursor-not-allowed opacity-70">Lamar</button>
                            )}
                            <button onClick={() => openDetail(job)} className="flex-1 sm:flex-none bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm hover:bg-emerald-700 transition active:scale-95">Detail</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalJobs > pageSize && (
                    <div className="mt-4 sm:mt-6 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                      <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">‹ Prev</button>
                      {Array.from({ length: Math.ceil(totalJobs / pageSize) }).map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded font-medium transition ${page === i + 1 ? 'bg-lime-500 text-emerald-900 border-lime-500' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>{i + 1}</button>
                      ))}
                      <button disabled={page === Math.ceil(totalJobs / pageSize)} onClick={() => setPage(p => Math.min(Math.ceil(totalJobs / pageSize), p + 1))} className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">Next ›</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'perusahaan' && (
                <div>
                  <div className="mb-3 sm:mb-4 flex flex-col gap-2">
                    <input value={companyQueryInput} onChange={(e) => { setCompanyQueryInput(e.target.value); }} placeholder="Cari perusahaan" className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 placeholder-emerald-500 focus:outline-none focus:ring-2 focus:ring-lime-500" />
                    <select value={companySelectedJurusan || ''} onChange={(e) => { setCompanySelectedJurusan(e.target.value || null); setCompanyPage(1); }} className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-500">
                      <option value="">Semua Jurusan</option>
                      {jurusanList.map((j) => (
                        <option key={j.id} value={j.id}>{j.nama}</option>
                      ))}
                    </select>
                  </div>

                  {companiesList.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-300 p-3 sm:p-4 rounded text-xs sm:text-sm text-amber-900">Belum ada perusahaan sesuai filter.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {companiesList.map((c) => (
                        <div key={c.id} className="bg-white p-3 sm:p-4 rounded shadow-sm border border-emerald-100 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm lg:text-base text-emerald-900 line-clamp-2">{c.fullName}</h4>
                            <p className="text-xs sm:text-sm text-emerald-600 break-all truncate">{c.email}</p>
                          </div>
                          <div className="w-full sm:w-auto">
                            <a href={`mailto:${c.email}`} className="text-xs sm:text-sm text-lime-600 hover:text-lime-700 hover:underline font-medium block text-center sm:text-left">Hubungi</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination for companies */}
                  {totalCompanies > pageSize && (
                    <div className="mt-4 sm:mt-6 flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                      <button disabled={companyPage === 1} onClick={() => setCompanyPage(p => Math.max(1, p - 1))} className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">‹ Prev</button>
                      {Array.from({ length: Math.ceil(totalCompanies / pageSize) }).map((_, i) => (
                        <button key={i} onClick={() => setCompanyPage(i + 1)} className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded font-medium transition ${companyPage === i + 1 ? 'bg-lime-500 text-emerald-900 border-lime-500' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'}`}>{i + 1}</button>
                      ))}
                      <button disabled={companyPage === Math.ceil(totalCompanies / pageSize)} onClick={() => setCompanyPage(p => Math.min(Math.ceil(totalCompanies / pageSize), p + 1))} className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 rounded text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed">Next ›</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'riwayat' && (
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-emerald-900">Riwayat Lamaran Anda</h2>
                  
                  {/* Status Filter */}
                  <div className="mb-3 sm:mb-4">
                    <select value={selectedStatus || ''} onChange={(e) => { setSelectedStatus(e.target.value || null); }} className="w-full border border-emerald-300 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm lg:text-base text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-500">
                      <option value="">Semua Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Ditinjau">Ditinjau</option>
                      <option value="Shortlist">Shortlist</option>
                      <option value="Interview">Interview</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  
                  {filteredApplications.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-300 p-3 sm:p-4 rounded text-xs sm:text-sm text-amber-900">
                      {selectedStatus ? 'Tidak ada lamaran dengan status tersebut.' : 'Anda belum melamar lowongan apapun.'}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredApplications.map((app) => {
                        const statusColor = {
                          'Pending': 'bg-gray-100 border-gray-300 text-gray-700',
                          'Ditinjau': 'bg-blue-100 border-blue-300 text-blue-700',
                          'Shortlist': 'bg-yellow-100 border-yellow-300 text-yellow-700',
                          'Interview': 'bg-purple-100 border-purple-300 text-purple-700',
                          'Accepted': 'bg-green-100 border-green-300 text-green-700',
                          'Rejected': 'bg-red-100 border-red-300 text-red-700',
                        };
                        
                        return (
                          <div key={app.id} className="bg-white p-3 sm:p-4 lg:p-6 rounded shadow-sm border border-emerald-100 hover:shadow-md transition">
                            <div className="flex flex-col gap-3 sm:gap-4">
                              <div className="w-full">
                                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-emerald-900 mb-1.5 sm:mb-2 line-clamp-2">{app.jobPosting.posisi}</h3>
                                <p className="text-xs sm:text-sm text-emerald-600 mb-2.5 sm:mb-3 line-clamp-1">{app.jobPosting.perusahaan?.fullName} • {app.jobPosting.lokasi}</p>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 sm:mb-4">
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Gaji</p>
                                    <p className="text-emerald-900 font-semibold text-xs sm:text-sm line-clamp-1">{app.jobPosting.salary ? `Rp ${Number(app.jobPosting.salary).toLocaleString('id-ID')}` : 'Negotiable'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Status</p>
                                    <p className={`text-xs sm:text-sm font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded inline-block border ${statusColor[app.status as keyof typeof statusColor] || 'bg-gray-100 border-gray-300'}`}>
                                      {app.status}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Tgl Melamar</p>
                                    <p className="text-emerald-900 font-semibold text-xs sm:text-sm">{new Date(app.appliedAt || app.createdAt).toLocaleDateString('id-ID')}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-tight mb-0.5">Deadline</p>
                                    <p className={`font-semibold text-xs sm:text-sm ${app.jobPosting.deadline && new Date(app.jobPosting.deadline) < new Date() ? 'text-red-600' : 'text-emerald-900'}`}>
                                      {app.jobPosting.deadline ? new Date(app.jobPosting.deadline).toLocaleDateString('id-ID') : '-'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <button onClick={() => { setSelectedJob(app.jobPosting); setShowApplyModal(true); }} className="flex-1 sm:flex-none bg-yellow-500 text-emerald-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm font-semibold hover:bg-yellow-600 transition active:scale-95">Ubah</button>
                              <button onClick={() => setSelectedJob(app.jobPosting)} className="flex-1 sm:flex-none bg-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded text-xs sm:text-sm hover:bg-emerald-700 transition active:scale-95">Detail</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              
            </div>

            {/* Right column: info / help */}
            <aside className="hidden lg:block">
              <div className="bg-white p-4 rounded shadow-sm border border-emerald-100 mb-4 sticky top-4">
                <h4 className="font-semibold text-sm text-emerald-900">Tips Melamar</h4>
                <ul className="text-xs text-emerald-600 mt-3 space-y-2">
                  <li className="flex items-start gap-2">✓ <span>Siapkan CV terbaru</span></li>
                  <li className="flex items-start gap-2">✓ <span>Sertakan portofolio</span></li>
                  <li className="flex items-start gap-2">✓ <span>Periksa deadline</span></li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded shadow-sm border border-emerald-100 sticky top-48">
                <h4 className="font-semibold text-sm text-emerald-900">Filter Jurusan</h4>
                <p className="text-xs text-emerald-600 mt-2">Pilih jurusan untuk melihat lowongan relevan dengan program studi Anda.</p>
              </div>
            </aside>
          </div>
        )}

        {/* Detail Drawer / Modal */}
        {selectedJob && !showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div onClick={() => setSelectedJob(null)} className="absolute inset-0 bg-black/50"></div>
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto my-4">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 sm:p-5 lg:p-6 rounded-t-lg">
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold mb-1 break-words">{selectedJob.posisi}</h3>
                <p className="text-xs sm:text-sm text-emerald-100">{selectedJob.perusahaan?.fullName}</p>
              </div>

              {/* Body */}
              <div className="p-3 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Section 1: Informasi Dasar */}
                <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
                    Informasi Dasar
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Lokasi Kerja</p>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-900 mt-1">{selectedJob.lokasi || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Tipe Pekerjaan</p>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-900 mt-1">{selectedJob.tipePekerjaan}</p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Kompensasi */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Kompensasi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Gaji</p>
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 mt-1">
                        {selectedJob.salary ? `Rp ${Number(selectedJob.salary).toLocaleString('id-ID')}` : 'Negotiable'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Periode</p>
                      <p className="text-xs sm:text-sm font-semibold text-blue-900 mt-1">
                        {selectedJob.salaryPeriod === 'per_hari' ? 'Per Hari' : selectedJob.salaryPeriod === 'per_minggu' ? 'Per Minggu' : 'Per Bulan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Deskripsi Posisi */}
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                  <h4 className="text-xs sm:text-sm font-bold text-orange-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                    Deskripsi Posisi
                  </h4>
                  <p className="text-xs sm:text-sm text-orange-900 leading-relaxed whitespace-pre-wrap line-clamp-6 sm:line-clamp-none">
                    {selectedJob.deskripsi}
                  </p>
                </div>

                {/* Section 4: Persyaratan & Kualifikasi */}
                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                    <h4 className="text-xs sm:text-sm font-bold text-purple-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                      Persyaratan
                    </h4>
                    <ul className="space-y-2">
                      {(Array.isArray(selectedJob.requirements) ? selectedJob.requirements : selectedJob.requirements.split(',')).map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-purple-900">
                          <span className="text-purple-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                          <span>{req.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 5: Jadwal Penting */}
                <div className="bg-cyan-50 p-3 sm:p-4 rounded-lg border border-cyan-200">
                  <h4 className="text-xs sm:text-sm font-bold text-cyan-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full mr-2"></span>
                    Jadwal Penting
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Diposting Pada</p>
                      <p className="text-xs sm:text-sm font-semibold text-cyan-900 mt-1">
                        {new Date(selectedJob.createdAt).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wide">Deadline</p>
                      <p className={`text-xs sm:text-sm font-semibold mt-1 ${selectedJob.deadline && new Date(selectedJob.deadline) < new Date() ? 'text-red-600' : 'text-cyan-900'}`}>
                        {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tidak ada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row justify-end gap-2 rounded-b-lg">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="order-2 sm:order-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-emerald-300 text-emerald-700 font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition active:scale-95"
                >
                  Tutup
                </button>
                {currentUser?.role === 'ALUMNI' ? (
                  (() => {
                    const appStatus = getApplicationStatus(selectedJob.id);
                    return (
                      <button
                        onClick={() => { setShowApplyModal(true); }}
                        className={`order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition active:scale-95 ${appStatus ? 'bg-yellow-500 text-emerald-900 hover:bg-yellow-600' : 'bg-lime-500 text-emerald-900 hover:bg-lime-600'}`}
                      >
                        {appStatus ? 'Ubah Lamaran' : 'Lamar Sekarang'}
                      </button>
                    );
                  })()
                ) : (
                  <button
                    disabled
                    className="order-1 sm:order-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gray-300 text-gray-600 font-semibold text-xs sm:text-sm cursor-not-allowed opacity-70"
                  >
                    Lamar Sekarang
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Apply Modal */}
        {showApplyModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div onClick={() => { setShowApplyModal(false); }} className="absolute inset-0 bg-emerald-50/40"></div>
            <div className="relative bg-white rounded shadow max-w-sm w-full p-4 sm:p-6 z-50 my-4">
              <h3 className="text-sm sm:text-lg font-bold mb-1">Lamar: {selectedJob.posisi}</h3>
              <p className="text-xs sm:text-sm text-emerald-600 mb-4 sm:mb-5">{selectedJob.perusahaan?.fullName}</p>
              <div>
                <p className="text-xs sm:text-sm text-emerald-700 mb-3 sm:mb-4">Serahkan CV dan surat lamaran (opsional).</p>
                <div className="grid gap-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-2 block">Upload CV (PDF/DOC)*</label>
                    <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setApplyFile(e.target.files ? e.target.files[0] : null)} className="text-xs sm:text-sm w-full border border-emerald-300 rounded p-2 hover:bg-emerald-50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700 mb-2 block">Surat Lamaran (Opsional)</label>
                    <textarea placeholder="Tulis alasan Anda melamar..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="w-full border border-emerald-300 rounded px-3 py-2 h-24 sm:h-28 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"></textarea>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <button onClick={() => setShowApplyModal(false)} className="px-4 py-2.5 sm:py-3 rounded border border-emerald-300 text-emerald-700 font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition active:scale-95">Batal</button>
                  <button disabled={isApplying} onClick={async () => {
                    setIsApplying(true);
                    
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
                          setIsApplying(false);
                          return;
                        }
                      } catch (err) {
                        console.error('Upload error', err);
                        toast.error('Gagal mengunggah CV');
                        setIsApplying(false);
                        return;
                      }
                    }

                    // now submit application
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
                        // Reload applications list
                        fetchUserApplications();
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
                  }} className={`px-4 py-2.5 sm:py-3 rounded text-white font-semibold text-xs sm:text-sm transition active:scale-95 ${isApplying ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'}`}>{isApplying ? 'Mengirim...' : 'Kirim Lamaran'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
