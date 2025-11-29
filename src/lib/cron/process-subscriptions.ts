/**
 * Subscription Processing Cron Job
 * Runs daily to charge recurring subscriptions
 *
 * This should be called from a Vercel Cron endpoint
 * Schedule: "0 2 * * *" (2 AM UTC daily)
 */

import { createClient } from '@supabase/supabase-js'
import { upayments } from '@/lib/upayments/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function processSubscriptions() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('[CRON] Starting subscription processing...')

  try {
    // Get all active subscriptions that are due for payment
    const today = new Date()
    const { data: dueSubscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('status', 'active')
      .lte('next_payment_date', today.toISOString())
      .not('card_token', 'is', null) // Only subscriptions with saved cards

    if (error) {
      console.error('[CRON] Error fetching due subscriptions:', error)
      return { success: false, error }
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      console.log('[CRON] No subscriptions due for payment')
      return { success: true, processed: 0 }
    }

    console.log(`[CRON] Found ${dueSubscriptions.length} subscriptions to process`)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    }

    // Process each subscription
    for (const subscription of dueSubscriptions) {
      try {
        const plan = subscription.plan as any

        // Generate unique order ID
        const orderId = `recurring_${subscription.id}_${Date.now()}`

        console.log(`[CRON] Processing subscription ${subscription.id} for user ${subscription.user_id}`)

        // Charge the saved card token
        const chargeResult = await upayments.chargeToken({
          token: subscription.card_token,
          amount: plan.price_monthly,
          order_id: orderId,
          customer_email: '', // Will be fetched by UPayments from token
        })

        if (chargeResult.status && chargeResult.data.status === 'success') {
          // Payment successful
          console.log(`[CRON] Successfully charged ${plan.price_monthly} KWD for subscription ${subscription.id}`)

          // Update subscription
          await supabase
            .from('user_subscriptions')
            .update({
              current_period_start: today.toISOString(),
              current_period_end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              last_payment_date: today.toISOString(),
              last_payment_amount: plan.price_monthly,
              next_payment_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              failed_payment_attempts: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id)

          // Create transaction record
          await supabase.from('payment_transactions').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            upayments_order_id: orderId,
            upayments_transaction_id: chargeResult.data.transaction_id,
            amount: plan.price_monthly,
            currency: 'KWD',
            status: 'success',
            payment_method: subscription.card_type,
            transaction_type: 'recurring_charge',
          })

          results.success++
        } else {
          // Payment failed
          console.error(`[CRON] Payment failed for subscription ${subscription.id}:`, chargeResult.message)

          const failedAttempts = (subscription.failed_payment_attempts || 0) + 1

          // Update subscription with failed attempt
          await supabase
            .from('user_subscriptions')
            .update({
              failed_payment_attempts: failedAttempts,
              status: failedAttempts >= 3 ? 'past_due' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id)

          // Create failed transaction record
          await supabase.from('payment_transactions').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            upayments_order_id: orderId,
            amount: plan.price_monthly,
            currency: 'KWD',
            status: 'failed',
            payment_method: subscription.card_type,
            transaction_type: 'recurring_charge',
            error_message: chargeResult.message || 'Payment failed',
          })

          results.failed++
          results.errors.push({
            subscription_id: subscription.id,
            user_id: subscription.user_id,
            error: chargeResult.message,
            failed_attempts: failedAttempts,
          })

          // If 3 failed attempts, cancel subscription
          if (failedAttempts >= 3) {
            console.log(`[CRON] Subscription ${subscription.id} marked as past_due after 3 failed attempts`)

            // TODO: Send email notification to user
          }
        }
      } catch (error: any) {
        console.error(`[CRON] Error processing subscription ${subscription.id}:`, error)
        results.failed++
        results.errors.push({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          error: error.message,
        })
      }
    }

    console.log(`[CRON] Processing complete: ${results.success} successful, ${results.failed} failed`)

    return {
      processed: dueSubscriptions.length,
      ...results,
      success: true,
    }
  } catch (error: any) {
    console.error('[CRON] Fatal error in subscription processing:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
