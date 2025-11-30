'use client'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoaded(true)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        router.refresh()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    userId: user?.id,
    isSignedIn: !!user,
    isLoaded,
    user,
  }
}

export function useUser() {
  const { user, isLoaded } = useAuth()

  return {
    user: user ? {
      id: user.id,
      emailAddress: user.email,
      fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
      imageUrl: user.user_metadata?.avatar_url,
    } : null,
    isLoaded,
    isSignedIn: !!user,
  }
}
