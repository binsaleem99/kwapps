// GET /api/billing/credits/balance
// Get user's credit balance and subscription info

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserCreditBalance } from '@/lib/billing/credit-service';

export async function GET() {
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

    // Get credit balance
    const balance = await getUserCreditBalance(user.id);

    if (!balance) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json(balance);
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
