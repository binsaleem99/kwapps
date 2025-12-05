/**
 * Domain Search API
 *
 * POST /api/domains/search
 * Search available domains by keyword and get pricing
 *
 * KWq8.com Pricing Rules:
 * - Domains ≤$15 = FREE (1 per user/year, includes SSL)
 * - Domains >$15 = cost + 20% markup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNamecheapClient } from '@/lib/namecheap/client'
import {
  calculateDomainPricing,
  hasUsedFreeDomainThisYear,
  getPricingDisplayAr,
} from '@/lib/namecheap/pricing'
import type { UserPlan } from '@/lib/namecheap/pricing'
import { COMMON_TLDS } from '@/lib/namecheap/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, tlds } = body

    // Validate input
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Keyword is required',
            messageAr: 'كلمة البحث مطلوبة',
          },
        },
        { status: 400 }
      )
    }

    // Clean keyword
    const cleanKeyword = keyword
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 63)

    if (cleanKeyword.length < 2) {
      return NextResponse.json(
        {
          error: {
            code: 'KEYWORD_TOO_SHORT',
            message: 'Keyword must be at least 2 characters',
            messageAr: 'يجب أن تكون كلمة البحث حرفين على الأقل',
          },
        },
        { status: 400 }
      )
    }

    // Get user info for pricing calculation
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userPlan: UserPlan = 'free'
    let hasUsedFreeDomain = false

    if (user) {
      // Get user's plan
      const { data: userData } = await supabase
        .from('users')
        .select('plan')
        .eq('id', user.id)
        .single()

      if (userData?.plan) {
        userPlan = userData.plan as UserPlan
      }

      // Check if user has used free domain this year
      hasUsedFreeDomain = await hasUsedFreeDomainThisYear(user.id, supabase)
    }

    // Use specified TLDs or default list
    const searchTlds = tlds && Array.isArray(tlds) && tlds.length > 0
      ? tlds
      : COMMON_TLDS.map(t => t.tld)

    // Search domains using Namecheap client
    const client = getNamecheapClient()
    const searchResults = await client.searchDomains(cleanKeyword, searchTlds)

    // Calculate pricing for each domain
    const suggestions = await Promise.all(
      searchResults.suggestions.map(async (result) => {
        let pricing = null
        let pricingDisplay = null

        if (result.available && result.price) {
          pricing = calculateDomainPricing(
            result.domain,
            result.price,
            userPlan,
            hasUsedFreeDomain
          )
          pricingDisplay = getPricingDisplayAr(pricing)
        } else if (result.available) {
          // Get pricing from API for this TLD
          const tld = result.domain.split('.').pop() || ''
          const price = await client.getPricing(tld)
          if (price) {
            pricing = calculateDomainPricing(result.domain, price, userPlan, hasUsedFreeDomain)
            pricingDisplay = getPricingDisplayAr(pricing)
          }
        }

        return {
          domain: result.domain,
          available: result.available,
          premium: result.premium,
          pricing: pricing ? {
            basePriceUSD: pricing.basePrice,
            finalPriceUSD: pricing.finalPriceUSD,
            finalPriceKWD: pricing.finalPriceKWD,
            isFree: pricing.isFree,
            includesSSL: pricing.includesSSL,
          } : null,
          display: pricingDisplay,
        }
      })
    )

    // Calculate pricing for alternatives
    const alternatives = await Promise.all(
      searchResults.alternatives.map(async (result) => {
        let pricing = null
        let pricingDisplay = null

        if (result.available && result.price) {
          pricing = calculateDomainPricing(
            result.domain,
            result.price,
            userPlan,
            hasUsedFreeDomain
          )
          pricingDisplay = getPricingDisplayAr(pricing)
        } else if (result.available) {
          const tld = result.domain.split('.').pop() || ''
          const price = await client.getPricing(tld)
          if (price) {
            pricing = calculateDomainPricing(result.domain, price, userPlan, hasUsedFreeDomain)
            pricingDisplay = getPricingDisplayAr(pricing)
          }
        }

        return {
          domain: result.domain,
          available: result.available,
          premium: result.premium,
          pricing: pricing ? {
            basePriceUSD: pricing.basePrice,
            finalPriceUSD: pricing.finalPriceUSD,
            finalPriceKWD: pricing.finalPriceKWD,
            isFree: pricing.isFree,
            includesSSL: pricing.includesSSL,
          } : null,
          display: pricingDisplay,
        }
      })
    )

    // Sort suggestions: available first, then free domains, then by price
    const sortedSuggestions = suggestions.sort((a, b) => {
      // Available first
      if (a.available && !b.available) return -1
      if (!a.available && b.available) return 1

      // If both available, sort by free first
      if (a.pricing?.isFree && !b.pricing?.isFree) return -1
      if (!a.pricing?.isFree && b.pricing?.isFree) return 1

      // Then by price
      const priceA = a.pricing?.finalPriceKWD ?? 999
      const priceB = b.pricing?.finalPriceKWD ?? 999
      return priceA - priceB
    })

    // Filter alternatives to only available ones
    const availableAlternatives = alternatives
      .filter(a => a.available)
      .sort((a, b) => {
        if (a.pricing?.isFree && !b.pricing?.isFree) return -1
        if (!a.pricing?.isFree && b.pricing?.isFree) return 1
        const priceA = a.pricing?.finalPriceKWD ?? 999
        const priceB = b.pricing?.finalPriceKWD ?? 999
        return priceA - priceB
      })

    return NextResponse.json({
      success: true,
      keyword: cleanKeyword,
      suggestions: sortedSuggestions,
      alternatives: availableAlternatives,
      userPlan,
      freeDomainAvailable: !hasUsedFreeDomain && ['pro', 'premium', 'enterprise'].includes(userPlan),
      freeDomainEligiblePlans: ['pro', 'premium', 'enterprise'],
    })
  } catch (error) {
    console.error('[API] Domain search error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'SEARCH_FAILED',
          message: 'Failed to search domains',
          messageAr: 'فشل البحث عن النطاقات',
        },
      },
      { status: 500 }
    )
  }
}
