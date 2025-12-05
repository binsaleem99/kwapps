// GET /api/billing/trial - Check trial eligibility
// POST /api/billing/trial - Create trial checkout (redirects to UPayments)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isEligibleForTrial, getTrialConfig } from '@/lib/billing/trial-service';
import { createCheckout } from '@/lib/billing/payment-service';

/**
 * GET - Check if user is eligible for trial
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح', error_en: 'Unauthorized' },
        { status: 401 }
      );
    }

    const eligible = await isEligibleForTrial(user.id);
    const config = getTrialConfig();

    return NextResponse.json({
      eligible,
      config: {
        price_kwd: config.price_kwd,
        duration_days: config.duration_days,
        allowed_tier: config.allowed_tier,
        credits: config.credits,
        daily_bonus: config.daily_bonus,
      },
    });
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return NextResponse.json(
      { error: 'حدث خطأ', error_en: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create trial checkout session
 *
 * Body:
 * - payment_source: 'knet' | 'cc' | 'apple-pay' | 'google-pay' (optional)
 * - save_card: boolean (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح', error_en: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check eligibility
    const eligible = await isEligibleForTrial(user.id);
    if (!eligible) {
      return NextResponse.json(
        { error: 'لقد استخدمت الفترة التجريبية من قبل', error_en: 'Trial already used' },
        { status: 400 }
      );
    }

    // Parse body
    const body = await request.json().catch(() => ({}));
    const { payment_source, save_card } = body as {
      payment_source?: 'knet' | 'cc' | 'apple-pay' | 'google-pay';
      save_card?: boolean;
    };

    // Create checkout for trial (1 KWD for Basic tier)
    const result = await createCheckout({
      userId: user.id,
      tierName: 'basic',
      isTrial: true,
      saveCard: save_card,
      paymentSource: payment_source,
    });

    return NextResponse.json({
      success: true,
      payment_link: result.paymentLink,
      order_id: result.orderId,
      track_id: result.trackId,
      amount: result.amount,
      currency: result.currency,
      is_trial: true,
      trial_config: getTrialConfig(),
    });
  } catch (error: any) {
    console.error('Error creating trial checkout:', error);

    return NextResponse.json(
      {
        error: error.message || 'فشل إنشاء جلسة الدفع',
        error_en: 'Failed to create checkout',
      },
      { status: error.message ? 400 : 500 }
    );
  }
}
