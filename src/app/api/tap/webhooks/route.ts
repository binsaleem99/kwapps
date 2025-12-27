/**
 * Tap Payments Webhook Handler
 * POST /api/tap/webhooks
 *
 * Handles all Tap subscription lifecycle events:
 * - Subscription created/activated/renewed
 * - Payment success/failure
 * - Trial started/ended
 * - Subscription cancelled/paused/resumed
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TAP_WEBHOOK_SECRET = process.env.TAP_WEBHOOK_SECRET!

/**
 * Verify Tap webhook signature per official Tap documentation
 * Reference: https://developers.tap.company/docs/webhooks
 *
 * Tap uses hashstring format:
 * "x_id" + id + "x_amount" + amount + "x_currency" + currency +
 * "x_gateway_reference" + gateway_ref + "x_payment_reference" + payment_ref +
 * "x_status" + status + "x_created" + created
 */
function verifyTapWebhook(payload: any, receivedHash: string): boolean {
  try {
    if (!receivedHash) {
      console.error('No hashstring provided in webhook')
      return false
    }

    // Extract required fields from payload
    const { id, amount, currency, status, created } = payload
    const gateway_ref = payload.gateway_reference || ''
    const payment_ref = payload.payment_reference || ''

    // Construct hashstring per Tap specification
    const hashString =
      `x_id${id}` +
      `x_amount${amount}` +
      `x_currency${currency}` +
      `x_gateway_reference${gateway_ref}` +
      `x_payment_reference${payment_ref}` +
      `x_status${status}` +
      `x_created${created}`

    // Generate HMAC-SHA256 hash
    const expectedHash = crypto
      .createHmac('sha256', TAP_WEBHOOK_SECRET)
      .update(hashString)
      .digest('hex')

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(expectedHash)
    )
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const event = JSON.parse(body)
    const hashstring = request.headers.get('hashstring') || '' // FIXED: Correct header name

    // Verify webhook authenticity with proper Tap hashstring method
    if (!verifyTapWebhook(event, hashstring)) {
      console.error('Invalid Tap webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { id: eventId, type, data } = event

    console.log(`Processing Tap webhook: ${type}`, { eventId })

    // Check for duplicate webhooks (idempotency)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('provider', 'tap')
      .eq('event_id', eventId)
      .eq('processed', true)
      .maybeSingle()

    if (existingEvent) {
      console.log(`Webhook ${eventId} already processed, skipping`)
      return NextResponse.json({ received: true, status: 'duplicate' })
    }

    // Log webhook for debugging
    await supabase.from('webhook_events').insert({
      provider: 'tap',
      event_id: eventId,
      event_type: type,
      payload: event,
    })

    // Handle different event types
    switch (type) {
      case 'SUBSCRIPTION_CREATED':
        await handleSubscriptionCreated(data)
        break

      case 'SUBSCRIPTION_ACTIVATED':
        await handleSubscriptionActivated(data)
        break

      case 'SUBSCRIPTION_RENEWED':
        await handleSubscriptionRenewed(data)
        break

      case 'SUBSCRIPTION_CANCELLED':
        await handleSubscriptionCancelled(data)
        break

      case 'SUBSCRIPTION_PAUSED':
        await handleSubscriptionPaused(data)
        break

      case 'SUBSCRIPTION_RESUMED':
        await handleSubscriptionResumed(data)
        break

      case 'INVOICE_PAID':
        await handleInvoicePaid(data)
        break

      case 'INVOICE_PAYMENT_FAILED':
        await handlePaymentFailed(data)
        break

      case 'SUBSCRIPTION_TRIAL_ENDING':
        await handleTrialEnding(data)
        break

      default:
        console.log(`Unhandled Tap event type: ${type}`)
    }

    // Mark webhook as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', eventId)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Tap webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ============================================
// EVENT HANDLERS
// ============================================

async function handleSubscriptionCreated(data: any) {
  const { id, customer, metadata } = data

  await supabase.from('tap_subscriptions').upsert({
    tap_subscription_id: id,
    user_id: metadata?.user_id,
    tap_customer_id: customer.id,
    status: 'pending',
  })

  await supabase.from('tap_billing_events').insert({
    user_id: metadata?.user_id,
    tap_subscription_id: id,
    type: 'subscription_created',
    status: 'completed',
  })
}

async function handleSubscriptionActivated(data: any) {
  const { id, current_period_start, current_period_end, charge } = data

  // Update subscription status
  await supabase
    .from('tap_subscriptions')
    .update({
      status: 'active',
      current_period_start,
      current_period_end,
      amount: charge.amount,
      currency: charge.currency,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id)

  // Grant credits to user
  const { data: subscription } = await supabase
    .from('tap_subscriptions')
    .select('user_id, plan_id')
    .eq('tap_subscription_id', id)
    .single()

  if (subscription) {
    await grantSubscriptionCredits(subscription.user_id, subscription.plan_id)
  }

  // Log event
  await supabase.from('tap_billing_events').insert({
    user_id: subscription?.user_id,
    tap_invoice_id: charge.id,
    type: 'subscription_activated',
    amount: charge.amount,
    currency: charge.currency,
    status: 'completed',
  })
}

async function handleSubscriptionRenewed(data: any) {
  const { id, current_period_start, current_period_end } = data

  // Update period and increment renewal count
  const { data: currentSub } = await supabase
    .from('tap_subscriptions')
    .select('renewal_count')
    .eq('tap_subscription_id', id)
    .single()

  await supabase
    .from('tap_subscriptions')
    .update({
      status: 'active',
      current_period_start,
      current_period_end,
      renewal_count: (currentSub?.renewal_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id)

  // Refresh credits
  const { data: subscription } = await supabase
    .from('tap_subscriptions')
    .select('user_id, plan_id')
    .eq('tap_subscription_id', id)
    .single()

  if (subscription) {
    await refreshSubscriptionCredits(subscription.user_id, subscription.plan_id)
  }

  // Log event
  await supabase.from('tap_billing_events').insert({
    user_id: subscription?.user_id,
    type: 'subscription_renewed',
    status: 'completed',
  })
}

async function handleSubscriptionCancelled(data: any) {
  const { id, cancel_at_period_end, cancelled_at } = data

  await supabase
    .from('tap_subscriptions')
    .update({
      status: cancel_at_period_end ? 'cancelling' : 'cancelled',
      cancel_at_period_end,
      cancelled_at,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id)

  await supabase.from('tap_billing_events').insert({
    type: 'subscription_cancelled',
    status: 'completed',
    metadata: { cancel_at_period_end },
  })
}

async function handleSubscriptionPaused(data: any) {
  await supabase
    .from('tap_subscriptions')
    .update({ status: 'paused' })
    .eq('tap_subscription_id', data.id)
}

async function handleSubscriptionResumed(data: any) {
  await supabase
    .from('tap_subscriptions')
    .update({ status: 'active' })
    .eq('tap_subscription_id', data.id)
}

async function handleInvoicePaid(data: any) {
  await supabase.from('tap_billing_events').insert({
    tap_invoice_id: data.id,
    type: 'payment_success',
    amount: data.amount,
    currency: data.currency,
    status: 'completed',
  })
}

async function handlePaymentFailed(data: any) {
  const { id, subscription, failure_reason } = data

  // Update subscription to past_due and increment failed payment count
  const { data: currentSub } = await supabase
    .from('tap_subscriptions')
    .select('failed_payment_count')
    .eq('tap_subscription_id', subscription?.id)
    .single()

  await supabase
    .from('tap_subscriptions')
    .update({
      status: 'past_due',
      failed_payment_count: (currentSub?.failed_payment_count || 0) + 1,
      last_payment_attempt: new Date().toISOString(),
    })
    .eq('tap_subscription_id', subscription?.id)

  // Log failure
  await supabase.from('tap_billing_events').insert({
    tap_invoice_id: id,
    type: 'payment_failed',
    status: 'failed',
    failure_reason,
  })

  // Schedule retry (dunning)
  await schedulePaymentRetries(subscription?.id)
}

async function handleTrialEnding(data: any) {
  // Send reminder email 2 days before trial ends
  const { data: subscription } = await supabase
    .from('tap_subscriptions')
    .select('user_id')
    .eq('tap_subscription_id', data.id)
    .single()

  if (subscription) {
    // Get user email separately
    const { data: user } = await supabase.auth.admin.getUserById(subscription.user_id)

    if (user?.user?.email) {
      await supabase.from('email_queue').insert({
        user_id: subscription.user_id,
        template: 'trial_ending',
        recipient_email: user.user.email,
        data: { trial_end: data.trial_end },
      })
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function grantSubscriptionCredits(userId: string, planId: string) {
  const creditAllocation: Record<string, number> = {
    basic_monthly_kwd: 3000, // 100/day × 30
    basic_annual_kwd: 36500, // 100/day × 365
    pro_monthly_kwd: 6000, // 200/day × 30
    pro_annual_kwd: 73000, // 200/day × 365
    premium_monthly_kwd: 12000, // 400/day × 30
    premium_annual_kwd: 146000, // 400/day × 365
    enterprise_monthly_kwd: 24000, // 800/day × 30
    enterprise_annual_kwd: 292000, // 800/day × 365
    trial_weekly_kwd: 700, // 100/day × 7
  }

  const credits = creditAllocation[planId] || 3000

  await supabase.from('user_credits').upsert({
    user_id: userId,
    total_credits: credits,
    used_credits: 0,
    updated_at: new Date().toISOString(),
  })
}

async function refreshSubscriptionCredits(userId: string, planId: string) {
  // Reset used credits for new billing period
  const creditAllocation: Record<string, number> = {
    basic_monthly_kwd: 3000,
    pro_monthly_kwd: 6000,
    premium_monthly_kwd: 12000,
    enterprise_monthly_kwd: 24000,
  }

  const credits = creditAllocation[planId] || 3000

  await supabase
    .from('user_credits')
    .update({
      total_credits: credits,
      used_credits: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}

async function schedulePaymentRetries(subscriptionId: string) {
  // Schedule 3 retry attempts: Day 1, Day 3, Day 7
  const retryDays = [1, 3, 7]

  for (let i = 0; i < retryDays.length; i++) {
    const retryDate = new Date()
    retryDate.setDate(retryDate.getDate() + retryDays[i])

    await supabase.from('payment_retry_schedule').insert({
      tap_subscription_id: subscriptionId,
      attempt_number: i + 1,
      scheduled_for: retryDate.toISOString(),
      status: 'pending',
    })
  }
}
