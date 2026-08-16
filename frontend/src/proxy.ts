import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. This file replaces the old
 * root-level middleware.ts — do not reintroduce that file alongside this one.
 *
 * Deny by default.
 *
 * `clerk init` scaffolds a bare `clerkMiddleware()` here, which leaves every
 * route public. That is wrong for this app: the authenticated pages live in the
 * `(dashboard)` route group, and a route group does not appear in the URL, so
 * they are served at `/chat`, `/documents`, `/analytics`, `/compliance`,
 * `/prompts` and `/settings` — not under `/dashboard/*`. Anything that guards
 * only `/dashboard(.*)`, or nothing at all, leaves all of them reachable while
 * signed out.
 *
 * Listing what is public and requiring auth for everything else means a new
 * page is protected the moment it is created, rather than the moment someone
 * remembers to add it here.
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // Signed in and sitting on the landing or auth pages — send them to the app.
  if (userId && (pathname === '/' || isAuthPage)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Signed out and asking for anything non-public — bounce to sign-in and
  // remember where they were headed.
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Clerk's auto-proxy path
    '/__clerk/:path*',
  ],
};
