// ==============================================
// KW APPS - Subscription Period Rollover
// ==============================================
// Runs when subscription periods end
// Handles credit rollover (max 50% of monthly allocation)
// Allocates new monthly credits
// ==============================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Maximum rollover percentage (50% of monthly allocation)
const ROLLOVER_PERCENTAGE = 0.5

interface SubscriptionWithTier {
  id: string
  user_id: string
  status: string
  credits_balance: number
  credits_allocated_this_period: number
  credits_bonus_earned: number
  credits_rollover: number
  current_period_start: string
  current_period_end: string
  tier: {
    id: string
    credits_per_month: number
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

    const now = new Date().toISOString()
    console.log(`[Period Rollover] Starting at: ${now}`)

    // Find subscriptions whose period has ended but are still active
    const { data: expiredPeriods, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        status,
        credits_balance,
        credits_allocated_this_period,
        credits_bonus_earned,
        credits_rollover,
        current_period_start,
        current_period_end,
        tier:subscription_tiers(id, credits_per_month, name)
      `)
      .eq('status', 'active')
      .lt('current_period_end', now)

    if (fetchError) {
      throw new Error(`Failed to fetch expired periods: ${fetchError.message}`)
    }

    if (!expiredPeriods || expiredPeriods.length === 0) {
      console.log('[Period Rollover] No subscriptions need rollover')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No subscriptions need rollover',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Period Rollover] Found ${expiredPeriods.length} subscriptions to process`)

    let processed = 0
    let expired = 0
    const errors: string[] = []

    for (const sub of expiredPeriods as unknown as SubscriptionWithTier[]) {
      try {
        const tierData = sub.tier as { id: string; credits_per_month: number; name: string }

        if (!tierData) {
          console.log(`[Period Rollover] Skipping ${sub.id}: No tier data`)
          continue
        }

        const monthlyAllocation = tierData.credits_per_month
        const remainingCredits = sub.credits_balance

        // Calculate rollover: min(remaining, 50% of monthly allocation)
        const maxRollover = Math.floor(monthlyAllocation * ROLLOVER_PERCENTAGE)
        const actualRollover = Math.min(remainingCredits, maxRollover)

        // New period dates (1 month from previous end)
        const newPeriodStart = new Date(sub.current_period_end)
        const newPeriodEnd = new Date(sub.current_period_end)
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

        // Check if the new period has already passed (subscription lapsed)
        if (newPeriodEnd < new Date()) {
          // Subscription has lapsed - mark as expired
          const { error: expireError } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'expired',
              credits_balance: 0,
              updated_at: now
            })
            .eq('id', sub.id)

          if (expireError) {
            throw new Error(`Failed to expire subscription: ${expireError.message}`)
          }

          expired++
          console.log(`[Period Rollover] Expired subscription ${sub.id} (lapsed)`)
          continue
        }

        // Calculate new balance: new allocation + rollover
        const newBalance = monthlyAllocation + actualRollover

        // Update subscription with new period
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            credits_balance: newBalance,
            credits_allocated_this_period: monthlyAllocation,
            credits_bonus_earned: 0, // Reset for new period
            credits_rollover: actualRollover,
            current_period_start: newPeriodStart.toISOString(),
            current_period_end: newPeriodEnd.toISOString(),
            updated_at: now
          })
          .eq('id', sub.id)

        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`)
        }

        // Create rollover transaction if there's rollover
        if (actualRollover > 0) {
          const { error: rolloverTxError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              transaction_type: 'rollover',
              amount: actualRollover,
              balance_after: actualRollover, // Just the rollover at this point
              description_ar: `ترحيل رصيد من الفترة السابقة (${actualRollover} من ${remainingCredits} رصيد متبقي)`,
              description_en: `Credit rollover from previous period (${actualRollover} of ${remainingCredits} remaining)`
            })

          if (rolloverTxError) {
            console.error(`[Period Rollover] Rollover transaction failed:`, rolloverTxError)
          }
        }

        // Create allocation transaction for new period
        const { error: allocTxError } = await supabase
          .from('credit_transactions')
          .insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            transaction_type: 'allocation',
            amount: monthlyAllocation,
            balance_after: newBalance,
            description_ar: `تخصيص رصيد شهري - باقة ${getArabicTierName(tierData.name)}`,
            description_en: `Monthly credit allocation - ${tierData.name} tier`
          })

        if (allocTxError) {
          console.error(`[Period Rollover] Allocation transaction failed:`, allocTxError)
        }

        processed++
        console.log(`[Period Rollover] Processed ${sub.id}: ${monthlyAllocation} new + ${actualRollover} rollover = ${newBalance} credits`)

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Subscription ${sub.id}: ${errorMsg}`)
        console.error(`[Period Rollover] Error for ${sub.id}:`, errorMsg)
      }
    }

    const result = {
      success: true,
      timestamp: now,
      processed,
      expired,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${processed} rollovers, ${expired} expired`
    }

    console.log(`[Period Rollover] Completed:`, result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Period Rollover] Fatal error:', errorMsg)

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
