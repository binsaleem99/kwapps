// ==============================================
// KW APPS - Daily Bonus Credit Distribution
// ==============================================
// Runs daily at 00:00 Kuwait time (GMT+3)
// Awards daily bonus credits to active subscribers
// ==============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionWithTier {
  id: string
  user_id: string
  credits_balance: number
  credits_bonus_earned: number
  tier: {
    daily_bonus_credits: number
    name: string
  }
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get today's date in Kuwait timezone (GMT+3)
    const kuwaitDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kuwait'
    })

    console.log(`[Daily Bonus] Starting for date: ${kuwaitDate}`)

    // Get all active subscriptions with their tier info
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        credits_balance,
        credits_bonus_earned,
        tier:subscription_tiers(daily_bonus_credits, name)
      `)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())

    if (subError) {
      throw new Error(`Failed to fetch subscriptions: ${subError.message}`)
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('[Daily Bonus] No active subscriptions found')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active subscriptions',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Daily Bonus] Found ${subscriptions.length} active subscriptions`)

    // Get users who already received bonus today
    const { data: existingBonuses, error: bonusError } = await supabase
      .from('daily_bonus_log')
      .select('user_id')
      .eq('bonus_date', kuwaitDate)

    if (bonusError) {
      throw new Error(`Failed to check existing bonuses: ${bonusError.message}`)
    }

    const usersWithBonus = new Set(existingBonuses?.map(b => b.user_id) || [])
    console.log(`[Daily Bonus] ${usersWithBonus.size} users already received bonus today`)

    let processed = 0
    let skipped = 0
    const errors: string[] = []

    // Process each subscription
    for (const sub of subscriptions as unknown as SubscriptionWithTier[]) {
      // Skip if user already received bonus today
      if (usersWithBonus.has(sub.user_id)) {
        skipped++
        continue
      }

      const tierData = sub.tier as { daily_bonus_credits: number; name: string }
      if (!tierData || !tierData.daily_bonus_credits) {
        console.log(`[Daily Bonus] Skipping user ${sub.user_id}: No tier data`)
        skipped++
        continue
      }

      const bonusAmount = tierData.daily_bonus_credits
      const newBalance = sub.credits_balance + bonusAmount
      const newBonusEarned = sub.credits_bonus_earned + bonusAmount

      try {
        // Start transaction: Update balance, create transaction, log bonus

        // 1. Update user subscription credits
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            credits_balance: newBalance,
            credits_bonus_earned: newBonusEarned,
            updated_at: new Date().toISOString()
          })
          .eq('id', sub.id)

        if (updateError) {
          throw new Error(`Update failed: ${updateError.message}`)
        }

        // 2. Create credit transaction record
        const { data: transaction, error: txError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            transaction_type: 'bonus',
            amount: bonusAmount,
            balance_after: newBalance,
            bonus_date: kuwaitDate,
            description_ar: `مكافأة يومية - باقة ${getArabicTierName(tierData.name)}`,
            description_en: `Daily bonus - ${tierData.name} tier`
          })
          .select('id')
          .single()

        if (txError) {
          throw new Error(`Transaction failed: ${txError.message}`)
        }

        // 3. Log to daily_bonus_log
        const { error: logError } = await supabase
          .from('daily_bonus_log')
          .insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            bonus_date: kuwaitDate,
            bonus_amount: bonusAmount,
            transaction_id: transaction?.id
          })

        if (logError) {
          throw new Error(`Bonus log failed: ${logError.message}`)
        }

        processed++
        console.log(`[Daily Bonus] Awarded ${bonusAmount} credits to user ${sub.user_id}`)

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`User ${sub.user_id}: ${errorMsg}`)
        console.error(`[Daily Bonus] Error for user ${sub.user_id}:`, errorMsg)
      }
    }

    // ==========================================
    // Cleanup expired orchestration sessions
    // ==========================================
    let sessionsCleaned = 0
    try {
      const { data: cleanupResult, error: cleanupError } = await supabase.rpc(
        'cleanup_expired_orchestration_sessions'
      )

      if (cleanupError) {
        console.error('[Daily Bonus] Session cleanup error:', cleanupError.message)
      } else {
        sessionsCleaned = cleanupResult || 0
        console.log(`[Daily Bonus] Cleaned up ${sessionsCleaned} expired orchestration sessions`)
      }
    } catch (cleanupErr) {
      console.error('[Daily Bonus] Session cleanup failed:', cleanupErr)
    }

    const result = {
      success: true,
      date: kuwaitDate,
      processed,
      skipped,
      sessionsCleaned,
      errors: errors.length > 0 ? errors : undefined,
      message: `Daily bonus distributed to ${processed} users, ${skipped} skipped. Cleaned ${sessionsCleaned} expired sessions.`
    }

    console.log(`[Daily Bonus] Completed:`, result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Daily Bonus] Fatal error:', errorMsg)

    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper: Get Arabic tier name
function getArabicTierName(tierName: string): string {
  const tierNames: Record<string, string> = {
    'basic': 'أساسي',
    'pro': 'احترافي',
    'premium': 'مميز',
    'enterprise': 'مؤسسي'
  }
  return tierNames[tierName.toLowerCase()] || tierName
}
