import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if this is a new user (Google OAuth signup)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // If user doesn't exist, create profile
      if (!existingUser) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: data.user.user_metadata.full_name || data.user.user_metadata.name || 'User',
          plan: 'free',
          onboarding_completed: false,
        })
      }

      // Get user data to determine redirect
      const { data: user } = await supabase
        .from('users')
        .select('is_admin, onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // Smart redirect based on user type
      if (user?.is_admin) {
        return NextResponse.redirect(`${origin}/admin`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // If there's an error or no code, redirect to sign-in
  return NextResponse.redirect(`${origin}/sign-in?error=oauth_failed`)
}
