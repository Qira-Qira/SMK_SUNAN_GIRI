'use client';

import Navbar from '@/components/common/Navbar';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { exportToCSV, exportPPDBToCSV, exportJobPostingsToCSV, exportStatisticsReport } from '@/lib/utils/export';
import {
  BarChart3,
  Download,
  FileText,
  Mic,
  Target,
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  Newspaper,
  Building2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Trophy
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import CountUp from '@/components/common/CountUp';

type TabType = 'dashboard' | 'ppdb' | 'bkk' | 'alumni' | 'users' | 'content';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [ppdbEntries, setPpdbEntries] = useState<any[]>([]);
  const [showPPDBDetailModal, setShowPPDBDetailModal] = useState(false);
  const [selectedPPDBEntry, setSelectedPPDBEntry] = useState<any>(null);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({ perusahaanId: '', jurusanId: '', posisi: '', deskripsi: '', requirements: '', salary: '', lokasi: '', tipePekerjaan: '', deadline: '' });
  const [jobSaving, setJobSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Content management states
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showJurusanModal, setShowJurusanModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedJurusan, setSelectedJurusan] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any>(null);
  // Videos
  const [videos, setVideos] = useState<any[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoForm, setVideoForm] = useState({ title: '', videoUrl: '', thumbnail: '', featured: false });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({ nama: '', alamat: '', telepon: '', email: '', visi: '', misi: '', youtube: '', instagram: '', logo: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroForm, setHeroForm] = useState({ heroTitle: '', heroSubtitle: '', heroDescription: '' });
  const [newsForm, setNewsForm] = useState({ title: '', content: '', thumbnail: '', featured: false, published: true });
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [jurusanForm, setJurusanForm] = useState({ nama: '', deskripsi: '', kode: '', icon: '' });
  const [jurusanLogoFile, setJurusanLogoFile] = useState<File | null>(null);
  const [statsForm, setStatsForm] = useState({
    siswaAktif: '1,200+',
    mitraIndustri: '150+',
    serapanKerja: '95%',
    prestasi: '50+',
    deskripsiSiswa: 'Dari berbagai daerah',
    deskripsiMitra: 'Perusahaan ternama',
    deskripsiSerapan: 'Alumni tersebar industri',
    deskripsiPrestasi: 'Tingkat nasional & internasional',
  });
  const [testimonialForm, setTestimonialForm] = useState({
    nama: '',
    posisi: '',
    perusahaan: '',
    tahunLulus: '',
    testimoni: '',
    rating: 5,
  });

  useEffect(() => {
    fetchStats();
    if (activeTab === 'ppdb') fetchPPDBEntries();
    if (activeTab === 'bkk') fetchJobPostings();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'content') fetchContent();
  }, [activeTab, refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 403 || res.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPPDBEntries = async () => {
    try {
      const res = await fetch('/api/ppdb/register', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPpdbEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching PPDB entries:', error);
    }
  };

  const fetchJobPostings = async () => {
    try {
      const res = await fetch('/api/bkk/job-postings', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setJobPostings(Array.isArray(data) ? data : (data.postings || []));
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers([data.user]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContent = async () => {
    try {
      // Fetch school profile
      const profileRes = await fetch('/api/public/school-profile', {
        credentials: 'include',
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setSchoolProfile(profileData.profile || {});
      }

      // Fetch news
      const newsRes = await fetch('/api/public/news', {
        credentials: 'include',
      });
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData.news || []);
      }

      // Fetch jurusan
      const jurusanRes = await fetch('/api/public/jurusan', {
        credentials: 'include',
      });
      if (jurusanRes.ok) {
        const jurusanData = await jurusanRes.json();
        setJurusan(jurusanData.jurusan || []);
      }

      // Fetch companies (admin only endpoint)
      try {
        const compRes = await fetch('/api/admin/companies', { credentials: 'include' });
        if (compRes.ok) {
          const compData = await compRes.json();
          setCompanies(compData.companies || []);
        }
      } catch (err) {
        // ignore if user not admin
      }

      // Fetch testimonials
      const testimonialRes = await fetch('/api/public/testimonials', {
        credentials: 'include',
      });
      if (testimonialRes.ok) {
        const testimonialData = await testimonialRes.json();
        setTestimonials(testimonialData.testimonials || []);
      }

      // Fetch videos
      const videosRes = await fetch('/api/public/videos', { credentials: 'include' });
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        let vitems = videosData.videos || [];
        vitems.sort((a: any, b: any) => {
          const fb = Number(Boolean(b.featured));
          const fa = Number(Boolean(a.featured));
          if (fb - fa !== 0) return fb - fa;
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });
        setVideos(vitems);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const updatePPDBStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/ppdb/register?id=${id}&status=${status}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating PPDB status:', error);
    }
  };

  const deleteJobPosting = async (id: string) => {
    try {
      const res = await fetch(`/api/bkk/job-postings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting job posting:', error);
    }
  };

  // Content handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = profileForm.logo;
      
      // If a file is selected, upload it first
      if (logoFile) {
        const fd = new FormData();
        fd.append('file', logoFile as any);
        const upRes = await fetch('/api/public/uploads', { method: 'POST', body: fd, credentials: 'include' });
        if (upRes.ok) {
          const upData = await upRes.json();
          logoUrl = upData.url;
        } else {
          toast.error('Gagal upload logo');
          return;
        }
      }
      
      const res = await fetch('/api/public/school-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...profileForm, logo: logoUrl }),
      });
      if (res.ok) {
        setShowProfileModal(false);
        setLogoFile(null);
        setRefreshTrigger(prev => prev + 1);
        toast.success('Profil sekolah berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Gagal menyimpan profil sekolah');
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/school-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(heroForm),
      });
      if (res.ok) {
        setShowHeroModal(false);
        setRefreshTrigger(prev => prev + 1);
        toast.success('Hero section berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      toast.error('Gagal menyimpan hero section');
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If a file is selected, upload it first and set thumbnail URL
      if (newsFile) {
        const fd = new FormData();
        fd.append('file', newsFile as any);
        const upRes = await fetch('/api/public/uploads', { method: 'POST', body: fd, credentials: 'include' });
        if (upRes.ok) {
          const upData = await upRes.json();
          setNewsForm((prev) => ({ ...prev, thumbnail: upData.url }));
        } else {
          toast.error('Gagal mengunggah gambar');
          return;
        }
      }

      if (selectedNews) {
        const res = await fetch(`/api/public/news?id=${selectedNews.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newsForm),
        });
        if (res.ok) {
          setShowNewsModal(false);
          setSelectedNews(null);
          setNewsFile(null);
          setNewsForm({ title: '', content: '', thumbnail: '', featured: false, published: true });
          setRefreshTrigger(prev => prev + 1);
          toast.success('Berita berhasil diperbarui!');
        }
      } else {
        const res = await fetch('/api/public/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newsForm),
        });
        if (res.ok) {
          setShowNewsModal(false);
          setNewsFile(null);
          setNewsForm({ title: '', content: '', thumbnail: '', featured: false, published: true });
          setRefreshTrigger(prev => prev + 1);
          toast.success('Berita berhasil ditambahkan!');
        }
      }
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Gagal menyimpan berita');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      const res = await fetch(`/api/public/news?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Berita berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const handleSaveJurusan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If a logo file was selected, upload it first and set the icon to the uploaded URL
      let iconUrl = jurusanForm.icon || '';
      if (jurusanLogoFile) {
        const fd = new FormData();
        fd.append('file', jurusanLogoFile as any);
        const upRes = await fetch('/api/public/uploads', { method: 'POST', body: fd, credentials: 'include' });
        if (upRes.ok) {
          const upData = await upRes.json();
          iconUrl = upData.url;
        } else {
          toast.error('Gagal mengunggah logo jurusan');
          return;
        }
      }

      const payload = { ...jurusanForm, icon: iconUrl };
      const res = await fetch('/api/public/jurusan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowJurusanModal(false);
        setJurusanForm({ nama: '', deskripsi: '', kode: '', icon: '' });
        setJurusanLogoFile(null);
        setRefreshTrigger(prev => prev + 1);
        toast.success('Jurusan berhasil ditambahkan!');
      }
    } catch (error) {
      console.error('Error saving jurusan:', error);
      toast.error('Gagal menyimpan jurusan');
    }
  };

  const handleDeleteJurusan = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jurusan ini?')) return;
    try {
      const res = await fetch(`/api/public/jurusan?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Jurusan berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting jurusan:', error);
    }
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(statsForm),
      });
      if (res.ok) {
        setShowStatsModal(false);
        setRefreshTrigger(prev => prev + 1);
        toast.success('Statistik berhasil diperbarui!');
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      toast.error('Gagal menyimpan statistik');
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTestimonial) {
        // Update
        const res = await fetch(`/api/public/testimonials?id=${selectedTestimonial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(testimonialForm),
        });
        if (res.ok) {
          setShowTestimonialModal(false);
          setSelectedTestimonial(null);
          setTestimonialForm({ nama: '', posisi: '', perusahaan: '', tahunLulus: '', testimoni: '', rating: 5 });
          setRefreshTrigger(prev => prev + 1);
          toast.success('Testimoni berhasil diperbarui!');
        }
      } else {
        // Create
        const res = await fetch('/api/public/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(testimonialForm),
        });
        if (res.ok) {
          setShowTestimonialModal(false);
          setTestimonialForm({ nama: '', posisi: '', perusahaan: '', tahunLulus: '', testimoni: '', rating: 5 });
          setRefreshTrigger(prev => prev + 1);
          toast.success('Testimoni berhasil ditambahkan!');
        }
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Gagal menyimpan testimoni');
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSaving(true);
    try {
      const res = await fetch('/api/bkk/job-postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
        setShowJobModal(false);
        setJobForm({ perusahaanId: '', jurusanId: '', posisi: '', deskripsi: '', requirements: '', salary: '', lokasi: '', tipePekerjaan: '', deadline: '' });
        setRefreshTrigger(prev => prev + 1);
        toast.success('Lowongan berhasil ditambahkan!');
      } else if (res.status === 403) {
        toast.error('Aksi ditolak: akun perlu role PERUSAHAAN untuk menambahkan lowongan.');
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal menambahkan lowongan');
      }
    } catch (error) {
      console.error('Error saving job posting:', error);
      toast.error('Gagal menyimpan lowongan');
    } finally {
      setJobSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Yakin ingin menghapus testimoni ini?')) return;
    try {
      const res = await fetch(`/api/public/testimonials?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Testimoni berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Gagal menghapus testimoni');
    }
  };

  // Videos handlers
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side required fields
    if (!videoForm.title?.trim() || !videoForm.videoUrl?.trim()) {
      toast.error('Judul dan Link video wajib diisi');
      return;
    }

    try {
      // upload thumbnail if file provided
      let thumbUrl = videoForm.thumbnail || '';
      if (videoFile) {
        const fd = new FormData();
        fd.append('file', videoFile as any);
        const upRes = await fetch('/api/public/uploads', { method: 'POST', body: fd, credentials: 'include' });
        if (upRes.ok) {
          const upData = await upRes.json();
          thumbUrl = upData.url;
        } else {
          toast.error('Gagal mengunggah thumbnail');
          return;
        }
      }

      const payload = { title: videoForm.title, videoUrl: videoForm.videoUrl, thumbnail: thumbUrl, featured: !!videoForm.featured };
      const res = await fetch('/api/public/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        toast.error('Aksi ditolak: silakan login ulang');
        window.location.href = '/login';
        return;
      }

      if (res.ok) {
        setShowVideoModal(false);
        setVideoForm({ title: '', videoUrl: '', thumbnail: '', featured: false });
        setVideoFile(null);
        setRefreshTrigger(prev => prev + 1);
        toast.success('Video berhasil ditambahkan!');
      } else {
        let errMsg = 'Gagal menambahkan video';
        try {
          const err = await res.json();
          errMsg = err?.error || err?.message || errMsg;
        } catch (ee) {
          console.error('Failed to parse error body', ee);
        }
        console.error('Videos POST failed', res.status, res.statusText);
        toast.error(errMsg);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Gagal menyimpan video');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Yakin ingin menghapus video ini?')) return;
    try {
      const res = await fetch(`/api/public/videos?id=${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Video berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Gagal menghapus video');
    }
  };

  if (isLoading) return (
    <div className="p-4 flex items-center justify-center">
      <Loader2 className="animate-spin w-6 h-6" />
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4 text-emerald-900">
        <h1 className="text-3xl font-bold mb-8 text-emerald-900">Admin Dashboard</h1>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-emerald-300">
          {['dashboard', 'ppdb', 'bkk', 'alumni', 'users', 'content'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-2 font-medium transition ${activeTab === tab
                ? 'border-b-2 border-lime-500 text-lime-600'
                : 'text-emerald-600 hover:text-emerald-900'
                }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => exportStatisticsReport(stats)}
                className="bg-lime-500 text-emerald-900 px-6 py-2 rounded hover:bg-lime-600 font-semibold flex items-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" /> Export Laporan Statistik
              </button>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <div className="bg-emerald-600 text-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-2">Total Pendaftar PPDB</h3>
                <p className="text-3xl font-bold">{stats?.totalStats?.ppdbCount || 0}</p>
              </div>
              <div className="bg-lime-500 text-white p-6 rounded shadow font-semibold">
                <h3 className="text-lg font-bold mb-2">Lamaran Kerja</h3>
                <p className="text-3xl font-bold">{stats?.totalStats?.applicationsCount || 0}</p>
              </div>
              <div className="bg-amber-500 text-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-2">Alumni</h3>
                <p className="text-3xl font-bold">{stats?.totalStats?.alumniCount || 0}</p>
              </div>
              <div className="bg-emerald-500 text-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-2">Lowongan Aktif</h3>
                <p className="text-3xl font-bold">{stats?.totalStats?.jobPostingsCount || 0}</p>
              </div>
              <div className="bg-emerald-500 text-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-2">Total Pengguna</h3>
                <p className="text-3xl font-bold">{stats?.totalStats?.usersCount || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow border border-emerald-200">
              <h2 className="text-2xl font-bold mb-4 text-emerald-900">Distribusi Status PPDB</h2>
              <table className="w-full text-left">
                <thead className="bg-emerald-100 border-b border-emerald-300">
                  <tr>
                    <th className="px-4 py-2 text-emerald-900">Status</th>
                    <th className="px-4 py-2 text-emerald-900">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.ppdbDistribution?.map((item: any) => (
                    <tr key={item.status} className="border-t border-emerald-200 text-emerald-800">
                      <td className="px-4 py-2">{item.status}</td>
                      <td className="px-4 py-2">{item._count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PPDB Tab */}
        {activeTab === 'ppdb' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">Manajemen PPDB</h2>
              <div className="space-x-2">
                <button
                  onClick={() => exportPPDBToCSV(ppdbEntries)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-semibold flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </button>
                <button
                  onClick={() => exportToCSV(ppdbEntries, 'PPDB_Export')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm font-semibold flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> Export JSON
                </button>
              </div>
            </div>
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">No. Pendaftaran</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Jurusan Pilihan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ppdbEntries.length > 0 ? (
                    ppdbEntries.map((entry: any) => (
                      <tr key={entry.id} className="border-t hover:bg-emerald-50">
                        <td className="px-4 py-3">{entry.registrationNumber}</td>
                        <td className="px-4 py-3">{entry.fullName}</td>
                        <td className="px-4 py-3 text-sm">{entry.email}</td>
                        <td className="px-4 py-3">{entry.majorChoice1}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${entry.status === 'LULUS' ? 'bg-green-100 text-green-800' :
                            entry.status === 'DITOLAK' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 space-x-2 flex items-center gap-2">
                          
                          <select
                            onChange={(e) => updatePPDBStatus(entry.id, e.target.value)}
                            className="px-2 py-1 text-xs border rounded min-w-max"
                          >
                            <option value="">Update Status</option>
                            <option value="PENDING_VERIFIKASI">Pending</option>
                            <option value="VERIFIKASI_LANJUT">Verifikasi Lanjut</option>
                            <option value="LULUS">Lulus</option>
                            <option value="CADANGAN">Cadangan</option>
                            <option value="DITOLAK">Ditolak</option>
                          </select>
                          <button
                            onClick={() => { setSelectedPPDBEntry(entry); setShowPPDBDetailModal(true); }}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-3 text-center text-emerald-700">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PPDB Detail Modal */}
        {showPPDBDetailModal && selectedPPDBEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Detail Pendaftar PPDB</h3>
                  <p className="text-emerald-100 text-sm mt-1">No. Pendaftaran: {selectedPPDBEntry.registrationNumber}</p>
                </div>
                <button
                  onClick={() => setShowPPDBDetailModal(false)}
                  className="text-white hover:text-emerald-200 text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Data Pribadi */}
                <div className="bg-blue-50 p-5 rounded border-l-4 border-blue-500">
                  <h4 className="text-lg font-bold text-blue-900 mb-4">Data Pribadi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Nama Lengkap</p>
                      <p className="text-blue-900">{selectedPPDBEntry.fullName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Email</p>
                      <p className="text-blue-900">{selectedPPDBEntry.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">NISN</p>
                      <p className="text-blue-900">{selectedPPDBEntry.NISN || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">NIK</p>
                      <p className="text-blue-900">{selectedPPDBEntry.NIK || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Tanggal Lahir</p>
                      <p className="text-blue-900">{selectedPPDBEntry.birthDate ? new Date(selectedPPDBEntry.birthDate).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Tempat Lahir</p>
                      <p className="text-blue-900">{selectedPPDBEntry.birthPlace || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Data Orang Tua */}
                <div className="bg-purple-50 p-5 rounded border-l-4 border-purple-500">
                  <h4 className="text-lg font-bold text-purple-900 mb-4">Data Orang Tua</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-purple-700">Nama Orang Tua</p>
                      <p className="text-purple-900">{selectedPPDBEntry.parentName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-700">Telepon Orang Tua</p>
                      <p className="text-purple-900">{selectedPPDBEntry.parentPhone || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-purple-700">Alamat Orang Tua</p>
                      <p className="text-purple-900">{selectedPPDBEntry.parentAddress || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Data Akademik */}
                <div className="bg-orange-50 p-5 rounded border-l-4 border-orange-500">
                  <h4 className="text-lg font-bold text-orange-900 mb-4">Data Akademik</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Sekolah Asal</p>
                      <p className="text-orange-900">{selectedPPDBEntry.previousSchool || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Rata-rata Nilai</p>
                      <p className="text-orange-900">{selectedPPDBEntry.averageScore || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Pilihan Jurusan 1</p>
                      <p className="text-orange-900">{selectedPPDBEntry.majorChoice1 || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Pilihan Jurusan 2</p>
                      <p className="text-orange-900">{selectedPPDBEntry.majorChoice2 || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="bg-indigo-50 p-5 rounded border-l-4 border-indigo-500">
                  <h4 className="text-lg font-bold text-indigo-900 mb-4">File Dokumen</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Kartu Keluarga (KK)', file: selectedPPDBEntry.kkFile },
                      { label: 'Akta Kelahiran', file: selectedPPDBEntry.aktaFile },
                      { label: 'Rapor Sekolah', file: selectedPPDBEntry.raportFile },
                      { label: 'Ijazah', file: selectedPPDBEntry.ijazahFile },
                      { label: 'Foto Calon Siswa', file: selectedPPDBEntry.fotoCalonFile },
                    ].map((doc) => (
                      <div key={doc.label} className="bg-white p-3 rounded border border-indigo-200">
                        <p className="text-sm font-semibold text-indigo-900 mb-2">{doc.label}</p>
                        {doc.file ? (
                          <>
                            {doc.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <div className="mb-2">
                                <img src={doc.file} alt={doc.label} className="max-h-48 max-w-full rounded border border-indigo-300" />
                              </div>
                            ) : (
                              <p className="text-xs text-indigo-600 mb-2">File: {doc.file.split('/').pop()}</p>
                            )}
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-900 hover:underline inline-flex items-center gap-1"
                            >
                              📥 Unduh File
                            </a>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Belum diupload</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-emerald-50 p-5 rounded border-l-4 border-emerald-500">
                  <h4 className="text-lg font-bold text-emerald-900 mb-4">Status Pendaftaran</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Status Saat Ini</p>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-1 ${
                        selectedPPDBEntry.status === 'LULUS' ? 'bg-green-100 text-green-800' :
                        selectedPPDBEntry.status === 'DITOLAK' ? 'bg-red-100 text-red-800' :
                        selectedPPDBEntry.status === 'CADANGAN' ? 'bg-yellow-100 text-yellow-800' :
                        selectedPPDBEntry.status === 'VERIFIKASI_LANJUT' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPPDBEntry.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">
                      Tanggal Mendaftar: {selectedPPDBEntry.createdAt ? new Date(selectedPPDBEntry.createdAt).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-100 p-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowPPDBDetailModal(false)}
                  className="px-4 py-2 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BKK Tab */}
        {activeTab === 'bkk' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-emerald-900">Manajemen Lowongan Kerja</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setShowJobModal(true)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm font-semibold"
                >
                  Tambah Lowongan
                </button>
                <button
                  onClick={() => exportJobPostingsToCSV(jobPostings)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-semibold flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </button>
                <button
                  onClick={() => exportToCSV(jobPostings, 'JobPostings_Export')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm font-semibold flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> Export JSON
                </button>
              </div>
            </div>
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900">
                  <tr>
                    <th className="px-4 py-3">Posisi</th>
                    <th className="px-4 py-3">Perusahaan</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3">Tanggal Posting</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPostings.length > 0 ? (
                    jobPostings.map((posting: any) => (
                      <tr key={posting.id} className="border-t hover:bg-emerald-50">
                        <td className="px-4 py-3">{posting.position}</td>
                        <td className="px-4 py-3">{posting.company}</td>
                        <td className="px-4 py-3">{posting.location}</td>
                        <td className="px-4 py-3 text-sm">{new Date(posting.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                            Aktif
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteJobPosting(posting.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-3 text-center text-emerald-700">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Add Job Modal */}
            {showJobModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div onClick={() => setShowJobModal(false)} className="absolute inset-0 bg-emerald-50/40"></div>
                <form onSubmit={handleSaveJob} className="relative bg-white rounded shadow max-w-2xl w-full p-6 z-50">
                  <h3 className="text-lg font-bold mb-4 text-emerald-900">Tambah Lowongan Kerja</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-emerald-700">Posisi</label>
                      <input required value={jobForm.posisi} onChange={(e) => setJobForm({ ...jobForm, posisi: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-emerald-700">Lokasi</label>
                      <input value={jobForm.lokasi} onChange={(e) => setJobForm({ ...jobForm, lokasi: e.target.value })} placeholder="Contoh: Jakarta" className="w-full border rounded px-3 py-2 text-emerald-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Perusahaan (pilih perusahaan jika ingin menugaskan ke perusahaan)</label>
                      <select value={jobForm.perusahaanId} onChange={(e) => setJobForm({ ...jobForm, perusahaanId: e.target.value })} className="w-full border rounded px-3 py-2">
                        <option value="">-- Pilih Perusahaan (opsional) --</option>
                        {companies.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.fullName} — {c.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jurusan</label>
                      <select value={jobForm.jurusanId} onChange={(e) => setJobForm({ ...jobForm, jurusanId: e.target.value })} className="w-full border rounded px-3 py-2">
                        <option value="">Tidak spesifik</option>
                        {jurusan.map((j: any) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipe Pekerjaan</label>
                      <input value={jobForm.tipePekerjaan} onChange={(e) => setJobForm({ ...jobForm, tipePekerjaan: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gaji (opsional)</label>
                      <input value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Deadline</label>
                      <input type="date" value={jobForm.deadline} onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Deskripsi</label>
                      <textarea required value={jobForm.deskripsi} onChange={(e) => setJobForm({ ...jobForm, deskripsi: e.target.value })} className="w-full border rounded px-3 py-2 h-32"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Requirements (pisahkan dengan koma)</label>
                      <input value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="submit" disabled={jobSaving} className={`bg-green-600 text-white px-4 py-2 rounded ${jobSaving ? 'opacity-60 cursor-not-allowed' : ''}`}>{jobSaving ? 'Menyimpan...' : 'Simpan'}</button>
                    <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 rounded border">Batal</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Alumni Tab */}
        {activeTab === 'alumni' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Statistik Alumni</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="font-bold text-blue-900">Bekerja</h3>
                <p className="text-3xl font-bold text-blue-600">{stats?.alumniStats?.working || 0}</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                <h3 className="font-bold text-green-900">Melanjutkan Kuliah</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.alumniStats?.studying || 0}</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                <h3 className="font-bold text-purple-900">Wirausaha</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.alumniStats?.entrepreneur || 0}</p>
              </div>
            </div>
            <div className="mt-6 bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Peluang Kerja Terbanyak</h3>
              <div className="space-y-2">
                {stats?.topCompanies?.slice(0, 5).map((item: any) => (
                  <div key={item.company} className="flex justify-between items-center py-2 border-b">
                    <span>{item.company}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{item.count} alumni</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center"><Mic className="w-5 h-5 mr-2 text-indigo-600" /> Testimoni Alumni</h3>
                    <p className="text-emerald-600 mb-4">Kelola testimoni alumni yang tampil di halaman utama</p>
                  </div>
                  <button
                    onClick={() => { setSelectedTestimonial(null); setTestimonialForm({ nama: '', posisi: '', perusahaan: '', tahunLulus: '', testimoni: '', rating: 5 }); setShowTestimonialModal(true); }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                    Tambah Testimoni
                  </button>
                </div>

                {testimonials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {testimonials.map((t: any) => (
                      <div key={t.id} className="bg-emerald-50 p-4 rounded border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold">{t.nama}</h4>
                            <p className="text-sm text-emerald-600 mt-1">{t.posisi} at {t.perusahaan}</p>
                            <p className="text-xs text-emerald-9000 mt-2">{t.tahunLulus}</p>
                            <p className="text-emerald-700 mt-3">"{(t.testimoni || '').substring(0, 150)}..."</p>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button onClick={() => { setSelectedTestimonial(t); setTestimonialForm({ nama: t.nama, posisi: t.posisi, perusahaan: t.perusahaan, tahunLulus: t.tahunLulus, testimoni: t.testimoni, rating: t.rating }); setShowTestimonialModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Edit</button>
                            <button onClick={() => handleDeleteTestimonial(t.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Hapus</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-9000 text-center py-4">Belum ada testimoni</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manajemen Pengguna</h2>
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Terdaftar</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user: any) => (
                      <tr key={user.id} className="border-t hover:bg-emerald-50">
                        <td className="px-4 py-3">{user.name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-4 py-3 text-center text-emerald-9000">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Manajemen Konten</h2>

            {/* Hero Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center"><Target className="w-5 h-5 mr-2 text-indigo-600" /> Hero Section</h3>
                    <p className="text-emerald-600 mb-4">Kelola halaman utama (hero section)</p>
                  </div>
                  <button
                    onClick={() => {
                      setHeroForm({
                        heroTitle: schoolProfile?.heroTitle || '',
                        heroSubtitle: schoolProfile?.heroSubtitle || '',
                        heroDescription: schoolProfile?.heroDescription || '',
                      });
                      setShowHeroModal(true);
                    }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                    Edit Hero
                  </button>
                </div>
                <div className="bg-emerald-50 p-4 rounded">
                  <p><strong>Judul:</strong> {schoolProfile?.heroTitle || '-'}</p>
                  <p><strong>Subtitle:</strong> {schoolProfile?.heroSubtitle || '-'}</p>
                  <p><strong>Deskripsi:</strong> {schoolProfile?.heroDescription || '-'}</p>
                </div>
              </div>
            </div>

            {/* Profil Sekolah Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow border border-emerald-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-emerald-900">Profil Sekolah</h3>
                    <p className="text-emerald-600 text-sm">Kelola informasi resmi dan identitas sekolah</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileForm({
                        nama: schoolProfile?.nama || '',
                        alamat: schoolProfile?.alamat || '',
                        telepon: schoolProfile?.telepon || '',
                        email: schoolProfile?.email || '',
                        visi: schoolProfile?.visi || '',
                        misi: schoolProfile?.misi || '',
                        youtube: schoolProfile?.youtube || '',
                        instagram: schoolProfile?.instagram || '',
                        logo: schoolProfile?.logo || '',
                      });
                      setLogoFile(null);
                      setShowProfileModal(true);
                    }}
                    className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 font-semibold transition">
                    Edit Profil
                  </button>
                </div>
                {schoolProfile && (
                  <div className="space-y-6">
                    {/* Logo & Informasi Dasar */}
                    <div className="bg-emerald-50 p-5 rounded border-l-4 border-emerald-500">
                      <p className="text-sm font-semibold text-emerald-600 mb-3">Logo Sekolah</p>
                      {schoolProfile.logo && (
                        <div className="mb-4">
                          <img 
                            src={schoolProfile.logo} 
                            alt="Logo Sekolah" 
                            className="h-16 w-16 object-contain rounded border border-emerald-300 p-2 bg-white"
                          />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-emerald-600 mb-1">Nama Sekolah</p>
                      <h4 className="text-lg font-bold text-emerald-900 mb-4">{schoolProfile.nama || '-'}</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-semibold text-emerald-600 mb-1">Alamat</p>
                          <p className="text-emerald-800 leading-relaxed">{schoolProfile.alamat || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-600 mb-1">Kontak</p>
                          <div className="space-y-1 text-emerald-800">
                            <p><span className="font-medium">Telepon:</span> {schoolProfile.telepon || '-'}</p>
                            <p><span className="font-medium">Email:</span> {schoolProfile.email || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visi & Misi */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-5 rounded border-l-4 border-blue-500">
                        <h5 className="text-sm font-bold text-blue-900 mb-3 uppercase tracking-wide">Visi</h5>
                        <p className="text-blue-800 leading-relaxed whitespace-pre-line text-sm">{schoolProfile.visi || '-'}</p>
                      </div>
                      <div className="bg-purple-50 p-5 rounded border-l-4 border-purple-500">
                        <h5 className="text-sm font-bold text-purple-900 mb-3 uppercase tracking-wide">Misi</h5>
                        <p className="text-purple-800 leading-relaxed whitespace-pre-line text-sm">{schoolProfile.misi || '-'}</p>
                      </div>
                    </div>

                    {/* Media Sosial */}
                    <div className="bg-indigo-50 p-5 rounded border-l-4 border-indigo-500">
                      <h5 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Tautan Media Sosial</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 mb-1">YouTube</p>
                          {schoolProfile.youtube ? (
                            <a href={schoolProfile.youtube} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:text-indigo-900 break-all text-sm">
                              {schoolProfile.youtube}
                            </a>
                          ) : (
                            <p className="text-indigo-500 text-sm italic">Belum diatur</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 mb-1">Instagram</p>
                          {schoolProfile.instagram ? (
                            <p className="text-indigo-800 text-sm">{schoolProfile.instagram}</p>
                          ) : (
                            <p className="text-indigo-500 text-sm italic">Belum diatur</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Berita Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Berita & Pengumuman</h3>
                    <p className="text-emerald-600 mb-4">Publikasikan berita dan pengumuman sekolah</p>
                  </div>
                  <button
                    onClick={() => { setSelectedNews(null); setShowNewsModal(true); }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Tambah Berita
                  </button>
                </div>

                {news.length > 0 ? (
                  <div className="space-y-3">
                    {news.map((item: any) => (
                      <div key={item.id} className={`p-4 rounded border-l-4 ${item.featured ? 'border-yellow-400 bg-yellow-50' : 'border-green-500 bg-emerald-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold">{item.title}</h4>
                              {item.featured && <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-semibold">Featured</span>}
                            </div>
                            <p className="text-sm text-emerald-600 mt-1">{(item.content || '').substring(0, 100)}...</p>
                            <p className="text-xs text-emerald-9000 mt-2">
                              {new Date(item.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 ml-2">
                            <button
                              onClick={() => { setSelectedNews(item); setNewsForm({ title: item.title, content: item.content, thumbnail: item.thumbnail || '', featured: item.featured || false, published: item.published || false }); setShowNewsModal(true); }}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteNews(item.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/public/news?id=${item.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ featured: !item.featured }),
                                  });
                                  if (res.ok) {
                                    setRefreshTrigger(prev => prev + 1);
                                    toast.success(item.featured ? 'Removed featured' : 'Marked as featured');
                                  } else if (res.status === 401 || res.status === 403) {
                                    toast.error('Aksi ditolak: silakan login ulang');
                                    window.location.href = '/login';
                                  } else {
                                    const err = await res.json();
                                    toast.error(err?.error || 'Gagal memperbarui featured');
                                  }
                                } catch (err) {
                                  console.error('Failed to toggle featured', err);
                                  toast.error('Gagal memperbarui featured');
                                }
                              }}
                              className={`px-3 py-1 rounded text-sm ${item.featured ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300'}`}
                            >
                              {item.featured ? 'Unfeature' : 'Feature'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-9000 text-center py-4">Belum ada berita</p>
                )}
              </div>
            </div>

            {/* Jurusan Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Program Keahlian (Jurusan)</h3>
                    <p className="text-emerald-600 mb-4">Kelola daftar jurusan yang tersedia</p>
                  </div>
                  <button
                    onClick={() => { setSelectedJurusan(null); setShowJurusanModal(true); }}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Tambah Jurusan
                  </button>
                </div>

                {jurusan.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jurusan.map((item: any) => (
                      <div key={item.id} className="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
                        <h4 className="font-bold text-purple-900">{item.nama}</h4>
                        <p className="text-sm text-emerald-600 mt-2">{item.deskripsi}</p>
                        <button
                          onClick={() => handleDeleteJurusan(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 mt-3"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-9000 text-center py-4">Belum ada jurusan</p>
                )}
              </div>
            </div>

            {/* Statistik Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-emerald-600" /> Statistik Sekolah</h3>
                    <p className="text-emerald-600 mb-4">Kelola statistik yang ditampilkan di halaman utama</p>
                  </div>
                  <button
                    onClick={() => setShowStatsModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                    Edit Statistik
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded">
                    <p><strong><Users className="w-4 h-4 inline mr-1 text-orange-600" /> Siswa Aktif:</strong> {(() => {
                      const val = schoolProfile?.siswaAktif || '-';
                      const match = val.match(/^([0-9,.]+)(.*)$/);
                      if (match) {
                        const end = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
                        return <CountUp end={end} suffix={match[2]} />;
                      }
                      return val;
                    })()}</p>
                    <p className="text-sm text-emerald-600 mt-1">{schoolProfile?.deskripsiSiswa || '-'}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p><strong><Building2 className="w-4 h-4 inline mr-1 text-orange-600" /> Mitra Industri:</strong> {(() => {
                      const val = schoolProfile?.mitraIndustri || '-';
                      const match = val.match(/^([0-9,.]+)(.*)$/);
                      if (match) {
                        const end = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
                        return <CountUp end={end} suffix={match[2]} />;
                      }
                      return val;
                    })()}</p>
                    <p className="text-sm text-emerald-600 mt-1">{schoolProfile?.deskripsiMitra || '-'}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p><strong><Briefcase className="w-4 h-4 inline mr-1 text-orange-600" /> Tingkat Serapan Kerja:</strong> {(() => {
                      const val = schoolProfile?.serapanKerja || '-';
                      const match = val.match(/^([0-9,.]+)(.*)$/);
                      if (match) {
                        const end = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
                        return <CountUp end={end} suffix={match[2]} />;
                      }
                      return val;
                    })()}</p>
                    <p className="text-sm text-emerald-600 mt-1">{schoolProfile?.deskripsiSerapan || '-'}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p><strong><Trophy className="w-4 h-4 inline mr-1 text-orange-600" /> Prestasi:</strong> {(() => {
                      const val = schoolProfile?.prestasi || '-';
                      const match = val.match(/^([0-9,.]+)(.*)$/);
                      if (match) {
                        const end = parseInt(match[1].replace(/[^0-9]/g, ''), 10);
                        return <CountUp end={end} suffix={match[2]} />;
                      }
                      return val;
                    })()}</p>
                    <p className="text-sm text-emerald-600 mt-1">{schoolProfile?.deskripsiPrestasi || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Video</h3>
                    <p className="text-emerald-600 mb-4">Kelola video yang tampil di halaman utama</p>
                  </div>
                  <button
                    onClick={() => { setSelectedVideo(null); setVideoForm({ title: '', videoUrl: '', thumbnail: '', featured: false }); setVideoFile(null); setShowVideoModal(true); }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
                    Tambah Video
                  </button>
                </div>

                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {videos.map((v: any) => (
                      <div key={v.id} className={`p-4 rounded border-l-4 ${v.featured ? 'border-yellow-400 bg-yellow-50' : 'border-emerald-500 bg-emerald-50'}`}>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-emerald-900">{v.title}</h4>
                          {v.featured && <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-semibold">Featured</span>}
                        </div>
                        <p className="text-sm text-emerald-600 mt-1">{(v.description || '').substring(0, 100)}...</p>
                        <p className="text-xs text-emerald-9000 mt-2">{v.createdAt ? new Date(v.createdAt).toLocaleDateString('id-ID') : ''}</p>
                        <div className="flex gap-2 mt-3">
                          <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 hover:underline">Tonton</a>
                          <button onClick={() => handleDeleteVideo(v.id)} className="ml-auto bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Hapus</button>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/public/videos', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify({ id: v.id, featured: !v.featured }),
                                });
                                if (res.ok) {
                                  setRefreshTrigger(prev => prev + 1);
                                  toast.success(`${!v.featured ? 'Marked as featured' : 'Removed featured'}`);
                                } else if (res.status === 401 || res.status === 403) {
                                  toast.error('Aksi ditolak: silakan login ulang');
                                  window.location.href = '/login';
                                } else {
                                  const err = await res.json();
                                  toast.error(err?.error || 'Gagal memperbarui featured');
                                }
                              } catch (err) {
                                console.error('Failed to toggle featured', err);
                                toast.error('Gagal memperbarui featured');
                              }
                            }}
                            className={`px-3 py-1 rounded text-sm ${v.featured ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300'}`}
                          >
                            {v.featured ? 'Unfeature' : 'Feature'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-9000 text-center py-4">Belum ada video</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-emerald-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900">Edit Profil Sekolah</h3>
                  <p className="text-emerald-600 text-sm mt-1">Kelola informasi dan identitas resmi sekolah Anda</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="text-emerald-500 hover:text-emerald-700 text-2xl font-light"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                {/* Informasi Dasar */}
                <div className="bg-emerald-50 p-5 rounded border border-emerald-200">
                  <h4 className="text-lg font-bold text-emerald-900 mb-4">Informasi Dasar</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-800 mb-2">Nama Sekolah</label>
                      <input
                        type="text"
                        value={profileForm.nama}
                        onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                        className="w-full border border-emerald-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Masukkan nama sekolah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-800 mb-2">Alamat</label>
                      <textarea
                        value={profileForm.alamat}
                        onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                        className="w-full border border-emerald-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        rows={3}
                        placeholder="Masukkan alamat lengkap sekolah"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-emerald-800 mb-2">Nomor Telepon</label>
                        <input
                          type="text"
                          value={profileForm.telepon}
                          onChange={(e) => setProfileForm({ ...profileForm, telepon: e.target.value })}
                          className="w-full border border-emerald-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          placeholder="Contoh: (021) 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-800 mb-2">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full border border-emerald-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          placeholder="Contoh: info@sekolah.ac.id"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visi & Misi */}
                <div className="bg-blue-50 p-5 rounded border border-blue-200">
                  <h4 className="text-lg font-bold text-blue-900 mb-4">Visi & Misi</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Visi Sekolah</label>
                      <textarea
                        value={profileForm.visi}
                        onChange={(e) => setProfileForm({ ...profileForm, visi: e.target.value })}
                        className="w-full border border-blue-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        rows={4}
                        placeholder="Tuliskan visi sekolah..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-800 mb-2">Misi Sekolah</label>
                      <textarea
                        value={profileForm.misi}
                        onChange={(e) => setProfileForm({ ...profileForm, misi: e.target.value })}
                        className="w-full border border-blue-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        rows={5}
                        placeholder="Tuliskan misi sekolah (pisahkan setiap misi dengan baris baru)..."
                      />
                      <p className="text-xs text-blue-600 mt-2">💡 Tip: Pisahkan setiap misi dengan baris baru untuk tampilan yang lebih rapi</p>
                    </div>
                  </div>
                </div>

                {/* Logo Sekolah */}
                <div className="bg-purple-50 p-5 rounded border border-purple-200">
                  <h4 className="text-lg font-bold text-purple-900 mb-4">Logo Sekolah</h4>
                  <div className="space-y-4">
                    {profileForm.logo && !logoFile && (
                      <div className="relative inline-block">
                        <img 
                          src={profileForm.logo} 
                          alt="Logo Preview" 
                          className="h-24 w-24 object-contain rounded border-2 border-purple-300"
                        />
                      </div>
                    )}
                    {logoFile && (
                      <div className="relative inline-block">
                        <img 
                          src={URL.createObjectURL(logoFile)} 
                          alt="Logo Preview" 
                          className="h-24 w-24 object-contain rounded border-2 border-purple-300"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-purple-800 mb-2">Upload Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                        className="w-full border-2 border-dashed border-purple-300 rounded px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      />
                      <p className="text-xs text-purple-600 mt-2">Ukuran rekomendasi: 200x200px atau lebih, format PNG/JPG</p>
                    </div>
                  </div>
                </div>

                {/* Media Sosial */}
                <div className="bg-indigo-50 p-5 rounded border border-indigo-200">
                  <h4 className="text-lg font-bold text-indigo-900 mb-4">Media Sosial</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-indigo-800 mb-2">🎥 Link YouTube</label>
                      <input
                        type="text"
                        value={profileForm.youtube}
                        onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })}
                        className="w-full border border-indigo-300 rounded px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="https://youtube.com/@sekolah"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-indigo-800 mb-2">📷 Link Instagram</label>
                      <input
                        type="text"
                        value={profileForm.instagram}
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        className="w-full border border-indigo-300 rounded px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="https://www.instagram.com/sekolah_official"
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-3 justify-end pt-4 border-t border-emerald-200">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-2 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 font-semibold transition shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hero Modal */}
        {showHeroModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Edit Hero Section</h3>
              <form onSubmit={handleSaveHero}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Judul Hero</label>
                  <input
                    type="text"
                    value={heroForm.heroTitle}
                    onChange={(e) => setHeroForm({ ...heroForm, heroTitle: e.target.value })}
                    placeholder="Masukkan judul hero section"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={heroForm.heroSubtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, heroSubtitle: e.target.value })}
                    placeholder="Masukkan subtitle hero section"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={heroForm.heroDescription}
                    onChange={(e) => setHeroForm({ ...heroForm, heroDescription: e.target.value })}
                    placeholder="Masukkan deskripsi hero section"
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Simpan</button>
                  <button type="button" onClick={() => setShowHeroModal(false)} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* News Modal */}
        {showNewsModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Tambah Berita</h3>
              <form onSubmit={handleSaveNews}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Judul Berita</label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    placeholder="Masukkan judul berita"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Konten</label>
                  <textarea
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    placeholder="Masukkan konten berita"
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Thumbnail (URL atau upload)</label>
                  <input
                    type="text"
                    value={newsForm.thumbnail}
                    onChange={(e) => setNewsForm({ ...newsForm, thumbnail: e.target.value })}
                    placeholder="Masukkan URL gambar atau gunakan upload di bawah"
                    className="w-full border rounded px-3 py-2 mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewsFile(file);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={newsForm.featured} onChange={(e) => setNewsForm({ ...newsForm, featured: e.target.checked })} />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={newsForm.published} onChange={(e) => setNewsForm({ ...newsForm, published: e.target.checked })} />
                    <span className="text-sm">Published</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Simpan</button>
                  <button type="button" onClick={() => setShowNewsModal(false)} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jurusan Modal */}
        {showJurusanModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Tambah Jurusan</h3>
              <form onSubmit={handleSaveJurusan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Nama Jurusan</label>
                  <input
                    type="text"
                    value={jurusanForm.nama}
                    onChange={(e) => setJurusanForm({ ...jurusanForm, nama: e.target.value })}
                    placeholder="Masukkan nama jurusan"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={jurusanForm.deskripsi}
                    onChange={(e) => setJurusanForm({ ...jurusanForm, deskripsi: e.target.value })}
                    placeholder="Masukkan deskripsi jurusan"
                    rows={4}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Kode Jurusan</label>
                  <input
                    type="text"
                    value={jurusanForm.kode}
                    onChange={(e) => setJurusanForm({ ...jurusanForm, kode: e.target.value })}
                    placeholder="Masukkan kode jurusan (misal: TI)"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Logo Jurusan (PNG/JPG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setJurusanLogoFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                  {jurusanLogoFile && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(jurusanLogoFile)} alt="preview" className="w-20 h-20 object-cover rounded" />
                    </div>
                  )}
                  {!jurusanLogoFile && jurusanForm.icon && (
                    <div className="mt-2">
                      <img src={jurusanForm.icon} alt="logo" className="w-20 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">Simpan</button>
                  <button type="button" onClick={() => setShowJurusanModal(false)} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Tambah Video</h3>
              <form onSubmit={handleSaveVideo}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Judul</label>
                  <input type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Link Video (YouTube)</label>
                  <input type="text" value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Thumbnail (URL atau upload)</label>
                  <input type="text" value={videoForm.thumbnail} onChange={(e) => setVideoForm({ ...videoForm, thumbnail: e.target.value })} placeholder="URL thumbnail (opsional)" className="w-full border rounded px-3 py-2 mb-2" />
                  <input type="file" accept="image/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full" />
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={videoForm.featured} onChange={(e) => setVideoForm({ ...videoForm, featured: e.target.checked })} />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Simpan</button>
                  <button type="button" onClick={() => setShowVideoModal(false)} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Testimonial Modal */}
        {showTestimonialModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{selectedTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni'}</h3>
              <form onSubmit={handleSaveTestimonial}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama</label>
                    <input type="text" value={testimonialForm.nama} onChange={(e) => setTestimonialForm({ ...testimonialForm, nama: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Posisi</label>
                    <input type="text" value={testimonialForm.posisi} onChange={(e) => setTestimonialForm({ ...testimonialForm, posisi: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Perusahaan</label>
                    <input type="text" value={testimonialForm.perusahaan} onChange={(e) => setTestimonialForm({ ...testimonialForm, perusahaan: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tahun Lulus</label>
                    <input type="text" value={testimonialForm.tahunLulus} onChange={(e) => setTestimonialForm({ ...testimonialForm, tahunLulus: e.target.value })} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Testimoni</label>
                    <textarea value={testimonialForm.testimoni} onChange={(e) => setTestimonialForm({ ...testimonialForm, testimoni: e.target.value })} className="w-full border rounded px-3 py-2" rows={4} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <select value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })} className="w-full border rounded px-3 py-2">
                      <option value={5}>5</option>
                      <option value={4}>4</option>
                      <option value={3}>3</option>
                      <option value={2}>2</option>
                      <option value={1}>1</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">Simpan</button>
                  <button type="button" onClick={() => { setShowTestimonialModal(false); setSelectedTestimonial(null); }} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Modal */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-emerald-50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow max-w-2xl w-full max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit Statistik Sekolah</h3>
              <form onSubmit={handleSaveStats}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Siswa Aktif (Nilai)</label>
                    <input
                      type="text"
                      value={statsForm.siswaAktif}
                      onChange={(e) => setStatsForm({ ...statsForm, siswaAktif: e.target.value })}
                      placeholder="Contoh: 1,200+"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Siswa Aktif (Deskripsi)</label>
                    <input
                      type="text"
                      value={statsForm.deskripsiSiswa}
                      onChange={(e) => setStatsForm({ ...statsForm, deskripsiSiswa: e.target.value })}
                      placeholder="Contoh: Dari berbagai daerah"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mitra Industri (Nilai)</label>
                    <input
                      type="text"
                      value={statsForm.mitraIndustri}
                      onChange={(e) => setStatsForm({ ...statsForm, mitraIndustri: e.target.value })}
                      placeholder="Contoh: 150+"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mitra Industri (Deskripsi)</label>
                    <input
                      type="text"
                      value={statsForm.deskripsiMitra}
                      onChange={(e) => setStatsForm({ ...statsForm, deskripsiMitra: e.target.value })}
                      placeholder="Contoh: Perusahaan ternama"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tingkat Serapan Kerja (Nilai)</label>
                    <input
                      type="text"
                      value={statsForm.serapanKerja}
                      onChange={(e) => setStatsForm({ ...statsForm, serapanKerja: e.target.value })}
                      placeholder="Contoh: 95%"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tingkat Serapan Kerja (Deskripsi)</label>
                    <input
                      type="text"
                      value={statsForm.deskripsiSerapan}
                      onChange={(e) => setStatsForm({ ...statsForm, deskripsiSerapan: e.target.value })}
                      placeholder="Contoh: Alumni tersebar industri"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prestasi (Nilai)</label>
                    <input
                      type="text"
                      value={statsForm.prestasi}
                      onChange={(e) => setStatsForm({ ...statsForm, prestasi: e.target.value })}
                      placeholder="Contoh: 50+"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prestasi (Deskripsi)</label>
                    <input
                      type="text"
                      value={statsForm.deskripsiPrestasi}
                      onChange={(e) => setStatsForm({ ...statsForm, deskripsiPrestasi: e.target.value })}
                      placeholder="Contoh: Tingkat nasional & internasional"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button type="submit" className="flex-1 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Simpan</button>
                  <button type="button" onClick={() => setShowStatsModal(false)} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
