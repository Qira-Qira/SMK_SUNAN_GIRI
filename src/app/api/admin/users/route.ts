import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    // Check if user is authenticated and has admin role
    if (!user || (user.role !== 'ADMIN_UTAMA' && user.role !== 'ADMIN_PPDB')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    // Check if user is authenticated and has admin role
    if (!user || user.role !== 'ADMIN_UTAMA') {
      return NextResponse.json(
        { error: 'Unauthorized - Only ADMIN_UTAMA can create users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, email, password, fullName, role, phone, address } = body;

    // Validation
    if (!username || !email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'username, email, password, fullName, dan role wajib diisi' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username atau email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        role: role as any,
        phone: phone || null,
        address: address || null,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User berhasil dibuat',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();

    // Check if user is authenticated and has admin role
    if (!user || user.role !== 'ADMIN_UTAMA') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isActive, role, fullName, phone, address } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if trying to deactivate self
    if (user.id === userId && isActive === false) {
      return NextResponse.json(
        { error: 'Tidak dapat menonaktifkan akun admin sendiri' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role && { role: role as any }),
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        address: true,
        photoUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil diperbarui',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();

    // Check if user is authenticated and has admin role
    if (!user || user.role !== 'ADMIN_UTAMA') {
      return NextResponse.json(
        { error: 'Unauthorized - Only ADMIN_UTAMA can delete users' },
        { status: 403 }
      );
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Check if trying to delete self
    if (user.id === userId) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun admin sendiri' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

