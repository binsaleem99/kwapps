import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function to match routes
function matchRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp('^' + pattern.replace('(.*)', '.*') + '$')
    return regex.test(pathname)
  })
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard(.*)', '/builder(.*)', '/admin(.*)', '/onboarding(.*)']
  const adminRoutes = ['/admin(.*)']

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  // Check if route is protected
  if (matchRoute(pathname, protectedRoutes)) {
    if (!userId) {
      // Not authenticated - redirect to sign-in
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Additional admin route protection
    if (matchRoute(pathname, adminRoutes)) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('is_admin, admin_role')
          .eq('id', userId)
          .maybeSingle()

        if (!user?.is_admin) {
          // Not an admin - redirect to user dashboard
          const dashboardUrl = new URL('/dashboard', req.url)
          dashboardUrl.searchParams.set('error', 'admin_access_required')
          return NextResponse.redirect(dashboardUrl)
        }

        // Update last_seen_at for admins
        await supabase
          .from('users')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId)
      } catch (error) {
        console.error('Admin check error:', error)
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
