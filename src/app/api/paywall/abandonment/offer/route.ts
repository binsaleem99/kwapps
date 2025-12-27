/**
 * Abandonment Offer Generation API
 * POST /api/paywall/abandonment/offer
 *
 * Generates special 20% discount for users who abandon payment
 * 15-minute expiry to create urgency
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { plan, sessionId } = await request.json()

    // Generate unique code
    const { data: code } = await supabase.rpc('generate_discount_code', {
      p_prefix: 'COMEBACK',
    })

    // Set expiry (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Create discount code
    await supabase.from('discount_codes').insert({
      code,
      type: 'abandonment',
      discount_percent: 20,
      valid_until: expiresAt.toISOString(),
      max_uses: 1,
      max_uses_per_user: 1,
      applicable_plans: plan ? [plan] : null,
      description: '20% off abandonment recovery offer',
      description_ar: 'خصم 20% - عرض العودة للمشتريات المتروكة',
    })

    // Track abandonment offer
    await supabase.from('paywall_events').insert({
      session_id: sessionId,
      event_type: 'abandonment_offer_shown',
      metadata: {
        plan,
        discount_code: code,
        expires_at: expiresAt.toISOString(),
      },
    })

    return NextResponse.json({
      discountCode: code,
      discountPercent: 20,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Abandonment offer generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate offer' },
      { status: 500 }
    )
  }
}
