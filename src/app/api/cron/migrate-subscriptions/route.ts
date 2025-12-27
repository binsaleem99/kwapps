/**
 * Automated Subscription Migration Cron Job
 * GET /api/cron/migrate-subscriptions
 *
 * Runs daily at 2 AM Kuwait time
 * Migrates users whose UPayments subscriptions are ending in next 3 days
 *
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/migrate-subscriptions",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { migrator } from '@/lib/migration/upayments-to-tap'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel provides this)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting automated subscription migration...')

    // Get migration batch (10 users at a time)
    const results = await migrator.migrateBatch(10)

    // Categorize results
    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    console.log(`✅ Migrated: ${successful.length} users`)
    console.log(`❌ Failed: ${failed.length} users`)

    // Send admin notification if failures
    if (failed.length > 0) {
      await sendAdminAlert({
        type: 'migration_failures',
        count: failed.length,
        failures: failed.map((f) => ({
          userId: f.userId,
          error: f.error,
        })),
      })
    }

    // Send success notifications
    for (const result of successful) {
      await sendUserNotification(result.userId, 'migration_success', {
        proratedCredits: result.proratedCredits,
        newSubscriptionId: result.newTapSubscriptionId,
      })
    }

    // Log migration run
    await logMigrationRun({
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      results,
    })

    return NextResponse.json({
      success: true,
      migrated: successful.length,
      failed: failed.length,
      total: results.length,
      results: {
        successful: successful.map((r) => ({
          userId: r.userId,
          oldSubscriptionId: r.oldSubscriptionId,
          newTapSubscriptionId: r.newTapSubscriptionId,
          proratedCredits: r.proratedCredits,
        })),
        failed: failed.map((r) => ({
          userId: r.userId,
          error: r.error,
        })),
      },
    })
  } catch (error) {
    console.error('Migration cron error:', error)

    // Alert admin of cron failure
    await sendAdminAlert({
      type: 'cron_failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Migration cron failed' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function sendAdminAlert(alert: {
  type: string
  count?: number
  failures?: any[]
  error?: string
}) {
  // Log to database for admin dashboard
  await supabase.from('admin_alerts').insert({
    type: alert.type,
    severity: 'high',
    message: JSON.stringify(alert),
    created_at: new Date().toISOString(),
  })

  // TODO: Send email/Slack notification to admin
  console.error('🚨 ADMIN ALERT:', alert)
}

async function sendUserNotification(
  userId: string,
  template: string,
  data: any
) {
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  if (!user) return

  await supabase.from('email_queue').insert({
    user_id: userId,
    template,
    recipient_email: user.email,
    data,
    scheduled_for: new Date().toISOString(),
  })
}

async function logMigrationRun(data: {
  total: number
  successful: number
  failed: number
  results: any[]
}) {
  await supabase.from('migration_logs').insert({
    run_date: new Date().toISOString(),
    total_processed: data.total,
    successful_count: data.successful,
    failed_count: data.failed,
    details: data.results,
  })
}
