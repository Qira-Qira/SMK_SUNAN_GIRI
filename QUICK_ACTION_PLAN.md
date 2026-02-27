# ⚡ QUICK ACTION PLAN - Production Deployment

**Status**: ✅ Main fixes completed  
**Next Steps**: Follow actions below in order

---

## 🎯 IMMEDIATE ACTIONS (Required before Vercel deploy)

### 1. **Fix File Upload Storage** (CRITICAL)
**Status**: ⚠️ NOT YET FIXED - MUST DO BEFORE PRODUCTION

Current problem: Files uploaded disimpan di `/public/uploads` - akan hilang setiap deploy di Vercel

**Options** (choose 1):

#### A. Use Supabase Storage (Recommended)
```bash
npm install @supabase/supabase-js
```

Create `src/lib/storage/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File, bucket: string, path: string) {
  const buffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { upsert: true });
  
  if (error) throw error;
  return data;
}
```

Update `src/app/api/ppdb/upload/route.ts`:
```typescript
import { uploadFile } from '@/lib/storage/supabase';

// Replace the fs.writeFile dengan:
const filePath = `ppdb/${user.id}/${filenameSafe}`;
await uploadFile(file, 'documents', filePath);

// Get public URL:
const { data } = supabase.storage
  .from('documents')
  .getPublicUrl(filePath);

return NextResponse.json({ url: data.publicUrl }, { status: 201 });
```

#### B. Use Vercel Blob (Easiest)
```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

const blob = await put(filenameSafe, file, { access: 'public' });
return NextResponse.json({ url: blob.url }, { status: 201 });
```

#### C. Use AWS S3
```bash
npm install aws-sdk
```

**Recommendation**: Use **Supabase Storage** or **Vercel Blob**

---

### 2. **Setup Environment Variables**

Create `.env.local` for local testing:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-generated-secret"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

Then push to Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Push environment variables
vercel env pull
```

Add to Vercel via dashboard or CLI:
```
DATABASE_URL = "postgresql://..."
DIRECT_URL = "postgresql://..."
JWT_SECRET = "generated-secret"
NEXTAUTH_SECRET = "generated-secret"
NEXTAUTH_URL = "https://yourdomain.com"
NODE_ENV = "production"
```

---

### 3. **Run Database Migrations**

```bash
# Install Prisma
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data (if needed)
npx prisma db seed
```

---

### 4. **Test Build Locally**

```bash
# Build production version
npm run build

# Test production build
npm start

# Visit http://localhost:3000
```

If build fails, check:
- ✅ DATABASE_URL valid
- ✅ DIRECT_URL valid
- ✅ All env vars in `.env.local`
- ✅ `npm run prisma:generate` works

---

## 🚀 DEPLOYING TO VERCEL

### Option A: Via Web (Easiest)

1. Push code to GitHub:
```bash
git add .
git commit -m "Production ready with fixes"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select GitHub repo
4. Framework: Next.js (auto-detected)
5. Add Environment Variables (from section 2 above)
6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
vercel deploy --prod
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

After deployment, verify:

```bash
# Test API health
curl https://yourdomain.com/api/auth/me

# Check can login
# Visit https://yourdomain.com/login
# Try login with test account
# Check cookie set

# Check admin dashboard
# Visit https://yourdomain.com/admin
# Should redirect to login if not authenticated

# Check file upload
# Go to PPDB page
# Try upload file
# Should see file URL response
```

View logs:
```bash
vercel logs yourdomain.com
```

---

## ⬆️ PRODUCTION MIGRATION WORKFLOW

```
Step 1: Local Setup
┌─────────────────────────────────────┐
│ npm install                         │
│ Create .env.local with all vars    │
│ npx prisma migrate deploy          │
│ npm run build                       │
│ npm start & test                    │
└─────────────────────────────────────┘
         ↓
Step 2: Git Push
┌─────────────────────────────────────┐
│ git add .                           │
│ git commit -m "Production ready"    │
│ git push origin main                │
└─────────────────────────────────────┘
         ↓
Step 3: Vercel Configuration
┌─────────────────────────────────────┐
│ Connect GitHub repo to Vercel       │
│ Add Environment Variables           │
│ vercel.json auto-uses settings      │
└─────────────────────────────────────┘
         ↓
Step 4: Auto Deploy
┌─────────────────────────────────────┐
│ Vercel detects git push             │
│ Runs: prisma generate && next build │
│ Deploy to production URL            │
│ SSL/HTTPS auto-configured           │
└─────────────────────────────────────┘
         ↓
Step 5: Verify
┌─────────────────────────────────────┐
│ Test all endpoints                  │
│ Check database connection           │
│ Verify file uploads work            │
│ Monitor logs for errors             │
└─────────────────────────────────────┘
```

---

## 📋 FILES CREATED/MODIFIED

### ✅ Created:
1. `.env.example` - Environment variable documentation
2. `vercel.json` - Vercel deployment configuration
3. `VERCEL_SETUP.md` - Step-by-step Vercel setup guide
4. `PRODUCTION_AUDIT_REPORT.md` - Complete audit findings

### ✅ Modified:
1. `src/lib/db/prisma.ts` - Fixed logging for production

### ⚠️ Still Need to Fix:
1. File upload storage migration (Supabase/S3/Vercel Blob)
2. Job scheduler (move to cron endpoint)

---

## 🆘 TROUBLESHOOTING

### "Build fails - Prisma error"
```bash
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
```

### "Database connection timeout"
- Check DATABASE_URL & DIRECT_URL correct
- Verify PostgreSQL accepting connections
- Try connection pooling: Supabase recommended

### "Login not working after deploy"
- Check NEXTAUTH_URL = "https://yourdomain.com" (not localhost)
- Check JWT_SECRET & NEXTAUTH_SECRET set in Vercel
- Clear browser cookies & cache

### "File uploads not persisting"
- File upload storage NOT fixed yet
- Must use Supabase/S3/Vercel Blob
- `/public/uploads` won't work on Vercel

---

## 📞 RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment/production
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **JWT Best Practices**: https://tools.ietf.org/html/rfc7519

---

## ⏱️ ESTIMATED TIME

- Local setup & testing: **30 minutes**
- Fix file uploads: **30-45 minutes**
- Deploy to Vercel: **10 minutes**
- Verification: **15 minutes**

**Total: ~2 hours**

---

## 🎯 PRIORITY ORDER

1. ⚡ **CRITICAL**: Fix file upload storage
2. ⚡ **HIGH**: Setup environment variables
3. ⚡ **HIGH**: Configure Vercel
4. 📋 **MEDIUM**: Test locally
5. ✅ **FINAL**: Deploy & verify

---

**Ready to deploy?** Start with Step 1! 🚀
