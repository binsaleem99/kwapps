/**
 * Subscription Processing Cron Job
 * Runs daily to charge recurring subscriptions using saved cards
 *
 * This should be called from a Vercel Cron endpoint
 * Schedule: "0 2 * * *" (2 AM UTC daily)
 *
 * Note: UPayments doesn't have a direct "charge token" API.
 * For recurring billing, we use the /charge endpoint with customerUniqueToken.
 * The customer will receive a payment link and must authorize the charge.
 *
 * For fully automated recurring billing, consider:
 * 1. Using UPayments KFAST for K-Net recurring
 * 2. Using MPGS tokenization for credit cards
 * 3. Contact UPayments for merchant-initiated transactions
 */

import { createClient } from '@supabase/supabase-js'
import { upayments } from '@/lib/upayments/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface ProcessingResult {
  success: boolean
  processed: number
  charged: number
  pending: number
  failed: number
  errors: Array<{
    subscription_id: string
    user_id: string
    error: string
    failed_attempts?: number
  }>
}

export async function processSubscriptions(): Promise<ProcessingResult> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('[CRON] Starting subscription processing...')

  const results: ProcessingResult = {
    success: true,
    processed: 0,
    charged: 0,
    pending: 0,
    failed: 0,
    errors: [],
  }

  try {
    // Get all active subscriptions that are due for payment
    const today = new Date()
    const { data: dueSubscriptions, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        user:users(id, email, display_name)
      `)
      .eq('status', 'active')
      .lte('next_payment_date', today.toISOString())

    if (error) {
      console.error('[CRON] Error fetching due subscriptions:', error)
      return { ...results, success: false }
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      console.log('[CRON] No subscriptions due for payment')
      return results
    }

    console.log(`[CRON] Found ${dueSubscriptions.length} subscriptions to process`)
    results.processed = dueSubscriptions.length

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kwq8.com'

    // Process each subscription
    for (const subscription of dueSubscriptions) {
      try {
        const plan = subscription.plan as any
        const user = subscription.user as any

        if (!plan) {
          console.error(`[CRON] No plan found for subscription ${subscription.id}`)
          results.failed++
          results.errors.push({
            subscription_id: subscription.id,
            user_id: subscription.user_id,
            error: 'Plan not found',
          })
          continue
        }

        // Generate unique order ID
        const orderId = upayments.generateOrderId('renew', subscription.user_id.substring(0, 8))

        console.log(`[CRON] Processing subscription ${subscription.id} for user ${subscription.user_id}`)

        // Prepare URLs
        const returnUrl = `${baseUrl}/billing/success?order_id=${orderId}&type=renewal`
        const cancelUrl = `${baseUrl}/billing/cancel?order_id=${orderId}`
        const webhookUrl = `${baseUrl}/api/billing/webhook`

        // Get customer token if saved
        const customerToken = subscription.card_token
          ? upayments.generateCustomerToken(subscription.user_id)
          : undefined

        // Create charge request
        // Note: This creates a payment link that the customer needs to authorize
        // For fully automated recurring, contact UPayments about merchant-initiated transactions
        const chargeResponse = await upayments.createCharge({
          order: {
            id: orderId,
            description: `تجديد اشتراك ${plan.name_ar || plan.name} - KW APPS`,
            currency: 'KWD',
            amount: plan.price_monthly,
          },
          reference: {
            id: orderId,
          },
          language: 'ar',
          returnUrl,
          cancelUrl,
          notificationUrl: webhookUrl,
          customer: {
            uniqueId: subscription.user_id,
            name: user?.display_name || 'Customer',
            email: user?.email || '',
          },
          products: [
            {
              name: plan.name_en || plan.name,
              description: `تجديد اشتراك شهري - ${plan.name_ar || plan.name}`,
              price: plan.price_monthly,
              quantity: 1,
            },
          ],
          // Include customer token if available (shows saved cards)
          ...(customerToken && {
            tokens: {
              customerUniqueToken: customerToken,
            },
          }),
        })

        // Create pending transaction record
        await supabase.from('payment_transactions').insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          upayments_order_id: orderId,
          upayments_track_id: chargeResponse.data.trackId,
          upayments_payment_id: chargeResponse.data.paymentId,
          amount: plan.price_monthly,
          currency: 'KWD',
          status: 'pending',
          payment_method: subscription.card_type || 'unknown',
          transaction_type: 'renewal',
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            payment_link: chargeResponse.data.link,
            is_automated_renewal: true,
          },
        })

        // Update subscription to mark renewal initiated
        await supabase
          .from('user_subscriptions')
          .update({
            renewal_pending: true,
            renewal_order_id: orderId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id)

        results.pending++

        console.log(`[CRON] Renewal initiated for subscription ${subscription.id}, payment link created`)

        // TODO: Send email to user with payment link for renewal
        // await sendRenewalEmail(user.email, chargeResponse.data.link, plan)

      } catch (error: any) {
        console.error(`[CRON] Error processing subscription ${subscription.id}:`, error)

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

        results.failed++
        results.errors.push({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          error: error.message,
          failed_attempts: failedAttempts,
        })

        // If 3 failed attempts, subscription is past_due
        if (failedAttempts >= 3) {
          console.log(`[CRON] Subscription ${subscription.id} marked as past_due after 3 failed attempts`)
          // TODO: Send email notification about subscription suspension
        }
      }
    }

    console.log(`[CRON] Processing complete: ${results.pending} pending, ${results.failed} failed`)

    return results

  } catch (error: any) {
    console.error('[CRON] Fatal error in subscription processing:', error)
    return {
      ...results,
      success: false,
    }
  }
}

/**
 * Process expired subscriptions
 * Marks subscriptions as 'expired' if they're past the grace period
 */
export async function processExpiredSubscriptions(): Promise<{ expired: number }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('[CRON] Checking for expired subscriptions...')

  // Grace period: 7 days after current_period_end
  const gracePeriodDays = 7
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays)

  const { data: expiredSubs, error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('status', 'past_due')
    .lte('current_period_end', cutoffDate.toISOString())
    .select('id, user_id')

  if (error) {
    console.error('[CRON] Error processing expired subscriptions:', error)
    return { expired: 0 }
  }

  const expiredCount = expiredSubs?.length || 0

  if (expiredCount > 0) {
    console.log(`[CRON] Marked ${expiredCount} subscriptions as expired`)

    // Update users to free plan
    for (const sub of expiredSubs || []) {
      await supabase
        .from('users')
        .update({ plan: 'free' })
        .eq('id', sub.user_id)
    }
  }

  return { expired: expiredCount }
}
