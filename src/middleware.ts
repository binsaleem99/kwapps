import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/builder(.*)',
  '/admin(.*)',
  '/onboarding(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Additional admin route protection
    if (isAdminRoute(req)) {
      try {
        const supabase = await createClient();
        const { data: user } = await supabase
          .from('users')
          .select('is_admin, admin_role')
          .eq('id', userId)
          .maybeSingle();

        if (!user?.is_admin) {
          // Not an admin - redirect to user dashboard
          const dashboardUrl = new URL('/dashboard', req.url);
          dashboardUrl.searchParams.set('error', 'admin_access_required');
          return NextResponse.redirect(dashboardUrl);
        }

        // Update last_seen_at for admins
        await supabase
          .from('users')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
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
