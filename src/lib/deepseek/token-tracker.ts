/**
 * Token Usage Tracker
 *
 * Tracks API token usage and costs for billing and monitoring
 * Integrates with usage_limits table for daily/monthly tracking
 */

import { createClient } from '@/lib/supabase/server'
import type { UserPlan } from '@/types'

// DeepSeek API pricing (per 1M tokens)
// Source: https://platform.deepseek.com/pricing
const PRICING = {
  INPUT_PER_MILLION: 0.14, // $0.14 per 1M input tokens
  OUTPUT_PER_MILLION: 0.28, // $0.28 per 1M output tokens
}

// Plan limits
export const PLAN_LIMITS: Record<
  UserPlan,
  { daily: number; monthly: number; name: string }
> = {
  free: { daily: 3, monthly: 10, name: 'مجاني' },
  builder: { daily: 50, monthly: 500, name: 'باني' },
  pro: { daily: 200, monthly: 2000, name: 'احترافي' },
  hosting_only: { daily: 0, monthly: 0, name: 'استضافة فقط' },
}

export interface UsageStats {
  today: {
    used: number
    limit: number
    remaining: number
    tokens: number
    cost: number
  }
  month: {
    used: number
    limit: number
    remaining: number
    tokens: number
    cost: number
  }
  plan: UserPlan
}

export interface TokenUsage {
  input: number
  output: number
  total: number
  cost: number
}

export class TokenTracker {
  /**
   * Calculate cost from token usage
   *
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Cost in USD
   */
  static calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * PRICING.INPUT_PER_MILLION
    const outputCost = (outputTokens / 1_000_000) * PRICING.OUTPUT_PER_MILLION
    return inputCost + outputCost
  }

  /**
   * Calculate cost from total tokens (assumes 50/50 split)
   *
   * @param totalTokens - Total tokens used
   * @returns Cost in USD
   */
  static calculateTotalCost(totalTokens: number): number {
    // Assume roughly 50/50 split between input and output
    const inputTokens = Math.floor(totalTokens * 0.5)
    const outputTokens = Math.ceil(totalTokens * 0.5)
    return this.calculateCost(inputTokens, outputTokens)
  }

  /**
   * Track token usage for a user
   *
   * @param userId - User ID
   * @param tokensUsed - Number of tokens consumed
   * @returns Success status
   */
  static async trackUsage(userId: string, tokensUsed: number): Promise<boolean> {
    try {
      const supabase = await createClient()
      const today = new Date().toISOString().split('T')[0]

      // Get current usage for today
      const { data: currentUsage } = await supabase
        .from('usage_limits')
        .select('prompt_count, tokens_used')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      // Upsert usage record
      const { error } = await supabase.from('usage_limits').upsert({
        user_id: userId,
        date: today,
        prompt_count: (currentUsage?.prompt_count || 0) + 1,
        tokens_used: (currentUsage?.tokens_used || 0) + tokensUsed,
      })

      if (error) {
        console.error('Failed to track usage:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Token tracking error:', error)
      return false
    }
  }

  /**
   * Get usage statistics for a user
   *
   * @param userId - User ID
   * @returns Usage statistics
   */
  static async getUsageStats(userId: string): Promise<UsageStats | null> {
    try {
      const supabase = await createClient()

      // Get user plan
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single<{ plan: UserPlan }>()

      if (!user) {
        return null
      }

      const limits = PLAN_LIMITS[user.plan]
      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split('T')[0]

      // Get today's usage
      const { data: todayUsage } = await supabase
        .from('usage_limits')
        .select('prompt_count, tokens_used')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      // Get month's usage
      const { data: monthUsage } = await supabase
        .from('usage_limits')
        .select('prompt_count, tokens_used')
        .eq('user_id', userId)
        .gte('date', startOfMonth)

      const todayCount = todayUsage?.prompt_count || 0
      const todayTokens = todayUsage?.tokens_used || 0
      const monthCount =
        monthUsage?.reduce((sum, record) => sum + record.prompt_count, 0) || 0
      const monthTokens =
        monthUsage?.reduce((sum, record) => sum + record.tokens_used, 0) || 0

      return {
        today: {
          used: todayCount,
          limit: limits.daily,
          remaining: Math.max(0, limits.daily - todayCount),
          tokens: todayTokens,
          cost: this.calculateTotalCost(todayTokens),
        },
        month: {
          used: monthCount,
          limit: limits.monthly,
          remaining: Math.max(0, limits.monthly - monthCount),
          tokens: monthTokens,
          cost: this.calculateTotalCost(monthTokens),
        },
        plan: user.plan,
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return null
    }
  }

  /**
   * Check if user can make a generation request
   *
   * @param userId - User ID
   * @returns true if user has remaining generations
   */
  static async canGenerate(userId: string): Promise<boolean> {
    const stats = await this.getUsageStats(userId)
    if (!stats) return false

    // Check daily limit
    if (stats.today.remaining <= 0) return false

    // Check monthly limit
    if (stats.month.remaining <= 0) return false

    return true
  }

  /**
   * Get remaining generations for user
   *
   * @param userId - User ID
   * @returns Number of remaining generations (min of daily and monthly)
   */
  static async getRemainingGenerations(userId: string): Promise<number> {
    const stats = await this.getUsageStats(userId)
    if (!stats) return 0

    return Math.min(stats.today.remaining, stats.month.remaining)
  }

  /**
   * Format cost in KWD (Kuwait Dinar)
   * 1 USD ≈ 0.307 KWD
   *
   * @param usdCost - Cost in USD
   * @returns Formatted cost in KWD
   */
  static formatCostKWD(usdCost: number): string {
    const kwdCost = usdCost * 0.307
    return `${kwdCost.toFixed(3)} د.ك`
  }

  /**
   * Format cost in USD
   *
   * @param usdCost - Cost in USD
   * @returns Formatted cost in USD
   */
  static formatCostUSD(usdCost: number): string {
    return `$${usdCost.toFixed(4)}`
  }

  /**
   * Get detailed token breakdown
   *
   * @param inputTokens - Input tokens
   * @param outputTokens - Output tokens
   * @returns Token usage breakdown
   */
  static getTokenBreakdown(
    inputTokens: number,
    outputTokens: number
  ): TokenUsage {
    return {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
      cost: this.calculateCost(inputTokens, outputTokens),
    }
  }

  /**
   * Get usage history for date range
   *
   * @param userId - User ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Array of usage records
   */
  static async getUsageHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<
    Array<{
      date: string
      prompts: number
      tokens: number
      cost: number
    }>
  > {
    try {
      const supabase = await createClient()

      const { data: usage, error } = await supabase
        .from('usage_limits')
        .select('date, prompt_count, tokens_used')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (error) {
        console.error('Failed to get usage history:', error)
        return []
      }

      return (usage || []).map((record) => ({
        date: record.date,
        prompts: record.prompt_count,
        tokens: record.tokens_used,
        cost: this.calculateTotalCost(record.tokens_used),
      }))
    } catch (error) {
      console.error('Usage history error:', error)
      return []
    }
  }
}
