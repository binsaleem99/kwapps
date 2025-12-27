/**
 * Paywall Event Tracking API
 * POST /api/paywall/track
 *
 * Tracks all paywall interactions for conversion funnel analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { eventType, placement, metadata, sessionId } = await request.json()

    // Get user ID if authenticated
    const authHeader = request.headers.get('authorization')
    let userId = null

    if (authHeader) {
      // Extract user from session if available
      const { data } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      userId = data.user?.id || null
    }

    // Insert event
    const { data, error } = await supabase.from('paywall_events').insert({
      user_id: userId,
      session_id: sessionId,
      event_type: eventType,
      placement_id: placement,
      page_url: request.headers.get('referer'),
      plan_selected: metadata?.plan,
      billing_interval: metadata?.billingInterval,
      trial_selected: metadata?.withTrial || false,
      metadata: metadata || {},
    })

    if (error) {
      console.error('Failed to track paywall event:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Paywall tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
