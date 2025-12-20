# SMK Sunan Giri - Website Resmi

Website resmi SMK Sunan Giri dengan fitur lengkap untuk pendidikan digital yang modern.

## 🎯 Fitur Utama

✅ **Profil Sekolah** - Informasi lengkap tentang sekolah, visi, misi, dan fasilitas

✅ **PPDB Online** - Sistem pendaftaran peserta didik baru secara online

✅ **AI Recommendation System** - Sistem rekomendasi jurusan berbasis AI

✅ **Tracer Study Alumni** - Pelacakan data alumni dan penempatan kerja

✅ **Job Seeker & BKK Online** - Platform bursa kerja khusus untuk alumni

✅ **Dashboard Admin** - Dashboard komprehensif untuk manajemen sistem

✅ **Multi-User Role** - 9 jenis role pengguna dengan akses berbeda

✅ **Responsive Design** - Desain yang responsif untuk semua perangkat

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, Next.js 16, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + NextAuth
- **Validation**: Zod, React Hook Form
- **Security**: bcryptjs untuk password hashing

## 📦 Instalasi dan Setup

### Prerequisites

- Node.js 18+ dan npm
- PostgreSQL 12+ (running dan accessible)

### 1. Setup PostgreSQL Database

Buat database baru di PostgreSQL:

```sql
CREATE DATABASE smk_sunan_giri;
```

**Pastikan PostgreSQL service sedang berjalan!**

### 2. Setup Environment Variables

File `.env.local` sudah ada di project. Edit dengan konfigurasi database Anda:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/smk_sunan_giri"
JWT_SECRET="your-secret-key-here"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migration

```bash
npm run prisma:migrate
```

Saat diminta nama migration, ketik: `init`

### 5. Seed Database dengan Data Awal

```bash
npm run prisma:seed
```

Data yang ditambahkan:
- 4 Program Jurusan (TI, Akuntansi, Desain Grafis, Otomotif)
- Admin User (username: `admin`, password: `admin123`)
- School Profile
- Sample News

### 6. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di **http://localhost:3000**

## 👤 User Roles dan Default Login

### Available User Roles:
1. **ADMIN_UTAMA** - Administrator utama sistem
2. **ADMIN_PPDB** - Admin khusus pengelolaan PPDB
3. **ADMIN_BKK** - Admin khusus pengelolaan BKK
4. **GURU** - Guru/Wali Kelas
5. **SISWA_AKTIF** - Siswa yang sedang aktif
6. **CALON_SISWA** - Calon siswa pendaftar
7. **ALUMNI** - Alumni sekolah
8. **PERUSAHAAN** - Mitra industri/perusahaan
9. **PENGUNJUNG** - Pengunjung umum

### 🔐 Default Admin Account:
```
Username: admin
Password: admin123
Role: ADMIN_UTAMA
```

**⚠️ PENTING**: Ubah password admin dan JWT_SECRET sebelum deploy ke production!

## 📁 Struktur Project

```
school/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/               # Authentication APIs
│   │   │   ├── admin/              # Admin APIs
│   │   │   ├── ppdb/               # PPDB APIs
│   │   │   ├── ai-recommendation/  # AI Recommendation APIs
│   │   │   ├── tracer-study/       # Tracer Study APIs
│   │   │   ├── bkk/                # BKK APIs
│   │   │   └── public/             # Public APIs
│   │   ├── page.tsx                # Home page
│   │   ├── login/                  # Login page
│   │   ├── register/               # Register page
│   │   ├── ppdb/                   # PPDB pages
│   │   ├── ai-recommendation/      # AI pages
│   │   ├── bkk/                    # BKK pages
│   │   ├── tracer-study/           # Tracer Study pages
│   │   ├── admin/                  # Admin pages
│   │   └── layout.tsx              # Root layout
│   ├── components/                 # React Components
│   │   ├── common/                 # Common components (Navbar, etc)
│   │   ├── auth/                   # Auth components
│   │   └── dashboard/              # Dashboard components
│   └── lib/                        # Utilities & Helpers
│       ├── auth/                   # JWT dan session utilities
│       ├── db/                     # Database connection
│       └── utils/                  # Helper functions
├── prisma/
│   ├── schema.prisma               # Prisma database schema
│   └── seed.ts                     # Database seed script
├── .env.local                      # Environment variables
└── package.json
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register           - Daftar user baru
POST   /api/auth/login              - Login user
GET    /api/auth/me                 - Get current user info
POST   /api/auth/logout             - Logout user
```

### PPDB
```
POST   /api/ppdb/register           - Daftar PPDB
GET    /api/ppdb/register           - Get PPDB data user
```

### AI Recommendation
```
POST   /api/ai-recommendation/generate  - Generate rekomendasi jurusan
GET    /api/ai-recommendation/generate  - Get history rekomendasi
```

### Tracer Study
```
POST   /api/tracer-study/update     - Update/Create tracer study data
GET    /api/tracer-study/update     - Get tracer study data
```

### BKK (Job Posting)
```
GET    /api/bkk/job-postings        - Get semua lowongan kerja
POST   /api/bkk/apply               - Apply untuk lowongan kerja
GET    /api/bkk/apply               - Get applications user
```

### Admin
```
GET    /api/admin/stats             - Get dashboard statistics
```

### Public
```
GET    /api/public/school-profile   - Get profil sekolah
GET    /api/public/jurusan          - Get daftar jurusan
GET    /api/public/news             - Get berita sekolah
```

## 📋 Development Commands

```bash
# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Generate Prisma Client
npm run prisma:generate

# Run database migration
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 🗄️ Prisma Studio - Database GUI

Untuk melihat dan memanipulasi database secara visual:

```bash
npm run prisma:studio
```

Ini akan membuka interface web di `http://localhost:5555`

## ✅ Fitur yang Sudah Diimplementasikan

### Fase 1 (Core Features) ✅
- [x] Authentication & Authorization (JWT + Role-based)
- [x] Profil Sekolah & Berita
- [x] PPDB Online Registration
- [x] AI Recommendation System (Rule-based engine)
- [x] Tracer Study Alumni
- [x] BKK Job Posting & Applications
- [x] Admin Dashboard
- [x] Responsive UI dengan Tailwind CSS
- [x] Complete Database Schema

### Fase 2 (Enhancement) - Untuk Development Lanjutan
- [ ] Email Notifications via SMTP
- [ ] File Upload untuk dokumen PPDB
- [ ] Advanced AI dengan Machine Learning
- [ ] Interview Scheduling System
- [ ] Analytics & Reporting (Charts & Graphs)
- [ ] Import/Export data (Excel, PDF)
- [ ] AI Chatbot for Customer Support
- [ ] Mobile App (React Native/Flutter)
- [ ] SMS Notifications
- [ ] Social Media Integration

## ⚡ Quick Start Summary

```bash
# 1. Create PostgreSQL database
# CREATE DATABASE smk_sunan_giri;

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Migrate database
npm run prisma:migrate

# 4. Seed data awal
npm run prisma:seed

# 5. Start dev server
npm run dev

# 6. Open browser
# http://localhost:3000

# Login dengan:
# Username: admin
# Password: admin123
```

## 🐛 Troubleshooting

### ❌ Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**✅ Solusi**: 
- Pastikan PostgreSQL service berjalan
- Periksa DATABASE_URL di `.env.local`
- Periksa port PostgreSQL (default: 5432)

### ❌ Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# atau
npx kill-port 3000
npm run dev
```

### ❌ Prisma Client Issues
```bash
npm run prisma:generate
npm install
```

### ❌ Database Migration Failed
```bash
# WARNING: This will reset database
npx prisma migrate reset
```

### ❌ Node modules issues
```bash
rm -r node_modules
npm install
```

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Notes

1. **JWT Secret**: Ubah JWT_SECRET yang kuat
2. **Password**: Semua password di-hash dengan bcryptjs
3. **Environment Variables**: Jangan commit `.env.local`
4. **HTTPS**: Selalu gunakan HTTPS di production
5. **Database**: Setup password PostgreSQL yang kuat

## 📊 Database Schema

Database terdiri dari 11 tabel utama:
- `User` - Data pengguna sistem
- `Jurusan` - Program keahlian
- `PPDBEntry` - Pendaftar PPDB
- `AIRecommendationResult` - Hasil rekomendasi AI
- `TracerStudy` - Data tracer alumni
- `JobPosting` - Lowongan kerja
- `JobApplication` - Lamaran kerja
- `News` - Berita sekolah
- `SchoolProfile` - Profil sekolah

## 🚀 Production Deployment

### Recommended Hosting:
- Vercel (for Next.js)
- Railway, Heroku (with PostgreSQL)
- AWS EC2 + RDS
- DigitalOcean

### Pre-deployment Checklist:
- [ ] Update all environment secrets
- [ ] Setup PostgreSQL production database
- [ ] Enable HTTPS/SSL
- [ ] Configure backup strategy
- [ ] Setup monitoring & logging
- [ ] Enable rate limiting
- [ ] Setup CDN for static files
- [ ] Test all features thoroughly
- [ ] Setup email notifications
- [ ] Configure security headers

## 📞 Support

Untuk bantuan dan pertanyaan:
- Email: support@smksunan.id
- Phone: (0234) 567890
- Website: https://smksunan.id

## 📝 License

© 2024 SMK Sunan Giri. All rights reserved.

---

**Dibuat dengan ❤️ untuk SMK Sunan Giri**

Last Updated: December 2024
Version: 1.0.0
