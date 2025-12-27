/**
 * Payment Provider Feature Flags
 *
 * Gradual rollout system for UPayments → Tap migration
 * Controls which users get which payment provider
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PaymentProvider = 'upayments' | 'tap'

export interface FeatureFlags {
  enableTapPayments: boolean
  tapRolloutPercentage: number
  forceProvider?: PaymentProvider
}

/**
 * Get feature flags from environment
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    enableTapPayments: process.env.NEXT_PUBLIC_ENABLE_TAP_PAYMENTS === 'true',
    tapRolloutPercentage: parseInt(process.env.NEXT_PUBLIC_TAP_ROLLOUT_PERCENTAGE || '0'),
    forceProvider: process.env.NEXT_PUBLIC_FORCE_PROVIDER as PaymentProvider | undefined,
  }
}

/**
 * Determine which payment provider to use for a user
 */
export async function getPaymentProvider(userId?: string): Promise<PaymentProvider> {
  const flags = getFeatureFlags()

  // If Tap is disabled, use UPayments
  if (!flags.enableTapPayments) {
    return 'upayments'
  }

  // If force provider is set (for testing)
  if (flags.forceProvider) {
    return flags.forceProvider
  }

  // If user ID provided, check their existing provider
  if (userId) {
    const { data: user } = await supabase
      .from('users')
      .select('payment_provider')
      .eq('id', userId)
      .single()

    if (user?.payment_provider) {
      return user.payment_provider as PaymentProvider
    }

    // Check if user has existing subscriptions
    const hasUpayments = await checkActiveUPaymentsSubscription(userId)
    if (hasUpayments) return 'upayments'

    const hasTap = await checkActiveTapSubscription(userId)
    if (hasTap) return 'tap'
  }

  // For new users, use rollout percentage
  const random = Math.random() * 100
  return random < flags.tapRolloutPercentage ? 'tap' : 'upayments'
}

/**
 * Check if user has active UPayments subscription
 */
async function checkActiveUPaymentsSubscription(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Check if user has active Tap subscription
 */
async function checkActiveTapSubscription(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('tap_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .single()

    return !!data
  } catch {
    return false
  }
}

/**
 * Check if user should be migrated now
 */
export async function shouldMigrateUser(userId: string): Promise<boolean> {
  // User must have active UPayments subscription
  const hasUpayments = await checkActiveUPaymentsSubscription(userId)
  if (!hasUpayments) return false

  // Check if subscription is ending soon (within 3 days)
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) return false

  const periodEnd = new Date(subscription.current_period_end)
  const now = new Date()
  const daysUntilEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return daysUntilEnd <= 3 && daysUntilEnd >= 0
}

/**
 * Get rollout status for monitoring
 */
export async function getRolloutStatus() {
  const flags = getFeatureFlags()

  // Count users by provider
  const { data: providerCounts } = await supabase
    .from('users')
    .select('payment_provider')
    .in('payment_provider', ['upayments', 'tap'])

  const upayments = providerCounts?.filter((u) => u.payment_provider === 'upayments').length || 0
  const tap = providerCounts?.filter((u) => u.payment_provider === 'tap').length || 0
  const total = upayments + tap

  return {
    enabled: flags.enableTapPayments,
    rolloutPercentage: flags.tapRolloutPercentage,
    users: {
      upayments,
      tap,
      total,
      migrationPercentage: total > 0 ? Math.round((tap / total) * 100) : 0,
    },
  }
}
