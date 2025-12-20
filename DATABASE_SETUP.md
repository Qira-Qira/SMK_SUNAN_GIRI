# PostgreSQL Setup Guide untuk SMK Sunan Giri

## Installation

### Windows
1. Download PostgreSQL dari: https://www.postgresql.org/download/windows/
2. Jalankan installer dan ikuti wizard
3. Ingat password untuk user `postgres` yang Anda buat
4. Port default: 5432

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Create Database

### Method 1: Using pgAdmin (GUI)
1. Buka pgAdmin (biasanya di browser: http://localhost:5050)
2. Right-click "Databases" → Create → Database
3. Name: `smk_sunan_giri`
4. Click Save

### Method 2: Using Command Line

#### Windows (Command Prompt)
```bash
# Login ke PostgreSQL
psql -U postgres

# Di psql prompt, ketik:
CREATE DATABASE smk_sunan_giri;
```

#### macOS/Linux (Terminal)
```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Di psql prompt, ketik:
CREATE DATABASE smk_sunan_giri;

# Untuk exit psql
\q
```

## Verify Database Connection

```bash
# Test connection dari project directory
psql -U postgres -d smk_sunan_giri -h localhost
```

Jika berhasil, Anda akan melihat prompt PostgreSQL.

## Update .env.local

Edit file `.env.local` di root project:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/smk_sunan_giri"
```

Ganti `YOUR_PASSWORD` dengan password yang Anda buat saat install PostgreSQL.

Contoh:
```env
DATABASE_URL="postgresql://postgres:mysecurepass123@localhost:5432/smk_sunan_giri"
```

## Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solusi:**
- Pastikan PostgreSQL service berjalan
  - Windows: Cek di Services (services.msc)
  - macOS: `brew services list`
  - Linux: `sudo systemctl status postgresql`

### Wrong Password
```
Error: password authentication failed
```

**Solusi:**
- Reset password PostgreSQL (lihat panduan di bawah)

### Database Doesn't Exist
```
Error: database "smk_sunan_giri" does not exist
```

**Solusi:**
- Buat database terlebih dahulu sesuai instruksi di atas

## Reset PostgreSQL Password (Windows)

1. Stop PostgreSQL Service
2. Buka Command Prompt as Administrator
3. Navigate ke PostgreSQL bin folder:
   ```bash
   cd "C:\Program Files\PostgreSQL\15\bin"
   ```
4. Jalankan:
   ```bash
   pg_ctl -D "C:\Program Files\PostgreSQL\15\data" -l logfile start -o "-p 5432"
   ```
5. Edit pg_hba.conf (ubah auth method menjadi `trust`)
6. Restart service dan update password

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- Connect to database
\c smk_sunan_giri

-- List all tables
\dt

-- Drop database (WARNING!)
DROP DATABASE smk_sunan_giri;

-- Exit psql
\q
```

## Next Steps

Setelah PostgreSQL setup selesai:

1. Run setup script:
   ```bash
   # Windows
   setup.bat
   
   # macOS/Linux
   bash setup.sh
   ```

2. Atau manual:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

## Reference

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Prisma Documentation: https://www.prisma.io/docs/
- Node.js: https://nodejs.org/

---

Jika ada pertanyaan atau masalah, hubungi: support@smksunan.id
