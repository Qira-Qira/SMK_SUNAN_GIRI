'use client';

import Navbar from '@/components/common/Navbar';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { Briefcase, Plus, Edit, Trash2, X, Download, FileText, BarChart3, Users, Clock, Code, Calendar, Eye, CheckCircle, Mic, Mail, ExternalLink, Save, GraduationCap, Check } from 'lucide-react';
import CountUp from '@/components/common/CountUp';

type CompanySubTab = 'dashboard' | 'lowongan' | 'lamaran';

export default function CompanyDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<CompanySubTab>('dashboard');

  // Job Postings
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobForm, setJobForm] = useState({
    posisi: '',
    lokasi: '',
    tipePekerjaan: 'Full-time',
    salary: '',
    salaryPeriod: 'per_bulan',
    deskripsi: '',
    requirements: '',
    deadline: '',
    jurusanId: '',
  });

  // Applications
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [applicationFilterStatus, setApplicationFilterStatus] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);

  // Jurusan
  const [jurusan, setJurusan] = useState<any[]>([]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'PERUSAHAAN') {
      fetchJobPostings();
      if (activeSubTab === 'lamaran') {
        fetchJobApplications();
      }
    }
  }, [activeSubTab, applicationFilterStatus, currentUser]);

  useEffect(() => {
    fetchJurusan();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);

        if (data.user?.role !== 'PERUSAHAAN') {
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const res = await fetch('/api/company/job-postings', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setJobPostings(data.jobPostings || []);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchJobApplications = async () => {
    try {
      const res = await fetch(
        `/api/company/applications${applicationFilterStatus ? `?status=${applicationFilterStatus}` : ''}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        setJobApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

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

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSaving(true);

    try {
      const url = selectedJobForEdit
        ? `/api/company/job-postings?id=${selectedJobForEdit.id}`
        : '/api/company/job-postings';
      const method = selectedJobForEdit ? 'PUT' : 'POST';

      console.log('Saving job:', { method, url, jobForm });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(jobForm),
      });

      if (res.ok) {
        toast.success(
          selectedJobForEdit ? 'Lowongan berhasil diperbarui!' : 'Lowongan berhasil ditambahkan!'
        );
        setShowJobModal(false);
        setJobForm({
          posisi: '',
          lokasi: '',
          tipePekerjaan: 'Full-time',
          salary: '',
          salaryPeriod: 'per_bulan',
          deskripsi: '',
          requirements: '',
          deadline: '',
          jurusanId: '',
        });
        setSelectedJobForEdit(null);
        fetchJobPostings();
      } else {
        const error = await res.json();
        console.error('Error response:', error);
        toast.error(error.error || error.details || 'Gagal menyimpan lowongan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
      console.error('Error:', error);
    } finally {
      setJobSaving(false);
    }
  };

  const handleEditJob = (job: any) => {
    setSelectedJobForEdit(job);
    
    // Convert requirements array to string (join with comma)
    const requirementsStr = Array.isArray(job.requirements)
      ? job.requirements.join(', ')
      : (job.requirements || '');

    // Parse deadline safely
    let deadlineStr = '';
    if (job.deadline) {
      try {
        const date = new Date(job.deadline);
        deadlineStr = date.toISOString().split('T')[0];
      } catch (e) {
        deadlineStr = '';
      }
    }

    setJobForm({
      posisi: job.posisi || '',
      lokasi: job.lokasi || '',
      tipePekerjaan: job.tipePekerjaan || 'Full-time',
      salary: job.salary?.toString() || '',
      salaryPeriod: job.salaryPeriod || 'per_bulan',
      deskripsi: job.deskripsi || '',
      requirements: requirementsStr,
      deadline: deadlineStr,
      jurusanId: job.jurusanId || '',
    });
    setShowJobModal(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) return;

    try {
      const res = await fetch(`/api/company/job-postings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Lowongan berhasil dihapus');
        fetchJobPostings();
      } else {
        toast.error('Gagal menghapus lowongan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
      console.error('Error:', error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/company/applications?id=${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success('Status lamaran berhasil diperbarui');
        fetchJobApplications();
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      } else {
        toast.error('Gagal memperbarui status');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-emerald-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'PERUSAHAAN') {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4 text-emerald-900">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-emerald-900">Dashboard Perusahaan</h1>
          <p className="text-emerald-600">Selamat datang, <span className="font-semibold">{currentUser?.fullName}</span></p>
        </div>

        {/* Sub-Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-emerald-200">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 font-semibold transition ${
              activeSubTab === 'dashboard'
                ? 'text-lime-600 border-b-2 border-lime-500'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <BarChart3 className="inline w-4 h-4 mr-2" /> Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab('lowongan')}
            className={`px-4 py-2 font-semibold transition ${
              activeSubTab === 'lowongan'
                ? 'text-lime-600 border-b-2 border-lime-500'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <Briefcase className="inline w-4 h-4 mr-2" /> Lowongan Saya
          </button>
          <button
            onClick={() => setActiveSubTab('lamaran')}
            className={`px-4 py-2 font-semibold transition ${
              activeSubTab === 'lamaran'
                ? 'text-lime-600 border-b-2 border-lime-500'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <FileText className="inline w-4 h-4 mr-2" /> Lamaran Masuk ({jobApplications.length})
          </button>
        </div>

        {/* Dashboard Sub-Tab */}
        {activeSubTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-6">Ringkasan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded shadow">
                <p className="text-sm text-blue-600 font-semibold mb-2">Total Lowongan</p>
                <p className="text-3xl font-bold text-blue-900"><CountUp end={jobPostings.length} /></p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded shadow">
                <p className="text-sm text-green-600 font-semibold mb-2">Total Lamaran</p>
                <p className="text-3xl font-bold text-green-900"><CountUp end={jobApplications.length} /></p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded shadow">
                <p className="text-sm text-orange-600 font-semibold mb-2">Lamaran Pending</p>
                <p className="text-3xl font-bold text-orange-900">
                  <CountUp end={jobApplications.filter((a: any) => a.status === 'Pending').length} />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lowongan Saya Sub-Tab */}
        {activeSubTab === 'lowongan' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">Lowongan Kerja Saya</h2>
              <button
                onClick={() => {
                  setSelectedJobForEdit(null);
                  setJobForm({
                    posisi: '',
                    lokasi: '',
                    tipePekerjaan: 'Full-time',
                    salary: '',
                    salaryPeriod: 'per_bulan',
                    deskripsi: '',
                    requirements: '',
                    deadline: '',
                    jurusanId: '',
                  });
                  setShowJobModal(true);
                }}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Posting Lowongan Baru
              </button>
            </div>
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">Posisi</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Lamaran</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostings.length > 0 ? (
                    jobPostings.map((posting: any) => (
                      <tr key={posting.id} className="border-t hover:bg-emerald-50">
                        <td className="px-4 py-3 font-semibold text-emerald-900">{posting.posisi}</td>
                        <td className="px-4 py-3">{posting.lokasi || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {posting.deadline ? new Date(posting.deadline).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {posting._count?.jobApplications || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-1">
                          <button
                            onClick={() => handleEditJob(posting)}
                            className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJob(posting.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-emerald-700">
                        Anda belum membuat lowongan kerja. Klik "Posting Lowongan Baru" untuk memulai!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lamaran Masuk Sub-Tab */}
        {activeSubTab === 'lamaran' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">Lamaran Masuk</h2>
              <select
                value={applicationFilterStatus}
                onChange={(e) => setApplicationFilterStatus(e.target.value)}
                className="border border-emerald-300 rounded px-3 py-2 text-emerald-900"
              >
                <option value="">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Ditinjau">Ditinjau</option>
                <option value="Shortlist">Shortlist</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Diterima</option>
                <option value="Rejected">Ditolak</option>
              </select>
            </div>
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">Pelamar</th>
                    <th className="px-4 py-3">Posisi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Tanggal Lamar</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jobApplications.length > 0 ? (
                    jobApplications.map((app: any) => (
                      <tr key={app.id} className="border-t hover:bg-emerald-50">
                        <td className="px-4 py-3 font-semibold">{app.user?.fullName}</td>
                        <td className="px-4 py-3">{app.jobPosting?.posisi}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              app.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : app.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(app.appliedAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowApplicationDetailModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 text-center text-emerald-700">
                        Tidak ada lamaran masuk
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Modal */}
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowJobModal(false)} className="absolute inset-0 bg-black/50"></div>
            <form
              onSubmit={handleSaveJob}
              className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full z-50 max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex justify-between items-center rounded-t-lg">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {selectedJobForEdit ? (
                    <><Edit className="w-5 h-5" /> Edit Lowongan Kerja</>
                  ) : (
                    <><Plus className="w-5 h-5" /> Posting Lowongan Kerja Baru</>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="text-white hover:text-emerald-100 transition"
                >
                  <X className="w-6 h-6" />
                </button>
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
                      <label className="block text-xs font-semibold mb-2 text-emerald-900">
                        Posisi Jabatan <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        value={jobForm.posisi}
                        onChange={(e) => setJobForm({ ...jobForm, posisi: e.target.value })}
                        className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Contoh: Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-emerald-900">Lokasi Kerja</label>
                      <input
                        value={jobForm.lokasi}
                        onChange={(e) => setJobForm({ ...jobForm, lokasi: e.target.value })}
                        className="w-full border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Contoh: Jakarta, Bandung"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Tipe & Kompensasi */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Tipe & Kompensasi
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-blue-900">Tipe Pekerjaan</label>
                      <select
                        value={jobForm.tipePekerjaan}
                        onChange={(e) => setJobForm({ ...jobForm, tipePekerjaan: e.target.value })}
                        className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Full-time">Full-time (Full)</option>
                        <option value="Part-time">Part-time (Paruh)</option>
                        <option value="Contract">Contract (Kontrak)</option>
                        <option value="Internship">Internship (Magang)</option>
                        <option value="Freelance">Freelance (Lepas)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-blue-900">Gaji (opsional)</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={jobForm.salary}
                            onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Cth:2000000"
                          />
                          <p className="text-xs text-blue-600 mt-1">Masukkan jumlah nominal</p>
                        </div>
                        <div>
                          <select
                            value={jobForm.salaryPeriod}
                            onChange={(e) => setJobForm({ ...jobForm, salaryPeriod: e.target.value })}
                            className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="per_hari">Per Hari</option>
                            <option value="per_minggu">Per Minggu</option>
                            <option value="per_bulan">Per Bulan</option>
                          </select>
                          <p className="text-xs text-blue-600 mt-1">Periode gaji</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Target & Deadline */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                    Target & Jadwal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-purple-900">Jurusan Target (opsional)</label>
                      <select
                        value={jobForm.jurusanId}
                        onChange={(e) => setJobForm({ ...jobForm, jurusanId: e.target.value })}
                        className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Semua Jurusan --</option>
                        {jurusan.map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2 text-purple-900">Deadline Lamaran</label>
                      <input
                        type="date"
                        value={jobForm.deadline}
                        onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                        className="w-full border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Deskripsi */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="text-sm font-bold text-orange-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                    Deskripsi Posisi
                  </h4>
                  <textarea
                    required
                    value={jobForm.deskripsi}
                    onChange={(e) => setJobForm({ ...jobForm, deskripsi: e.target.value })}
                    className="w-full border border-orange-300 rounded px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Jelaskan deskripsi pekerjaan, tanggung jawab utama, dan tugas-tugas yang akan dikerjakan..."
                  />
                  <p className="text-xs text-orange-600 mt-2">💡 Semakin detail, semakin banyak pelamar yang sesuai</p>
                </div>

                {/* Section 5: Requirements */}
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h4 className="text-sm font-bold text-cyan-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-cyan-600 rounded-full mr-2"></span>
                    Persyaratan & Kualifikasi
                  </h4>
                  <input
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    className="w-full border border-cyan-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Contoh: 2 tahun pengalaman, komunikasi baik, sertifikat S1, dll (pisahkan dengan koma)"
                  />
                  <p className="text-xs text-cyan-600 mt-2">💡 Pisahkan setiap persyaratan dengan tanda koma</p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-2 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-6 py-2 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={jobSaving}
                  className={`px-6 py-2 rounded-lg text-white font-semibold transition flex items-center gap-2 ${
                    jobSaving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : selectedJobForEdit
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {jobSaving ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : selectedJobForEdit ? (
                    <><Save className="w-4 h-4" /> Perbarui Lowongan</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Posting Lowongan</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Application Detail Modal */}
        {showApplicationDetailModal && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowApplicationDetailModal(false)}
              className="absolute inset-0 bg-black/50"
            ></div>
            <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full z-50 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-lg">
                <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5" /> Detail Lamaran Pelamar</h3>
                <button
                  onClick={() => setShowApplicationDetailModal(false)}
                  className="text-white hover:text-blue-100 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Section 1: Informasi Pelamar */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Informasi Pelamar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Nama Lengkap</p>
                      <p className="text-lg font-bold text-blue-900 mt-1">
                        {selectedApplication.user?.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Email</p>
                      <p className="text-base text-blue-900 mt-1">
                        <a href={`mailto:${selectedApplication.user?.email}`} className="hover:underline">
                          {selectedApplication.user?.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Telepon</p>
                      <p className="text-base text-blue-900 mt-1">
                        {selectedApplication.user?.phone || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Tanggal Lamar</p>
                      <p className="text-base text-blue-900 mt-1">
                        {new Date(selectedApplication.appliedAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informasi Lowongan */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="text-sm font-bold text-emerald-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
                    Lowongan Kerja
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Posisi</p>
                      <p className="text-lg font-bold text-emerald-900 mt-1">
                        {selectedApplication.jobPosting?.posisi}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Status Lamaran</p>
                      <select
                        value={selectedApplication.status}
                        onChange={(e) =>
                          handleUpdateApplicationStatus(selectedApplication.id, e.target.value)
                        }
                        className={`mt-1 w-full px-3 py-2 rounded-lg font-semibold border-2 text-sm transition ${
                          selectedApplication.status === 'Accepted'
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : selectedApplication.status === 'Rejected'
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : selectedApplication.status === 'Pending'
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                            : 'border-blue-500 bg-blue-50 text-blue-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ditinjau">Ditinjau</option>
                        <option value="Shortlist">Shortlist</option>
                        <option value="Interview">Interview</option>
                        <option value="Accepted">Diterima</option>
                        <option value="Rejected">Ditolak</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Document */}
                {(selectedApplication.cvFile || selectedApplication.coverLetter) && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                      Dokumen & Surat Lamaran
                    </h4>

                    {selectedApplication.cvFile && (
                      <div className="mb-4 pb-4 border-b border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Curriculum Vitae (CV)
                        </p>
                        <a
                          href={selectedApplication.cvFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-4 py-2 rounded-lg border border-blue-300 transition"
                        >
                          <ExternalLink className="w-4 h-4" /> Buka CV
                        </a>
                      </div>
                    )}

                    {selectedApplication.coverLetter && (
                      <div>
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Surat Lamaran
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-purple-300 text-sm text-purple-900 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {selectedApplication.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end rounded-b-lg">
                <button
                  onClick={() => setShowApplicationDetailModal(false)}
                  className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
