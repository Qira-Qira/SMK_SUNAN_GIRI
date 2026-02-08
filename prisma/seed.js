const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Password hashing function using bcryptjs
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Check if jurusan already exist
    const existingJurusan = await prisma.jurusan.count();
    let jurusan = [];

    if (existingJurusan === 0) {
      // Create Jurusan
      console.log('📚 Creating Jurusan...');
      jurusan = await Promise.all([
      prisma.jurusan.create({
        data: {
          nama: 'Rekayasa Perangkat Lunak',
          kode: 'RPL',
          deskripsi: 'Pengembangan software, web, dan mobile applications',
          icon: '🧠'
        }
      }),
      prisma.jurusan.create({
        data: {
          nama: 'Teknik Komputer & Jaringan',
          kode: 'TKJ',
          deskripsi: 'Infrastruktur jaringan, cybersecurity, cloud computing',
          icon: '🌐'
        }
      }),
      prisma.jurusan.create({
        data: {
          nama: 'Teknik Bisnis Sepeda Motor',
          kode: 'TBSM',
          deskripsi: 'Teknologi otomotif modern dan manajemen bisnis',
          icon: '🏍️'
        }
      }),
      prisma.jurusan.create({
        data: {
          nama: 'Akuntansi & Keuangan Lembaga',
          kode: 'AKL',
          deskripsi: 'Manajemen keuangan, perpajakan, audit digital',
          icon: '💰'
        }
      }),
      prisma.jurusan.create({
        data: {
          nama: 'Desain Komunikasi Visual',
          kode: 'DKV',
          deskripsi: 'Desain grafis, multimedia, dan branding',
          icon: '🎨'
        }
      }),
    ]);

      console.log(`✅ Created ${jurusan.length} jurusan`);
    } else {
      console.log('📚 Jurusan already exist, skipping creation');
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@smksunan.id' }
    });

    if (!existingAdmin) {
      // Create Admin User
      console.log('👤 Creating admin user...');
      const adminPassword = await hashPassword('admin123');
      const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@smksunan.id',
        password: adminPassword,
        fullName: 'Administrator Utama',
        role: 'ADMIN_UTAMA',
        phone: '08123456789',
        isActive: true,
      }
      });

      console.log('✅ Created admin user:', admin.email);
    } else {
      console.log('👤 Admin user already exists');
    }

    // Check if school profile exists
    const existingSchoolProfile = await prisma.schoolProfile.count();

    if (existingSchoolProfile === 0) {
      // Create School Profile
      console.log('🏫 Creating school profile...');
      const schoolProfile = await prisma.schoolProfile.create({
        data: {
          sejarah: 'SMK Sunan Giri berdiri pada tahun 2010 dengan visi menjadi sekolah kejuruan unggulan',
          visi: 'Menjadi sekolah kejuruan unggulan yang menghasilkan tenaga kerja profesional dan berkarakter',
          misi: 'Membimbing peserta didik untuk menguasai kompetensi, bersikap profesional, dan siap di industri',
          tujuan: 'Menghasilkan lulusan yang berkualitas, berkarakter, dan siap bekerja',
          fasilitas: ['Laboratorium Komputer', 'Workshop Otomotif', 'Ruang Design', 'Perpustakaan', 'Aula'],
          guruJumlah: 45,
          siswaJumlah: 600,
          phoneNumber: '(0234) 567890',
          emailSchool: 'info@smksunan.id',
          address: 'Jl. Pendidikan No. 123, Kota Semarang',
          photoGaleri: []
        }
      });

      console.log('✅ Created school profile');
    } else {
      console.log('🏫 School profile already exists');
    }

    // Check if news already exists
    const existingNews = await prisma.news.count();

    if (existingNews === 0) {
      // Create Sample News
      console.log('📰 Creating sample news...');
      await Promise.all([
      prisma.news.create({
        data: {
          title: 'PPDB Tahun Ajaran 2024 Dibuka',
          slug: 'ppdb-2024-dibuka',
          content: 'Pendaftaran Peserta Didik Baru untuk tahun ajaran 2024 telah dibuka dengan sistem online yang mudah',
          published: true
        }
      }),
      prisma.news.create({
        data: {
          title: 'Pencapaian Siswa dalam Lomba Nasional',
          slug: 'pencapaian-lomba-nasional',
          content: 'Siswa SMK Sunan Giri meraih prestasi gemilang di Lomba Kompetensi Siswa Nasional',
          published: true
        }
      }),
    ]);

      console.log('✅ Created sample news');
    } else {
      console.log('📰 News already exists');
    }

    // Check if testimonials already exist
    const existingTestimonials = await prisma.testimonial.count();

    if (existingTestimonials === 0) {
      // Create Sample Testimonials
      console.log('⭐ Creating sample testimonials...');
      await Promise.all([
      prisma.testimonial.create({
        data: {
          nama: 'Ahmad Rizki',
          posisi: 'Software Engineer',
          perusahaan: 'Tokopedia',
          tahunLulus: 'RPL 2020',
          testimoni: 'SMK memberikan fondasi teknologi yang kuat dan koneksi industri yang membantu karir saya berkembang pesat.',
          rating: 5
        }
      }),
      prisma.testimonial.create({
        data: {
          nama: 'Siti Nurhaliza',
          posisi: 'Network Security',
          perusahaan: 'Telkom Indonesia',
          tahunLulus: 'TKJ 2019',
          testimoni: 'Pengalaman prakerin dan sertifikasi yang didapat sangat relevan dengan kebutuhan industri saat ini.',
          rating: 5
        }
      }),
      prisma.testimonial.create({
        data: {
          nama: 'Budi Santoso',
          posisi: 'Service Manager',
          perusahaan: 'Honda',
          tahunLulus: 'TBSM 2021',
          testimoni: 'Teaching Factory mempersiapkan saya dengan skill teknis dan soft skill yang dibutuhkan dunia kerja.',
          rating: 5
        }
      }),
      prisma.testimonial.create({
        data: {
          nama: 'Eka Putri',
          posisi: 'Accounting Supervisor',
          perusahaan: 'PT Maju Jaya',
          tahunLulus: 'AKL 2020',
          testimoni: 'Kurikulum yang disesuaikan dengan standar internasional membuat saya siap menghadapi tantangan kerja.',
          rating: 5
        }
      }),
      prisma.testimonial.create({
        data: {
          nama: 'Rendra Wijaya',
          posisi: 'Graphic Designer',
          perusahaan: 'PT Kreatif Digital',
          tahunLulus: 'DKV 2019',
          testimoni: 'Program magang di perusahaan ternama memberi pengalaman langsung dalam industri kreatif.',
          rating: 5
        }
      }),
    ]);

      console.log('✅ Created sample testimonials');
    } else {
      console.log('⭐ Testimonials already exist');
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Create test users
async function createTestUsers() {
  try {
    console.log('👥 Creating test users...');

    // Check if admin already exists
    const adminExists = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@smk.id',
          password: hashedPassword,
          fullName: 'Admin Utama',
          role: 'ADMIN_UTAMA',
          phone: '08123456789',
          address: 'Semarang',
        },
      });
      console.log('✅ Created admin user');
    }

    // Check if company user exists
    const companyExists = await prisma.user.findUnique({
      where: { username: 'perusahaan1' },
    });

    if (!companyExists) {
      const hashedPassword = await hashPassword('perusahaan123');
      await prisma.user.create({
        data: {
          username: 'perusahaan1',
          email: 'hr@perusahaan.com',
          password: hashedPassword,
          fullName: 'PT Maju Jaya Indonesia',
          role: 'PERUSAHAAN',
          phone: '0812-3456-7890',
          address: 'Jl. Industri No. 123, Jakarta',
        },
      });
      console.log('✅ Created perusahaan user');
    }

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    throw error;
  }
}

async function runAll() {
  try {
    await main();
    await createTestUsers();
    console.log('✨ All seeding completed!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAll()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
