/**
 * Spin Wheel API
 * POST /api/paywall/spin
 *
 * Selects a prize based on weighted probabilities
 * Generates unique discount code
 * One spin per email/session
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Weighted probabilities (must sum to 100)
const PRIZE_WEIGHTS = [
  { index: 0, percent: 30, probability: 2 },  // 30% off (2% chance)
  { index: 1, percent: 10, probability: 30 }, // 10% off (30% chance)
  { index: 2, percent: 25, probability: 8 },  // 25% off (8% chance)
  { index: 3, percent: 15, probability: 35 }, // 15% off (35% chance) - most common
  { index: 4, percent: 5, probability: 5 },   // 5% off (5% chance)
  { index: 5, percent: 20, probability: 20 }, // 20% off (20% chance)
]

function selectPrize(): { index: number; percent: number } {
  const random = Math.random() * 100
  let cumulative = 0

  for (const prize of PRIZE_WEIGHTS) {
    cumulative += prize.probability
    if (random <= cumulative) {
      return { index: prize.index, percent: prize.percent }
    }
  }

  // Fallback (should never reach)
  return { index: 3, percent: 15 }
}

export async function POST(request: NextRequest) {
  try {
    const { email, sessionId } = await request.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'بريد إلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // Check if already spun (by session)
    const { data: existingEntry } = await supabase
      .from('spin_wheel_entries')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: 'لقد قمت بالدوران من قبل في هذه الجلسة' },
        { status: 400 }
      )
    }

    // Select prize
    const prize = selectPrize()

    // Generate discount code
    const { data: discountCode } = await supabase.rpc('generate_discount_code', {
      p_prefix: 'SPIN',
    })

    // Create discount code in database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

    await supabase.from('discount_codes').insert({
      code: discountCode,
      type: 'spin_wheel',
      discount_percent: prize.percent,
      valid_until: expiresAt.toISOString(),
      max_uses: 1,
      max_uses_per_user: 1,
      description: `${prize.percent}% off from spin wheel`,
      description_ar: `خصم ${prize.percent}% من عجلة الحظ`,
    })

    // Record spin entry
    await supabase.from('spin_wheel_entries').insert({
      email,
      session_id: sessionId,
      prize_index: prize.index,
      discount_percent: prize.percent,
      discount_code: discountCode,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    return NextResponse.json({
      prizeIndex: prize.index,
      discountPercent: prize.percent,
      discountCode,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('Spin wheel error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    )
  }
}
