// ==============================================
// KW APPS - Trial Subscription Expiry Handler
// ==============================================
// Checks for expired trials and handles conversion/downgrade
// Sends notifications via webhook (prepared for future use)
// ==============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpiredTrial {
  id: string
  user_id: string
  subscription_id: string
  ends_at: string
  converted_to_paid: boolean
  subscription: {
    id: string
    status: string
    credits_balance: number
  }
  user: {
    email: string
    name: string | null
  }
}

interface WebhookPayload {
  event: 'trial_expired' | 'trial_warning'
  user_id: string
  email: string
  name: string | null
  trial_end_date: string
  converted: boolean
  timestamp: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const webhookUrl = Deno.env.get('TRIAL_EXPIRY_WEBHOOK_URL') // Optional webhook

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date()
    const nowISO = now.toISOString()
    console.log(`[Trial Expiry] Starting at: ${nowISO}`)

    // Find expired trials that haven't been processed
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('trial_subscriptions')
      .select(`
        id,
        user_id,
        subscription_id,
        ends_at,
        converted_to_paid,
        subscription:user_subscriptions(id, status, credits_balance)
      `)
      .lt('ends_at', nowISO)
      .eq('payment_status', 'paid')
      .is('converted_to_paid', false)

    if (fetchError) {
      throw new Error(`Failed to fetch expired trials: ${fetchError.message}`)
    }

    // Also check for trials ending soon (warning - within 24 hours)
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const { data: expiringTrials, error: warningError } = await supabase
      .from('trial_subscriptions')
      .select(`
        id,
        user_id,
        subscription_id,
        ends_at,
        converted_to_paid
      `)
      .gt('ends_at', nowISO)
      .lt('ends_at', tomorrow.toISOString())
      .eq('payment_status', 'paid')
      .is('converted_to_paid', false)

    if (warningError) {
      console.error('[Trial Expiry] Warning fetch error:', warningError)
    }

    let expired = 0
    let warned = 0
    const errors: string[] = []
    const webhookPayloads: WebhookPayload[] = []

    // Process expired trials
    if (expiredTrials && expiredTrials.length > 0) {
      console.log(`[Trial Expiry] Found ${expiredTrials.length} expired trials`)

      for (const trial of expiredTrials as unknown as ExpiredTrial[]) {
        try {
          // Get user info for notification
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', trial.user_id)
            .single()

          if (userError) {
            console.error(`[Trial Expiry] User fetch error:`, userError)
          }

          // Update subscription status to expired
          const { error: subUpdateError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'expired',
              credits_balance: 0,
              updated_at: nowISO
            })
            .eq('id', trial.subscription_id)

          if (subUpdateError) {
            throw new Error(`Subscription update failed: ${subUpdateError.message}`)
          }

          // Update trial record
          const { error: trialUpdateError } = await supabase
            .from('trial_subscriptions')
            .update({
              converted_to_paid: false // Mark as not converted
            })
            .eq('id', trial.id)

          if (trialUpdateError) {
            console.error(`[Trial Expiry] Trial update error:`, trialUpdateError)
          }

          // Update user role/plan to indicate no active subscription
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              plan: 'expired', // Mark user as expired/no subscription
              updated_at: nowISO
            })
            .eq('id', trial.user_id)

          if (userUpdateError) {
            console.error(`[Trial Expiry] User update error:`, userUpdateError)
          }

          // Create credit transaction for trial end
          const { error: txError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: trial.user_id,
              subscription_id: trial.subscription_id,
              transaction_type: 'debit',
              amount: -(trial.subscription as { credits_balance: number })?.credits_balance || 0,
              balance_after: 0,
              operation_type: 'deploy', // Use existing operation type
              operation_metadata: { reason: 'trial_expired' },
              description_ar: 'انتهاء فترة التجربة - تم تصفير الرصيد',
              description_en: 'Trial period ended - balance reset to zero'
            })

          if (txError) {
            console.error(`[Trial Expiry] Transaction error:`, txError)
          }

          // Prepare webhook payload
          if (webhookUrl && userData) {
            webhookPayloads.push({
              event: 'trial_expired',
              user_id: trial.user_id,
              email: userData.email,
              name: userData.name,
              trial_end_date: trial.ends_at,
              converted: false,
              timestamp: nowISO
            })
          }

          expired++
          console.log(`[Trial Expiry] Expired trial for user ${trial.user_id}`)

        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          errors.push(`Trial ${trial.id}: ${errorMsg}`)
          console.error(`[Trial Expiry] Error for trial ${trial.id}:`, errorMsg)
        }
      }
    }

    // Process trials expiring soon (warnings)
    if (expiringTrials && expiringTrials.length > 0) {
      console.log(`[Trial Expiry] Found ${expiringTrials.length} trials expiring soon`)

      for (const trial of expiringTrials) {
        try {
          // Get user info for notification
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', trial.user_id)
            .single()

          if (userError) {
            console.error(`[Trial Expiry] Warning user fetch error:`, userError)
            continue
          }

          // Prepare webhook payload for warning
          if (webhookUrl && userData) {
            webhookPayloads.push({
              event: 'trial_warning',
              user_id: trial.user_id,
              email: userData.email,
              name: userData.name,
              trial_end_date: trial.ends_at,
              converted: false,
              timestamp: nowISO
            })
          }

          warned++

        } catch (err) {
          console.error(`[Trial Expiry] Warning error:`, err)
        }
      }
    }

    // Send webhook notifications if configured
    if (webhookUrl && webhookPayloads.length > 0) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Source': 'kwapps-trial-expiry'
          },
          body: JSON.stringify({
            events: webhookPayloads,
            timestamp: nowISO
          })
        })

        if (!webhookResponse.ok) {
          console.error(`[Trial Expiry] Webhook failed:`, webhookResponse.status)
        } else {
          console.log(`[Trial Expiry] Webhook sent successfully`)
        }
      } catch (webhookError) {
        console.error(`[Trial Expiry] Webhook error:`, webhookError)
      }
    }

    const result = {
      success: true,
      timestamp: nowISO,
      expired,
      warned,
      webhooksSent: webhookPayloads.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${expired} expired trials, ${warned} warnings sent`
    }

    console.log(`[Trial Expiry] Completed:`, result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Trial Expiry] Fatal error:', errorMsg)

    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
