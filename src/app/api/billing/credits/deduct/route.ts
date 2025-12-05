// POST /api/billing/credits/deduct
// Deduct credits for an operation

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deductCredits } from '@/lib/billing/credit-service';
import type { DeductCreditsRequest } from '@/types/billing';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json() as DeductCreditsRequest;

    if (!body.operation_type) {
      return NextResponse.json(
        { error: 'operation_type is required' },
        { status: 400 }
      );
    }

    // Deduct credits
    const result = await deductCredits(user.id, body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deducting credits:', error);

    // Return specific error message if available
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
