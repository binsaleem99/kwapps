// ==============================================
// KW APPS - Manual Cron Job Trigger (Admin Only)
// ==============================================
// POST /api/cron/trigger
// Allows admins to manually trigger cron jobs for testing
// ==============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Valid cron job types
type CronJobType = 'daily-bonus' | 'period-rollover' | 'trial-expiry'

const VALID_CRON_JOBS: CronJobType[] = ['daily-bonus', 'period-rollover', 'trial-expiry']

// Supabase Edge Function URLs
const getEdgeFunctionUrl = (job: CronJobType): string => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]
  return `https://${projectRef}.supabase.co/functions/v1/${job}`
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { job, secret } = body as { job?: string; secret?: string }

    // Validate cron job type
    if (!job || !VALID_CRON_JOBS.includes(job as CronJobType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job type',
          validJobs: VALID_CRON_JOBS
        },
        { status: 400 }
      )
    }

    // Check for CRON_SECRET (for automated triggers)
    const cronSecret = process.env.CRON_SECRET
    if (secret && cronSecret && secret === cronSecret) {
      // Authorized via CRON_SECRET
      console.log(`[Cron Trigger] Job "${job}" triggered via CRON_SECRET`)
    } else {
      // Check for admin authentication
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      }

      const token = authHeader.split(' ')[1]

      // Verify user is admin
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication' },
          { status: 401 }
        )
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError || userData?.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        )
      }

      console.log(`[Cron Trigger] Job "${job}" triggered by admin ${user.id}`)
    }

    // Trigger the Edge Function
    const functionUrl = getEdgeFunctionUrl(job as CronJobType)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    console.log(`[Cron Trigger] Calling Edge Function: ${functionUrl}`)

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({ triggered_by: 'manual' })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error(`[Cron Trigger] Edge Function error:`, result)
      return NextResponse.json(
        {
          success: false,
          error: 'Edge Function failed',
          details: result
        },
        { status: response.status }
      )
    }

    console.log(`[Cron Trigger] Job "${job}" completed:`, result)

    return NextResponse.json({
      success: true,
      job,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Cron Trigger] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check available jobs (no auth required)
export async function GET() {
  return NextResponse.json({
    availableJobs: VALID_CRON_JOBS.map(job => ({
      name: job,
      description: getJobDescription(job)
    })),
    usage: {
      method: 'POST',
      body: {
        job: 'daily-bonus | period-rollover | trial-expiry',
        secret: 'CRON_SECRET (optional, for automated triggers)'
      },
      headers: {
        'Authorization': 'Bearer <admin_access_token> (required if no secret)'
      }
    }
  })
}

// Helper: Get job description
function getJobDescription(job: CronJobType): string {
  const descriptions: Record<CronJobType, string> = {
    'daily-bonus': 'Awards daily bonus credits to all active subscribers',
    'period-rollover': 'Handles subscription period rollovers and credit allocation',
    'trial-expiry': 'Processes expired trials and sends notifications'
  }
  return descriptions[job]
}
