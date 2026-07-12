import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce trailing slashes on all client-side pages 
 * while ignoring admin routes and system assets.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const xForwardedHost = request.headers.get('x-forwarded-host');

  let needsRewrite = false;
  const requestHeaders = new Headers(request.headers);

  // Fix duplicated Origin header from LiteSpeed / Cloudflare
  if (origin && origin.includes(',')) {
    requestHeaders.set('origin', origin.split(',')[0].trim());
    needsRewrite = true;
  }

  // Fix duplicated Host header
  if (host && host.includes(',')) {
    requestHeaders.set('host', host.split(',')[0].trim());
    needsRewrite = true;
  }

  // Fix duplicated X-Forwarded-Host header
  if (xForwardedHost && xForwardedHost.includes(',')) {
    requestHeaders.set('x-forwarded-host', xForwardedHost.split(',')[0].trim());
    needsRewrite = true;
  }

  // 1. Skip system paths, API endpoints, static assets, and admin routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/m-admin') ||
    pathname.includes('.') || // Avoid slashing files like favicon.ico, images, etc.
    pathname === '/'          // Root already has a virtual slash or is fine
  ) {
    const isPrivate = pathname.startsWith('/m-admin');
    const robotsValue = isPrivate ? 'noindex, nofollow' : 'index, follow';

    const res = needsRewrite
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.next();
    res.headers.set('X-Robots-Tag', robotsValue);
    return res;
  }

  // 2. Enforce trailing slash for client pages (GET requests only, ignore RSC/internal fetches)
  if (request.method === 'GET' && !pathname.endsWith('/') && !request.nextUrl.searchParams.has('_rsc')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname + '/';
    const res = NextResponse.redirect(url, 301); // Permanent redirect for SEO
    res.headers.set('X-Robots-Tag', 'index, follow');
    return res;
  }

  const res = needsRewrite
    ? NextResponse.next({ request: { headers: requestHeaders } })
    : NextResponse.next();
  res.headers.set('X-Robots-Tag', 'index, follow');
  return res;
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
