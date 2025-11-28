import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول' },
        { status: 401 }
      )
    }

    // Get referral code from request
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'رمز الإحالة مطلوب' }, { status: 400 })
    }

    // Call the apply_referral_code function from database
    const { data, error } = await supabase.rpc('apply_referral_code', {
      p_user_id: user.id,
      p_code: code.toUpperCase(),
    })

    if (error) {
      console.error('Error applying referral code:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء تطبيق رمز الإحالة' },
        { status: 500 }
      )
    }

    // The function returns JSONB with success/error
    const result = data as { success: boolean; error?: string; discount_percentage?: number }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'رمز إحالة غير صالح' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      discount_percentage: result.discount_percentage || 0,
      message: 'تم تطبيق رمز الإحالة بنجاح',
    })
  } catch (error: any) {
    console.error('Error in referral apply route:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تطبيق رمز الإحالة',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check if user has used any referral code
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح. يرجى تسجيل الدخول' },
        { status: 401 }
      )
    }

    // Check if user has any referral uses
    const { data: referralUses, error } = await supabase
      .from('referral_uses')
      .select(
        `
        id,
        discount_applied,
        created_at,
        referral_code:referral_codes(
          code,
          influencer_name,
          discount_percentage
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching referral uses:', error)
      return NextResponse.json(
        { error: 'حدث خطأ أثناء جلب معلومات الإحالة' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      has_referral: referralUses && referralUses.length > 0,
      referral_uses: referralUses || [],
    })
  } catch (error: any) {
    console.error('Error in referral get route:', error)
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب معلومات الإحالة',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
