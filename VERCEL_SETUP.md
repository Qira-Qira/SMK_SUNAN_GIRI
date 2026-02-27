# 🚀 Vercel Deployment & Production Setup Guide

Panduan lengkap untuk deploy aplikasi SMK Sunan Giri ke Vercel dengan production-ready configuration.

## ✅ Pre-Deployment Checklist

- [ ] Semua kode sudah di-push ke GitHub repository
- [ ] Database PostgreSQL di production sudah ready
- [ ] Semua environment variables sudah disiapkan
- [ ] Security audit sudah dilakukan
- [ ] Testing di development berhasil
- [ ] Database migrations sudah di-testing

---

## 🔑 Step 1: Prepare Production Environment Variables

### Generate Secure Secret Keys

```bash
# Generate JWT_SECRET (run in terminal/command line)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Simpan hasil output di atas untuk langkah selanjutnya.

### Siapkan PostgreSQL Production Database

Gunakan Supabase atau PostgreSQL hosting lainnya:

```sql
-- Jangan gunakan user 'postgres'
CREATE USER smk_production WITH PASSWORD 'YOUR_VERY_STRONG_PASSWORD';
ALTER ROLE smk_production CREATEDB;
CREATE DATABASE smk_sunan_giri OWNER smk_production;
GRANT ALL PRIVILEGES ON DATABASE smk_sunan_giri TO smk_production;
```

Dapatkan credentials:
- **Host**: db.xxxxx.supabase.co (jika Supabase)
- **Port**: 5432
- **Database**: smk_sunan_giri
- **User**: smk_production
- **Password**: YOUR_VERY_STRONG_PASSWORD

---

## 🔗 Step 2: Connect Repository to Vercel

### Opsi A: Via Web Interface

1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub/GitLab
3. Klik **"New Project"**
4. Import repository Anda
5. Framework preset: **Next.js** (auto-detected)
6. Lanjut ke **Step 3**

### Opsi B: Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy dari folder project
cd c:\Users\nawaf\Documents\project\school
vercel
```

---

## ⚙️ Step 3: Configure Environment Variables di Vercel

### Vercel Dashboard Setup

1. Project Settings → **Environment Variables**
2. Tambahkan variables berikut:

| Variable | Value | Type |
|----------|-------|------|
| `DATABASE_URL` | `postgresql://smk_production:PASSWORD@host:5432/smk_sunan_giri?schema=public&prepared_statements=false` | Sensitive |
| `DIRECT_URL` | `postgresql://smk_production:PASSWORD@host:5432/smk_sunan_giri` | Sensitive |
| `JWT_SECRET` | Hasil generate script di atas | Sensitive |
| `NEXTAUTH_SECRET` | Hasil generate script di atas | Sensitive |
| `NEXTAUTH_URL` | `https://yourdomain.com` | Regular |
| `NODE_ENV` | `production` | Regular |
| `MAX_FILE_SIZE` | `5242880` | Regular |

### Environment Variable Scopes

Untuk multi-environment setup:

**Production Variables** (default)
- Scope: Production
- Apply to: All environments

**Preview Variables** (optional)
- Scope: Preview
- Apply ke staging/PR previews

**Development Variables** (local only)
- Gunakan `.env.local` di local machine

---

## 🗄️  Step 4: Setup Production Database

### Run Migrations di Vercel

```bash
# Local machine - run migrations sebelum deploy
npx prisma migrate deploy

# Atau jika ada pending migrations
npx prisma migrate dev --name initial_schema
```

### Alternative: Using Vercel CLI

```bash
# Set environment variable untuk Prisma
vercel env set DATABASE_URL
vercel env set DIRECT_URL

# Run migrations
vercel run prisma migrate deploy
```

### Verify Database Connection

```bash
# Check database
npx prisma db push

# View database di Prisma Studio
npx prisma studio
```

---

## 🚀 Step 5: Deploy ke Vercel

### Auto-Deploy (Recommended)

```bash
# Push ke GitHub - Vercel akan auto-deploy
git add .
git commit -m "Ready for production"
git push origin main
```

Vercel akan:
1. Trigger build otomatis
2. Run: `prisma generate && next build`
3. Deploy ke production URL

### Manual Deploy

```bash
# Via CLI
vercel --prod

# Follow prompts untuk confirm settings
```

---

## ✅ Step 6: Verify Production Deployment

### Test API Endpoints

```bash
# Test server health
curl https://yourdomain.com/api/auth/me

# Test public endpoints  
curl https://yourdomain.com/api/public/school-profile

# Test database connection
curl https://yourdomain.com/api/debug
```

### Test Authentication

1. Buka `https://yourdomain.com/login`
2. Login dengan test account
3. Check cookies: Set `token` dengan HttpOnly flag
4. Test protected routes: `/admin`, `/dashboard`

### Monitor Logs

```bash
# Real-time logs
vercel logs yourdomain.com --tail

# View past deployments
vercel ls
```

---

## 🔒 Security Checklist untuk Production

### ✅ Completed in this setup:

- [x] Environment variables di-encrypt di Vercel
- [x] `.env` file tidak di-expose (ada di .gitignore)
- [x] HTTPS/SSL otomatis dari Vercel
- [x] API security headers di vercel.json
- [x] JWT tokens dengan secure cookies (httpOnly)
- [x] Password hashing dengan bcryptjs
- [x] Role-based access control di middleware

### ⚠️ Additional Recommendations:

1. **Rate Limiting** - Implementasi rate limiting untuk API
2. **CORS** - Restrict CORS ke domain Anda saja
3. **Content Security Policy** - Add CSP headers
4. **Database Backups** - Setup automatic backups di PostgreSQL hosting
5. **Monitoring** - Setup error tracking (Sentry, LogRocket)

---

## 📁 File Upload Storage untuk Production

### Current Issue
Upload files disimpan di `/public/uploads` - temporary storage di Vercel (akan hilang setiap deploy)

### Solution: Gunakan Supabase Storage

```typescript
// src/lib/storage/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key di server
);

export async function uploadFile(file: File, bucket: string, path: string) {
  const buffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer);
  
  if (error) throw error;
  return data;
}
```

---

## 🛠️ Debug & Troubleshooting

### Build Fails dengan "Prisma error"

```bash
# Regenerate Prisma Client
vercel env pull  # Pull .env dari Vercel
npx prisma generate
npx prisma migrate deploy
vercel redeploy  # Redeploy
```

### Database Connection Timeout

1. Verify URL format di Vercel env variables
2. Check database connection limit di PostgreSQL
3. Gunakan pooler: Supabase pooling mode
4. Increase `timeoutDuration` di Prisma schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Cookie Not Persisting Across Requests

Pastikan di `.env` production:
```env
NEXTAUTH_URL="https://yourdomain.com"  # HTTPS required
NODE_ENV="production"
```

---

## 🔄 Rollback jika ada error

```bash
# View past deployments
vercel deployments

# Rollback ke deployment sebelumnya
vercel rollback <deployment-id>

# Atau via GitHub releases
# Push ke branch lain, Vercel akan create preview
```

---

## 📊 Monitoring Production

### Vercel Dashboard
- **Edge Function** metrics
- **Response time** monitoring
- **Error tracking** & logs
- **Database query** optimization

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay & debugging
- **Datadog** - APM & monitoring
- **New Relic** - Performance monitoring

---

## 🆘 Perlu Help?

- Cek Vercel docs: https://vercel.com/docs
- Cek Next.js deployment: https://nextjs.org/docs/deployment
- Cek Prisma production: https://www.prisma.io/docs/guides/deployment/production

Selamat! Aplikasi Anda siap production! 🎉
