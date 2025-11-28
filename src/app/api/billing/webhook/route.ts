import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upayments } from '@/lib/upayments/client'

/**
 * UPayments Webhook Handler
 * Processes payment confirmations and updates subscription status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-upayments-signature') || ''

    // Verify webhook signature
    if (!upayments.verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse webhook payload
    const payload = JSON.parse(body)
    const webhookData = upayments.parseWebhook(payload)

    const supabase = await createClient()

    // Find the transaction
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .select('*, metadata')
      .eq('upayments_order_id', webhookData.order_id)
      .single()

    if (txError || !transaction) {
      console.error('Transaction not found:', webhookData.order_id)
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction status
    await supabase
      .from('payment_transactions')
      .update({
        upayments_transaction_id: webhookData.transaction_id,
        status: webhookData.status,
        payment_method: webhookData.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)

    // Handle successful payment
    if (webhookData.status === 'success') {
      const metadata = transaction.metadata as any

      // Get the plan
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', metadata.plan_id)
        .single()

      if (!plan) {
        console.error('Plan not found:', metadata.plan_id)
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
      }

      // Check if this is a tokenization request
      if (metadata.tokenize_card && webhookData.card_token) {
        // Create/update subscription with card token for recurring billing
        await supabase.from('user_subscriptions').upsert({
          user_id: transaction.user_id,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          card_token: webhookData.card_token,
          card_last_four: webhookData.card_last_four,
          card_type: webhookData.payment_method,
          last_payment_date: new Date().toISOString(),
          last_payment_amount: webhookData.amount,
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          failed_payment_attempts: 0,
        })

        // Update transaction to link to subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', transaction.user_id)
          .single()

        if (subscription) {
          await supabase
            .from('payment_transactions')
            .update({ subscription_id: subscription.id })
            .eq('id', transaction.id)
        }

        console.log(`Card tokenized and subscription created for user ${transaction.user_id}`)
      } else {
        // Regular payment - activate or update subscription
        await supabase.from('user_subscriptions').upsert({
          user_id: transaction.user_id,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_payment_date: new Date().toISOString(),
          last_payment_amount: webhookData.amount,
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          failed_payment_attempts: 0,
        })

        // Update transaction to link to subscription
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', transaction.user_id)
          .single()

        if (subscription) {
          await supabase
            .from('payment_transactions')
            .update({ subscription_id: subscription.id })
            .eq('id', transaction.id)
        }

        console.log(`Subscription activated for user ${transaction.user_id}`)
      }

      // Initialize usage tracking if not exists
      const { data: existingUsage } = await supabase
        .from('usage_tracking')
        .select('id')
        .eq('user_id', transaction.user_id)
        .single()

      if (!existingUsage) {
        await supabase.from('usage_tracking').insert({
          user_id: transaction.user_id,
        })
      }
    } else if (webhookData.status === 'failed') {
      // Handle failed payment
      console.error(`Payment failed for order ${webhookData.order_id}`)

      // Increment failed payment attempts
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', transaction.user_id)
        .single()

      if (subscription) {
        const failedAttempts = (subscription.failed_payment_attempts || 0) + 1

        await supabase
          .from('user_subscriptions')
          .update({
            failed_payment_attempts: failedAttempts,
            status: failedAttempts >= 3 ? 'past_due' : subscription.status,
          })
          .eq('id', subscription.id)

        console.log(`Failed payment attempt ${failedAttempts} for user ${transaction.user_id}`)
      }
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
