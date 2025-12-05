// GET /api/billing/subscription - Get user's subscription
// POST /api/billing/subscription - Create new subscription

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUserSubscription,
  createSubscription as createSub,
} from '@/lib/billing/subscription-service';
import type { CreateSubscriptionRequest } from '@/types/billing';

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

    // Get user's subscription
    const subscription = await getUserSubscription(user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const body = await request.json() as CreateSubscriptionRequest;

    if (!body.tier_name || !body.payment_method) {
      return NextResponse.json(
        { error: 'tier_name and payment_method are required' },
        { status: 400 }
      );
    }

    // Create subscription
    const result = await createSub(user.id, body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating subscription:', error);

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
