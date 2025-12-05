/**
 * Domain Purchase API
 *
 * POST /api/domains/purchase
 * Purchase a domain for a project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNamecheapClient, DomainRegistrant } from '@/lib/namecheap/client'
import {
  calculateDomainPricing,
  hasUsedFreeDomainThisYear,
  validateDomainName,
} from '@/lib/namecheap/pricing'
import type { UserPlan } from '@/lib/namecheap/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, projectId, registrant } = body

    // Validate input
    if (!domain || !projectId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Domain and projectId are required',
            messageAr: 'النطاق ومعرف المشروع مطلوبان',
          },
        },
        { status: 400 }
      )
    }

    // Validate domain name
    const validation = validateDomainName(domain)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_DOMAIN',
            message: validation.error,
            messageAr: validation.errorAr,
          },
        },
        { status: 400 }
      )
    }

    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            messageAr: 'يرجى تسجيل الدخول',
          },
        },
        { status: 401 }
      )
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or access denied',
            messageAr: 'المشروع غير موجود أو لا يمكن الوصول إليه',
          },
        },
        { status: 404 }
      )
    }

    // Get user plan
    const { data: userData } = await supabase
      .from('users')
      .select('plan, email, name')
      .eq('id', user.id)
      .single()

    const userPlan = (userData?.plan || 'free') as UserPlan

    // Check if user has used free domain
    const hasUsedFreeDomain = await hasUsedFreeDomainThisYear(user.id, supabase)

    // Check domain availability
    const client = getNamecheapClient()
    const [availability] = await client.checkAvailability([domain])

    if (!availability.available) {
      return NextResponse.json(
        {
          error: {
            code: 'DOMAIN_UNAVAILABLE',
            message: 'Domain is not available',
            messageAr: 'النطاق غير متاح',
          },
        },
        { status: 400 }
      )
    }

    // Get pricing
    const tld = domain.split('.').pop() || ''
    const price = availability.price || (await client.getPricing(tld))

    if (!price) {
      return NextResponse.json(
        {
          error: {
            code: 'PRICING_ERROR',
            message: 'Could not determine domain price',
            messageAr: 'لم نتمكن من تحديد سعر النطاق',
          },
        },
        { status: 500 }
      )
    }

    // Calculate final pricing
    const pricing = calculateDomainPricing(domain, price, userPlan, hasUsedFreeDomain)

    // If domain is not free, check if user has paid
    // (In production, integrate with UPayments)
    if (!pricing.isFree) {
      // For now, create a pending purchase that requires payment
      const { data: purchase, error: purchaseError } = await supabase
        .from('domain_purchases')
        .insert({
          user_id: user.id,
          project_id: projectId,
          domain,
          tld,
          status: 'pending_payment',
          purchase_price_kwd: pricing.finalPriceKWD,
          namecheap_cost_usd: pricing.basePrice,
          is_free: false,
          ssl_enabled: true,
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('[Domain] Purchase insert error:', purchaseError)
        return NextResponse.json(
          {
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to create purchase record',
              messageAr: 'فشل إنشاء سجل الشراء',
            },
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        requiresPayment: true,
        purchase: {
          id: purchase.id,
          domain,
          priceKWD: pricing.finalPriceKWD,
          priceUSD: pricing.finalPriceUSD,
        },
        paymentUrl: `/billing/domain-checkout?purchaseId=${purchase.id}`,
      })
    }

    // Free domain - register directly
    // Build registrant info
    const domainRegistrant: DomainRegistrant = registrant || {
      firstName: userData?.name?.split(' ')[0] || 'KWq8',
      lastName: userData?.name?.split(' ').slice(1).join(' ') || 'User',
      address1: 'Kuwait City',
      city: 'Kuwait City',
      state: 'KW',
      postalCode: '12345',
      country: 'KW',
      phone: '+965.00000000',
      email: userData?.email || user.email || '',
    }

    // Register with Namecheap
    const result = await client.registerDomain(domain, 1, domainRegistrant)

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: 'REGISTRATION_FAILED',
            message: result.error || 'Failed to register domain',
            messageAr: result.error || 'فشل تسجيل النطاق',
          },
        },
        { status: 500 }
      )
    }

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Save to database
    const { data: purchase, error: purchaseError } = await supabase
      .from('domain_purchases')
      .insert({
        user_id: user.id,
        project_id: projectId,
        domain,
        tld,
        status: 'active',
        purchase_price_kwd: 0,
        namecheap_cost_usd: pricing.basePrice,
        namecheap_order_id: result.orderId,
        registered_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: true,
        is_free: true,
        ssl_enabled: true,
        nameservers: ['dns1.vercel-dns.com', 'dns2.vercel-dns.com'],
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('[Domain] Purchase save error:', purchaseError)
      // Domain was registered but failed to save - log for manual fix
    }

    return NextResponse.json({
      success: true,
      requiresPayment: false,
      domain,
      status: 'active',
      expiresAt: expiresAt.toISOString(),
      message: 'تم تسجيل النطاق بنجاح!',
    })
  } catch (error) {
    console.error('[API] Domain purchase error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'PURCHASE_FAILED',
          message: 'Failed to purchase domain',
          messageAr: 'فشل شراء النطاق',
        },
      },
      { status: 500 }
    )
  }
}
