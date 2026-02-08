# Auto-Cleanup Expired Job Postings

## Deskripsi
Fitur untuk secara otomatis menghapus job postings yang sudah melewati deadline yang telah ditentukan.

## Bagaimana Cara Kerjanya

### 1. **Scheduled Cleanup (Cron Job)**
- Berjalan otomatis **setiap hari jam 00:00 (tengah malam)**
- Mengecek semua job postings dengan `deadline < sekarang`
- Menghapus posting yang sudah expired
- Dicatat di console log untuk monitoring

### 2. **Manual Cleanup API**
Admin dapat trigger cleanup secara manual melalui API endpoint

## File Struktur

```
src/
├── lib/
│   └── jobs/
│       ├── cleanup.ts          # Core cleanup logic
│       └── scheduler.ts         # Cron job scheduler
└── app/
    └── api/
        └── admin/
            └── jobs/
                └── cleanup/
                    └── route.ts # API endpoint
```

## API Endpoints

### 1. **Manual Cleanup (POST)**
```bash
POST /api/admin/jobs/cleanup
Authorization: Bearer admin_token
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 5,
  "timestamp": "2026-02-08T12:30:00.000Z"
}
```

### 2. **Check Expired Postings (GET)**
```bash
GET /api/admin/jobs/cleanup
Authorization: Bearer admin_token
```

**Response:**
```json
{
  "expiredPostings": [
    {
      "id": "job-123",
      "posisi": "Software Engineer",
      "deadline": "2026-02-07T00:00:00.000Z",
      "perusahaan": {
        "fullName": "PT Maju Jaya"
      }
    }
  ]
}
```

## Konfigurasi Cron Job

File: `src/lib/jobs/scheduler.ts`

**Cron Pattern Saat Ini:**
```typescript
'0 0 * * *'  // Setiap hari jam 00:00 (midnight)
```

### Contoh Pattern Lain:
```
'*/5 * * * *'    // Setiap 5 menit
'0 * * * *'      // Setiap jam
'0 */6 * * *'    // Setiap 6 jam
'0 0 * * *'      // Setiap hari jam 00:00 (default)
'0 2 * * 0'      // Setiap Minggu jam 02:00
```

Untuk mengubah, edit schedule di `scheduler.ts`:
```typescript
cronJob = cron.schedule('0 2 * * *', async () => {
  // ... cleanup code
});
```

## Testing Cleanup

### Test Manual Cleanup dengan cURL:
```bash
curl -X POST http://localhost:3000/api/admin/jobs/cleanup \
  -H "Cookie: token=YOUR_ADMIN_TOKEN"
```

### Test Cek Expired Postings:
```bash
curl -X GET http://localhost:3000/api/admin/jobs/cleanup \
  -H "Cookie: token=YOUR_ADMIN_TOKEN"
```

### Test Database:
Buat job posting dengan deadline kemarin:
```sql
INSERT INTO "JobPosting" (
  id, posisi, lokasi, deskripsi, 
  "perusahaanId", deadline, "createdAt", "updatedAt"
) VALUES (
  'test-123', 'Test Job', 'Jakarta', 'Test Description',
  'perusahaan-id', NOW() - INTERVAL '1 day',
  NOW(), NOW()
);
```

Lalu trigger cleanup dan verifikasi job sudah dihapus.

## Monitoring & Logs

Cron job akan mencatat aktivitas di console:
```
[Job Scheduler] ⏰ Memulai cleanup expired job postings...
[Job Cleanup] Deleted 5 expired job postings at 2026-02-08T00:00:00.000Z
[Job Scheduler] ✅ Cleanup selesai: 5 job dihapus
```

Atau jika error:
```
[Job Scheduler] ❌ Error cleanup: <error details>
```

## Fitur yang Ditambahkan

### 1. Cleanup Logic (`src/lib/jobs/cleanup.ts`)
- `cleanupExpiredJobPostings()` - Hapus job postings expired
- `getExpiredJobPostings()` - Dapatkan list job yang expired (untuk monitoring)

### 2. Scheduler (`src/lib/jobs/scheduler.ts`)
- `startJobCleanupScheduler()` - Mulai scheduled cleanup
- `stopJobCleanupScheduler()` - Stop scheduled cleanup
- `runJobCleanupNow()` - Jalankan cleanup sekarang (manual)

### 3. API Endpoint (`src/app/api/admin/jobs/cleanup/route.ts`)
- POST: Manual cleanup trigger
- GET: Check expired postings

### 4. Server Initialization
- Scheduler otomatis dimulai saat Next.js server startup di `src/app/layout.tsx`

## Dependencies
```json
{
  "dependencies": {
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/node-cron": "^3.0.11"
  }
}
```

## Keamanan
- Hanya admin dengan role `ADMIN_UTAMA` yang bisa:
  - Trigger manual cleanup via API
  - Check expired postings
- Token divalidasi dari cookies
- Automatic cleanup tidak memerlukan token (berjalan di server)

## Troubleshooting

**Q: Scheduler tidak jalan?**
A: Pastikan Next.js server sudah started. Cek console untuk log:
```
[Job Scheduler] ✓ Job cleanup scheduler started
```

**Q: Ingin mengubah waktu cleanup?**
A: Edit cron pattern di `src/lib/jobs/scheduler.ts` baris ~20

**Q: Ingin soft-delete daripada hard-delete?**
A: Update schema Prisma tambah field `isActive: Boolean` dan filter dengan `isActive = true`

**Q: Ingin backup sebelum delete?**
A: Tambahkan archive table dan copy data ke archive sebelum delete

## Roadmap Improvement
- [ ] Email notification sebelum deadline
- [ ] Archive deleted postings ke tabel terpisah
- [ ] Dashboard admin untuk monitoring cleanup history
- [ ] Webhook notification untuk perusahaan
- [ ] Bulk re-post functionality
- [ ] Auto-extend deadline option
