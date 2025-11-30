import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Export as 'proxy' for Next.js 16
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user (validates with Supabase Auth server - more secure than getSession)
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Get session only if user is valid
  let session = null
  if (user && !error) {
    const { data: { session: userSession } } = await supabase.auth.getSession()
    session = userSession
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Not authenticated - redirect to login
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin, admin_role')
      .eq('id', session.user.id)
      .single()

    if (!user?.is_admin) {
      // Not an admin - redirect to user dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'admin_access_required')
      return NextResponse.redirect(url)
    }

    // Update last_seen_at for admins
    await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', session.user.id)
  }

  // Protect /dashboard and /builder routes (regular user access)
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/builder')
  ) {
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Update last_seen_at
    await supabase
      .from('users')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', session.user.id)
  }

  // Protect /api/admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: user } = await supabase
      .from('users')
      .select('is_admin, admin_role')
      .eq('id', session.user.id)
      .single()

    if (!user?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    session &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup')
  ) {
    // Check if admin
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = user?.is_admin ? '/admin' : '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
