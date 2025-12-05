// ============================================
// KW APPS Payment Service
// ============================================
// Unified payment handling for UPayments integration

import { createClient } from '@/lib/supabase/server';
import { upayments } from '@/lib/upayments/client';
import type { SubscriptionTierName } from '@/types/billing';
import { SUBSCRIPTION_TIERS, TRIAL_CONFIG } from '@/types/billing';

// ============================================
// Types
// ============================================

export interface CheckoutParams {
  userId: string;
  tierName: SubscriptionTierName;
  isTrial?: boolean;
  saveCard?: boolean;
  paymentSource?: 'knet' | 'cc' | 'apple-pay' | 'google-pay';
}

export interface CheckoutResult {
  success: boolean;
  paymentLink: string;
  orderId: string;
  trackId: string;
  amount: number;
  currency: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  upayments_order_id: string;
  upayments_track_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'canceled' | 'refunded';
  transaction_type: 'subscription' | 'trial' | 'renewal' | 'upgrade';
  payment_method: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// ============================================
// Checkout Functions
// ============================================

/**
 * Create a checkout session for subscription or trial
 */
export async function createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  const supabase = await createClient();

  // Get tier from database
  const { data: tier, error: tierError } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('name', params.tierName)
    .eq('is_active', true)
    .single();

  if (tierError || !tier) {
    throw new Error('Tier not available');
  }

  // Calculate amount
  const amount = params.isTrial ? TRIAL_CONFIG.price_kwd : tier.price_kwd;
  const transactionType = params.isTrial ? 'trial' : 'subscription';

  // Generate order ID
  const orderId = upayments.generateOrderId(
    params.isTrial ? 'trial' : 'sub',
    params.userId.substring(0, 8)
  );

  // Get user info
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', params.userId)
    .single();

  const { data: authUser } = await supabase.auth.getUser();
  const customerName = profile?.display_name || authUser?.user?.email?.split('@')[0] || 'User';
  const customerEmail = profile?.email || authUser?.user?.email || '';

  // URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kwq8.com';
  const returnUrl = `${baseUrl}/billing/success?order_id=${orderId}&type=${transactionType}`;
  const cancelUrl = `${baseUrl}/billing/cancel?order_id=${orderId}`;
  const webhookUrl = `${baseUrl}/api/billing/webhook`;

  // Customer token for card saving
  let customerUniqueToken: string | undefined;
  if (params.saveCard) {
    customerUniqueToken = upayments.generateCustomerToken(params.userId);
    try {
      await upayments.createCustomerToken({ customerUniqueToken });
    } catch {
      // Token may already exist
    }
  }

  // Description
  const description = params.isTrial
    ? `فترة تجريبية - ${tier.display_name_ar} - KW APPS`
    : `اشتراك ${tier.display_name_ar} - KW APPS`;

  // Create UPayments charge
  const chargeResponse = await upayments.createCharge({
    order: {
      id: orderId,
      description,
      currency: 'KWD',
      amount,
    },
    reference: { id: orderId },
    language: 'ar',
    returnUrl,
    cancelUrl,
    notificationUrl: webhookUrl,
    customer: {
      uniqueId: params.userId,
      name: customerName,
      email: customerEmail,
    },
    products: [
      {
        name: params.isTrial ? `Trial - ${tier.display_name_en}` : tier.display_name_en,
        description: params.isTrial
          ? `${TRIAL_CONFIG.duration_days} day trial`
          : 'Monthly subscription',
        price: amount,
        quantity: 1,
      },
    ],
    ...(customerUniqueToken && { tokens: { customerUniqueToken } }),
    ...(params.paymentSource && { paymentGateway: { src: params.paymentSource } }),
  });

  // Store pending transaction
  await supabase.from('payment_transactions').insert({
    user_id: params.userId,
    upayments_order_id: orderId,
    upayments_track_id: chargeResponse.data.trackId,
    upayments_payment_id: chargeResponse.data.paymentId,
    amount,
    currency: 'KWD',
    status: 'pending',
    transaction_type: transactionType,
    metadata: {
      tier_id: tier.id,
      tier_name: tier.name,
      is_trial: params.isTrial || false,
      save_card: params.saveCard || false,
      customer_unique_token: customerUniqueToken,
      credits_per_month: tier.credits_per_month,
      daily_bonus_credits: tier.daily_bonus_credits,
    },
  });

  return {
    success: true,
    paymentLink: chargeResponse.data.link,
    orderId,
    trackId: chargeResponse.data.trackId,
    amount,
    currency: 'KWD',
  };
}

// ============================================
// Payment Status Functions
// ============================================

/**
 * Get payment transaction by order ID
 */
export async function getPaymentByOrderId(
  orderId: string
): Promise<PaymentTransaction | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('upayments_order_id', orderId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as PaymentTransaction;
}

/**
 * Get user's payment history
 */
export async function getUserPaymentHistory(
  userId: string,
  limit = 20
): Promise<PaymentTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data as PaymentTransaction[];
}

/**
 * Check payment status with UPayments
 */
export async function checkPaymentStatus(trackId: string): Promise<{
  status: string;
  result: string;
  amount: number;
}> {
  try {
    const response = await upayments.getPaymentStatus(trackId);

    return {
      status: response.data.result === 'CAPTURED' ? 'success' : 'pending',
      result: response.data.result,
      amount: response.data.amount,
    };
  } catch (error) {
    console.error('Failed to check payment status:', error);
    throw error;
  }
}

// ============================================
// Refund Functions
// ============================================

/**
 * Create a refund for a payment
 */
export async function createRefund(
  orderId: string,
  reason: string
): Promise<{ success: boolean; refundId?: string }> {
  const supabase = await createClient();

  // Get original transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('upayments_order_id', orderId)
    .eq('status', 'success')
    .single();

  if (!transaction) {
    throw new Error('Original transaction not found or not successful');
  }

  // Get user info for refund
  const { data: user } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', transaction.user_id)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kwq8.com';

  // Process refund with UPayments
  const refundResponse = await upayments.createRefund({
    orderId,
    totalPrice: transaction.amount,
    customerFirstName: user.display_name || 'Customer',
    customerEmail: user.email || '',
    customerMobileNumber: '',
    reference: `refund_${orderId}`,
    notifyUrl: `${baseUrl}/api/billing/webhook`,
  });

  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({
      status: 'refunded',
      metadata: {
        ...transaction.metadata,
        refund_reason: reason,
        refund_id: refundResponse.data.refundId,
      },
    })
    .eq('id', transaction.id);

  return {
    success: true,
    refundId: refundResponse.data.refundId,
  };
}

// ============================================
// Card Management
// ============================================

/**
 * Get user's saved cards
 */
export async function getSavedCards(userId: string): Promise<any[]> {
  try {
    const customerToken = upayments.generateCustomerToken(userId);
    const response = await upayments.retrieveCustomerCards(customerToken);
    return response.data || [];
  } catch {
    return [];
  }
}

/**
 * Delete a saved card
 */
export async function deleteSavedCard(
  userId: string,
  cardToken: string
): Promise<boolean> {
  try {
    const customerToken = upayments.generateCustomerToken(userId);
    await upayments.deleteCustomerCard(customerToken, cardToken);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Pricing Info
// ============================================

/**
 * Get all subscription pricing info
 */
export function getSubscriptionPricing() {
  return {
    tiers: SUBSCRIPTION_TIERS,
    trial: {
      price_kwd: TRIAL_CONFIG.price_kwd,
      duration_days: TRIAL_CONFIG.duration_days,
      allowed_tier: TRIAL_CONFIG.allowed_tier,
    },
    currency: 'KWD',
    payment_methods: ['knet', 'cc', 'apple-pay', 'google-pay'] as const,
  };
}
