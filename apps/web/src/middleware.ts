import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const _publicRoutes = ['/login', '/signup', '/forgot-password', '/'];

// Define routes that require authentication
const _protectedRoutes = ['/dashboard'];

export function middleware(_request: NextRequest) {
  // For localStorage-based auth, we can't check here, so we disable server-side redirect
  // and let client-side handle it. Only block if we're certain there's no auth.
  // Comment out the redirect for now since we're using localStorage
  // if (isProtectedRoute && !token) {
  //   const loginUrl = new URL('/login', _request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

  // Allow all requests to pass through
  // Client-side useEffect will handle auth checks for localStorage-based auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all _request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
