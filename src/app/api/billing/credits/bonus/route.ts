// POST /api/billing/credits/bonus
// Claim daily bonus credits

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { claimDailyBonus } from '@/lib/billing/credit-service';

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Claim daily bonus
    const result = await claimDailyBonus(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
