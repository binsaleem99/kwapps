/**
 * Usage Limits Checker
 * Enforces plan limits for projects, storage, and AI prompts
 */

import { createClient } from '@/lib/supabase/server'

export type LimitType = 'prompts' | 'projects' | 'storage'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  planName: string
  message?: string
}

/**
 * Check if user can perform an action based on their plan limits
 */
export async function checkUserLimit(
  userId: string,
  limitType: LimitType,
  amount: number = 1
): Promise<LimitCheckResult> {
  const supabase = await createClient()

  try {
    // Get user's plan limits using database function
    const { data: limitsData, error: limitsError } = await supabase.rpc('get_user_plan_limits', {
      p_user_id: userId,
    })

    if (limitsError || !limitsData || limitsData.length === 0) {
      console.error('Error fetching plan limits:', limitsError)
      // Default to free plan limits
      return {
        allowed: false,
        current: 0,
        limit: 0,
        planName: 'unknown',
        message: 'Could not fetch plan limits',
      }
    }

    const limits = limitsData[0]
    const planName = limits.plan_name

    // Get current usage
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      // PGRST116 = row not found
      console.error('Error fetching usage:', usageError)
      return {
        allowed: false,
        current: 0,
        limit: 0,
        planName,
        message: 'Could not fetch usage data',
      }
    }

    // If no usage record exists, create one
    if (!usage) {
      await supabase.from('usage_tracking').insert({ user_id: userId })
    }

    const currentUsage = usage || {
      prompts_used_today: 0,
      projects_count: 0,
      storage_used_mb: 0,
    }

    // Check limit based on type
    let current: number
    let limit: number
    let allowed: boolean

    switch (limitType) {
      case 'prompts':
        current = currentUsage.prompts_used_today || 0
        limit = limits.max_prompts_per_day
        allowed = current + amount <= limit
        break

      case 'projects':
        current = currentUsage.projects_count || 0
        limit = limits.max_projects
        allowed = current + amount <= limit
        break

      case 'storage':
        current = currentUsage.storage_used_mb || 0
        limit = limits.max_storage_mb
        allowed = current + amount <= limit
        break

      default:
        return {
          allowed: false,
          current: 0,
          limit: 0,
          planName,
          message: 'Invalid limit type',
        }
    }

    return {
      allowed,
      current,
      limit,
      planName,
      message: allowed
        ? undefined
        : `You've reached your ${planName} plan limit for ${limitType}. Current: ${current}, Limit: ${limit}`,
    }
  } catch (error: any) {
    console.error('Error checking user limit:', error)
    return {
      allowed: false,
      current: 0,
      limit: 0,
      planName: 'unknown',
      message: error.message || 'Error checking limits',
    }
  }
}

/**
 * Increment usage counter after successful action
 */
export async function incrementUsage(
  userId: string,
  limitType: LimitType,
  amount: number = 1
): Promise<void> {
  const supabase = await createClient()

  try {
    await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_usage_type: limitType,
      p_amount: amount,
    })
  } catch (error: any) {
    console.error('Error incrementing usage:', error)
    throw error
  }
}

/**
 * Get user's current usage across all limit types
 */
export async function getUserUsage(userId: string) {
  const supabase = await createClient()

  try {
    // Get plan limits
    const { data: limitsData } = await supabase.rpc('get_user_plan_limits', {
      p_user_id: userId,
    })

    const limits = limitsData?.[0] || {
      max_projects: 1,
      max_storage_mb: 100,
      max_prompts_per_day: 3,
      plan_name: 'free',
    }

    // Get current usage
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .single()

    const currentUsage = usage || {
      prompts_used_today: 0,
      projects_count: 0,
      storage_used_mb: 0,
    }

    return {
      prompts: {
        used: currentUsage.prompts_used_today || 0,
        limit: limits.max_prompts_per_day,
        percentage: Math.round(
          ((currentUsage.prompts_used_today || 0) / limits.max_prompts_per_day) * 100
        ),
      },
      projects: {
        used: currentUsage.projects_count || 0,
        limit: limits.max_projects,
        percentage: Math.round(((currentUsage.projects_count || 0) / limits.max_projects) * 100),
      },
      storage: {
        used: currentUsage.storage_used_mb || 0,
        limit: limits.max_storage_mb,
        percentage: Math.round(
          ((currentUsage.storage_used_mb || 0) / limits.max_storage_mb) * 100
        ),
      },
      planName: limits.plan_name,
    }
  } catch (error: any) {
    console.error('Error getting user usage:', error)
    throw error
  }
}
