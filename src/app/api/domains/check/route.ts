/**
 * Domain Availability Check API
 *
 * POST /api/domains/check
 * Check if domain(s) are available and get pricing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNamecheapClient } from '@/lib/namecheap/client'
import { calculateDomainPricing, hasUsedFreeDomainThisYear, validateDomainName } from '@/lib/namecheap/pricing'
import type { UserPlan } from '@/lib/namecheap/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domains } = body

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Domains array is required',
            messageAr: 'قائمة النطاقات مطلوبة',
          },
        },
        { status: 400 }
      )
    }

    // Limit to 50 domains per request
    if (domains.length > 50) {
      return NextResponse.json(
        {
          error: {
            code: 'TOO_MANY_DOMAINS',
            message: 'Maximum 50 domains per request',
            messageAr: 'الحد الأقصى 50 نطاق لكل طلب',
          },
        },
        { status: 400 }
      )
    }

    // Validate domain names
    for (const domain of domains) {
      const validation = validateDomainName(domain)
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_DOMAIN',
              message: validation.error,
              messageAr: validation.errorAr,
              domain,
            },
          },
          { status: 400 }
        )
      }
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

    // Check availability with Namecheap
    const client = getNamecheapClient()
    const availability = await client.checkAvailability(domains)

    // Calculate pricing for each domain
    const results = await Promise.all(
      availability.map(async (result) => {
        let pricing = null

        if (result.available && result.price) {
          pricing = calculateDomainPricing(
            result.domain,
            result.price,
            userPlan,
            hasUsedFreeDomain
          )
        } else if (result.available) {
          // Get pricing from API
          const tld = result.domain.split('.').pop() || ''
          const price = await client.getPricing(tld)
          if (price) {
            pricing = calculateDomainPricing(result.domain, price, userPlan, hasUsedFreeDomain)
          }
        }

        return {
          domain: result.domain,
          available: result.available,
          premium: result.premium,
          pricing,
        }
      })
    )

    return NextResponse.json({
      success: true,
      results,
      userPlan,
      freeDomainAvailable: !hasUsedFreeDomain && ['pro', 'premium', 'enterprise'].includes(userPlan),
    })
  } catch (error) {
    console.error('[API] Domain check error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'CHECK_FAILED',
          message: 'Failed to check domain availability',
          messageAr: 'فشل التحقق من توفر النطاق',
        },
      },
      { status: 500 }
    )
  }
}
