import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Only fetch active jurusan
    const jurusan = await prisma.jurusan.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            ppdbEntries: true,
            tracerStudy: true,
          },
        },
      },
    });

    return NextResponse.json({ jurusan }, { status: 200 });
  } catch (error) {
    console.error('Jurusan get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { nama, deskripsi, kode, icon } = body;

    if (!nama || !deskripsi || !kode) {
      return NextResponse.json(
        { error: 'Nama, deskripsi, and kode required' },
        { status: 400 }
      );
    }

    const jurusan = await prisma.jurusan.create({
      data: {
        nama,
        deskripsi,
        kode,
        ...(icon ? { icon } : {}),
      },
    });

    return NextResponse.json({ jurusan }, { status: 201 });
  } catch (error) {
    console.error('Jurusan create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { nama, deskripsi, kode, icon } = body;

    const jurusan = await prisma.jurusan.update({
      where: { id },
      data: {
        ...(nama && { nama }),
        ...(deskripsi && { deskripsi }),
        ...(kode && { kode }),
        ...(icon !== undefined && { icon }),
      },
    });

    return NextResponse.json({ jurusan }, { status: 200 });
  } catch (error) {
    console.error('Jurusan update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint untuk soft delete (archive)
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const action = searchParams.get('action'); // 'archive' atau 'restore'

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (!action || !['archive', 'restore'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "archive" or "restore"' }, { status: 400 });
    }

    const isArchiving = action === 'archive';

    const jurusan = await prisma.jurusan.update({
      where: { id },
      data: {
        isActive: !isArchiving, // Archive = false, Restore = true
      },
    });

    return NextResponse.json({ 
      jurusan,
      message: isArchiving ? 'Jurusan berhasil di-archive' : 'Jurusan berhasil di-restore',
      type: 'soft-delete'
    }, { status: 200 });
  } catch (error) {
    console.error('Jurusan patch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'ADMIN_UTAMA') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const force = searchParams.get('force') === 'true'; // Force delete dari archived jurusan

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Jika force delete (dari archived), langsung hapus tanpa validasi
    if (force) {
      try {
        await prisma.jurusan.delete({
          where: { id },
        });

        return NextResponse.json({ 
          message: 'Jurusan berhasil dihapus secara permanen',
          type: 'hard-delete-forced'
        }, { status: 200 });
      } catch (error: any) {
        console.error('Force delete error:', error);
        return NextResponse.json(
          { 
            error: `Gagal menghapus jurusan: ${error.message || 'Foreign key constraint atau relasi data'}`,
            details: error.code === 'P2014' ? 'Ada relasi data yang mencegah penghapusan. Pastikan tidak ada referensi dari tabel lain.' : error.message
          },
          { status: 409 }
        );
      }
    }

    // Check if there are any PPDB entries with this jurusan
    const ppdbCount = await prisma.pPDBEntry.count({
      where: {
        OR: [
          { jurusanId1: id },
          { jurusanId2: id },
          { jurusanId3: id },
        ],
      },
    });

    if (ppdbCount > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus jurusan ini karena masih ada data PPDB yang terkait. Jurusan akan di-archive (non-aktif) untuk menjaga integritas data.',
          affectedRecords: ppdbCount,
          suggestion: 'soft-delete'
        },
        { status: 409 }
      );
    }

    // Check if there are any job postings
    const jobCount = await prisma.jobPosting.count({
      where: { jurusanId: id },
    });

    if (jobCount > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus jurusan ini karena masih ada lowongan kerja yang terkait. Jurusan akan di-archive (non-aktif).',
          affectedRecords: jobCount,
          suggestion: 'soft-delete'
        },
        { status: 409 }
      );
    }

    // Check if there are any tracer study entries
    const tracerCount = await prisma.tracerStudy.count({
      where: { jurusanId: id },
    });

    if (tracerCount > 0) {
      return NextResponse.json(
        { 
          error: 'Tidak dapat menghapus jurusan ini karena masih ada data tracer study yang terkait. Jurusan akan di-archive (non-aktif).',
          affectedRecords: tracerCount,
          suggestion: 'soft-delete'
        },
        { status: 409 }
      );
    }

    // If no child records, perform hard delete
    await prisma.jurusan.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: 'Jurusan berhasil dihapus',
      type: 'hard-delete'
    }, { status: 200 });
  } catch (error) {
    console.error('Jurusan delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
