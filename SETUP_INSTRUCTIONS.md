# 🚀 Setup Instructions - SMK Sunan Giri Website

Panduan lengkap untuk setup dan menjalankan website SMK Sunan Giri.

## ✅ Prerequisites

Pastikan Anda sudah menginstall:
1. **Node.js 18+** - Download dari https://nodejs.org/
2. **PostgreSQL 12+** - Download dari https://www.postgresql.org/download/
3. **Git** (Optional) - Download dari https://git-scm.com/

Verifikasi instalasi:
```bash
node --version      # Should output v18.x.x or higher
npm --version       # Should output 9.x.x or higher
psql --version      # Should output psql (PostgreSQL) 12.x
```

## 📋 Step-by-Step Setup Guide

### Step 1: Setup PostgreSQL Database

#### Option A: Using pgAdmin (GUI - Recommended for beginners)

1. Buka pgAdmin (biasanya di http://localhost:5050)
2. Login dengan credentials yang Anda buat saat install
3. Right-click **Databases** → **Create** → **Database**
4. Isi form:
   - **Name**: `smk_sunan_giri`
   - Klik **Save**
5. Database sudah ready!

#### Option B: Using Command Line

**Windows (Command Prompt as Administrator):**
```bash
psql -U postgres -h localhost

# Di psql prompt, ketik:
CREATE DATABASE smk_sunan_giri;
\q
```

**macOS/Linux (Terminal):**
```bash
sudo -u postgres psql

# Di psql prompt, ketik:
CREATE DATABASE smk_sunan_giri;
\q
```

Untuk panduan lebih detail, lihat **DATABASE_SETUP.md**

### Step 2: Update Environment Variables

Edit file `.env.local` di root project:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smk_sunan_giri"

# JWT Secret (for authentication)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-12345678901234567890"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# File Upload
MAX_FILE_SIZE=5242880

# AI Recommendation Engine
AI_MODEL_VERSION="v1"
```

**⚠️ PENTING:**
- Replace `YOUR_PASSWORD` dengan password PostgreSQL Anda
- Default username: `postgres`
- Default port: `5432`

Contoh:
```env
DATABASE_URL="postgresql://postgres:mysecurepass123@localhost:5432/smk_sunan_giri"
```

### Step 3: Automatic Setup (Recommended)

Jalankan script setup otomatis:

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

Script ini akan:
1. ✅ Install dependencies
2. ✅ Generate Prisma Client
3. ✅ Run database migrations
4. ✅ Seed database dengan data awal
5. ✅ Siap untuk development!

### Step 4: Manual Setup (Jika script tidak berfungsi)

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
# When prompted for name, type: init

# Seed database
npm run prisma:seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

Output akan menampilkan:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environment:  .env.local

Ready in 2.3s.
```

### Step 6: Access Website

1. Buka browser
2. Go to: **http://localhost:3000**
3. Anda akan melihat homepage SMK Sunan Giri!

## 🔐 Login dengan Default Admin Account

Setelah setup selesai, Anda bisa login sebagai admin:

```
URL: http://localhost:3000/login

Username: admin
Password: admin123
```

Ini akan membuka **Admin Dashboard** di `/admin`

**⚠️ PENTING**: Ubah password admin setelah login pertama!

## 📂 Project Structure

```
school/
├── README.md                   # Dokumentasi project
├── DATABASE_SETUP.md           # Panduan setup PostgreSQL
├── SETUP_INSTRUCTIONS.md       # File ini
├── setup.bat                   # Setup script untuk Windows
├── setup.sh                    # Setup script untuk macOS/Linux
├── .env.local                  # Environment variables (JANGAN COMMIT!)
├── package.json                # Dependencies & scripts
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── page.tsx            # Home page
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── ppdb/               # PPDB page
│   │   ├── ai-recommendation/  # AI Recommendation page
│   │   ├── bkk/                # BKK page
│   │   ├── tracer-study/       # Tracer Study page
│   │   ├── admin/              # Admin Dashboard
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── common/             # Navbar, etc
│   │   ├── auth/               # Auth components
│   │   └── dashboard/          # Dashboard components
│   │
│   └── lib/                    # Utilities
│       ├── auth/               # JWT, session utilities
│       ├── db/                 # Prisma client
│       └── utils/              # Helper functions
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Initial data seeding
│
└── public/                     # Static files
```

## 🛠️ Useful Commands

```bash
# Development
npm run dev                     # Start dev server with hot reload

# Production
npm run build                   # Build optimized production bundle
npm start                       # Start production server

# Database
npm run prisma:generate         # Generate Prisma Client
npm run prisma:migrate          # Run database migrations
npm run prisma:seed             # Seed initial data
npm run prisma:studio           # Open Prisma Studio (database GUI)

# Code Quality
npm run lint                    # Run ESLint
```

## 📊 Database Schema Overview

Database terdiri dari beberapa tabel utama:

### 1. User Table
Menyimpan data semua pengguna sistem

### 2. Jurusan Table
Menyimpan data program keahlian

### 3. PPDBEntry Table
Data pendaftar PPDB

### 4. AIRecommendationResult Table
Hasil rekomendasi jurusan dari AI

### 5. TracerStudy Table
Data tracer alumni

### 6. JobPosting Table
Lowongan kerja dari perusahaan

### 7. JobApplication Table
Lamaran kerja dari alumni

### 8. News Table
Berita dan pengumuman sekolah

### 9. SchoolProfile Table
Profil dan informasi sekolah

## 🔍 Troubleshooting

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Penyebab**: PostgreSQL tidak berjalan

**Solusi**:
1. **Windows**: Buka Services (services.msc), cari PostgreSQL, click Start
2. **macOS**: `brew services start postgresql@15`
3. **Linux**: `sudo systemctl start postgresql`

### ❌ "Error: database "smk_sunan_giri" does not exist"

**Penyebab**: Database belum dibuat

**Solusi**: Buat database sesuai Step 1 di atas

### ❌ "Error: password authentication failed"

**Penyebab**: Password salah di `.env.local`

**Solusi**: 
1. Verifikasi password PostgreSQL Anda
2. Update DATABASE_URL dengan password yang benar

### ❌ "Port 3000 is already in use"

**Solusi**:
```bash
# Kill process di port 3000
npx kill-port 3000
npm run dev
```

Atau gunakan port lain:
```bash
PORT=3001 npm run dev
```

### ❌ "Module not found" atau "Cannot find module"

**Solusi**:
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
npm run prisma:generate
```

### ❌ Seeded data tidak muncul

**Solusi**:
```bash
npm run prisma:seed
```

Atau buka Prisma Studio untuk debug:
```bash
npm run prisma:studio
```

## 🌐 Browser Testing

Website sudah di-test di:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Next Steps Setelah Setup Berhasil

1. **Explore Homepage**
   - Lihat desain dan layout
   - Cek navigation menu

2. **Register User Baru**
   - Klik "Register" di homepage
   - Isi form dan daftar
   - Login dengan credentials baru

3. **Try PPDB**
   - Buka `/ppdb`
   - Coba fill form pendaftaran
   - Lihat registration number

4. **Test AI Recommendation**
   - Buka `/ai-recommendation`
   - Jawab kuisioner
   - Lihat rekomendasi jurusan

5. **Check Admin Dashboard**
   - Login sebagai admin
   - Buka `/admin`
   - Lihat statistik

6. **Open Prisma Studio**
   - Run: `npm run prisma:studio`
   - Explore database tables
   - Lihat data yang tersimpan

## 📚 Documentation

Untuk dokumentasi lebih lengkap:
- **README.md** - Project overview & API docs
- **DATABASE_SETUP.md** - PostgreSQL setup guide
- **Prisma Docs** - https://www.prisma.io/docs/
- **Next.js Docs** - https://nextjs.org/docs/

## ⚙️ Customization & Development

### Menambah Halaman Baru

1. Buat folder di `src/app/[nama-halaman]/`
2. Buat file `page.tsx` di folder tersebut
3. Next.js otomatis membuat route

### Menambah API Endpoint

1. Buat folder di `src/app/api/[nama-endpoint]/`
2. Buat file `route.ts` dengan handler POST/GET
3. API ready di `/api/[nama-endpoint]`

### Mengubah Database Schema

1. Edit `prisma/schema.prisma`
2. Run: `npm run prisma:migrate`
3. Ikuti prompts untuk migration name

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET yang strong
- [ ] Update NEXTAUTH_SECRET
- [ ] Enable HTTPS di production
- [ ] Setup environment variables properly
- [ ] Database backup strategy
- [ ] Regular security updates

## 📞 Support & Help

- **Email**: support@smksunan.id
- **Phone**: (0234) 567890
- **Website**: https://smksunan.id

## 📝 Notes

- Semua timestamps menggunakan UTC
- Password di-hash dengan bcryptjs
- JWT token expires dalam 7 hari
- Database schema siap untuk production
- Code sudah di-optimize untuk performance

---

**Selamat! Setup berhasil dan website siap untuk development! 🎉**

Jika ada pertanyaan, silakan hubungi support team kami.

Last Updated: December 2024
