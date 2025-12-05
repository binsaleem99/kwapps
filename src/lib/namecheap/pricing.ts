/**
 * Domain Pricing Calculator
 *
 * KWq8.com Domain Pricing Rules:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 1. Domains ≤$15 = FREE (1 year + SSL included)
 *    - Only for Pro/Premium/Enterprise users
 *    - One free domain per year per subscription
 *
 * 2. Domains >$15 = Cost + 20% markup
 *    - Premium TLDs (.io, .app, .dev, .kw)
 *    - Charged to user at our cost + 20%
 *    - SSL still included
 */

import type { DomainPrice, DomainPricing } from './types'
import {
  FREE_DOMAIN_THRESHOLD_USD,
  PREMIUM_DOMAIN_MARKUP,
  USD_TO_KWD_RATE,
} from './types'

// User plan types that qualify for free domain
export type UserPlan = 'free' | 'basic' | 'pro' | 'premium' | 'enterprise'

const FREE_DOMAIN_ELIGIBLE_PLANS: UserPlan[] = ['pro', 'premium', 'enterprise']

/**
 * Calculate domain pricing based on KWq8 rules
 */
export function calculateDomainPricing(
  domain: string,
  basePrice: DomainPrice,
  userPlan: UserPlan,
  hasUsedFreeDomain: boolean = false
): DomainPricing {
  const tld = domain.split('.').pop() || ''
  const registrationPrice = basePrice.registration

  // Check if domain qualifies for free tier
  const qualifiesForFree =
    registrationPrice <= FREE_DOMAIN_THRESHOLD_USD &&
    FREE_DOMAIN_ELIGIBLE_PLANS.includes(userPlan) &&
    !hasUsedFreeDomain

  let finalPriceUSD: number
  let markup: number
  let isFree: boolean

  if (qualifiesForFree) {
    // FREE: Domains ≤$15 for eligible plans
    finalPriceUSD = 0
    markup = 0
    isFree = true
  } else {
    // PAID: Cost + 20% markup
    markup = registrationPrice * PREMIUM_DOMAIN_MARKUP
    finalPriceUSD = registrationPrice + markup
    isFree = false
  }

  // Convert to KWD
  const finalPriceKWD = Math.ceil(finalPriceUSD * USD_TO_KWD_RATE * 100) / 100

  return {
    domain,
    tld,
    basePrice: registrationPrice,
    markup,
    finalPriceUSD,
    finalPriceKWD,
    isFree,
    includesSSL: true, // Always included
    yearIncluded: 1,
  }
}

/**
 * Get pricing display for Arabic UI
 */
export function getPricingDisplayAr(pricing: DomainPricing): {
  priceLabel: string
  priceDescription: string
  badge?: string
  badgeColor?: string
} {
  if (pricing.isFree) {
    return {
      priceLabel: 'مجاني',
      priceDescription: 'سنة واحدة + شهادة SSL مجاناً مع باقتك',
      badge: 'مجاني',
      badgeColor: 'green',
    }
  }

  const priceKWD = pricing.finalPriceKWD.toFixed(2)

  if (pricing.basePrice > FREE_DOMAIN_THRESHOLD_USD) {
    return {
      priceLabel: `${priceKWD} د.ك`,
      priceDescription: 'نطاق مميز - سنة واحدة + SSL',
      badge: 'مميز',
      badgeColor: 'purple',
    }
  }

  return {
    priceLabel: `${priceKWD} د.ك`,
    priceDescription: 'سنة واحدة + شهادة SSL',
  }
}

/**
 * Check if user has used their free domain this year
 */
export async function hasUsedFreeDomainThisYear(
  userId: string,
  supabase: any
): Promise<boolean> {
  const currentYear = new Date().getFullYear()
  const startOfYear = `${currentYear}-01-01`

  const { data, error } = await supabase
    .from('domain_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('is_free', true)
    .gte('created_at', startOfYear)
    .limit(1)

  if (error) {
    console.error('[Domain] Error checking free domain usage:', error)
    return false
  }

  return data && data.length > 0
}

/**
 * Calculate renewal pricing
 * Renewals are always at market rate + 10% markup
 */
export function calculateRenewalPricing(
  domain: string,
  renewalPrice: number
): {
  priceUSD: number
  priceKWD: number
} {
  const markup = renewalPrice * 0.1 // 10% markup on renewals
  const priceUSD = renewalPrice + markup
  const priceKWD = Math.ceil(priceUSD * USD_TO_KWD_RATE * 100) / 100

  return { priceUSD, priceKWD }
}

/**
 * Get domain suggestions with pricing
 */
export function generateDomainSuggestions(
  baseName: string,
  userPlan: UserPlan,
  hasUsedFreeDomain: boolean
): Array<{
  domain: string
  tld: string
  estimatedPrice: DomainPricing
}> {
  // Common TLDs sorted by typical price
  const tlds = [
    { tld: 'com', price: 12.98 },
    { tld: 'net', price: 14.98 },
    { tld: 'org', price: 12.98 },
    { tld: 'co', price: 11.98 },
    { tld: 'me', price: 8.98 },
    { tld: 'site', price: 3.98 },
    { tld: 'online', price: 4.98 },
    { tld: 'store', price: 5.98 },
    { tld: 'io', price: 32.98 },
    { tld: 'app', price: 15.98 },
  ]

  // Clean base name
  const cleanName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 63)

  return tlds.map(({ tld, price }) => {
    const domain = `${cleanName}.${tld}`
    const basePrice: DomainPrice = {
      registration: price,
      renewal: price * 1.1,
      transfer: price,
      currency: 'USD',
    }

    return {
      domain,
      tld,
      estimatedPrice: calculateDomainPricing(domain, basePrice, userPlan, hasUsedFreeDomain),
    }
  })
}

/**
 * Format price for display
 */
export function formatPriceKWD(amount: number): string {
  if (amount === 0) return 'مجاني'
  return `${amount.toFixed(2)} د.ك`
}

export function formatPriceUSD(amount: number): string {
  if (amount === 0) return 'Free'
  return `$${amount.toFixed(2)}`
}

/**
 * Validate domain name
 */
export function validateDomainName(domain: string): {
  valid: boolean
  error?: string
  errorAr?: string
} {
  // Remove protocol and www
  let cleaned = domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]

  // Check if has TLD
  if (!cleaned.includes('.')) {
    return {
      valid: false,
      error: 'Domain must include a TLD (e.g., .com)',
      errorAr: 'يجب أن يتضمن النطاق امتداداً (مثل .com)',
    }
  }

  const [sld] = cleaned.split('.')

  // Check length
  if (sld.length < 2) {
    return {
      valid: false,
      error: 'Domain name too short',
      errorAr: 'اسم النطاق قصير جداً',
    }
  }

  if (sld.length > 63) {
    return {
      valid: false,
      error: 'Domain name too long',
      errorAr: 'اسم النطاق طويل جداً',
    }
  }

  // Check characters
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(sld)) {
    return {
      valid: false,
      error: 'Domain can only contain letters, numbers, and hyphens',
      errorAr: 'النطاق يمكن أن يحتوي فقط على حروف وأرقام وشرطات',
    }
  }

  return { valid: true }
}
