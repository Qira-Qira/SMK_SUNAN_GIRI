# 🚀 QUICK START - Mulai dalam 5 Menit!

## Prerequisites Installed?
Pastikan sudah punya:
- Node.js 18+
- PostgreSQL 12+

## 5 Step to Success

### 1️⃣ Database Setup (2 menit)

**Windows (Command Prompt - Run as Admin):**
```bash
psql -U postgres
CREATE DATABASE smk_sunan_giri;
\q
```

**macOS/Linux (Terminal):**
```bash
sudo -u postgres psql
CREATE DATABASE smk_sunan_giri;
\q
```

### 2️⃣ Update .env.local (1 menit)

Edit `.env.local`, update baris ini:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smk_sunan_giri"
```

Replace `YOUR_PASSWORD` dengan PostgreSQL password Anda.

### 3️⃣ Run Setup Script (1-2 menit)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
bash setup.sh
```

Script ini akan:
- Install dependencies
- Setup database
- Create seed data

### 4️⃣ Start Server (1 menit)

```bash
npm run dev
```

### 5️⃣ Open Browser (30 detik)

Go to: **http://localhost:3000**

## 🔐 Login Details

```
Username: admin
Password: admin123
```

---

## ⚡ Jika Script Gagal, Manual Setup:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Connection refused | PostgreSQL not running - start service |
| Database doesn't exist | Run: `CREATE DATABASE smk_sunan_giri;` |
| Port 3000 in use | `npx kill-port 3000` |
| Module not found | `npm install && npm run prisma:generate` |

## 📚 Full Documentation

- **SETUP_INSTRUCTIONS.md** - Detailed setup guide
- **DATABASE_SETUP.md** - PostgreSQL guide
- **README.md** - Full documentation

---

**That's it! Website running in < 5 minutes! 🎉**
