# ✅ PRODUCTION DEPLOYMENT INTERACTIVE CHECKLIST
## Use this to track your progress toward deployment

---

## PHASE 1: PREPARATION (Week Before Deployment)

### Environment Setup
- [ ] Read `DEPLOYMENT_SUMMARY.md`
- [ ] Read `PRODUCTION_AUDIT_REPORT.md`
- [ ] Install Node.js 18+ (current: check with `node -v`)
- [ ] Install npm 9+ (check with `npm -v`)
- [ ] Clone/open project in VS Code

### Create Production Database
- [ ] Choose database provider:
  - [ ] Supabase (recommended, free tier)
  - [ ] AWS RDS PostgreSQL
  - [ ] DigitalOcean PostgreSQL
  - [ ] Other: _________
- [ ] Create database instance
- [ ] Save credentials:
  - [ ] Host: ___________________
  - [ ] Port: ___________________
  - [ ] Database: ___________________
  - [ ] User: ___________________
  - [ ] Password: ___________________

### Generate Security Secrets
```bash
# Run these commands and save outputs:
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] JWT_SECRET: ___________________________________________________
- [ ] NEXTAUTH_SECRET: ___________________________________________________

### Setup Supabase for File Storage
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Get Project URL: ___________________
- [ ] Get Service Role Key: ___________________
- [ ] Create storage buckets:
  - [ ] ppdb-documents
  - [ ] job-applications
  - [ ] profiles

---

## PHASE 2: CODE FIXES (1-2 Days)

### Fix #1: Migrate File Uploads
- [ ] Read `FILE_UPLOAD_MIGRATION.md`
- [ ] Install @supabase/supabase-js: `npm install @supabase/supabase-js`
- [ ] Create `src/lib/storage/supabase-storage.ts`
- [ ] Update `src/app/api/ppdb/upload/route.ts`
- [ ] Update `src/app/api/bkk/uploads/route.ts`
- [ ] Test file upload locally:
  - [ ] Start dev server: `npm run dev`
  - [ ] Try upload in PPDB form
  - [ ] Verify Supabase URL returned
- [ ] Delete `/public/uploads` directory (backup first)

### Fix #2: Job Scheduler for Production
- [ ] Create `src/app/api/jobs/cleanup/route.ts` (cron endpoint)
- [ ] Add CRON_SECRET to environment: `npm run dev` with .env update
- [ ] Update `vercel.json` to add cron section
- [ ] Remove scheduler from `src/app/layout.tsx`
- [ ] Test cron endpoint locally

### Setup Environment Files
- [ ] Create `.env.local` with all variables:
  ```env
  DATABASE_URL="postgresql://..."
  DIRECT_URL="postgresql://..."
  JWT_SECRET="your-generated-secret"
  NEXTAUTH_SECRET="your-generated-secret"
  NEXTAUTH_URL="http://localhost:3000"
  NODE_ENV="development"
  NEXT_PUBLIC_SUPABASE_URL="..."
  SUPABASE_SERVICE_KEY="..."
  ```
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify no secrets in version control: `git status`

### Code Review
- [ ] Review `PRODUCTION_AUDIT_REPORT.md` findings
- [ ] Check all API error handling
- [ ] Verify no `console.error` with sensitive data
- [ ] Ensure all async functions have try-catch

---

## PHASE 3: LOCAL TESTING (1 Day)

### Install Dependencies
```bash
npm install
```
- [ ] Installation successful, no errors

### Database Setup
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed  # Optional: seed test data
```
- [ ] Prisma client generated
- [ ] Migrations applied successfully
- [ ] Database contains tables

### Build Testing
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] Next.js shows success message
- [ ] No TypeScript errors

### Production Build Run
```bash
npm start
```
- [ ] Server starts on http://localhost:3000
- [ ] No errors in console
- [ ] Website loads at localhost:3000

### Feature Testing Locally

#### Authentication
- [ ] Homepage loads
- [ ] Click Login button
- [ ] Registration works (create test user)
- [ ] Login with test user works
- [ ] Token cookie set (check DevTools > Application > Cookies)
- [ ] Logout works

#### PPDB Upload
- [ ] Go to PPDB registration
- [ ] Fill all required fields
- [ ] Upload document (PDF or image)
- [ ] File uploads successfully
- [ ] Supabase URL returned (not /uploads/)
- [ ] Submitted registration successful

#### Admin Features
- [ ] Admin user login works
- [ ] Admin dashboard accessible
- [ ] Can view PPDB entries
- [ ] Can view statistics

#### API Testing
```bash
# In another terminal:
curl http://localhost:3000/api/public/school-profile
curl http://localhost:3000/api/auth/me  # Should fail (not logged in)
# After login:
curl -H "Cookie: token=YOUR_TOKEN" http://localhost:3000/api/auth/me
```
- [ ] Public APIs respond correctly
- [ ] Protected APIs require authentication

---

## PHASE 4: SETUP VERCEL (1 Day)

### GitHub Setup
- [ ] Code pushed to GitHub repository
- [ ] All files committed (except .env)
- [ ] Main branch clean

### Vercel Account & Project
- [ ] Create/login Vercel account
- [ ] Connect GitHub account
- [ ] Import repository to Vercel
- [ ] Select Next.js framework (auto-detected)

### Environment Variables in Vercel
Go to: Project Settings → Environment Variables

Add for **Production**:
- [ ] DATABASE_URL = "postgresql://..."
- [ ] DIRECT_URL = "postgresql://..."
- [ ] JWT_SECRET = "your-generated-secret"
- [ ] NEXTAUTH_SECRET = "your-generated-secret"
- [ ] NEXTAUTH_URL = "https://YOUR-VERCEL-URL.vercel.app"
- [ ] NODE_ENV = "production"
- [ ] NEXT_PUBLIC_SUPABASE_URL = "https://..."
- [ ] SUPABASE_SERVICE_KEY = "..."

**Note**: Replace YOUR-VERCEL-URL with actual Vercel-assigned domain

### Custom Domain (Optional)
- [ ] Purchase/own your domain
- [ ] Add domain in Vercel settings
- [ ] Update DNS records as Vercel instructs
- [ ] SSL certificate auto-generated
- [ ] Update NEXTAUTH_URL to custom domain

---

## PHASE 5: DEPLOYMENT (Few minutes)

### Deploy to Vercel
- [ ] Push final code to GitHub:
  ```bash
  git add .
  git commit -m "Production ready deployment"
  git push origin main
  ```
- [ ] Vercel auto-detects and starts build
- [ ] Monitor build progress in Vercel dashboard
- [ ] Build completes successfully

**OR** Deploy via CLI:
```bash
npm install -g vercel
vercel login
vercel deploy --prod
```
- [ ] CLI deployment initiated
- [ ] Confirm production deployment

### Verify Build & Deployment
Check Vercel Dashboard:
- [ ] Build completed (green checkmark)
- [ ] Deployment successful
- [ ] No build errors or warnings
- [ ] Deployments page shows new deployment

---

## PHASE 6: POST-DEPLOYMENT VERIFICATION (30 minutes)

### URL Access
- [ ] Website accessible via Vercel URL
- [ ] Homepage loads without errors
- [ ] No 500/502 errors in browser

### Production Database
- [ ] Database connection working (no timeout errors)
- [ ] Can view data in production database
- [ ] Migrations applied correctly

### Core Features
- [ ] Login/Register functional
- [ ] New user registration works
- [ ] PPDB form submission works
- [ ] File uploads work (Supabase storage)
- [ ] Admin dashboard accessible

### API Endpoints
```bash
# Test production APIs:
curl https://yourdomain.com/api/public/school-profile
curl https://yourdomain.com/api/public/jurusan
curl https://yourdomain.com/api/public/news
```
- [ ] Public APIs respond (200 OK)
- [ ] Valid JSON returned
- [ ] No error messages

### Security Check
- [ ] HTTPS working (lock icon in browser)
- [ ] Cookies are HttpOnly (DevTools > Application > Cookies)
- [ ] No exposed secrets in source
- [ ] Security headers present (vercel.json applied)

### Performance Check
```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com
```
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No timeout errors

### Error Monitoring
```bash
vercel logs yourdomain.com
```
- [ ] Check logs for errors
- [ ] No database connection errors
- [ ] No authentication errors
- [ ] All endpoints responding

### Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Responsive design working
- [ ] Touch interactions responsive

---

## PHASE 7: MONITORING SETUP (Optional but Recommended)

### Error Tracking
- [ ] Sign up for Sentry
- [ ] Add Sentry to Next.js project
- [ ] Configure reporting

### Performance Monitoring
- [ ] Setup Vercel Analytics (built-in)
- [ ] Monitor Web Vitals
- [ ] Check database query performance

### Uptime Monitoring
- [ ] Setup UptimeRobot or similar
- [ ] Monitor 24/7 for downtime

---

## PHASE 8: MAINTENANCE (Ongoing)

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Database backup verification
- [ ] Monthly: Security updates

### Backup Strategy
- [ ] Database backup configured
- [ ] Automatic backups enabled
- [ ] Test backup restore process
- [ ] Document recovery procedure

### Updates
- [ ] Subscribe to Next.js updates
- [ ] Subscribe to Prisma updates
- [ ] Subscribe to dependency security alerts
- [ ] Plan quarterly updates

---

## 📊 PROGRESS SUMMARY

Calculate your completion:

- **Phase 1 Prep**: _____ / 8 checkboxes
- **Phase 2 Code**: _____ / 20 checkboxes
- **Phase 3 Testing**: _____ / 15 checkboxes
- **Phase 4 Setup**: _____ / 12 checkboxes
- **Phase 5 Deploy**: _____ / 4 checkboxes
- **Phase 6 Verify**: _____ / 15 checkboxes
- **Phase 7 Monitor**: _____ / 5 checkboxes

**Total Completion: _____ / 79 items completed**

---

## 🎯 CRITICAL GO/NO-GO DECISION POINTS

**MUST BE COMPLETED BEFORE MOVING FORWARD:**

1. **Before Phase 2 Code Fixes**:
   - [ ] All environment variables generated
   - [ ] Production database created
   - [ ] Supabase setup complete

2. **Before Phase 3 Testing**:
   - [ ] .env.local created with all variables
   - [ ] File upload code migrated
   - [ ] Job scheduler created

3. **Before Phase 5 Deployment**:
   - [ ] All local tests passing
   - [ ] Code pushed to GitHub
   - [ ] Environment variables added to Vercel
   - [ ] No console errors in build

4. **Before Going Live**:
   - [ ] All Phase 6 verifications passed
   - [ ] Website fully functional
   - [ ] Database performing well
   - [ ] No error logs in production

---

## 🚨 ABORT CRITERIA

**Stop deployment and troubleshoot if:**

- [ ] Build failing with errors
- [ ] Database connection not working
- [ ] Login/auth not functional
- [ ] File uploads failing
- [ ] API endpoints returning 500
- [ ] Security vulnerabilities found

---

## ✅ FINAL APPROVAL

When all boxes checked:

- [ ] I have completed all items
- [ ] All tests are passing
- [ ] Website is fully functional
- [ ] I am confident in this deployment
- [ ] I understand the codebase
- [ ] I have backup and recovery plan

**Approved for Production**: _________________ (Date)  
**Deployed By**: ___________________________ (Name)  
**Reviewed By**: ___________________________ (Name)

---

**Good luck! You've got this! 🚀**
