import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define protected routes with required roles
  const protectedRoutes: Record<string, string[]> = {
    '/admin': ['ADMIN_UTAMA', 'ADMIN_PPDB', 'ADMIN_BKK', 'ADMIN_BERITA'],
    '/company/dashboard': ['PERUSAHAAN'],
    '/dashboard': ['ALUMNI'], // If there's a personal dashboard
  };

  // Check if current path needs protection
  let requiredRoles: string[] = [];
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      requiredRoles = roles;
      break;
    }
  }

  // If no protection needed, allow
  if (requiredRoles.length === 0) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  // No token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token and get user data
    const verified = await jwtVerify(token, secret);
    const user = verified.payload as any;

    // Check if user role is allowed
    if (!requiredRoles.includes(user.role)) {
      // User authenticated but role not allowed, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // User authorized, allow request
    return NextResponse.next();
  } catch (error) {
    // Token invalid or expired, redirect to login
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/company/dashboard/:path*',
    '/dashboard/:path*',
  ],
};
