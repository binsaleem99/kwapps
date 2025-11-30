import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserUsage } from '@/lib/limits/check-limit'

/**
 * GET /api/usage
 * Returns current user's usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get usage data using existing backend function
    const usage = await getUserUsage(user.id)

    return NextResponse.json(usage)
  } catch (error: any) {
    console.error('Error fetching usage:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}
