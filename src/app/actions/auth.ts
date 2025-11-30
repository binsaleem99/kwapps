'use server'

/**
 * Auth actions now use Clerk for authentication
 *
 * NOTE: Sign in/Sign up is handled by Clerk UI components (<SignIn>, <SignUp>)
 * This file now handles user sync to database and sign out
 */

import { auth, clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Sync Clerk user to our database
 * Called automatically via Clerk webhook or manually after sign in
 */
export async function syncUserToDatabase() {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const supabase = await createClient()

    // Check if user already exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingUser) {
      // Create new user record
      await supabase.from('users').insert({
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        display_name: user.fullName || user.username || 'User',
        plan: 'free',
        onboarding_completed: false,
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error syncing user to database:', error)
    return { error: error.message }
  }
}

/**
 * Sign out - Clerk handles the actual sign out via <SignOutButton>
 * This is a fallback for programmatic sign out
 */
export async function signOut() {
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}
