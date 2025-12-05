// ============================================
// KW APPS Trial Subscription Service
// ============================================
// Handles trial subscriptions (1 KWD/week for Basic tier only)

import { createClient } from '@/lib/supabase/server';
import type {
  TrialSubscription,
  UserSubscription,
  PaymentStatus,
} from '@/types/billing';
import { TRIAL_CONFIG } from '@/types/billing';
import { createSubscription } from './subscription-service';

// ============================================
// Trial Eligibility
// ============================================

/**
 * Check if user is eligible for trial
 * User is eligible if they have never had a trial or paid subscription
 */
export async function isEligibleForTrial(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if user has ever had a subscription (trial or paid)
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error checking trial eligibility:', error);
    return false;
  }

  // Eligible if no subscription history exists
  return !data;
}

// ============================================
// Trial Creation
// ============================================

/**
 * Create a trial subscription
 * Returns payment URL for 1 KWD payment
 */
export async function createTrialSubscription(
  userId: string,
  paymentMethod: 'upayments' | 'stripe' = 'upayments'
): Promise<{
  subscription: UserSubscription;
  trial: TrialSubscription;
  payment_url: string;
}> {
  // Check eligibility
  const eligible = await isEligibleForTrial(userId);
  if (!eligible) {
    throw new Error('User not eligible for trial');
  }

  // Create trial subscription
  const { subscription } = await createSubscription(userId, {
    tier_name: 'basic',
    is_trial: true,
    payment_method: paymentMethod,
  });

  // Get trial record
  const supabase = await createClient();
  const { data: trial, error: trialError } = await supabase
    .from('trial_subscriptions')
    .select('*')
    .eq('subscription_id', subscription.id)
    .single();

  if (trialError || !trial) {
    throw new Error('Failed to retrieve trial subscription');
  }

  // Generate payment URL
  // This would integrate with UPayments or Stripe
  const paymentUrl = await generateTrialPaymentUrl(
    userId,
    trial.id,
    paymentMethod
  );

  return {
    subscription,
    trial: trial as TrialSubscription,
    payment_url: paymentUrl,
  };
}

/**
 * Generate payment URL for trial (1 KWD payment)
 * Uses the unified checkout API which integrates with UPayments
 */
async function generateTrialPaymentUrl(
  userId: string,
  trialId: string,
  paymentMethod: 'upayments' | 'stripe'
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kwq8.com';

  // Direct to the checkout page with trial parameters
  // The checkout page will call POST /api/billing/checkout with is_trial: true
  return `${baseUrl}/billing/checkout?tier=basic&trial=true&method=${paymentMethod}`;
}

// ============================================
// Trial Payment Processing
// ============================================

/**
 * Process successful trial payment
 * Called by payment webhook
 */
export async function processTrialPayment(
  trialId: string,
  transactionId: string
): Promise<void> {
  const supabase = await createClient();

  const now = new Date();

  // Update trial payment status
  const { error } = await supabase
    .from('trial_subscriptions')
    .update({
      payment_status: 'paid' as PaymentStatus,
      payment_transaction_id: transactionId,
      payment_date: now.toISOString(),
    })
    .eq('id', trialId);

  if (error) {
    throw new Error('Failed to update trial payment status');
  }

  // Activate subscription
  const { data: trial } = await supabase
    .from('trial_subscriptions')
    .select('subscription_id')
    .eq('id', trialId)
    .single();

  if (trial) {
    await supabase
      .from('user_subscriptions')
      .update({ status: 'active' })
      .eq('id', trial.subscription_id);
  }
}

/**
 * Handle failed trial payment
 */
export async function processTrialPaymentFailure(
  trialId: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();

  // Update trial payment status
  const { error } = await supabase
    .from('trial_subscriptions')
    .update({
      payment_status: 'failed' as PaymentStatus,
    })
    .eq('id', trialId);

  if (error) {
    throw new Error('Failed to update trial payment status');
  }

  // Cancel the subscription
  const { data: trial } = await supabase
    .from('trial_subscriptions')
    .select('subscription_id')
    .eq('id', trialId)
    .single();

  if (trial) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: `Trial payment failed: ${reason || 'Unknown'}`,
      })
      .eq('id', trial.subscription_id);
  }
}

// ============================================
// Trial Conversion
// ============================================

/**
 * Convert trial subscription to paid subscription
 * Called when user upgrades from trial to regular paid plan
 */
export async function convertTrialToPaid(
  subscriptionId: string,
  paymentTransactionId: string
): Promise<void> {
  const supabase = await createClient();

  const now = new Date();

  // Update subscription to remove trial status
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .update({
      is_trial: false,
      trial_ends_at: null,
      status: 'active',
      last_payment_date: now.toISOString(),
    })
    .eq('id', subscriptionId);

  if (subError) {
    throw new Error('Failed to convert trial subscription');
  }

  // Update trial record
  const { error: trialError } = await supabase
    .from('trial_subscriptions')
    .update({
      converted_to_paid: true,
      converted_at: now.toISOString(),
    })
    .eq('subscription_id', subscriptionId);

  if (trialError) {
    console.error('Failed to update trial record:', trialError);
  }
}

// ============================================
// Trial Expiration
// ============================================

/**
 * Expire trial subscriptions that have ended
 * Run this daily via cron job
 */
export async function expireTrialSubscriptions(): Promise<number> {
  const supabase = await createClient();

  const now = new Date();

  // Get all active trial subscriptions that have ended
  const { data: trials, error: fetchError } = await supabase
    .from('trial_subscriptions')
    .select('subscription_id')
    .eq('converted_to_paid', false)
    .lt('ends_at', now.toISOString());

  if (fetchError || !trials || trials.length === 0) {
    return 0;
  }

  const subscriptionIds = trials.map((t) => t.subscription_id);

  // Expire the subscriptions
  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'expired' })
    .in('id', subscriptionIds)
    .eq('is_trial', true)
    .eq('status', 'active')
    .select('id');

  if (error) {
    console.error('Error expiring trial subscriptions:', error);
    return 0;
  }

  return data?.length || 0;
}

// ============================================
// Trial Information
// ============================================

/**
 * Get user's trial subscription if exists
 */
export async function getUserTrial(
  userId: string
): Promise<TrialSubscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trial_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching trial:', error);
    return null;
  }

  return data as TrialSubscription | null;
}

/**
 * Get trial config (price, duration, etc.)
 */
export function getTrialConfig() {
  return TRIAL_CONFIG;
}
