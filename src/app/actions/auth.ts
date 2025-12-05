'use server'

/**
 * Auth actions using Supabase
 *
 * NOTE: Sign in/Sign up is handled by custom forms with Supabase auth
 * This file handles user sync to database and sign out
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Sync Supabase user to our database
 * Called automatically after sign in/sign up to ensure user exists in users table
 */
export async function syncUserToDatabase() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Unauthorized' }
  }

  try {
    const userId = session.user.id
    const userEmail = session.user.email || ''
    const userName =
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.display_name ||
      userEmail.split('@')[0] ||
      'User'

    // Check if user already exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingUser) {
      // Create new user record (only include columns that exist in base schema)
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: userEmail,
        display_name: userName,
        plan: 'free',
      })

      if (insertError) {
        console.error('Error inserting user:', insertError)
        // Don't throw - trigger might have already created the user
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error syncing user to database:', error)
    return { error: error.message }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/sign-in')
}
