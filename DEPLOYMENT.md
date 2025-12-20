# 🌍 Production Deployment Guide - SMK Sunan Giri

Panduan untuk deploy website SMK Sunan Giri ke production environment.

## Before You Deploy

✅ Checklist:
- [ ] Semua testing selesai di development
- [ ] Database schema final dan tidak ada perubahan
- [ ] Semua API endpoints working
- [ ] UI/UX sudah di-review
- [ ] Security vulnerabilities sudah di-check
- [ ] Environment secrets sudah di-update

## 🔒 Security Preparation

### 1. Update Environment Secrets

**Change ALL default secrets in .env.production:**

```env
# ⚠️ JANGAN gunakan nilai ini di production!
DATABASE_URL="postgresql://user:VERY_STRONG_PASSWORD@prod-db-host:5432/smk_sunan_giri"

# Generate strong random strings untuk ini
JWT_SECRET="generate-very-long-random-string-here-at-least-32-chars"
NEXTAUTH_SECRET="another-very-long-random-string-here"

# Use your domain
NEXTAUTH_URL="https://smksunan.id"

# Security headers
CORS_ORIGIN="https://smksunan.id"
```

Untuk generate random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. PostgreSQL Production Setup

```sql
-- Create production user (jangan pakai postgres)
CREATE USER smk_prod WITH PASSWORD 'VERY_STRONG_PASSWORD';

-- Create database
CREATE DATABASE smk_sunan_giri_prod;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE smk_sunan_giri_prod TO smk_prod;
```

### 3. Enable HTTPS/SSL

- Buy SSL certificate (Let's Encrypt = free option)
- Configure web server untuk redirect HTTP → HTTPS
- Set NEXTAUTH_URL dengan HTTPS

## 🚀 Hosting Options

### Option 1: Vercel (Recommended for Next.js)

**Advantages:**
- Optimized for Next.js
- Automatic deployments
- Free tier available
- Global CDN included

**Steps:**
1. Push code to GitHub
2. Go to vercel.com
3. Import GitHub repo
4. Add environment variables
5. Deploy!

```bash
# Setup:
npm install -g vercel
vercel
```

### Option 2: Railway

**Advantages:**
- Simple interface
- Built-in PostgreSQL
- Affordable pricing

**Steps:**
1. Go to railway.app
2. Connect GitHub
3. Create new project
4. Add PostgreSQL
5. Deploy

### Option 3: DigitalOcean

**Advantages:**
- Full control
- Affordable VPS
- Good for scaling

**Steps:**
1. Create Ubuntu 22.04 Droplet
2. Install Node.js & PostgreSQL
3. Clone repository
4. Setup environment
5. Use PM2 for process management

```bash
# SSH ke server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql

# Install PM2
sudo npm install -g pm2

# Clone repo
git clone <your-repo-url>
cd school

# Install & Build
npm install
npm run build

# Start with PM2
pm2 start "npm start" --name "smk-sunan-giri"
pm2 startup
pm2 save
```

## 🗄️ Database Migration untuk Production

```bash
# Di production server:
npm run prisma:migrate -- --skip-generate

# Seed data jika perlu
npm run prisma:seed

# Verify dengan Prisma Studio (hanya untuk debugging)
npm run prisma:studio
```

## 🔍 Pre-Production Checklist

### Code & Build
- [ ] `npm run build` - Production build successful
- [ ] `npm run lint` - No linting errors
- [ ] All TypeScript errors resolved
- [ ] All dependencies updated & secure

### Database
- [ ] Production database created
- [ ] Database credentials secured
- [ ] Backup strategy implemented
- [ ] Migrations tested

### Security
- [ ] All environment secrets updated
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection enabled (Prisma handles this)
- [ ] XSS protection enabled (React handles this)

### Performance
- [ ] Image optimization done
- [ ] Bundle size acceptable
- [ ] CDN configured
- [ ] Caching strategy set
- [ ] API response times < 200ms

### Monitoring
- [ ] Error logging setup
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert system configured

## 📊 Monitoring & Maintenance

### Essential Tools

1. **Sentry** (Error tracking)
```bash
npm install @sentry/nextjs
```

2. **Datadog** atau **New Relic** (Performance monitoring)

3. **Uptime Robot** (Uptime monitoring)

### Backup Strategy

```bash
# Daily PostgreSQL backup
0 2 * * * /usr/bin/pg_dump smk_sunan_giri > /backups/db-$(date +\%Y\%m\%d).sql

# Upload to cloud storage
0 3 * * * aws s3 sync /backups s3://my-backup-bucket/
```

## 🔄 Continuous Deployment

### GitHub Actions (Automated Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Install Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test || true
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: vercel/action@master
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📈 Performance Optimization

### 1. Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image 
  src="/image.png" 
  alt="description"
  width={400}
  height={300}
  loading="lazy"
/>
```

### 2. Code Splitting
Next.js automatically code-splits by page.

### 3. Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_ppdb_status ON "PPDBEntry"(status);
CREATE INDEX idx_job_active ON "JobPosting"(isActive);
```

### 4. Caching Strategy
- Static pages: 1 year
- API routes: 5 minutes
- Assets: 1 year

## 🆘 Disaster Recovery

### Database Backup & Recovery

```bash
# Backup
pg_dump -U postgres smk_sunan_giri > backup.sql

# Restore
psql -U postgres -d smk_sunan_giri < backup.sql
```

### Server Recovery

1. Restore from backup
2. Reinstall dependencies: `npm install`
3. Rebuild: `npm run build`
4. Start service: `pm2 start app`

## 📞 Post-Deployment

### First Week Monitoring
- Check error logs daily
- Monitor database performance
- Test all critical features
- Collect user feedback
- Fix any production bugs immediately

### Regular Maintenance
- Weekly backup verification
- Monthly security updates
- Monthly performance review
- Quarterly database optimization

## 🔐 Security Hardening

### Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade

# Enable firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# SSH key only (disable password)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
```

### Application Security
- Enable rate limiting
- Implement CORS properly
- Use helmet for HTTP headers
- Enable CSRF protection
- Implement API authentication

### Database Security
- Strong passwords
- Regular backups
- Connection encryption
- Prepared statements (Prisma does this)
- Principle of least privilege

## 📝 Deployment Rollback

Jika ada issue:

```bash
# Vercel
vercel rollback

# Manual
git revert HEAD
npm run build
npm start
```

## 📚 Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment
- **PostgreSQL Backup**: https://www.postgresql.org/docs/backup-restore/
- **Security Best Practices**: https://owasp.org/

## ✅ Deployment Success Criteria

- [ ] Website accessible at production URL
- [ ] All pages loading correctly
- [ ] API endpoints responding
- [ ] Database connected and working
- [ ] Authentication working
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] Support team trained

---

**Ready for production! 🚀**

Untuk pertanyaan deployment, hubungi: support@smksunan.id

Last Updated: December 2024
