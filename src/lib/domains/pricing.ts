/**
 * Domain Pricing Logic
 *
 * Calculates user pricing with free domain tier
 * - Pro+ users: 1 free domain/year (≤$15 USD)
 * - Paid domains: Cost + markup (20% for $15-$25, 15% for $25-$50, 10% for $50+)
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DomainPricing {
  priceKWD: number
  isFree: boolean
  originalPriceUSD: number
  margin: number
  userTier: string
  eligibleForFree: boolean
}

export class DomainPricingService {
  /**
   * Calculate domain price for user
   */
  async calculatePrice(
    userId: string,
    namecheapPriceUSD: number
  ): Promise<DomainPricing> {
    // Check user's tier and free domain eligibility
    const { tier, eligibleForFree } = await this.checkFreeDomainEligibility(userId)

    // Free if ≤$15 and user is eligible
    if (namecheapPriceUSD <= 15 && eligibleForFree) {
      return {
        priceKWD: 0,
        isFree: true,
        originalPriceUSD: namecheapPriceUSD,
        margin: 0,
        userTier: tier,
        eligibleForFree: true,
      }
    }

    // Calculate markup
    const margin = this.getMarginPercent(namecheapPriceUSD)
    const totalUSD = namecheapPriceUSD * (1 + margin)
    const priceKWD = this.convertToKWD(totalUSD)

    return {
      priceKWD,
      isFree: false,
      originalPriceUSD: namecheapPriceUSD,
      margin,
      userTier: tier,
      eligibleForFree,
    }
  }

  /**
   * Check if user is eligible for free domain
   */
  private async checkFreeDomainEligibility(
    userId: string
  ): Promise<{ tier: string; eligibleForFree: boolean }> {
    try {
      // Get user's subscription tier
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      const tier = subscription?.tier || 'none'

      // Pro+ users are eligible
      const paidTiers = ['pro', 'premium', 'enterprise']
      if (!paidTiers.includes(tier)) {
        return { tier, eligibleForFree: false }
      }

      // Check if user already used free domain this year
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const { data: recentFreeDomain } = await supabase
        .from('domain_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('is_free', true)
        .gte('created_at', oneYearAgo.toISOString())
        .single()

      return {
        tier,
        eligibleForFree: !recentFreeDomain, // Eligible if no free domain in last year
      }
    } catch (error) {
      return { tier: 'none', eligibleForFree: false }
    }
  }

  /**
   * Get margin percentage based on domain price
   */
  private getMarginPercent(priceUSD: number): number {
    if (priceUSD <= 15) return 0 // Free for eligible users
    if (priceUSD <= 25) return 0.20 // 20%
    if (priceUSD <= 50) return 0.15 // 15%
    return 0.10 // 10%
  }

  /**
   * Convert USD to KWD
   */
  private convertToKWD(usd: number): number {
    const USD_TO_KWD = 0.308
    return Math.round(usd * USD_TO_KWD * 1000) / 1000 // 3 decimals
  }
}

// Singleton
export const domainPricingService = new DomainPricingService()
