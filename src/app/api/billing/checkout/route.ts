import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upayments } from '@/lib/upayments/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { plan_name, tokenize_card } = body

    // Validate plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', plan_name)
      .eq('active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Free plan doesn't require payment
    if (plan.name === 'free') {
      // Create free subscription directly
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

      if (subError) {
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Free plan activated' })
    }

    // Generate unique order ID
    const orderId = `sub_${user.id}_${Date.now()}`

    // Get user profile for payment
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const customerName = profile?.full_name || user.email?.split('@')[0] || 'User'
    const customerEmail = user.email || ''

    // Prepare redirect and webhook URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = `${baseUrl}/billing/success?order_id=${orderId}`
    const webhookUrl = `${baseUrl}/api/billing/webhook`

    let paymentLink: any

    if (tokenize_card) {
      // Create tokenization link for recurring billing
      paymentLink = await upayments.createTokenizationLink({
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        redirect_url: redirectUrl,
        webhook_url: webhookUrl,
        tokenize: true,
      })
    } else {
      // Create one-time payment link (for first month)
      paymentLink = await upayments.createPaymentLink({
        amount: plan.price_monthly,
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        redirect_url: redirectUrl,
        webhook_url: webhookUrl,
        reference: `Subscription: ${plan.name_en}`,
        products: [
          {
            name: plan.name_en,
            description: `${plan.name_en} Plan - Monthly Subscription`,
            price: plan.price_monthly,
            quantity: 1,
          },
        ],
      })
    }

    // Create pending transaction record
    await supabase.from('payment_transactions').insert({
      user_id: user.id,
      upayments_order_id: orderId,
      upayments_payment_id: paymentLink.data.payment_id,
      amount: tokenize_card ? 0 : plan.price_monthly,
      currency: 'KWD',
      status: 'pending',
      transaction_type: 'initial_subscription',
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        tokenize_card,
      },
    })

    // Return payment link
    return NextResponse.json({
      success: true,
      payment_link: paymentLink.data.link,
      order_id: orderId,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
