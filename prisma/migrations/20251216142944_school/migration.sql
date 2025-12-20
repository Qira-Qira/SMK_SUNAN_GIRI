-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN_UTAMA', 'ADMIN_PPDB', 'ADMIN_BKK', 'GURU', 'SISWA_AKTIF', 'CALON_SISWA', 'ALUMNI', 'PERUSAHAAN', 'PENGUNJUNG');

-- CreateEnum
CREATE TYPE "PPDBStatus" AS ENUM ('PENDING_VERIFIKASI', 'VERIFIKASI_LANJUT', 'LULUS', 'CADANGAN', 'DITOLAK');

-- CreateTable
CREATE TABLE "Jurusan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "photoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PPDBEntry" (
    "id" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jurusanId1" TEXT NOT NULL,
    "jurusanId2" TEXT,
    "jurusanId3" TEXT,
    "status" "PPDBStatus" NOT NULL DEFAULT 'PENDING_VERIFIKASI',
    "score" DOUBLE PRECISION,
    "nisn" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentAddress" TEXT NOT NULL,
    "kkFile" TEXT,
    "aktaFile" TEXT,
    "raportFile" TEXT,
    "ijazahFile" TEXT,
    "fotoCalonFile" TEXT,
    "previousSchool" TEXT NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PPDBEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendationResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizScore" DOUBLE PRECISION NOT NULL,
    "minat" TEXT[],
    "kemampuanAkademik" DOUBLE PRECISION NOT NULL,
    "gayaBelajar" TEXT NOT NULL,
    "citaCitaKarier" TEXT NOT NULL,
    "preferensiKerja" TEXT NOT NULL,
    "recommendation1" TEXT NOT NULL,
    "score1" DOUBLE PRECISION NOT NULL,
    "reasoning1" TEXT NOT NULL,
    "recommendation2" TEXT,
    "score2" DOUBLE PRECISION,
    "reasoning2" TEXT,
    "recommendation3" TEXT,
    "score3" DOUBLE PRECISION,
    "reasoning3" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIRecommendationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TracerStudy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jurusanId" TEXT NOT NULL,
    "tahunLulus" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "namaPerusahaan" TEXT,
    "jabatan" TEXT,
    "gaji" DOUBLE PRECISION,
    "relevansi" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TracerStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "jurusanId" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "requirements" TEXT[],
    "salary" DOUBLE PRECISION,
    "lokasi" TEXT NOT NULL,
    "tipePekerjaan" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvFile" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnail" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolProfile" (
    "id" TEXT NOT NULL,
    "sejarah" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "tujuan" TEXT NOT NULL,
    "fasilitas" TEXT[],
    "guruJumlah" INTEGER NOT NULL,
    "siswaJumlah" INTEGER NOT NULL,
    "photoGaleri" TEXT[],
    "phoneNumber" TEXT NOT NULL,
    "emailSchool" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Jurusan_nama_key" ON "Jurusan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Jurusan_kode_key" ON "Jurusan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PPDBEntry_registrationNo_key" ON "PPDBEntry"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "PPDBEntry_userId_key" ON "PPDBEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TracerStudy_userId_key" ON "TracerStudy"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobPostingId_userId_key" ON "JobApplication"("jobPostingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- AddForeignKey
ALTER TABLE "PPDBEntry" ADD CONSTRAINT "PPDBEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PPDBEntry" ADD CONSTRAINT "PPDBEntry_jurusanId1_fkey" FOREIGN KEY ("jurusanId1") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendationResult" ADD CONSTRAINT "AIRecommendationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendationResult" ADD CONSTRAINT "AIRecommendationResult_recommendation1_fkey" FOREIGN KEY ("recommendation1") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracerStudy" ADD CONSTRAINT "TracerStudy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracerStudy" ADD CONSTRAINT "TracerStudy_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
