// GET /api/billing/subscription/tiers
// Get all available subscription tiers

import { NextResponse } from 'next/server';
import { getSubscriptionTiers } from '@/lib/billing/subscription-service';

export async function GET() {
  try {
    const tiers = await getSubscriptionTiers();
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
