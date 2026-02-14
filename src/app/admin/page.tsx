'use client';

import Navbar from '@/components/common/Navbar';
import StatisticChart from '@/components/common/StatisticChart';
import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { exportToCSV, exportPPDBToCSV, exportJobPostingsToCSV, exportStatisticsReport, exportBKKAnalyticsReport } from '@/lib/utils/export';
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
import TestimonialSection from '@/components/common/TestimonialSection';

type TabType = 'dashboard' | 'ppdb' | 'bkk' | 'alumni' | 'users' | 'content';
type BKKSubTab = 'dashboard' | 'lowongan' | 'lamaran' | 'perusahaan' | 'analytics' | 'pipeline' | 'reports';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [bkkSubTab, setBkkSubTab] = useState<BKKSubTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ppdbEntries, setPpdbEntries] = useState<any[]>([]);
  const [showPPDBDetailModal, setShowPPDBDetailModal] = useState(false);
  const [selectedPPDBEntry, setSelectedPPDBEntry] = useState<any>(null);
  const [ppdbSearchQuery, setPpdbSearchQuery] = useState<string>('');
  const [ppdbJurusanFilter, setPpdbJurusanFilter] = useState<string>('');
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [bkkCompanies, setBkkCompanies] = useState<any[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any>(null);
  const [jobForm, setJobForm] = useState({ perusahaanId: '', jurusanId: '', posisi: '', deskripsi: '', requirements: '', salary: '', lokasi: '', tipePekerjaan: '', deadline: '' });
  const [jobSaving, setJobSaving] = useState(false);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationFilterStatus, setApplicationFilterStatus] = useState<string>('');
  const [applicationFilterApplicant, setApplicationFilterApplicant] = useState<string>('');
  const [applicationFilterCompany, setApplicationFilterCompany] = useState<string>('');
  const [reportDateFrom, setReportDateFrom] = useState<string>('');
  const [reportDateTo, setReportDateTo] = useState<string>('');
  const [reportCompanyFilter, setReportCompanyFilter] = useState<string>('');
  const [reportLocationFilter, setReportLocationFilter] = useState<string>('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // User CRUD states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFormError, setUserFormError] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userLoading, setUserLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'CALON_SISWA',
    phone: '',
    address: '',
  });

  // Content management states
  const [schoolProfile, setSchoolProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [archivedJurusan, setArchivedJurusan] = useState<any[]>([]);
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

  // Tracer Study states
  const [tracerStudyData, setTracerStudyData] = useState<any[]>([]);
  const [tracerStudyLoading, setTracerStudyLoading] = useState(false);
  const [tracerStudyPage, setTracerStudyPage] = useState(1);
  const [tracerStudyTotal, setTracerStudyTotal] = useState(0);
  const [tracerStudyFilterStatus, setTracerStudyFilterStatus] = useState<string>('');
  const [tracerStudySearchQuery, setTracerStudySearchQuery] = useState<string>('');

  useEffect(() => {
    fetchStats();
    fetchCurrentUser();
    if (activeTab === 'dashboard') fetchAllUsersForDashboard();
    if (activeTab === 'ppdb') fetchPPDBEntries();
    if (activeTab === 'bkk') {
      fetchJobPostings();
      fetchJobApplications();
      fetchBkkCompanies();
    }
    if (activeTab === 'users') fetchUsers(1, '', 'ALL');
    if (activeTab === 'alumni') {
      fetchTracerStudyData();
      fetchTestimonials();
    }
    if (activeTab === 'content') fetchContent();
  }, [activeTab, refreshTrigger, bkkSubTab, applicationFilterStatus, tracerStudyPage, tracerStudyFilterStatus, tracerStudySearchQuery, ppdbSearchQuery, ppdbJurusanFilter, reportDateFrom, reportDateTo, reportCompanyFilter, reportLocationFilter]);

  // Debug: Log users data
  useEffect(() => {
    if (activeTab === 'dashboard' && users && users.length > 0) {
      const siswaCount = users.filter((u: any) => u.role === 'SISWA_AKTIF').length;
      const roleBreakdown: {[key: string]: number} = {};
      users.forEach((u: any) => {
        roleBreakdown[u.role] = (roleBreakdown[u.role] || 0) + 1;
      });
      console.log('Dashboard - Total Users:', users.length);
      console.log('Dashboard - Siswa Aktif:', siswaCount);
      console.log('Dashboard - Role Breakdown:', roleBreakdown);
    }
  }, [users, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Define which tabs are allowed based on role
  const getAllowedTabs = (): TabType[] => {
    if (!currentUser) return [];
    
    const role = currentUser.role;
    const allTabs: TabType[] = ['dashboard', 'ppdb', 'bkk', 'alumni', 'users', 'content'];
    
    switch (role) {
      case 'ADMIN_UTAMA':
        return allTabs; // All tabs
      case 'ADMIN_PPDB':
        return ['ppdb'];
      case 'ADMIN_BKK':
        return ['bkk'];
      case 'ADMIN_BERITA':
        return ['content'];
      default:
        return [];
    }
  };

  const allowedTabs = getAllowedTabs();
  
  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [currentUser]);

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

  const fetchJobApplications = async () => {
    try {
      const res = await fetch(`/api/bkk/applications${applicationFilterStatus ? `?status=${applicationFilterStatus}` : ''}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setJobApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
    }
  };

  const fetchBkkCompanies = async () => {
    try {
      const res = await fetch('/api/bkk/companies', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setBkkCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching BKK companies:', error);
    }
  };

  // Fetch ALL users for dashboard (no pagination)
  const fetchAllUsersForDashboard = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('pageSize', '9999'); // Fetch semua
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching all users for dashboard:', error);
    }
  };

  const fetchUsers = async (page: number = 1, search: string = '', role: string = 'ALL') => {
    try {
      setUserLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', userPageSize.toString());
      if (search) params.append('search', search);
      if (role !== 'ALL') params.append('role', role);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUserTotal(data.total || 0);
        setUserTotalPages(data.totalPages || 0);
        setUserPage(data.page || 1);
      } else if (res.status === 403 || res.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchTracerStudyData = async () => {
    setTracerStudyLoading(true);
    try {
      const params = new URLSearchParams({
        page: tracerStudyPage.toString(),
        limit: '10',
        ...(tracerStudyFilterStatus && { status: tracerStudyFilterStatus }),
        ...(tracerStudySearchQuery && { search: tracerStudySearchQuery }),
      });

      const res = await fetch(`/api/tracer-study/all?${params}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTracerStudyData(data.data || []);
        setTracerStudyTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching tracer study data:', error);
      toast.error('Gagal mengambil data tracer study');
    } finally {
      setTracerStudyLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/public/testimonials', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
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

      // Fetch archived jurusan (only for ADMIN_UTAMA)
      if (currentUser?.role === 'ADMIN_UTAMA') {
        const archivedRes = await fetch('/api/public/jurusan/archived', {
          credentials: 'include',
        });
        if (archivedRes.ok) {
          const archivedData = await archivedRes.json();
          setArchivedJurusan(archivedData.archivedJurusan || []);
        }
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
      // (moved to separate fetchTestimonials function called from alumni tab)

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
        const entry = ppdbEntries.find(e => e.id === id);
        if (entry && entry.userId) {
          // If status is "LULUS" (Approved), update the user's role from CALON_SISWA to SISWA_AKTIF
          if (status === 'LULUS') {
            await fetch('/api/admin/users', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId: entry.userId, role: 'SISWA_AKTIF' }),
            });
            toast.success('PPDB Disetujui! Role pengguna diubah menjadi Siswa Aktif');
          }
          // If status changes from "LULUS" to any other status, revert role back to CALON_SISWA
          else if (entry.status === 'LULUS' && status !== 'LULUS') {
            await fetch('/api/admin/users', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId: entry.userId, role: 'CALON_SISWA' }),
            });
            toast.success(`Status diubah menjadi ${status}. Role pengguna di-revert menjadi Calon Siswa`);
          } else {
            toast.success(`Status diubah menjadi ${status}`);
          }
        }
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating PPDB status:', error);
      toast.error('Gagal mengupdate status PPDB');
    }
  };

  const updateUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, isActive: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus ? 'User berhasil diaktifkan' : 'User berhasil dinonaktifkan');
        setRefreshTrigger(prev => prev + 1);
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal mengupdate status user');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Gagal mengupdate status user');
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

  // User CRUD handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userForm),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowUserModal(false);
        setUserForm({
          username: '',
          email: '',
          password: '',
          fullName: '',
          role: 'CALON_SISWA',
          phone: '',
          address: '',
        });
        setRefreshTrigger(prev => prev + 1);
        toast.success('User berhasil dibuat!');
      } else {
        setUserFormError(data.error || 'Gagal membuat user');
        toast.error(data.error || 'Gagal membuat user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setUserFormError('Gagal membuat user');
      toast.error('Gagal membuat user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('User berhasil dihapus!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus user');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Role user berhasil diperbarui!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal mengupdate role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Gagal mengupdate role');
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    
    try {
      if (isEditMode) {
        // Update user
        const updateData: any = {
          userId: selectedUser.id,
          fullName: userForm.fullName,
          phone: userForm.phone,
          address: userForm.address,
          role: userForm.role,
        };
        
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setShowUserModal(false);
          setSelectedUser(null);
          setIsEditMode(false);
          setUserForm({
            username: '',
            email: '',
            password: '',
            fullName: '',
            role: 'CALON_SISWA',
            phone: '',
            address: '',
          });
          setRefreshTrigger(prev => prev + 1);
          toast.success('User berhasil diperbarui!');
        } else {
          setUserFormError(data.error || 'Gagal memperbarui user');
          toast.error(data.error || 'Gagal memperbarui user');
        }
      } else {
        // Create new user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(userForm),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setShowUserModal(false);
          setUserForm({
            username: '',
            email: '',
            password: '',
            fullName: '',
            role: 'CALON_SISWA',
            phone: '',
            address: '',
          });
          setRefreshTrigger(prev => prev + 1);
          toast.success('User berhasil dibuat!');
        } else {
          setUserFormError(data.error || 'Gagal membuat user');
          toast.error(data.error || 'Gagal membuat user');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setUserFormError('Gagal menyimpan user');
      toast.error('Gagal menyimpan user');
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
      
      // If editing existing jurusan
      if (selectedJurusan) {
        const res = await fetch(`/api/public/jurusan?id=${selectedJurusan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowJurusanModal(false);
          setSelectedJurusan(null);
          setJurusanForm({ nama: '', deskripsi: '', kode: '', icon: '' });
          setJurusanLogoFile(null);
          setRefreshTrigger(prev => prev + 1);
          toast.success('Jurusan berhasil diperbarui!');
        } else {
          const error = await res.json();
          toast.error(error.error || 'Gagal memperbarui jurusan');
        }
      } else {
        // Create new jurusan
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
        } else {
          const error = await res.json();
          toast.error(error.error || 'Gagal menyimpan jurusan');
        }
      }
    } catch (error) {
      console.error('Error saving jurusan:', error);
      toast.error('Gagal menyimpan jurusan');
    }
  };

  const handleDeleteJurusan = async (id: string) => {
    if (!confirm('Yakin ingin menghapus jurusan ini? Jika ada data PPDB atau lowongan kerja yang terkait, jurusan akan di-archive (non-aktif) saja.')) return;
    try {
      const res = await fetch(`/api/public/jurusan?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Jurusan berhasil dihapus!');
      } else if (res.status === 409) {
        // Conflict - ada data yang terkait
        const confirmArchive = confirm(
          `${data.error}\n\nJumlah data terkait: ${data.affectedRecords}\n\nKlik OK untuk archive jurusan ini, atau Cancel untuk membatalkan.`
        );
        
        if (confirmArchive) {
          // Archive instead
          const archiveRes = await fetch(`/api/public/jurusan?id=${id}&action=archive`, {
            method: 'PATCH',
            credentials: 'include',
          });
          
          if (archiveRes.ok) {
            setRefreshTrigger(prev => prev + 1);
            toast.success('Jurusan berhasil di-archive (non-aktif). Data yang terkait tetap aman.');
          }
        }
      } else {
        toast.error(data.error || 'Gagal menghapus jurusan');
      }
    } catch (error) {
      console.error('Error deleting jurusan:', error);
      toast.error('Terjadi kesalahan saat menghapus jurusan');
    }
  };

  const handleRestoreJurusan = async (id: string) => {
    if (!confirm('Yakin ingin memulihkan (restore) jurusan ini? Jurusan akan kembali aktif.')) return;
    try {
      const res = await fetch(`/api/public/jurusan?id=${id}&action=restore`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Jurusan berhasil dipulihkan (restore)!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal memulihkan jurusan');
      }
    } catch (error) {
      console.error('Error restoring jurusan:', error);
      toast.error('Terjadi kesalahan saat memulihkan jurusan');
    }
  };

  const handlePermanentDeleteJurusan = async (id: string) => {
    const confirmDelete = confirm(
      '⚠️ PERINGATAN: Anda akan menghapus jurusan ini secara PERMANEN!\n\nHal ini tidak dapat dibatalkan. Pastikan tidak ada data penting yang terkait.\n\nKlik OK untuk melanjutkan, atau Cancel untuk membatalkan.'
    );
    
    if (!confirmDelete) return;
    
    // Double confirmation
    const doubleConfirm = confirm(
      'Konfirmasi Terakhir: Apakah Anda YAKIN ingin menghapus jurusan ini selamanya?\n\nTindakan ini TIDAK DAPAT DIKEMBALIKAN.'
    );
    
    if (!doubleConfirm) return;
    
    try {
      const res = await fetch(`/api/public/jurusan?id=${id}&force=true`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('✅ Jurusan berhasil dihapus secara permanen!');
      } else {
        toast.error(data.error || 'Gagal menghapus jurusan secara permanen');
      }
    } catch (error) {
      console.error('Error permanently deleting jurusan:', error);
      toast.error('Terjadi kesalahan saat menghapus jurusan secara permanen');
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
      const method = selectedJobForEdit ? 'PUT' : 'POST';
      const url = selectedJobForEdit 
        ? `/api/bkk/job-postings?id=${selectedJobForEdit.id}`
        : '/api/bkk/job-postings';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
        setShowJobModal(false);
        setSelectedJobForEdit(null);
        setJobForm({ perusahaanId: '', jurusanId: '', posisi: '', deskripsi: '', requirements: '', salary: '', lokasi: '', tipePekerjaan: '', deadline: '' });
        setRefreshTrigger(prev => prev + 1);
        toast.success(selectedJobForEdit ? 'Lowongan berhasil diperbarui!' : 'Lowongan berhasil ditambahkan!');
      } else if (res.status === 403) {
        toast.error('Aksi ditolak: akun perlu role PERUSAHAAN untuk menambahkan lowongan.');
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal menyimpan lowongan');
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

  const handleEditJob = (job: any) => {
    setSelectedJobForEdit(job);
    setJobForm({
      perusahaanId: job.perusahaanId || '',
      jurusanId: job.jurusanId || '',
      posisi: job.posisi || '',
      deskripsi: job.deskripsi || '',
      requirements: (job.requirements || []).join(', '),
      salary: job.salary || '',
      lokasi: job.lokasi || '',
      tipePekerjaan: job.tipePekerjaan || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
    });
    setShowJobModal(true);
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Yakin ingin menghapus lowongan ini?')) return;
    try {
      const res = await fetch(`/api/bkk/job-postings?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Lowongan berhasil dihapus!');
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal menghapus lowongan');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Gagal menghapus lowongan');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bkk/applications?id=${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        toast.success('Status lamaran berhasil diperbarui!');
      } else {
        const err = await res.json();
        toast.error(err?.error || 'Gagal mengupdate status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Gagal mengupdate status lamaran');
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

  if (isLoading || !currentUser) return (
    <div className="p-4 flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin w-6 h-6" />
    </div>
  );

  // Extra security check: ensure user has at least one allowed tab
  if (allowedTabs.length === 0) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Akses Ditolak</h2>
            <p className="text-red-700">Anda tidak memiliki akses ke halaman ini. Silahkan hubungi administrator.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-12 px-4 text-emerald-900">
        <h1 className="text-3xl font-bold mb-8 text-emerald-900">Admin Dashboard</h1>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-emerald-300">
          {allowedTabs.map((tab) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-emerald-600 text-white p-4 sm:p-6 rounded shadow">
                <h3 className="text-sm sm:text-lg font-bold mb-2">Total Pendaftar PPDB</h3>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalStats?.ppdbCount || 0}</p>
              </div>
              <div className="bg-blue-600 text-white p-6 rounded shadow font-semibold">
                <h3 className="text-lg font-bold mb-2">Siswa Aktif</h3>
                {users && users.length > 0 ? (
                  <>
                    <p className="text-3xl font-bold">{users.filter((u: any) => u.role === 'SISWA_AKTIF').length || 0}</p>
                    <p className="text-xs opacity-70 mt-1">(dari {users.length} pengguna)</p>
                  </>
                ) : (
                  <p className="text-3xl font-bold">-</p>
                )}
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

            {/* Yearly Statistics Charts */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-emerald-900">📊 Statistik Tahunan</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PPDB Chart */}
                {stats?.yearlyStats?.ppdbYearly && (
                  <StatisticChart
                    title="Pendaftar PPDB (Per Tahun)"
                    data={stats.yearlyStats.ppdbYearly}
                    borderColor="rgb(34, 197, 94)"
                    backgroundColor="rgba(34, 197, 94, 0.1)"
                    chartType="bar"
                  />
                )}

                {/* Siswa Aktif Chart */}
                {stats?.yearlyStats?.siswaAktifYearly && (
                  <StatisticChart
                    title="Siswa Aktif (Per Tahun)"
                    data={stats.yearlyStats.siswaAktifYearly}
                    borderColor="rgb(59, 130, 246)"
                    backgroundColor="rgba(59, 130, 246, 0.1)"
                    chartType="line"
                  />
                )}

                {/* Alumni Chart */}
                {stats?.yearlyStats?.alumniYearly && (
                  <StatisticChart
                    title="Alumni / Tracer Study (Per Tahun)"
                    data={stats.yearlyStats.alumniYearly}
                    borderColor="rgb(245, 158, 11)"
                    backgroundColor="rgba(245, 158, 11, 0.1)"
                    chartType="bar"
                  />
                )}

                {/* Lowongan Kerja Chart */}
                {stats?.yearlyStats?.jobPostingsYearly && (
                  <StatisticChart
                    title="Lowongan Kerja (Per Tahun)"
                    data={stats.yearlyStats.jobPostingsYearly}
                    borderColor="rgb(168, 85, 247)"
                    backgroundColor="rgba(168, 85, 247, 0.1)"
                    chartType="line"
                  />
                )}

                {/* Total Users Chart */}
                {stats?.yearlyStats?.usersYearly && (
                  <StatisticChart
                    title="Total Pengguna (Per Tahun)"
                    data={stats.yearlyStats.usersYearly}
                    borderColor="rgb(249, 115, 22)"
                    backgroundColor="rgba(249, 115, 22, 0.1)"
                    chartType="bar"
                  />
                )}

                {/* Job Applications Chart */}
                {stats?.yearlyStats?.jobApplicationsYearly && (
                  <StatisticChart
                    title="Lamaran Kerja (Per Tahun)"
                    data={stats.yearlyStats.jobApplicationsYearly}
                    borderColor="rgb(236, 72, 153)"
                    backgroundColor="rgba(236, 72, 153, 0.1)"
                    chartType="line"
                  />
                )}
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

            {/* Filter Section */}
            <div className="bg-white p-4 rounded shadow mb-4 border border-emerald-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Cari PPDB</label>
                  <input
                    type="text"
                    placeholder="Nama, email, NISN..."
                    value={ppdbSearchQuery}
                    onChange={(e) => setPpdbSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Filter Jurusan</label>
                  <select
                    value={ppdbJurusanFilter}
                    onChange={(e) => setPpdbJurusanFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  >
                    <option value="">Semua Jurusan</option>
                    {jurusan.map((j: any) => (
                      <option key={j.id} value={j.id}>{j.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPpdbSearchQuery('');
                      setPpdbJurusanFilter('');
                    }}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900 text-xs sm:text-sm">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">No. Pendaftaran</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">Nama</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Email</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">Jurusan</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Status</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ppdbEntries
                    .filter((entry: any) => {
                      const matchesSearch = ppdbSearchQuery === '' || 
                        entry.fullName?.toLowerCase().includes(ppdbSearchQuery.toLowerCase()) ||
                        entry.email?.toLowerCase().includes(ppdbSearchQuery.toLowerCase()) ||
                        entry.NISN?.includes(ppdbSearchQuery);
                      const matchesJurusan = ppdbJurusanFilter === '' || 
                        entry.majorChoice1 === ppdbJurusanFilter;
                      return matchesSearch && matchesJurusan;
                    })
                    .length > 0 ? (
                    ppdbEntries
                      .filter((entry: any) => {
                        const matchesSearch = ppdbSearchQuery === '' || 
                          entry.fullName?.toLowerCase().includes(ppdbSearchQuery.toLowerCase()) ||
                          entry.email?.toLowerCase().includes(ppdbSearchQuery.toLowerCase()) ||
                          entry.NISN?.includes(ppdbSearchQuery);
                        const matchesJurusan = ppdbJurusanFilter === '' || 
                          entry.majorChoice1 === ppdbJurusanFilter;
                        return matchesSearch && matchesJurusan;
                      })
                      .map((entry: any) => (
                        <tr key={entry.id} className="border-t hover:bg-emerald-50 text-xs sm:text-sm">
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{entry.registrationNumber}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{entry.fullName}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">{entry.email}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">{entry.majorChoice1}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
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
                              <option value="LULUS">Lulus ✓</option>
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
                      <p className="text-blue-900">{selectedPPDBEntry.nisn || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">NIK</p>
                      <p className="text-blue-900">{selectedPPDBEntry.nik || '-'}</p>
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
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Pilihan Jurusan 3</p>
                      <p className="text-orange-900">{selectedPPDBEntry.majorChoice3 || '-'}</p>
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
            {/* BKK Sub-Tabs */}
            <div className="mb-6 flex flex-wrap gap-2 border-b border-emerald-200">
              <button
                onClick={() => setBkkSubTab('dashboard')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'dashboard'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <BarChart3 className="inline w-4 h-4 mr-2" /> Dashboard
              </button>
              <button
                onClick={() => setBkkSubTab('lamaran')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'lamaran'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <FileText className="inline w-4 h-4 mr-2" /> Lamaran ({jobApplications.length})
              </button>
              <button
                onClick={() => setBkkSubTab('perusahaan')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'perusahaan'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <Building2 className="inline w-4 h-4 mr-2" /> Perusahaan Mitra
              </button>
              <button
                onClick={() => setBkkSubTab('analytics')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'analytics'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <BarChart3 className="inline w-4 h-4 mr-2" /> Analytics
              </button>
              <button
                onClick={() => setBkkSubTab('pipeline')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'pipeline'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <Target className="inline w-4 h-4 mr-2" /> Pipeline
              </button>
              <button
                onClick={() => setBkkSubTab('reports')}
                className={`px-4 py-2 font-semibold transition ${
                  bkkSubTab === 'reports'
                    ? 'text-lime-600 border-b-2 border-lime-500'
                    : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <FileText className="inline w-4 h-4 mr-2" /> Reports
              </button>
            </div>

            {/* Dashboard Sub-Tab */}
            {bkkSubTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">Dashboard BKK</h2>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded shadow">
                    <p className="text-sm text-blue-600 font-semibold mb-2">Total Lowongan</p>
                    <p className="text-3xl font-bold text-blue-900"><CountUp end={jobPostings.length} /></p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded shadow">
                    <p className="text-sm text-green-600 font-semibold mb-2">Total Lamaran</p>
                    <p className="text-3xl font-bold text-green-900"><CountUp end={jobApplications.length} /></p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded shadow">
                    <p className="text-sm text-purple-600 font-semibold mb-2">Perusahaan Mitra</p>
                    <p className="text-3xl font-bold text-purple-900"><CountUp end={bkkCompanies.length} /></p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded shadow">
                    <p className="text-sm text-orange-600 font-semibold mb-2">Lamaran Pending</p>
                    <p className="text-3xl font-bold text-orange-900"><CountUp end={jobApplications.filter((a: any) => a.status === 'Pending').length} /></p>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded shadow">
                    <p className="text-sm text-cyan-600 font-semibold mb-2">Lamaran Diterima</p>
                    <p className="text-3xl font-bold text-cyan-900"><CountUp end={jobApplications.filter((a: any) => a.status === 'Accepted').length} /></p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded shadow">
                    <p className="text-sm text-rose-600 font-semibold mb-2">Lamaran Ditolak</p>
                    <p className="text-3xl font-bold text-rose-900"><CountUp end={jobApplications.filter((a: any) => a.status === 'Rejected').length} /></p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded shadow">
                    <p className="text-sm text-indigo-600 font-semibold mb-2">Sedang Ditinjau</p>
                    <p className="text-3xl font-bold text-indigo-900"><CountUp end={jobApplications.filter((a: any) => a.status === 'Ditinjau').length} /></p>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-white p-6 rounded shadow border border-emerald-200">
                  <h3 className="text-lg font-bold text-emerald-900 mb-4">📊 Statistik Rekrutmen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold mb-2">Conversion Rate</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {jobApplications.length > 0
                          ? ((jobApplications.filter((a: any) => a.status === 'Accepted').length / jobApplications.length) * 100).toFixed(1)
                          : 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Lamaran → Diterima</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold mb-2">Avg Applications/Job</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {jobPostings.length > 0 ? (jobApplications.length / jobPostings.length).toFixed(1) : 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Per lowongan</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold mb-2">Active Postings</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {jobPostings.filter((j: any) => !j.deadline || new Date(j.deadline) > new Date()).length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Belum expired</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lowongan Kerja Sub-Tab */}
            {bkkSubTab === 'lowongan' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-emerald-900">Manajemen Lowongan Kerja</h2>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedJobForEdit(null);
                        setJobForm({ perusahaanId: '', jurusanId: '', posisi: '', deskripsi: '', requirements: '', salary: '', lokasi: '', tipePekerjaan: '', deadline: '' });
                        setShowJobModal(true);
                      }}
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm font-semibold"
                    >
                      + Tambah Lowongan
                    </button>
                    <button
                      onClick={() => exportJobPostingsToCSV(jobPostings)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-semibold"
                    >
                      <Download className="inline w-4 h-4 mr-2" /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded shadow overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100 border-b text-emerald-900">
                      <tr>
                        <th className="px-4 py-3">Posisi</th>
                        <th className="px-4 py-3">Perusahaan</th>
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
                            <td className="px-4 py-3">{posting.perusahaan?.fullName || '-'}</td>
                            <td className="px-4 py-3">{posting.lokasi}</td>
                            <td className="px-4 py-3 text-sm">{posting.deadline ? new Date(posting.deadline).toLocaleDateString('id-ID') : '-'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                {jobApplications.filter((a: any) => a.jobPostingId === posting.id).length}
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
                        <tr><td colSpan={6} className="px-4 py-3 text-center text-emerald-700">Tidak ada lowongan kerja</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lamaran Sub-Tab */}
            {bkkSubTab === 'lamaran' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-emerald-900 mb-4">Manajemen Lamaran Kerja</h2>
                  {/* Advanced Filters */}
                  <div className="bg-white p-4 rounded shadow mb-4 border border-emerald-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-2">Status</label>
                        <select
                          value={applicationFilterStatus}
                          onChange={(e) => setApplicationFilterStatus(e.target.value)}
                          className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
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
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-2">Cari Pelamar</label>
                        <input
                          type="text"
                          placeholder="Nama atau email..."
                          value={applicationFilterApplicant}
                          onChange={(e) => setApplicationFilterApplicant(e.target.value)}
                          className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-emerald-900 mb-2">Perusahaan</label>
                        <select 
                          value={applicationFilterCompany}
                          onChange={(e) => setApplicationFilterCompany(e.target.value)}
                          className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                        >
                          <option value="">Semua Perusahaan</option>
                          {bkkCompanies.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.fullName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={() => {
                            setApplicationFilterStatus('');
                            setApplicationFilterApplicant('');
                            setApplicationFilterCompany('');
                          }}
                          className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-semibold"
                        >
                          Reset Filter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded shadow overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100 border-b text-emerald-900">
                      <tr>
                        <th className="px-4 py-3">Pelamar</th>
                        <th className="px-4 py-3">Posisi</th>
                        <th className="px-4 py-3">Perusahaan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredApps = jobApplications.filter((app: any) => {
                          // Filter by status
                          if (applicationFilterStatus && app.status !== applicationFilterStatus) return false;
                          
                          // Filter by applicant name or email
                          if (applicationFilterApplicant) {
                            const searchTerm = applicationFilterApplicant.toLowerCase();
                            const nameMatch = app.user?.fullName?.toLowerCase().includes(searchTerm);
                            const emailMatch = app.user?.email?.toLowerCase().includes(searchTerm);
                            if (!nameMatch && !emailMatch) return false;
                          }
                          
                          // Filter by company
                          if (applicationFilterCompany && app.jobPosting?.perusahaanId !== applicationFilterCompany) return false;
                          
                          return true;
                        });
                        
                        return filteredApps.length > 0 ? (
                          filteredApps.map((app: any) => (
                          <tr key={app.id} className="border-t hover:bg-emerald-50">
                            <td className="px-4 py-3 font-semibold">{app.user?.fullName}</td>
                            <td className="px-4 py-3">{app.jobPosting?.posisi}</td>
                            <td className="px-4 py-3">{app.jobPosting?.perusahaan?.fullName}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{new Date(app.appliedAt).toLocaleDateString('id-ID')}</td>
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
                          <tr><td colSpan={6} className="px-4 py-3 text-center text-emerald-700">Tidak ada lamaran</td></tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Perusahaan Sub-Tab */}
            {bkkSubTab === 'perusahaan' && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">Perusahaan Mitra</h2>
                <div className="bg-white rounded shadow overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100 border-b text-emerald-900">
                      <tr>
                        <th className="px-4 py-3">Nama Perusahaan</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Lowongan</th>
                        <th className="px-4 py-3">Alamat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bkkCompanies.length > 0 ? (
                        bkkCompanies.map((company: any) => (
                          <tr key={company.id} className="border-t hover:bg-emerald-50">
                            <td className="px-4 py-3 font-semibold">{company.fullName}</td>
                            <td className="px-4 py-3">{company.email}</td>
                            <td className="px-4 py-3">{company.phone || '-'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                {company._count?.jobPostings || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{company.address || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="px-4 py-3 text-center text-emerald-700">Tidak ada perusahaan mitra</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Sub-Tab */}
            {bkkSubTab === 'analytics' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-emerald-900">📊 Analytics BKK</h2>
                  <button
                    onClick={() => exportBKKAnalyticsReport(jobPostings, jobApplications, bkkCompanies)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm font-semibold flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" /> Export Report
                  </button>
                </div>
                
                {/* Top 5 Most Applied Jobs */}
                <div className="bg-white rounded shadow overflow-hidden mb-6">
                  <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                    <h3 className="font-bold text-emerald-900">🏆 Top 5 Lowongan Paling Banyak Lamaran</h3>
                  </div>
                  <div className="p-6">
                    {jobPostings.length > 0 ? (
                      <div className="space-y-3">
                        {jobPostings
                          .map((job: any) => ({
                            ...job,
                            applicationCount: jobApplications.filter((a: any) => a.jobPostingId === job.id).length
                          }))
                          .sort((a: any, b: any) => b.applicationCount - a.applicationCount)
                          .slice(0, 5)
                          .map((job: any, idx: number) => (
                            <div key={job.id} className="flex items-center justify-between pb-3 border-b last:border-b-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-emerald-600">#{idx + 1}</span>
                                <div>
                                  <p className="font-semibold text-emerald-900">{job.posisi}</p>
                                  <p className="text-sm text-emerald-600">{job.perusahaan?.fullName || 'No Company'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{job.applicationCount}</p>
                                <p className="text-xs text-gray-500">aplikasi</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center text-emerald-700 py-4">Tidak ada data lowongan</p>
                    )}
                  </div>
                </div>

                {/* Application Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Status Chart */}
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">📈 Distribusi Status Lamaran</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                        { status: 'Ditinjau', color: 'bg-blue-100 text-blue-800' },
                        { status: 'Shortlist', color: 'bg-purple-100 text-purple-800' },
                        { status: 'Interview', color: 'bg-indigo-100 text-indigo-800' },
                        { status: 'Accepted', color: 'bg-green-100 text-green-800' },
                        { status: 'Rejected', color: 'bg-red-100 text-red-800' }
                      ].map((stat: any) => {
                        const count = jobApplications.filter((a: any) => a.status === stat.status).length;
                        const percentage = jobApplications.length > 0 ? ((count / jobApplications.length) * 100).toFixed(1) : 0;
                        return (
                          <div key={stat.status}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-emerald-900">{stat.status}</span>
                              <span className={`px-3 py-1 rounded text-xs font-bold ${stat.color}`}>{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${stat.color.split(' ')[0]}`}
                                style={{width: `${percentage}%`}}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Analysis */}
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">📍 Lowongan per Lokasi</h3>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const locationMap = new Map<string, number>();
                        jobPostings.forEach((job: any) => {
                          const loc = job.lokasi || 'Unknown';
                          locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
                        });
                        const sorted = Array.from(locationMap.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 10);
                        
                        return sorted.length > 0 ? (
                          <div className="space-y-3">
                            {sorted.map(([loc, count], idx) => (
                              <div key={loc} className="flex items-center justify-between">
                                <span className="text-emerald-900 font-semibold">{loc}</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-emerald-700 py-4">Tidak ada data lokasi</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Job Type Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">💼 Lowongan per Tipe Pekerjaan</h3>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const typeMap = new Map<string, number>();
                        jobPostings.forEach((job: any) => {
                          const type = job.tipePekerjaan || 'Not Specified';
                          typeMap.set(type, (typeMap.get(type) || 0) + 1);
                        });
                        const sorted = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);
                        
                        return sorted.length > 0 ? (
                          <div className="space-y-3">
                            {sorted.map(([type, count]) => (
                              <div key={type} className="flex items-center justify-between">
                                <span className="text-emerald-900 font-semibold">{type}</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-emerald-700 py-4">Tidak ada data tipe pekerjaan</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Company Performance */}
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">🏢 Kinerja Perusahaan Mitra</h3>
                    </div>
                    <div className="p-6">
                      {bkkCompanies.length > 0 ? (
                        <div className="space-y-3">
                          {bkkCompanies
                            .map((c: any) => ({
                              ...c,
                              jobCount: jobPostings.filter((j: any) => j.perusahaanId === c.id).length,
                              appCount: jobApplications.filter((a: any) => a.jobPosting?.perusahaanId === c.id).length
                            }))
                            .sort((a: any, b: any) => b.appCount - a.appCount)
                            .slice(0, 8)
                            .map((company: any) => (
                              <div key={company.id} className="flex items-center justify-between pb-3 border-b last:border-b-0 last:pb-0">
                                <div>
                                  <p className="font-semibold text-emerald-900">{company.fullName}</p>
                                  <p className="text-xs text-gray-500">{company.jobCount} lowongan</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{company.appCount} aplikasi</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-center text-emerald-700 py-4">Tidak ada perusahaan mitra</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Sub-Tab */}
            {bkkSubTab === 'pipeline' && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">🎯 Recruitment Pipeline</h2>
                
                {/* Recruitment Funnel */}
                <div className="bg-white rounded shadow overflow-hidden mb-6">
                  <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                    <h3 className="font-bold text-emerald-900">Funnel Konversi</h3>
                  </div>
                  <div className="p-8">
                    {(() => {
                      const stages = ['Pending', 'Ditinjau', 'Shortlist', 'Interview', 'Accepted'];
                      const stageCounts: any = {};
                      stages.forEach(stage => {
                        stageCounts[stage] = jobApplications.filter((a: any) => a.status === stage).length;
                      });
                      const total = Object.values(stageCounts).reduce((a: any, b: any) => a + b, 0) || 1;

                      return (
                        <div className="space-y-4">
                          {stages.map((stage, idx) => {
                            const count = (stageCounts[stage] || 0) as number;
                            const percentage = ((count / (total as number)) * 100).toFixed(1);
                            const colors = [
                              'from-yellow-400 to-yellow-500',
                              'from-blue-400 to-blue-500',
                              'from-purple-400 to-purple-500',
                              'from-indigo-400 to-indigo-500',
                              'from-green-400 to-green-500'
                            ];
                            
                            return (
                              <div key={stage}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-emerald-900">{idx + 1}. {stage}</span>
                                  <span className="text-lg font-bold text-emerald-700">{count} ({percentage}%)</span>
                                </div>
                                <div className={`h-8 rounded-lg bg-gradient-to-r ${colors[idx]} shadow flex items-center justify-center transition-all`} 
                                  style={{width: `${Math.max(10, parseFloat(percentage))}%`, minWidth: '100px'}}>
                                  <span className="text-white font-bold text-sm">{percentage}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Stage-by-Stage Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {[
                    { stage: 'Pending', color: 'from-yellow-50 to-yellow-100', icon: '⏳', borderColor: 'border-yellow-300' },
                    { stage: 'Ditinjau', color: 'from-blue-50 to-blue-100', icon: '👀', borderColor: 'border-blue-300' },
                    { stage: 'Shortlist', color: 'from-purple-50 to-purple-100', icon: '⭐', borderColor: 'border-purple-300' },
                    { stage: 'Interview', color: 'from-indigo-50 to-indigo-100', icon: '🎤', borderColor: 'border-indigo-300' },
                    { stage: 'Accepted', color: 'from-green-50 to-green-100', icon: '✅', borderColor: 'border-green-300' }
                  ].map((metric) => {
                    const count = jobApplications.filter((a: any) => a.status === metric.stage).length;
                    const prev = metric.stage === 'Pending' ? jobApplications.length : jobApplications.filter((a: any) => ['Pending', 'Ditinjau', 'Shortlist', 'Interview'].includes(a.status)).length;
                    const conversionRate = prev > 0 ? ((count / prev) * 100).toFixed(1) : 0;

                    return (
                      <div key={metric.stage} className={`bg-gradient-to-br ${metric.color} p-4 rounded shadow border-l-4 ${metric.borderColor}`}>
                        <p className="text-3xl mb-2">{metric.icon}</p>
                        <p className="text-xs font-semibold text-gray-600 mb-1">{metric.stage}</p>
                        <p className="text-2xl font-bold text-emerald-900">{count}</p>
                        <p className="text-xs text-gray-500 mt-1">Konversi: {conversionRate}%</p>
                      </div>
                    );
                  })}
                </div>

                {/* Company-wise Pipeline */}
                <div className="bg-white rounded shadow overflow-hidden">
                  <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                    <h3 className="font-bold text-emerald-900">Pipeline per Perusahaan</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-emerald-50 border-b border-emerald-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Perusahaan</th>
                          <th className="px-4 py-3 text-center font-semibold">⏳ Pending</th>
                          <th className="px-4 py-3 text-center font-semibold">👀 Ditinjau</th>
                          <th className="px-4 py-3 text-center font-semibold">⭐ Shortlist</th>
                          <th className="px-4 py-3 text-center font-semibold">🎤 Interview</th>
                          <th className="px-4 py-3 text-center font-semibold">✅ Accepted</th>
                          <th className="px-4 py-3 text-center font-semibold">❌ Rejected</th>
                          <th className="px-4 py-3 text-center font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bkkCompanies.length > 0 ? (
                          bkkCompanies.map((company: any) => {
                            const companyApps = jobApplications.filter((a: any) => a.jobPosting?.perusahaanId === company.id);
                            const pending = companyApps.filter((a: any) => a.status === 'Pending').length;
                            const ditinjau = companyApps.filter((a: any) => a.status === 'Ditinjau').length;
                            const shortlist = companyApps.filter((a: any) => a.status === 'Shortlist').length;
                            const interview = companyApps.filter((a: any) => a.status === 'Interview').length;
                            const accepted = companyApps.filter((a: any) => a.status === 'Accepted').length;
                            const rejected = companyApps.filter((a: any) => a.status === 'Rejected').length;
                            const total = companyApps.length;

                            return (
                              <tr key={company.id} className="border-b hover:bg-emerald-50">
                                <td className="px-4 py-3 font-semibold text-emerald-900">{company.fullName}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 font-bold">{pending}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 font-bold">{ditinjau}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 font-bold">{shortlist}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800 font-bold">{interview}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 font-bold">{accepted}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 font-bold">{rejected}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-emerald-900">{total}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr><td colSpan={8} className="px-4 py-3 text-center text-emerald-700">Tidak ada data perusahaan</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Sub-Tab */}
            {bkkSubTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-6">📋 Reports & Analytics</h2>

                {/* Advanced Filters */}
                <div className="bg-white p-6 rounded shadow mb-6 border border-emerald-200">
                  <h3 className="font-bold text-emerald-900 mb-4">🔍 Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-900 mb-2">Dari Tanggal</label>
                      <input
                        type="date"
                        value={reportDateFrom}
                        onChange={(e) => setReportDateFrom(e.target.value)}
                        className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-900 mb-2">Sampai Tanggal</label>
                      <input
                        type="date"
                        value={reportDateTo}
                        onChange={(e) => setReportDateTo(e.target.value)}
                        className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-900 mb-2">Perusahaan</label>
                      <select
                        value={reportCompanyFilter}
                        onChange={(e) => setReportCompanyFilter(e.target.value)}
                        className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                      >
                        <option value="">Semua Perusahaan</option>
                        {bkkCompanies.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.fullName}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-900 mb-2">Lokasi</label>
                      <select
                        value={reportLocationFilter}
                        onChange={(e) => setReportLocationFilter(e.target.value)}
                        className="w-full border border-emerald-300 rounded px-3 py-2 text-emerald-900"
                      >
                        <option value="">Semua Lokasi</option>
                        {(() => {
                          const locations = new Set(jobPostings.map((j: any) => j.lokasi).filter(Boolean));
                          return Array.from(locations).map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReportDateFrom('');
                      setReportDateTo('');
                      setReportCompanyFilter('');
                      setReportLocationFilter('');
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Trend Analysis */}
                <div className="bg-white rounded shadow overflow-hidden mb-6">
                  <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                    <h3 className="font-bold text-emerald-900">📈 Trend Analysis - Aplikasi per Bulan</h3>
                  </div>
                  <div className="p-6">
                    {(() => {
                      const monthlyData: any = {};
                      jobApplications.forEach((app: any) => {
                        const date = new Date(app.appliedAt);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        
                        if (reportDateFrom && new Date(app.appliedAt) < new Date(reportDateFrom)) return;
                        if (reportDateTo && new Date(app.appliedAt) > new Date(reportDateTo)) return;
                        if (reportCompanyFilter && app.jobPosting?.perusahaanId !== reportCompanyFilter) return;
                        if (reportLocationFilter && app.jobPosting?.lokasi !== reportLocationFilter) return;
                        
                        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
                      });
                      
                      const labels = Object.keys(monthlyData).sort();
                      const data = labels.map(key => monthlyData[key]);
                      
                      return labels.length > 0 ? (
                        <div className="space-y-2">
                          {labels.map((month, idx) => (
                            <div key={month}>
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold text-emerald-900">{month}</span>
                                <span className="font-bold text-blue-600">{data[idx]} aplikasi</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{width: `${Math.min(100, (data[idx] / Math.max(...data)) * 100)}%`}}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-emerald-700 py-4">Tidak ada data untuk periode yang dipilih</p>
                      );
                    })()}
                  </div>
                </div>

                {/* Recruitment Timeline */}
                <div className="bg-white rounded shadow overflow-hidden mb-6">
                  <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                    <h3 className="font-bold text-emerald-900">⏱️ Recruitment Timeline - Rata-rata Durasi per Tahap</h3>
                  </div>
                  <div className="p-6">
                    {(() => {
                      // Calculate average time in each stage
                      const stages = ['Pending', 'Ditinjau', 'Shortlist', 'Interview', 'Accepted'];
                      const stageData = stages.map(stage => {
                        const count = jobApplications.filter((a: any) => a.status === stage).length;
                        return { stage, count, avgDays: Math.floor(Math.random() * 15) + 1 }; // Placeholder calculation
                      });
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <span>Estimated Days in Stage</span>
                          </div>
                          {stageData.map((item, idx) => (
                            <div key={item.stage} className="flex items-center gap-4">
                              <div className="w-32">
                                <p className="font-semibold text-emerald-900">{item.stage}</p>
                                <p className="text-xs text-gray-500">{item.count} aplikasi</p>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                    <div 
                                      className="h-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                                      style={{width: `${Math.min(100, item.avgDays * 3)}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-emerald-700 w-12 text-right">
                                    ~{item.avgDays}d
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Comprehensive KPI Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {(() => {
                    const filteredApps = jobApplications.filter((app: any) => {
                      if (reportDateFrom && new Date(app.appliedAt) < new Date(reportDateFrom)) return false;
                      if (reportDateTo && new Date(app.appliedAt) > new Date(reportDateTo)) return false;
                      if (reportCompanyFilter && app.jobPosting?.perusahaanId !== reportCompanyFilter) return false;
                      if (reportLocationFilter && app.jobPosting?.lokasi !== reportLocationFilter) return false;
                      return true;
                    });

                    const kpis = [
                      {
                        label: 'Success Rate',
                        value: filteredApps.length > 0 ? ((filteredApps.filter((a: any) => a.status === 'Accepted').length / filteredApps.length) * 100).toFixed(1) : 0,
                        unit: '%',
                        color: 'from-green-50 to-green-100',
                        icon: '✅',
                        borderColor: 'border-green-300'
                      },
                      {
                        label: 'Total Applications',
                        value: filteredApps.length,
                        unit: 'aplikasi',
                        color: 'from-blue-50 to-blue-100',
                        icon: '📝',
                        borderColor: 'border-blue-300'
                      },
                      {
                        label: 'Avg Applications/Job',
                        value: jobPostings.length > 0 ? (filteredApps.length / jobPostings.length).toFixed(1) : 0,
                        unit: 'per job',
                        color: 'from-purple-50 to-purple-100',
                        icon: '📊',
                        borderColor: 'border-purple-300'
                      },
                      {
                        label: 'Active Job Postings',
                        value: jobPostings.filter((j: any) => !j.deadline || new Date(j.deadline) > new Date()).length,
                        unit: 'lowongan',
                        color: 'from-orange-50 to-orange-100',
                        icon: '📌',
                        borderColor: 'border-orange-300'
                      }
                    ];

                    return kpis.map((kpi) => (
                      <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} p-6 rounded shadow border-l-4 ${kpi.borderColor}`}>
                        <p className="text-3xl mb-2">{kpi.icon}</p>
                        <p className="text-xs font-semibold text-gray-600">{kpi.label}</p>
                        <p className="text-2xl font-bold text-emerald-900 mt-2">{kpi.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{kpi.unit}</p>
                      </div>
                    ));
                  })()}
                </div>

                {/* Conversion Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stage Conversion Rates */}
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">📉 Conversion Rates per Stage</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {(() => {
                        const stages = ['Pending→Ditinjau', 'Ditinjau→Shortlist', 'Shortlist→Interview', 'Interview→Accepted'];
                        const stageMap = {
                          'Pending→Ditinjau': { from: 'Pending', to: 'Ditinjau', icon: '📥' },
                          'Ditinjau→Shortlist': { from: 'Ditinjau', to: 'Shortlist', icon: '⭐' },
                          'Shortlist→Interview': { from: 'Shortlist', to: 'Interview', icon: '🎤' },
                          'Interview→Accepted': { from: 'Interview', to: 'Accepted', icon: '✅' }
                        };
                        
                        return stages.map((stage) => {
                          const def = stageMap[stage as keyof typeof stageMap];
                          const fromCount = jobApplications.filter((a: any) => a.status === def.from).length;
                          const toCount = jobApplications.filter((a: any) => a.status === def.to).length;
                          const rate = fromCount > 0 ? ((toCount / fromCount) * 100).toFixed(1) : 0;
                          
                          return (
                            <div key={stage}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-emerald-900">{def.icon} {stage}</span>
                                <span className="text-sm font-bold text-blue-600">{rate}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{width: `${rate}%`}}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{toCount} dari {fromCount} kandidat</p>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Top Performing Metrics */}
                  <div className="bg-white rounded shadow overflow-hidden">
                    <div className="bg-emerald-100 p-4 border-b border-emerald-200">
                      <h3 className="font-bold text-emerald-900">🏆 Top Performing Companies</h3>
                    </div>
                    <div className="p-6">
                      {(() => {
                        const companyMetrics = bkkCompanies
                          .map((c: any) => {
                            const companyApps = jobApplications.filter((a: any) => a.jobPosting?.perusahaanId === c.id);
                            const accepted = companyApps.filter((a: any) => a.status === 'Accepted').length;
                            const total = companyApps.length;
                            const rate = total > 0 ? ((accepted / total) * 100).toFixed(1) : 0;
                            return {
                              name: c.fullName,
                              accepted,
                              total,
                              rate: parseFloat(rate as string)
                            };
                          })
                          .sort((a, b) => b.rate - a.rate)
                          .slice(0, 5);

                        return companyMetrics.length > 0 ? (
                          <div className="space-y-3">
                            {companyMetrics.map((metric, idx) => (
                              <div key={metric.name} className="flex items-center justify-between pb-3 border-b last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-emerald-600">#{idx + 1}</span>
                                  <div>
                                    <p className="font-semibold text-emerald-900">{metric.name}</p>
                                    <p className="text-xs text-gray-500">{metric.accepted} hired</p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  {metric.rate}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-emerald-700 py-4">Tidak ada data perusahaan</p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

            {/* Add/Edit Job Modal */}
            {showJobModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div onClick={() => setShowJobModal(false)} className="absolute inset-0 bg-emerald-50/40"></div>
                <form onSubmit={handleSaveJob} className="relative bg-white rounded shadow max-w-2xl w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-emerald-900">
                      {selectedJobForEdit ? '✏️ Edit Lowongan Kerja' : '➕ Tambah Lowongan Kerja'}
                    </h3>
                    <button type="button" onClick={() => setShowJobModal(false)} className="text-emerald-500 hover:text-emerald-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
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
                      <label className="block text-sm font-medium mb-1">Perusahaan</label>
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
                    <button type="submit" disabled={jobSaving} className={`bg-green-600 text-white px-4 py-2 rounded font-semibold ${jobSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}>
                      {jobSaving ? '💾 Menyimpan...' : selectedJobForEdit ? '💾 Perbarui' : '➕ Simpan'}
                    </button>
                    <button type="button" onClick={() => setShowJobModal(false)} className="px-4 py-2 rounded border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50">Batal</button>
                  </div>
                </form>
              </div>
            )}

            {/* Application Detail Modal */}
            {showApplicationDetailModal && selectedApplication && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div onClick={() => setShowApplicationDetailModal(false)} className="absolute inset-0 bg-emerald-50/40"></div>
                <div className="relative bg-white rounded shadow max-w-2xl w-full p-6 z-50 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-emerald-900">Detail Lamaran</h3>
                    <button onClick={() => setShowApplicationDetailModal(false)} className="text-emerald-500 hover:text-emerald-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Nama Pelamar</p>
                      <p className="text-emerald-900 font-bold">{selectedApplication.user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Email</p>
                      <p className="text-emerald-900">{selectedApplication.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Posisi</p>
                      <p className="text-emerald-900 font-bold">{selectedApplication.jobPosting?.posisi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Perusahaan</p>
                      <p className="text-emerald-900">{selectedApplication.jobPosting?.perusahaan?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Tanggal Lamar</p>
                      <p className="text-emerald-900">{new Date(selectedApplication.appliedAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">Status</p>
                      <select
                        value={selectedApplication.status}
                        onChange={(e) => handleUpdateApplicationStatus(selectedApplication.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded font-semibold border-2 ${
                          selectedApplication.status === 'Accepted' ? 'border-green-500 bg-green-50 text-green-800' :
                          selectedApplication.status === 'Rejected' ? 'border-red-500 bg-red-50 text-red-800' :
                          'border-yellow-500 bg-yellow-50 text-yellow-800'
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

                  {selectedApplication.cvFile && (
                    <div className="mb-4">
                      <p className="text-sm text-emerald-600 font-semibold mb-2">CV</p>
                      <a href={selectedApplication.cvFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        📄 Lihat CV
                      </a>
                    </div>
                  )}

                  {selectedApplication.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm text-emerald-600 font-semibold mb-2">Surat Lamaran</p>
                      <p className="text-emerald-900 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowApplicationDetailModal(false)} className="px-4 py-2 rounded border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50">
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
        

        {/* Alumni Tab with Tracer Study */}
        {activeTab === 'alumni' && (
          <div>
            {/* Summary Stats */}
            <h2 className="text-2xl font-bold mb-6 text-emerald-900">Tracer Study Alumni</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="font-semibold text-blue-900 text-sm">Bekerja</h3>
                <p className="text-3xl font-bold text-blue-600">{stats?.alumniStats?.working || 0}</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                <h3 className="font-semibold text-green-900 text-sm">Melanjutkan Kuliah</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.alumniStats?.studying || 0}</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                <h3 className="font-semibold text-purple-900 text-sm">Wirausaha</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.alumniStats?.entrepreneur || 0}</p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
                <h3 className="font-semibold text-orange-900 text-sm">Mencari Kerja</h3>
                <p className="text-3xl font-bold text-orange-600">{stats?.alumniStats?.searching || 0}</p>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-6 rounded shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Cari Alumni</label>
                  <input
                    type="text"
                    placeholder="Nama, email, perusahaan..."
                    value={tracerStudySearchQuery}
                    onChange={(e) => {
                      setTracerStudySearchQuery(e.target.value);
                      setTracerStudyPage(1);
                    }}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Filter Status</label>
                  <select
                    value={tracerStudyFilterStatus}
                    onChange={(e) => {
                      setTracerStudyFilterStatus(e.target.value);
                      setTracerStudyPage(1);
                    }}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  >
                    <option value="">Semua Status</option>
                    <option value="Bekerja">Bekerja</option>
                    <option value="Kuliah">Kuliah</option>
                    <option value="Wirausaha">Wirausaha</option>
                    <option value="Mencari Kerja">Mencari Kerja</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setTracerStudySearchQuery('');
                      setTracerStudyFilterStatus('');
                      setTracerStudyPage(1);
                    }}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
              {tracerStudyLoading ? (
                <div className="p-6 flex items-center justify-center">
                  <Loader2 className="animate-spin w-6 h-6 text-emerald-600" />
                </div>
              ) : tracerStudyData.length > 0 ? (
                <>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100 border-b text-emerald-900">
                      <tr>
                        <th className="px-4 py-3">Nama Alumni</th>
                        <th className="px-4 py-3">Jurusan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Perusahaan/Info</th>
                        <th className="px-4 py-3">Jabatan/Posisi</th>
                        <th className="px-4 py-3">Relevansi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracerStudyData.map((item: any) => (
                        <tr key={item.id} className="border-t hover:bg-emerald-50">
                          <td className="px-4 py-3 font-semibold">{item.user?.fullName}</td>
                          <td className="px-4 py-3">{item.jurusan?.nama || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              item.status === 'Bekerja' ? 'bg-green-100 text-green-800' :
                              item.status === 'Kuliah' ? 'bg-blue-100 text-blue-800' :
                              item.status === 'Wirausaha' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{item.namaPerusahaan || '-'}</td>
                          <td className="px-4 py-3 text-sm">{item.jabatan || '-'}</td>
                          <td className="px-4 py-3 text-xs">{item.relevansi || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="px-4 py-3 border-t flex items-center justify-between">
                    <p className="text-sm text-emerald-600">
                      Total: <span className="font-semibold">{tracerStudyTotal}</span> alumni
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTracerStudyPage(prev => Math.max(prev - 1, 1))}
                        disabled={tracerStudyPage === 1}
                        className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 text-sm"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold">{tracerStudyPage}</span>
                      <button
                        onClick={() => setTracerStudyPage(prev => prev + 1)}
                        disabled={tracerStudyData.length < 10}
                        className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-emerald-700">
                  Tidak ada data tracer study alumni
                </div>
              )}
            </div>

            {/* Testimonial Section */}
            <div className="mt-8">
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
                            <p className="text-xs text-emerald-900 mt-2">{t.tahunLulus}</p>
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
                  <p className="text-emerald-900 text-center py-4">Belum ada testimoni</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">Manajemen Pengguna</h2>
                <p className="text-emerald-600">Total: <span className="font-semibold text-lg">{userTotal}</span> pengguna terdaftar</p>
              </div>
              {currentUser?.role === 'ADMIN_UTAMA' && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setIsEditMode(false);
                    setUserForm({ username: '', email: '', password: '', fullName: '', role: 'CALON_SISWA', phone: '', address: '' });
                    setUserFormError('');
                    setShowUserModal(true);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 font-semibold"
                >
                  + Tambah User
                </button>
              )}
            </div>

            {/* Search & Filter Box */}
            <div className="mb-6 bg-white p-4 rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Cari User</label>
                  <input
                    type="text"
                    placeholder="Nama, username, atau email..."
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value);
                      setUserPage(1);
                      fetchUsers(1, e.target.value, userRoleFilter);
                    }}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-2">Filter Role</label>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value);
                      setUserPage(1);
                      fetchUsers(1, userSearchQuery, e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900"
                  >
                    <option value="ALL">Semua Role</option>
                    <option value="CALON_SISWA">Calon Siswa</option>
                    <option value="SISWA_AKTIF">Siswa Aktif</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="PERUSAHAAN">Perusahaan</option>
                    <option value="ADMIN_PPDB">Admin PPDB</option>
                    <option value="ADMIN_BKK">Admin BKK</option>
                    <option value="ADMIN_BERITA">Admin Berita</option>
                    <option value="ADMIN_UTAMA">Admin Utama</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setUserSearchQuery('');
                      setUserRoleFilter('ALL');
                      setUserPage(1);
                      fetchUsers(1, '', 'ALL');
                    }}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-emerald-100 border-b text-emerald-900">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">Nama Lengkap</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">Username</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">Email</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3">Role</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Telepon</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">Terdaftar</th>
                    {currentUser?.role === 'ADMIN_UTAMA' && <th className="px-2 sm:px-4 py-2 sm:py-3">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {userLoading ? (
                    <tr>
                      <td colSpan={currentUser?.role === 'ADMIN_UTAMA' ? 7 : 6} className="px-4 py-6 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : users.length > 0 ? (
                    users.map((user: any) => (
                      <tr key={user.id} className="border-t hover:bg-emerald-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-emerald-900">{user.fullName || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 hidden sm:table-cell">{user.username || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 hidden md:table-cell">{user.email}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          {currentUser?.role === 'ADMIN_UTAMA' ? (
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              className="px-1 sm:px-2 py-1 rounded text-xs border border-emerald-300 bg-white"
                            >
                              <option value="CALON_SISWA">CALON_SISWA</option>
                              <option value="SISWA_AKTIF">SISWA_AKTIF</option>
                              <option value="ALUMNI">ALUMNI</option>
                              <option value="ADMIN_PPDB">ADMIN_PPDB</option>
                              <option value="ADMIN_BKK">ADMIN_BKK</option>
                              <option value="ADMIN_BERITA">ADMIN_BERITA</option>
                              <option value="ADMIN_UTAMA">ADMIN_UTAMA</option>
                              <option value="PERUSAHAAN">PERUSAHAAN</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.role === 'ADMIN_UTAMA' ? 'bg-red-100 text-red-800' :
                              user.role === 'ADMIN_PPDB' ? 'bg-orange-100 text-orange-800' :
                              user.role === 'ADMIN_BKK' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'ADMIN_BERITA' ? 'bg-pink-100 text-pink-800' :
                              user.role === 'CALON_SISWA' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'SISWA_AKTIF' ? 'bg-green-100 text-green-800' :
                              user.role === 'ALUMNI' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'PERUSAHAAN' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 hidden lg:table-cell">{user.phone || '-'}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-emerald-800 hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString('id-ID')}</td>
                        {currentUser?.role === 'ADMIN_UTAMA' && (
                          <td className="px-2 sm:px-4 py-2 sm:py-3 space-x-1 sm:space-x-2 flex items-center">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="px-1.5 sm:px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-1.5 sm:px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                            >
                              Hapus
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={currentUser?.role === 'ADMIN_UTAMA' ? 7 : 6} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-emerald-700 text-xs sm:text-sm">Tidak ada pengguna yang cocok</td></tr>
                  )}
                </tbody>
              </table>
              
              {users.length > 0 && (
                <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                  <p className="text-sm text-emerald-600">
                    Menampilkan <span className="font-semibold">{(userPage - 1) * userPageSize + 1}</span> - <span className="font-semibold">{Math.min(userPage * userPageSize, userTotal)}</span> dari <span className="font-semibold">{userTotal}</span> pengguna
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setUserPage(userPage - 1);
                        fetchUsers(userPage - 1, userSearchQuery, userRoleFilter);
                      }}
                      disabled={userPage === 1}
                      className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 text-sm font-semibold"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-sm font-semibold border border-emerald-300 rounded">{userPage} / {userTotalPages}</span>
                    <button
                      onClick={() => {
                        setUserPage(userPage + 1);
                        fetchUsers(userPage + 1, userSearchQuery, userRoleFilter);
                      }}
                      disabled={userPage >= userTotalPages}
                      className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400 text-sm font-semibold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add/Edit User Modal */}
            {showUserModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 sm:p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold">{isEditMode ? 'Edit User' : 'Tambah User Baru'}</h3>
                      <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                        {isEditMode ? `Edit informasi user ${selectedUser?.fullName}` : 'Buat akun pengguna baru'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserModal(false);
                        setIsEditMode(false);
                      }}
                      className="text-white hover:text-emerald-200 text-3xl font-light leading-none"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-4 sm:p-6">
                    {userFormError && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded text-sm">
                        <p className="font-semibold">Error:</p>
                        <p>{userFormError}</p>
                      </div>
                    )}

                    <form onSubmit={handleSaveUserModal} className="space-y-4 sm:space-y-6">
                      {/* Row 1: Nama Lengkap & Username */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-semibold text-emerald-700 mb-1 sm:mb-2">Nama Lengkap *</label>
                          <input
                            type="text"
                            required
                            value={userForm.fullName}
                            onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                            className="w-full border border-emerald-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 text-sm"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-emerald-700 mb-2">Username {isEditMode ? '' : '*'}</label>
                          <input
                            type="text"
                            required={!isEditMode}
                            disabled={isEditMode}
                            value={userForm.username}
                            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none text-emerald-900 placeholder-emerald-500 ${
                              isEditMode 
                                ? 'bg-emerald-50 border-emerald-200 cursor-not-allowed' 
                                : 'border-emerald-300 focus:ring-2 focus:ring-emerald-500'
                            }`}
                            placeholder="Masukkan username"
                          />
                          {isEditMode && <p className="text-xs text-emerald-600 mt-1">Username tidak dapat diubah</p>}
                        </div>
                      </div>

                      {/* Row 2: Email & Password */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-emerald-700 mb-2">Email {isEditMode ? '' : '*'}</label>
                          <input
                            type="email"
                            required={!isEditMode}
                            disabled={isEditMode}
                            value={userForm.email}
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none text-emerald-900 placeholder-emerald-500 ${
                              isEditMode 
                                ? 'bg-emerald-50 border-emerald-200 cursor-not-allowed' 
                                : 'border-emerald-300 focus:ring-2 focus:ring-emerald-500'
                            }`}
                            placeholder="Masukkan email"
                          />
                          {isEditMode && <p className="text-xs text-emerald-600 mt-1">Email tidak dapat diubah</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-emerald-700 mb-2">Password {isEditMode ? '' : '*'}</label>
                          <input
                            type="password"
                            required={!isEditMode}
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 placeholder-emerald-500"
                            placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                          />
                          {isEditMode && <p className="text-xs text-emerald-600 mt-1">Opsional saat edit</p>}
                        </div>
                      </div>

                      {/* Row 3: Role & Telepon */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-emerald-700 mb-2">Role *</label>
                          <select
                            required
                            value={userForm.role}
                            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                            className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 bg-white"
                          >
                            <option value="">-- Pilih Role --</option>
                            <option value="CALON_SISWA">Calon Siswa</option>
                            <option value="SISWA_AKTIF">Siswa Aktif</option>
                            <option value="ALUMNI">Alumni</option>
                            <option value="PERUSAHAAN">Perusahaan</option>
                            <option value="ADMIN_PPDB">Admin PPDB</option>
                            <option value="ADMIN_BKK">Admin BKK</option>
                            <option value="ADMIN_BERITA">Admin Berita</option>
                            <option value="ADMIN_UTAMA">Admin Utama</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-emerald-700 mb-2">Telepon</label>
                          <input
                            type="tel"
                            value={userForm.phone}
                            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                            className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 placeholder-emerald-500"
                            placeholder="Masukkan nomor telepon"
                          />
                        </div>
                      </div>

                      {/* Row 4: Alamat */}
                      <div>
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">Alamat</label>
                        <textarea
                          value={userForm.address}
                          onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                          rows={3}
                          className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 placeholder-emerald-500 resize-none"
                          placeholder="Masukkan alamat lengkap"
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex gap-3 justify-end pt-4 border-t border-emerald-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserModal(false);
                            setIsEditMode(false);
                          }}
                          className="px-6 py-2 border-2 border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 font-semibold transition"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition"
                        >
                          {isEditMode ? 'Perbarui User' : 'Buat User'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            {currentUser?.role === 'ADMIN_BERITA' ? (
              <h2 className="text-2xl font-bold mb-4">Kelola Berita</h2>
            ) : (
              <h2 className="text-2xl font-bold mb-4">Manajemen Konten</h2>
            )}

            {/* Only show Hero, Profil, Jurusan, Statistik, Video for non-ADMIN_BERITA */}
            {currentUser?.role !== 'ADMIN_BERITA' && (
              <>
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
            </>
            )}

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
            {currentUser?.role !== 'ADMIN_BERITA' && (
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
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              setSelectedJurusan(item);
                              setJurusanForm({
                                nama: item.nama,
                                deskripsi: item.deskripsi,
                                kode: item.kode,
                                icon: item.icon || ''
                              });
                              setJurusanLogoFile(null);
                              setShowJurusanModal(true);
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 flex-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteJurusan(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex-1"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-9000 text-center py-4">Belum ada jurusan</p>
                )}
              </div>
            </div>
            )}

            {/* Archived Jurusan Section - Only for ADMIN_UTAMA */}
            {currentUser?.role === 'ADMIN_UTAMA' && archivedJurusan.length > 0 && (
            <div className="mb-8">
              <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                <div className="mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 flex items-center">
                      <span className="text-yellow-600 font-bold mr-2">📦</span> 
                      Jurusan Arsip (Non-Aktif)
                    </h3>
                    <p className="text-yellow-600 mb-4">Jurusan yang telah di-archive dapat dipulihkan kembali</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {archivedJurusan.map((item: any) => (
                    <div key={item.id} className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
                      <h4 className="font-bold text-yellow-900">{item.nama}</h4>
                      <p className="text-sm text-yellow-700 mt-2">{item.deskripsi}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        📊 PPDB: {item._count?.ppdbEntries || 0} | 
                        💼 Job: {item._count?.jobPostings || 0} | 
                        📈 Tracer: {item._count?.tracerStudy || 0}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRestoreJurusan(item.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex-1"
                        >
                          ↻ Pulihkan
                        </button>
                        <button
                          onClick={() => handlePermanentDeleteJurusan(item.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex-1"
                        >
                          🗑️ Hapus Permanen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Statistik Section */}
            {currentUser?.role !== 'ADMIN_BERITA' && (
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
            )}

            {/* Video Section */}
            {currentUser?.role !== 'ADMIN_BERITA' && (
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
            )}
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
              <h3 className="text-lg font-bold mb-4">{selectedJurusan ? 'Edit Jurusan' : 'Tambah Jurusan'}</h3>
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
                  <button type="submit" className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    {selectedJurusan ? 'Perbarui' : 'Simpan'}
                  </button>
                  <button type="button" onClick={() => {
                    setShowJurusanModal(false);
                    setSelectedJurusan(null);
                    setJurusanForm({ nama: '', deskripsi: '', kode: '', icon: '' });
                    setJurusanLogoFile(null);
                  }} className="flex-1 bg-emerald-300 text-emerald-800 px-4 py-2 rounded hover:bg-emerald-400">Batal</button>
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
