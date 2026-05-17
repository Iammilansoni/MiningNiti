import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
]);

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const currentUrl = req.nextUrl;
  const isHomePage = currentUrl.pathname === '/';
  const isAuthPage = currentUrl.pathname.includes('/sign-in') || currentUrl.pathname.includes('/sign-up');

  // If user is logged in and on home page, redirect to dashboard
  if (userId && isHomePage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is logged in and on auth pages, redirect to dashboard
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is not logged in and trying to access dashboard, redirect to sign-in
  if (!userId && isDashboardRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Protect dashboard routes - require authentication
  if (isDashboardRoute(req)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
