import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upayments, WebhookPayload } from '@/lib/upayments/client'
import { TRIAL_CONFIG } from '@/types/billing'
import type { TransactionType } from '@/types/billing'

/**
 * UPayments Webhook Handler
 *
 * Processes payment confirmations and activates subscriptions with credits.
 *
 * Security Features:
 * - HMAC-SHA256 signature verification (fail-secure)
 * - Idempotency check via processed_webhooks table
 * - Arabic error messages for user-facing errors
 *
 * Webhook triggers:
 * - Payment succeeds (result: "CAPTURED")
 * - Payment fails (result: "NOT CAPTURED", "FAILED")
 * - Payment canceled (result: "CANCELED")
 *
 * On success:
 * - Creates user_subscription with credit allocation
 * - Creates credit_transaction for initial allocation
 * - Updates trial_subscription if trial payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-upayments-signature') || ''

    // SECURITY: Verify webhook signature (fail-secure)
    if (!upayments.verifyWebhookSignature(body, signature)) {
      console.error('[Webhook] SECURITY: Invalid or missing webhook signature')
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid signature',
          errorAr: 'توقيع غير صالح - تم رفض الطلب',
          code: 'INVALID_SIGNATURE',
        },
        { status: 400 }
      )
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
    const webhookData: WebhookPayload = upayments.parseWebhook(payload)

    const supabase = await createClient()

    // IDEMPOTENCY: Check if webhook was already processed
    const { data: existingWebhook } = await supabase
      .from('processed_webhooks')
      .select('id, processed_at')
      .eq('track_id', webhookData.track_id)
      .maybeSingle()

    if (existingWebhook) {
      console.log('[Webhook] Duplicate webhook detected, skipping:', {
        track_id: webhookData.track_id,
        processed_at: existingWebhook.processed_at,
      })
      return NextResponse.json({
        success: true,
        message: 'Webhook already processed',
        messageAr: 'تم معالجة هذا الإشعار مسبقاً',
        track_id: webhookData.track_id,
        duplicate: true,
      })
    }

    // Record webhook as processed BEFORE processing (to prevent race conditions)
    const { error: insertError } = await supabase
      .from('processed_webhooks')
      .insert({
        track_id: webhookData.track_id,
        order_id: webhookData.order_id,
        payment_id: webhookData.payment_id,
        result: webhookData.result,
      })

    if (insertError) {
      // If insert fails due to unique constraint, another process is handling it
      if (insertError.code === '23505') {
        console.log('[Webhook] Concurrent processing detected, skipping:', webhookData.track_id)
        return NextResponse.json({
          success: true,
          message: 'Webhook being processed by another request',
          messageAr: 'جاري معالجة هذا الإشعار',
          track_id: webhookData.track_id,
        })
      }
      console.error('[Webhook] Failed to record processed webhook:', insertError)
    }

    console.log('[Webhook] Processing UPayments webhook:', {
      order_id: webhookData.order_id,
      track_id: webhookData.track_id,
      result: webhookData.result,
      payment_type: webhookData.payment_type,
      amount: webhookData.amount,
    })

    // Find payment transaction by order_id
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('upayments_order_id', webhookData.order_id)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found:', webhookData.order_id)
      return NextResponse.json({
        success: false,
        message: 'Transaction not found',
        order_id: webhookData.order_id,
      })
    }

    const metadata = transaction.metadata as {
      tier_id: string
      tier_name: string
      is_trial: boolean
      credits_per_month: number
      daily_bonus_credits: number
    }

    // Determine payment status
    const isSuccess = upayments.isPaymentSuccessful(webhookData.result)
    const status = isSuccess
      ? 'success'
      : webhookData.result === 'CANCELED'
        ? 'canceled'
        : 'failed'

    // Update payment transaction
    await supabase
      .from('payment_transactions')
      .update({
        upayments_transaction_id: webhookData.tran_id,
        upayments_payment_id: webhookData.payment_id,
        upayments_track_id: webhookData.track_id,
        status,
        payment_method: webhookData.payment_type,
        webhook_received_at: new Date().toISOString(),
        webhook_data: webhookData,
        card_token: webhookData.card_token || null,
        card_last_four: webhookData.card_last_four || null,
        card_type: webhookData.payment_type || null,
      })
      .eq('id', transaction.id)

    // Handle successful payment
    if (isSuccess) {
      const now = new Date()

      // Calculate subscription period
      const periodDays = metadata.is_trial ? TRIAL_CONFIG.duration_days : 30
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + periodDays)

      // Get tier for credits info
      const { data: tier } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', metadata.tier_id)
        .single()

      if (!tier) {
        console.error('Tier not found:', metadata.tier_id)
        return NextResponse.json({
          success: false,
          message: 'Tier not found',
        })
      }

      const creditsToAllocate = tier.credits_per_month
      const subscriptionStatus = metadata.is_trial ? 'trial' : 'active'

      // Check for existing subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', transaction.user_id)
        .maybeSingle()

      let subscriptionId: string

      if (existingSub) {
        // Update existing subscription (e.g., trial converting or renewal)
        const { data: updated, error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            tier_id: tier.id,
            status: subscriptionStatus,
            is_trial: metadata.is_trial,
            trial_ends_at: metadata.is_trial ? periodEnd.toISOString() : null,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            credits_balance: creditsToAllocate,
            credits_allocated_this_period: creditsToAllocate,
            credits_bonus_earned: 0,
            credits_rollover: 0,
            last_payment_amount: transaction.amount,
            last_payment_date: now.toISOString(),
            payment_method: 'upayments',
            failed_payment_attempts: 0,
          })
          .eq('id', existingSub.id)
          .select('id')
          .single()

        if (updateError || !updated) {
          throw new Error('Failed to update subscription')
        }
        subscriptionId = updated.id
      } else {
        // Create new subscription
        const { data: newSub, error: createError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: transaction.user_id,
            tier_id: tier.id,
            status: subscriptionStatus,
            is_trial: metadata.is_trial,
            trial_ends_at: metadata.is_trial ? periodEnd.toISOString() : null,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            credits_balance: creditsToAllocate,
            credits_allocated_this_period: creditsToAllocate,
            credits_bonus_earned: 0,
            credits_rollover: 0,
            last_payment_amount: transaction.amount,
            last_payment_date: now.toISOString(),
            payment_method: 'upayments',
            failed_payment_attempts: 0,
          })
          .select('id')
          .single()

        if (createError || !newSub) {
          throw new Error('Failed to create subscription')
        }
        subscriptionId = newSub.id
      }

      // Create credit allocation transaction
      await supabase.from('credit_transactions').insert({
        user_id: transaction.user_id,
        subscription_id: subscriptionId,
        transaction_type: 'allocation' as TransactionType,
        amount: creditsToAllocate,
        balance_after: creditsToAllocate,
        description_ar: metadata.is_trial
          ? `تخصيص رصيد الفترة التجريبية: ${creditsToAllocate} رصيد - ${tier.display_name_ar}`
          : `تخصيص رصيد شهري: ${creditsToAllocate} رصيد - ${tier.display_name_ar}`,
        description_en: metadata.is_trial
          ? `Trial credit allocation: ${creditsToAllocate} credits - ${tier.display_name_en}`
          : `Monthly credit allocation: ${creditsToAllocate} credits - ${tier.display_name_en}`,
      })

      // Update payment transaction with subscription ID
      await supabase
        .from('payment_transactions')
        .update({ subscription_id: subscriptionId })
        .eq('id', transaction.id)

      // Handle trial-specific updates
      if (metadata.is_trial) {
        // Create or update trial_subscriptions record
        const { data: existingTrial } = await supabase
          .from('trial_subscriptions')
          .select('id')
          .eq('user_id', transaction.user_id)
          .maybeSingle()

        if (existingTrial) {
          await supabase
            .from('trial_subscriptions')
            .update({
              subscription_id: subscriptionId,
              payment_status: 'paid',
              payment_transaction_id: webhookData.tran_id || webhookData.payment_id,
              payment_date: now.toISOString(),
            })
            .eq('id', existingTrial.id)
        } else {
          await supabase.from('trial_subscriptions').insert({
            user_id: transaction.user_id,
            subscription_id: subscriptionId,
            trial_price_kwd: TRIAL_CONFIG.price_kwd,
            trial_duration_days: TRIAL_CONFIG.duration_days,
            started_at: now.toISOString(),
            ends_at: periodEnd.toISOString(),
            payment_status: 'paid',
            payment_transaction_id: webhookData.tran_id || webhookData.payment_id,
            payment_date: now.toISOString(),
          })

          // Link trial to payment transaction
          const { data: trialRecord } = await supabase
            .from('trial_subscriptions')
            .select('id')
            .eq('subscription_id', subscriptionId)
            .single()

          if (trialRecord) {
            await supabase
              .from('payment_transactions')
              .update({ trial_id: trialRecord.id })
              .eq('id', transaction.id)
          }
        }
      }

      // Update user's plan and payment_status in users table
      await supabase
        .from('users')
        .update({
          plan: tier.name,
          payment_status: subscriptionStatus, // Mark as 'trial' or 'active'
          payment_verified_at: now.toISOString(),
        })
        .eq('id', transaction.user_id)

      console.log(
        `Payment success - ${metadata.is_trial ? 'Trial' : 'Subscription'} activated for user ${transaction.user_id}`,
        `Tier: ${tier.name}, Credits: ${creditsToAllocate}`
      )

    } else if (status === 'failed') {
      // Handle failed payment
      console.error(`Payment failed for order ${webhookData.order_id}:`, webhookData.result)

      // Increment failed attempts if subscription exists
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id, failed_payment_attempts')
        .eq('user_id', transaction.user_id)
        .maybeSingle()

      if (subscription) {
        const attempts = (subscription.failed_payment_attempts || 0) + 1
        await supabase
          .from('user_subscriptions')
          .update({
            failed_payment_attempts: attempts,
            status: attempts >= 3 ? 'expired' : 'active',
          })
          .eq('id', subscription.id)
      }

      // Update trial payment status if trial
      if (metadata.is_trial) {
        await supabase
          .from('trial_subscriptions')
          .update({ payment_status: 'failed' })
          .eq('user_id', transaction.user_id)
      }

    } else if (status === 'canceled') {
      console.log(`Payment canceled for order ${webhookData.order_id}`)
    }

    return NextResponse.json({
      success: true,
      received: true,
      order_id: webhookData.order_id,
      result: webhookData.result,
      status,
    })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * GET - Webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'UPayments webhook endpoint active',
    timestamp: new Date().toISOString(),
    supported_events: ['CAPTURED', 'NOT CAPTURED', 'FAILED', 'CANCELED'],
  })
}
