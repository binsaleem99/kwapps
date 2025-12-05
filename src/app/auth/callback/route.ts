import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const tierParam = requestUrl.searchParams.get('tier')
  const trialParam = requestUrl.searchParams.get('trial')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // If there's a 'next' parameter (from password reset), use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Check if this is a new user (OAuth signup or email confirmation)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      // If user doesn't exist, create profile
      // The trigger should handle this, but we do it manually as backup
      if (!existingUser) {
        const displayName = data.user.user_metadata.full_name
          || data.user.user_metadata.name
          || data.user.email?.split('@')[0]
          || 'User'

        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: displayName,
          plan: 'free',
        })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
          // Continue anyway - trigger might have created it
        }
      }

      // If there's a tier parameter, redirect to checkout page
      if (tierParam) {
        const checkoutUrl = new URL(`${origin}/checkout`)
        checkoutUrl.searchParams.set('tier', tierParam)
        if (trialParam) {
          checkoutUrl.searchParams.set('trial', trialParam)
        }
        return NextResponse.redirect(checkoutUrl.toString())
      }

      // Get user data to determine redirect (with fallback for missing columns)
      const { data: user } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', data.user.id)
        .maybeSingle()

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
