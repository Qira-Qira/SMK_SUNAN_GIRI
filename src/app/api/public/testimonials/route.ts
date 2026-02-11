import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // If userId is provided, get user's fullName and find their testimonial
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { fullName: true },
        });

        if (!user) {
          return NextResponse.json({
            testimonials: [],
          });
        }

        const testimonials = await prisma.testimonial.findMany({
          where: { nama: user.fullName },
          orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
          testimonials,
        });
      } catch (error) {
        console.error('Error fetching user testimonials:', error);
        return NextResponse.json({
          testimonials: [],
        });
      }
    }

    // Otherwise return all testimonials
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      testimonials,
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle ALUMNI creating their own testimonial
    if (payload.role === 'ALUMNI') {
      const { isi, rating } = body;

      if (!isi || !rating) {
        return NextResponse.json(
          { error: 'Missing required fields: isi, rating' },
          { status: 400 }
        );
      }

      try {
        // Get user data (use payload.id, not payload.userId)
        const user = await prisma.user.findUnique({
          where: { id: payload.id as string },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get tracer study data if exists
        const tracerStudy = await prisma.tracerStudy.findUnique({
          where: { userId: payload.id as string },
        });

        // Check if testimonial with this name already exists
        const existingTestimonial = await prisma.testimonial.findFirst({
          where: {
            nama: user.fullName,
          },
        });

        if (existingTestimonial) {
          // Update existing testimonial
          const updated = await prisma.testimonial.update({
            where: { id: existingTestimonial.id },
            data: {
              testimoni: isi,
              rating: parseInt(rating.toString()),
              posisi: tracerStudy?.jabatan || existingTestimonial.posisi,
              perusahaan: tracerStudy?.namaPerusahaan || existingTestimonial.perusahaan,
              tahunLulus: tracerStudy?.tahunLulus?.toString() || existingTestimonial.tahunLulus,
              updatedAt: new Date(),
            },
          });

          return NextResponse.json(
            { message: 'Testimonial updated successfully', testimonial: updated },
            { status: 200 }
          );
        }

        // Create new testimonial
        const testimonial = await prisma.testimonial.create({
          data: {
            nama: user.fullName,
            posisi: tracerStudy?.jabatan || 'Alumni',
            perusahaan: tracerStudy?.namaPerusahaan || 'Independen',
            tahunLulus: tracerStudy?.tahunLulus?.toString() || new Date().getFullYear().toString(),
            testimoni: isi,
            rating: parseInt(rating.toString()),
          },
        });

        return NextResponse.json(
          { message: 'Testimonial created successfully', testimonial },
          { status: 201 }
        );
      } catch (dbError) {
        console.error('Database error in ALUMNI testimonial creation:', dbError);
        return NextResponse.json(
          { error: 'Failed to save testimonial: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Handle ADMIN_UTAMA and GURU creating testimonials
    if (payload.role === 'ADMIN_UTAMA' || payload.role === 'GURU') {
      const { nama, posisi, perusahaan, tahunLulus, testimoni, rating } = body;

      if (!nama || !posisi || !perusahaan || !tahunLulus || !testimoni || !rating) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const testimonial = await prisma.testimonial.create({
        data: {
          nama,
          posisi,
          perusahaan,
          tahunLulus,
          testimoni,
          rating: parseInt(rating),
        },
      });

      return NextResponse.json(
        { message: 'Testimonial created successfully', testimonial },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const body = await request.json();

    // Handle ALUMNI updating their own testimonial
    if (payload.role === 'ALUMNI') {
      const { isi, rating } = body;

      if (!isi || !rating) {
        return NextResponse.json(
          { error: 'Missing required fields: isi, rating' },
          { status: 400 }
        );
      }

      try {
        // Get user data (use payload.id, not payload.userId)
        const user = await prisma.user.findUnique({
          where: { id: payload.id as string },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get tracer study data if exists
        const tracerStudy = await prisma.tracerStudy.findUnique({
          where: { userId: payload.id as string },
        });

        const testimonial = await prisma.testimonial.update({
          where: { id },
          data: {
            testimoni: isi,
            rating: parseInt(rating.toString()),
            posisi: tracerStudy?.jabatan || undefined,
            perusahaan: tracerStudy?.namaPerusahaan || undefined,
            tahunLulus: tracerStudy?.tahunLulus?.toString() || undefined,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: 'Testimonial updated successfully',
          testimonial,
        });
      } catch (dbError) {
        console.error('Database error in ALUMNI testimonial update:', dbError);
        return NextResponse.json(
          { error: 'Failed to update testimonial: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Handle ADMIN_UTAMA and GURU updating testimonials
    if (payload.role === 'ADMIN_UTAMA' || payload.role === 'GURU') {
      const { nama, posisi, perusahaan, tahunLulus, testimoni, rating } = body;

      const testimonial = await prisma.testimonial.update({
        where: { id },
        data: {
          nama: nama || undefined,
          posisi: posisi || undefined,
          perusahaan: perusahaan || undefined,
          tahunLulus: tahunLulus || undefined,
          testimoni: testimoni || undefined,
          rating: rating ? parseInt(rating) : undefined,
        },
      });

      return NextResponse.json({
        message: 'Testimonial updated successfully',
        testimonial,
      });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (payload.role !== 'ADMIN_UTAMA' && payload.role !== 'GURU') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Testimonial deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
