import { NextResponse } from 'next/server';

// Middleware to protect authenticated routes
export function middleware(request) {
  // Define protected routes - be more specific about what needs protection
  const protectedPaths = ['/dashboard'];

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check for Better Auth session cookie from the request headers
    const authCookieHeader = request.headers.get('cookie');

    // If no cookies exist at all, user is definitely not authenticated
    if (!authCookieHeader) {
      // Redirect to login with callback URL
      const requestedPath = request.nextUrl.pathname + request.nextUrl.search;
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', requestedPath);

      return NextResponse.redirect(redirectUrl);
    }

    // Look for Better Auth session token in cookies
    // Better Auth typically sets session cookies with names like:
    // '__Secure-better-auth.session_token' or 'better-auth.session_token'
    const hasAuthSession = authCookieHeader.includes('better-auth.session_token') ||
                          authCookieHeader.includes('__Secure-better-auth.session_token') ||
                          authCookieHeader.includes('authjs.session-token') ||
                          authCookieHeader.includes('__Secure-authjs.session-token');

    // If no session token found, redirect to login
    if (!hasAuthSession) {
      // Redirect to login with callback URL
      const requestedPath = request.nextUrl.pathname + request.nextUrl.search;
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', requestedPath);

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (Better Auth API routes)
     * - public auth pages (login, register, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|login|register|forgot-password|reset-password).*)',
  ],
};