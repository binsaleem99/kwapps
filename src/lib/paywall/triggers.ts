/**
 * Paywall Trigger System
 *
 * Determines when and where to show paywalls for maximum conversion
 * 8 strategic placement points based on user behavior
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PaywallPlacement {
  id: string
  name: string
  nameAr: string
  priority: 'P0' | 'P1' | 'P2'
  expectedConversion: number
  triggerCondition: () => Promise<boolean>
}

export const PAYWALL_PLACEMENTS: Record<string, PaywallPlacement> = {
  POST_ONBOARDING: {
    id: 'post_onboarding',
    name: 'Post Onboarding',
    nameAr: 'بعد التسجيل',
    priority: 'P0',
    expectedConversion: 0.40,
    triggerCondition: async () => {
      const onboardingComplete = sessionStorage.getItem('onboarding_complete')
      const hasSubscription = await checkSubscription()
      return onboardingComplete === 'true' && !hasSubscription
    },
  },

  FIRST_GENERATION: {
    id: 'first_generation',
    name: 'First AI Generation',
    nameAr: 'أول توليد AI',
    priority: 'P0',
    expectedConversion: 0.25,
    triggerCondition: async () => {
      const generationCount = parseInt(
        localStorage.getItem('generation_count') || '0'
      )
      const hasSubscription = await checkSubscription()
      return generationCount === 0 && !hasSubscription
    },
  },

  PUBLISH_ATTEMPT: {
    id: 'publish_attempt',
    name: 'Publish Attempt',
    nameAr: 'محاولة النشر',
    priority: 'P0',
    expectedConversion: 0.15,
    triggerCondition: async () => {
      const hasSubscription = await checkSubscription()
      return !hasSubscription
    },
  },

  CREDIT_EXHAUSTION: {
    id: 'credit_exhaustion',
    name: 'Credit Exhaustion',
    nameAr: 'نفاد الرصيد',
    priority: 'P1',
    expectedConversion: 0.10,
    triggerCondition: async () => {
      const credits = await getCreditBalance()
      return credits <= 5
    },
  },

  FEATURE_GATE: {
    id: 'feature_gate',
    name: 'Feature Gate',
    nameAr: 'بوابة الميزة',
    priority: 'P1',
    expectedConversion: 0.12,
    triggerCondition: async () => {
      const hasSubscription = await checkSubscription()
      const tier = await getUserTier()
      return !hasSubscription || tier === 'basic'
    },
  },

  DASHBOARD_VISIT: {
    id: 'dashboard_visit',
    name: 'Dashboard Visit',
    nameAr: 'زيارة لوحة التحكم',
    priority: 'P2',
    expectedConversion: 0.05,
    triggerCondition: async () => {
      const visitCount = parseInt(
        localStorage.getItem('dashboard_visit_count') || '0'
      )
      const hasSubscription = await checkSubscription()
      return visitCount >= 3 && !hasSubscription
    },
  },

  TEMPLATE_BROWSE: {
    id: 'template_browse',
    name: 'Template Browse',
    nameAr: 'تصفح القوالب',
    priority: 'P1',
    expectedConversion: 0.08,
    triggerCondition: async () => {
      const hasSubscription = await checkSubscription()
      return !hasSubscription
    },
  },

  VISUAL_EDITOR_OPEN: {
    id: 'visual_editor_open',
    name: 'Visual Editor Open',
    nameAr: 'فتح المحرر المرئي',
    priority: 'P1',
    expectedConversion: 0.18,
    triggerCondition: async () => {
      const hasSubscription = await checkSubscription()
      const tier = await getUserTier()
      return !hasSubscription || tier === 'basic'
    },
  },
}

/**
 * Check if user should see paywall at given placement
 */
export async function shouldShowPaywall(
  placementId: string
): Promise<boolean> {
  const placement = PAYWALL_PLACEMENTS[placementId]

  if (!placement) {
    console.warn(`Unknown placement: ${placementId}`)
    return false
  }

  // Check if placement is active in database
  const { data: config } = await supabase
    .from('paywall_placements')
    .select('is_active')
    .eq('id', placementId)
    .single()

  if (!config?.is_active) {
    return false
  }

  // Check recent paywall views (don't spam user)
  const recentlyShown = await wasPaywallShownRecently(300) // 5 minutes
  if (recentlyShown) {
    return false
  }

  // Check trigger condition
  try {
    return await placement.triggerCondition()
  } catch (error) {
    console.error(`Trigger error for ${placementId}:`, error)
    return false
  }
}

/**
 * Helper: Check if user has active subscription
 */
async function checkSubscription(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    return !!data
  } catch (error) {
    return false
  }
}

/**
 * Helper: Get user's credit balance
 */
async function getCreditBalance(): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return 0

    const { data } = await supabase
      .from('user_credits')
      .select('total_credits, used_credits')
      .eq('user_id', user.id)
      .single()

    if (!data) return 0

    return (data.total_credits || 0) - (data.used_credits || 0)
  } catch (error) {
    return 0
  }
}

/**
 * Helper: Get user's subscription tier
 */
async function getUserTier(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    return data?.tier || null
  } catch (error) {
    return null
  }
}

/**
 * Helper: Check if paywall was shown recently
 */
async function wasPaywallShownRecently(seconds: number): Promise<boolean> {
  const sessionId = sessionStorage.getItem('paywall_session_id')
  if (!sessionId) return false

  try {
    const cutoff = new Date()
    cutoff.setSeconds(cutoff.getSeconds() - seconds)

    const { data } = await supabase
      .from('paywall_events')
      .select('id')
      .eq('session_id', sessionId)
      .eq('event_type', 'paywall_impression')
      .gte('created_at', cutoff.toISOString())
      .limit(1)

    return (data?.length || 0) > 0
  } catch (error) {
    return false
  }
}

/**
 * Initialize session ID for tracking
 */
export function initPaywallSession(): string {
  let sessionId = sessionStorage.getItem('paywall_session_id')

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('paywall_session_id', sessionId)
  }

  return sessionId
}

/**
 * Get all active placements sorted by priority
 */
export async function getActivePlacements(): Promise<PaywallPlacement[]> {
  const placements = Object.values(PAYWALL_PLACEMENTS)

  // Sort by priority (P0 > P1 > P2)
  return placements.sort((a, b) => {
    const priorityOrder = { P0: 3, P1: 2, P2: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}
