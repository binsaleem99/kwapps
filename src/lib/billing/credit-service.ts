// ============================================
// KW APPS Credit Service
// ============================================
// Handles all credit-related operations including
// reservations for streaming/long-running tasks

import { createClient } from '@/lib/supabase/server';
import type {
  OperationType,
  CreditTransaction,
  UserSubscription,
  DeductCreditsRequest,
  DeductCreditsResponse,
  ClaimDailyBonusResponse,
  CreditBalanceResponse,
  TransactionType,
} from '@/types/billing';
import { CREDIT_COSTS } from '@/types/billing';

// ============================================
// Credit Reservation System
// ============================================
// For streaming operations, we "hold" credits before
// the operation starts, then either commit (deduct)
// on success or release (return) on failure.

interface CreditReservation {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  operationType: OperationType;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory reservation store (in production, use Redis)
const reservations = new Map<string, CreditReservation>();

// Cleanup expired reservations every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [id, reservation] of reservations.entries()) {
    if (reservation.expiresAt < now) {
      console.log(`[Credits] Auto-releasing expired reservation: ${id}`);
      reservations.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * Reserve credits for an upcoming operation
 * This "holds" credits without actually deducting them
 * Reservation expires after 5 minutes if not committed/released
 */
export async function reserveCredits(
  userId: string,
  operationType: OperationType,
  metadata?: Record<string, any>
): Promise<{ success: boolean; reservationId?: string; error?: string }> {
  const supabase = await createClient();

  // Get user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    return { success: false, error: 'No active subscription found' };
  }

  const cost = CREDIT_COSTS[operationType];

  // Calculate total held credits for this user
  let totalHeld = 0;
  for (const reservation of reservations.values()) {
    if (reservation.userId === userId) {
      totalHeld += reservation.amount;
    }
  }

  // Check if user has enough credits (considering existing holds)
  const availableCredits = subscription.credits_balance - totalHeld;
  if (availableCredits < cost) {
    return {
      success: false,
      error: `Insufficient credits. Required: ${cost}, Available: ${availableCredits}`,
    };
  }

  // Create reservation
  const reservationId = `res-${userId.slice(0, 8)}-${Date.now()}`;
  const reservation: CreditReservation = {
    id: reservationId,
    userId,
    subscriptionId: subscription.id,
    amount: cost,
    operationType,
    metadata,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute expiry
  };

  reservations.set(reservationId, reservation);
  console.log(`[Credits] Reserved ${cost} credits for user ${userId}, reservation: ${reservationId}`);

  return { success: true, reservationId };
}

/**
 * Commit a reservation - actually deduct the credits
 * Call this after successful operation completion
 */
export async function commitCredits(
  reservationId: string
): Promise<{ success: boolean; transaction?: CreditTransaction; error?: string }> {
  const reservation = reservations.get(reservationId);

  if (!reservation) {
    return { success: false, error: 'Reservation not found or expired' };
  }

  // Remove reservation first (even if deduct fails, we don't want double-charge)
  reservations.delete(reservationId);

  try {
    // Deduct the credits
    const result = await deductCredits(reservation.userId, {
      operation_type: reservation.operationType,
      operation_metadata: {
        ...reservation.metadata,
        reservation_id: reservationId,
      },
    });

    console.log(`[Credits] Committed reservation ${reservationId}, deducted ${reservation.amount} credits`);
    return { success: true, transaction: result.transaction };
  } catch (error) {
    console.error(`[Credits] Failed to commit reservation ${reservationId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to commit credits',
    };
  }
}

/**
 * Release a reservation - return the held credits
 * Call this if operation fails or is cancelled
 */
export async function releaseCredits(
  reservationId: string
): Promise<{ success: boolean; error?: string }> {
  const reservation = reservations.get(reservationId);

  if (!reservation) {
    // Already released or expired - not an error
    return { success: true };
  }

  reservations.delete(reservationId);
  console.log(`[Credits] Released reservation ${reservationId}, ${reservation.amount} credits returned to user ${reservation.userId}`);

  return { success: true };
}

/**
 * Get all active reservations for a user
 */
export async function getUserReservations(userId: string): Promise<CreditReservation[]> {
  const userReservations: CreditReservation[] = [];
  for (const reservation of reservations.values()) {
    if (reservation.userId === userId) {
      userReservations.push(reservation);
    }
  }
  return userReservations;
}

/**
 * Get user's available credits (balance minus held)
 */
export async function getAvailableCredits(userId: string): Promise<number> {
  const balance = await getUserCreditBalance(userId);
  if (!balance) return 0;

  let totalHeld = 0;
  for (const reservation of reservations.values()) {
    if (reservation.userId === userId) {
      totalHeld += reservation.amount;
    }
  }

  return balance.credits_balance - totalHeld;
}

// ============================================
// Credit Balance & Info
// ============================================

/**
 * Get user's current credit balance and subscription info
 */
export async function getUserCreditBalance(
  userId: string
): Promise<CreditBalanceResponse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_credit_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active_subscription', true)
    .single();

  if (error || !data) {
    console.error('Error fetching credit balance:', error);
    return null;
  }

  // Check if user can claim daily bonus
  const canClaimBonus = await canClaimDailyBonus(userId);

  return {
    credits_balance: data.credits_balance,
    tier_name: data.tier_name,
    tier_display_name_ar: data.tier_display_name_ar,
    daily_bonus_credits: data.daily_bonus_credits,
    can_claim_bonus: canClaimBonus,
    subscription_status: data.status,
    period_end: data.current_period_end,
  };
}

/**
 * Check if user has enough credits for an operation
 */
export async function hasEnoughCredits(
  userId: string,
  operationType: OperationType
): Promise<boolean> {
  const balance = await getUserCreditBalance(userId);
  if (!balance) return false;

  const cost = CREDIT_COSTS[operationType];
  return balance.credits_balance >= cost;
}

// ============================================
// Credit Transactions
// ============================================

/**
 * Deduct credits for an operation
 */
export async function deductCredits(
  userId: string,
  request: DeductCreditsRequest
): Promise<DeductCreditsResponse> {
  const supabase = await createClient();

  // Get user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    throw new Error('No active subscription found');
  }

  const cost = CREDIT_COSTS[request.operation_type];

  // Check if user has enough credits
  if (subscription.credits_balance < cost) {
    throw new Error(
      `Insufficient credits. Required: ${cost}, Available: ${subscription.credits_balance}`
    );
  }

  // Calculate new balance
  const newBalance = subscription.credits_balance - cost;

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      transaction_type: 'debit' as TransactionType,
      amount: -cost,
      balance_after: newBalance,
      operation_type: request.operation_type,
      operation_metadata: request.operation_metadata || null,
      description_ar: `خصم ${cost} رصيد لعملية ${request.operation_type}`,
      description_en: `Deducted ${cost} credits for ${request.operation_type}`,
    })
    .select()
    .single();

  if (txError) {
    throw new Error('Failed to create transaction');
  }

  // Update subscription balance
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ credits_balance: newBalance })
    .eq('id', subscription.id);

  if (updateError) {
    throw new Error('Failed to update credit balance');
  }

  return {
    success: true,
    transaction: transaction as CreditTransaction,
    remaining_balance: newBalance,
  };
}

/**
 * Add credits to user account (for refunds, bonuses, etc.)
 */
export async function addCredits(
  userId: string,
  amount: number,
  transactionType: TransactionType,
  description: { ar: string; en: string },
  metadata?: Record<string, any>
): Promise<CreditTransaction> {
  const supabase = await createClient();

  // Get user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    throw new Error('No active subscription found');
  }

  const newBalance = subscription.credits_balance + amount;

  // Create transaction record
  const { data: transaction, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      transaction_type: transactionType,
      amount: amount,
      balance_after: newBalance,
      description_ar: description.ar,
      description_en: description.en,
      operation_metadata: metadata || null,
    })
    .select()
    .single();

  if (txError) {
    throw new Error('Failed to create transaction');
  }

  // Update subscription balance
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ credits_balance: newBalance })
    .eq('id', subscription.id);

  if (updateError) {
    throw new Error('Failed to update credit balance');
  }

  return transaction as CreditTransaction;
}

// ============================================
// Daily Bonus System
// ============================================

/**
 * Check if user can claim today's daily bonus
 */
export async function canClaimDailyBonus(userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get today's date (Kuwait timezone - UTC+3)
  const today = new Date();
  const kuwaitOffset = 3 * 60; // Kuwait is UTC+3
  const kuwaitTime = new Date(today.getTime() + kuwaitOffset * 60 * 1000);
  const todayDate = kuwaitTime.toISOString().split('T')[0];

  // Check if bonus already claimed today
  const { data, error } = await supabase
    .from('daily_bonus_log')
    .select('id')
    .eq('user_id', userId)
    .eq('bonus_date', todayDate)
    .maybeSingle();

  if (error) {
    console.error('Error checking daily bonus:', error);
    return false;
  }

  // Can claim if no record exists for today
  return !data;
}

/**
 * Claim daily bonus credits
 */
export async function claimDailyBonus(
  userId: string
): Promise<ClaimDailyBonusResponse> {
  const supabase = await createClient();

  // Check if already claimed today
  const canClaim = await canClaimDailyBonus(userId);
  if (!canClaim) {
    return {
      success: false,
      bonus_amount: 0,
      message: 'Daily bonus already claimed today',
    };
  }

  // Get user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_tiers (
        daily_bonus_credits
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (subError || !subscription) {
    return {
      success: false,
      bonus_amount: 0,
      message: 'No active subscription found',
    };
  }

  const bonusAmount = (subscription.subscription_tiers as any).daily_bonus_credits;
  const newBalance = subscription.credits_balance + bonusAmount;

  // Get today's date
  const today = new Date();
  const kuwaitOffset = 3 * 60;
  const kuwaitTime = new Date(today.getTime() + kuwaitOffset * 60 * 1000);
  const todayDate = kuwaitTime.toISOString().split('T')[0];

  // Create bonus transaction
  const { data: transaction, error: txError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      transaction_type: 'bonus' as TransactionType,
      amount: bonusAmount,
      balance_after: newBalance,
      bonus_date: todayDate,
      description_ar: `مكافأة يومية: ${bonusAmount} رصيد`,
      description_en: `Daily bonus: ${bonusAmount} credits`,
    })
    .select()
    .single();

  if (txError) {
    return {
      success: false,
      bonus_amount: 0,
      message: 'Failed to create bonus transaction',
    };
  }

  // Update subscription balance and bonus earned
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      credits_balance: newBalance,
      credits_bonus_earned: subscription.credits_bonus_earned + bonusAmount,
    })
    .eq('id', subscription.id);

  if (updateError) {
    return {
      success: false,
      bonus_amount: 0,
      message: 'Failed to update credit balance',
    };
  }

  // Log the bonus claim
  const { error: logError } = await supabase.from('daily_bonus_log').insert({
    user_id: userId,
    subscription_id: subscription.id,
    bonus_date: todayDate,
    bonus_amount: bonusAmount,
    transaction_id: transaction.id,
  });

  if (logError) {
    console.error('Failed to log daily bonus:', logError);
  }

  return {
    success: true,
    bonus_amount: bonusAmount,
    transaction: transaction as CreditTransaction,
    message: `Successfully claimed ${bonusAmount} bonus credits!`,
  };
}

// ============================================
// Transaction History
// ============================================

/**
 * Get user's credit transaction history
 */
export async function getCreditTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }

  return data as CreditTransaction[];
}

/**
 * Get transaction summary (total debits, credits, etc.)
 */
export async function getTransactionSummary(userId: string): Promise<{
  total_debits: number;
  total_credits: number;
  total_bonuses: number;
  total_transactions: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('transaction_type, amount')
    .eq('user_id', userId);

  if (error || !data) {
    return {
      total_debits: 0,
      total_credits: 0,
      total_bonuses: 0,
      total_transactions: 0,
    };
  }

  const summary = data.reduce(
    (acc, tx) => {
      if (tx.transaction_type === 'debit') {
        acc.total_debits += Math.abs(tx.amount);
      } else if (tx.transaction_type === 'credit' || tx.transaction_type === 'allocation') {
        acc.total_credits += tx.amount;
      } else if (tx.transaction_type === 'bonus') {
        acc.total_bonuses += tx.amount;
      }
      acc.total_transactions++;
      return acc;
    },
    {
      total_debits: 0,
      total_credits: 0,
      total_bonuses: 0,
      total_transactions: 0,
    }
  );

  return summary;
}
