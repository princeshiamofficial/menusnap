import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce trailing slashes on all client-side pages 
 * while ignoring admin routes and system assets.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip system paths, API endpoints, static assets, and admin routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/m-admin') ||
    pathname.includes('.') || // Avoid slashing files like favicon.ico, images, etc.
    pathname === '/'          // Root already has a virtual slash or is fine
  ) {
    return NextResponse.next();
  }

  // 2. Enforce trailing slash for client pages
  if (!pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname + '/';
    return NextResponse.redirect(url, 301); // Permanent redirect for SEO
  }

  return NextResponse.next();
}

// Optional: Limit middleware to specific paths for performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
