import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upayments } from '@/lib/upayments/client'
import type { SubscriptionTierName } from '@/types/billing'
import { SUBSCRIPTION_TIERS, TRIAL_CONFIG } from '@/types/billing'

/**
 * Checkout API - Create UPayments charge for subscription or trial
 *
 * POST /api/billing/checkout
 *
 * Body:
 * - tier_name: 'basic' | 'pro' | 'premium' | 'enterprise' (required)
 * - is_trial: boolean (optional - for 1 KWD trial, only Basic tier)
 * - save_card: boolean (optional - save card for recurring payments)
 * - payment_source: 'knet' | 'cc' | 'apple-pay' | 'google-pay' (optional - specific payment method)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول', error_en: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      tier_name,
      is_trial = false,
      save_card = false,
      payment_source,
    } = body as {
      tier_name: SubscriptionTierName
      is_trial?: boolean
      save_card?: boolean
      payment_source?: 'knet' | 'cc' | 'apple-pay' | 'google-pay'
    }

    // Validate tier name
    if (!tier_name || !['basic', 'pro', 'premium', 'enterprise'].includes(tier_name)) {
      return NextResponse.json(
        { error: 'اسم الباقة غير صالح', error_en: 'Invalid tier name' },
        { status: 400 }
      )
    }

    // Trial is only for Basic tier
    if (is_trial && tier_name !== 'basic') {
      return NextResponse.json(
        { error: 'الفترة التجريبية متاحة فقط للباقة الأساسية', error_en: 'Trial only available for Basic tier' },
        { status: 400 }
      )
    }

    // Check if user already has active subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id, status, is_trial')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingSubscription && !existingSubscription.is_trial) {
      return NextResponse.json(
        { error: 'لديك اشتراك نشط بالفعل', error_en: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Check trial eligibility
    if (is_trial) {
      const { data: previousSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (previousSubscription) {
        return NextResponse.json(
          { error: 'لقد استخدمت الفترة التجريبية من قبل', error_en: 'Trial already used' },
          { status: 400 }
        )
      }
    }

    // Get the tier from database
    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('name', tier_name)
      .eq('is_active', true)
      .single()

    if (tierError || !tier) {
      return NextResponse.json(
        { error: 'الباقة غير متوفرة', error_en: 'Tier not available' },
        { status: 400 }
      )
    }

    // Calculate amount
    const amount = is_trial ? TRIAL_CONFIG.price_kwd : tier.price_kwd
    const transactionType = is_trial ? 'trial' : 'subscription'

    // Generate unique order ID
    const orderId = upayments.generateOrderId(is_trial ? 'trial' : 'sub', user.id.substring(0, 8))

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    const customerName = profile?.display_name || user.email?.split('@')[0] || 'User'
    const customerEmail = profile?.email || user.email || ''

    // Prepare URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kwq8.com'
    const returnUrl = `${baseUrl}/billing/success?order_id=${orderId}&type=${transactionType}`
    const cancelUrl = `${baseUrl}/billing/cancel?order_id=${orderId}`
    const webhookUrl = `${baseUrl}/api/billing/webhook`

    // Generate customer token for card saving (if requested)
    let customerUniqueToken: string | undefined
    if (save_card) {
      customerUniqueToken = upayments.generateCustomerToken(user.id)
      try {
        await upayments.createCustomerToken({ customerUniqueToken })
      } catch {
        // Token may already exist
      }
    }

    // Build description
    const description = is_trial
      ? `فترة تجريبية - ${tier.display_name_ar} - KW APPS`
      : `اشتراك ${tier.display_name_ar} - KW APPS`

    // Create charge using UPayments
    const chargeResponse = await upayments.createCharge({
      order: {
        id: orderId,
        description,
        currency: 'KWD',
        amount,
      },
      reference: {
        id: orderId,
      },
      language: 'ar',
      returnUrl,
      cancelUrl,
      notificationUrl: webhookUrl,
      customer: {
        uniqueId: user.id,
        name: customerName,
        email: customerEmail,
      },
      products: [
        {
          name: is_trial ? `Trial - ${tier.display_name_en}` : tier.display_name_en,
          description: is_trial
            ? `${TRIAL_CONFIG.duration_days} day trial - ${tier.display_name_ar}`
            : `Monthly subscription - ${tier.display_name_ar}`,
          price: amount,
          quantity: 1,
        },
      ],
      // Add token config if saving card
      ...(customerUniqueToken && {
        tokens: { customerUniqueToken },
      }),
      // Add specific payment gateway if specified
      ...(payment_source && {
        paymentGateway: { src: payment_source },
      }),
    })

    // Create pending payment transaction record
    const { error: txError } = await supabase.from('payment_transactions').insert({
      user_id: user.id,
      upayments_order_id: orderId,
      upayments_track_id: chargeResponse.data.trackId,
      upayments_payment_id: chargeResponse.data.paymentId,
      amount,
      currency: 'KWD',
      status: 'pending',
      transaction_type: transactionType,
      metadata: {
        tier_id: tier.id,
        tier_name: tier.name,
        is_trial,
        save_card,
        customer_unique_token: customerUniqueToken,
        credits_per_month: tier.credits_per_month,
        daily_bonus_credits: tier.daily_bonus_credits,
      },
    })

    if (txError) {
      console.error('Failed to create payment transaction:', txError)
    }

    // Return payment link
    return NextResponse.json({
      success: true,
      payment_link: chargeResponse.data.link,
      order_id: orderId,
      track_id: chargeResponse.data.trackId,
      amount,
      currency: 'KWD',
      tier: {
        name: tier.name,
        display_name_ar: tier.display_name_ar,
        display_name_en: tier.display_name_en,
        price_kwd: tier.price_kwd,
      },
      is_trial,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      {
        error: error.message || 'فشل إنشاء جلسة الدفع',
        error_en: 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Get available tiers and pricing info
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tiers, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({
      tiers,
      trial: {
        price_kwd: TRIAL_CONFIG.price_kwd,
        duration_days: TRIAL_CONFIG.duration_days,
        allowed_tier: TRIAL_CONFIG.allowed_tier,
      },
    })
  } catch (error: any) {
    console.error('Failed to fetch tiers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
