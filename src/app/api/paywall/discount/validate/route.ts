/**
 * Discount Code Validation API
 * POST /api/paywall/discount/validate
 *
 * Validates discount code and returns discount percentage
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { code, plan } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: 'كود الخصم مطلوب' },
        { status: 400 }
      )
    }

    // Get user ID if authenticated
    let userId = null
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const { data } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      userId = data.user?.id || null
    }

    // Validate using database function
    const { data: validation, error } = await supabase.rpc(
      'is_discount_code_valid',
      {
        p_code: code.toUpperCase(),
        p_user_id: userId,
        p_plan: plan,
      }
    )

    if (error || !validation || validation.length === 0) {
      return NextResponse.json({
        valid: false,
        reason: 'كود الخصم غير صالح',
      })
    }

    const result = validation[0]

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason,
      })
    }

    return NextResponse.json({
      valid: true,
      discountPercent: result.discount_percent,
      code: code.toUpperCase(),
    })
  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json(
      { valid: false, reason: 'حدث خطأ في التحقق' },
      { status: 500 }
    )
  }
}
