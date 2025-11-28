import { NextRequest, NextResponse } from 'next/server'
import { processSubscriptions } from '@/lib/cron/process-subscriptions'

/**
 * Cron endpoint for processing recurring subscriptions
 * Called by Vercel Cron daily at 2 AM UTC
 *
 * Configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/subscriptions",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON API] Subscription processing triggered')

    const result = await processSubscriptions()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[CRON API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process subscriptions' },
      { status: 500 }
    )
  }
}
