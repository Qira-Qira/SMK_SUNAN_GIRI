-- AlterTable
ALTER TABLE "SchoolProfile" ADD COLUMN     "deskripsiMitra" TEXT DEFAULT 'Perusahaan ternama',
ADD COLUMN     "deskripsiPrestasi" TEXT DEFAULT 'Tingkat nasional & internasional',
ADD COLUMN     "deskripsiSerapan" TEXT DEFAULT 'Alumni tersebar industri',
ADD COLUMN     "deskripsiSiswa" TEXT DEFAULT 'Dari berbagai daerah',
ADD COLUMN     "heroDescription" TEXT DEFAULT 'Persiapkan diri untuk era industri 4.0',
ADD COLUMN     "heroStatistics" TEXT,
ADD COLUMN     "heroSubtitle" TEXT DEFAULT 'Bersama SMK Unggulan',
ADD COLUMN     "heroTitle" TEXT DEFAULT 'Wujudkan Masa Depan Digitalmu',
ADD COLUMN     "mitraIndustri" TEXT DEFAULT '150+',
ADD COLUMN     "prestasi" TEXT DEFAULT '50+',
ADD COLUMN     "serapanKerja" TEXT DEFAULT '95%',
ADD COLUMN     "siswaAktif" TEXT DEFAULT '1,200+';
