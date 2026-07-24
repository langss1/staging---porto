import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware runs on the SERVER before any page renders.
 * This prevents URL bypass attacks where someone navigates
 * directly to /admin/dashboard without logging in.
 *
 * Supabase v2 stores the session token in a cookie named:
 * sb-{project-ref}-auth-token
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie (both possible cookie names)
  const authCookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
  const authCookie =
    request.cookies.get(authCookieName) ||
    request.cookies.get('sb-access-token') ||
    request.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token.0`);

  let isAuthenticated = false;

  if (authCookie && authCookie.value) {
    // Attempt to verify the token by fetching the user profile from Supabase
    // This is much safer than just checking if the cookie exists
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${authCookie.value}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      if (res.ok) {
        const userData = await res.json();
        const userEmail = userData.email;
        // HIGH-02: Never fall back to a hardcoded email. ADMIN_EMAIL must be set.
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
          console.error('ADMIN_EMAIL environment variable is not set!');
          isAuthenticated = false;
        } else if (pathname.startsWith('/admin') && userEmail !== adminEmail) {
          isAuthenticated = false;
        } else {
          isAuthenticated = true;
        }
      }
    } catch (err) {
      console.error("Middleware auth verification failed", err);
    }
  }

  // Paths that do NOT require authentication
  // INFO-02: Use startsWith so /staging/* sub-paths are also treated as public
  const isPublicPath =
    pathname === '/admin/login' ||
    pathname.startsWith('/staging');

  if (!isAuthenticated && !isPublicPath) {
    // If they are trying to access admin dashboard, send to admin login
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Otherwise, send to staging login
    const stagingUrl = new URL('/staging', request.url);
    stagingUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(stagingUrl);
  }

  // If already authenticated and trying to access login/staging pages, redirect to dashboard/home
  if (isAuthenticated) {
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (pathname === '/staging') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all paths
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
