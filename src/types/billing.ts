// ============================================
// KW APPS Credit System Types
// ============================================

export type SubscriptionTierName = 'basic' | 'pro' | 'premium' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export type TransactionType = 'debit' | 'credit' | 'bonus' | 'rollover' | 'refund' | 'allocation';

export type OperationType =
  | 'chat'
  | 'simple_edit'
  | 'component'
  | 'page'
  | 'complex'
  | 'banana_image'
  | 'deploy'
  | 'orchestrate';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

// ============================================
// Database Table Types
// ============================================

export interface SubscriptionTier {
  id: string;
  name: SubscriptionTierName;
  display_name_ar: string;
  display_name_en: string;
  price_kwd: number;
  credits_per_month: number;
  daily_bonus_credits: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: SubscriptionStatus;
  is_trial: boolean;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  credits_balance: number;
  credits_allocated_this_period: number;
  credits_bonus_earned: number;
  credits_rollover: number;
  last_payment_amount: number | null;
  last_payment_date: string | null;
  payment_method: string | null;
  payment_provider_subscription_id: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditOperation {
  id: string;
  operation_type: OperationType;
  display_name_ar: string;
  display_name_en: string;
  credit_cost: number;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  transaction_type: TransactionType;
  amount: number;
  balance_after: number;
  operation_type: OperationType | null;
  operation_metadata: Record<string, any> | null;
  bonus_date: string | null;
  description_ar: string | null;
  description_en: string | null;
  created_at: string;
}

export interface DailyBonusLog {
  id: string;
  user_id: string;
  subscription_id: string;
  bonus_date: string;
  bonus_amount: number;
  transaction_id: string | null;
  created_at: string;
}

export interface TrialSubscription {
  id: string;
  user_id: string;
  subscription_id: string;
  trial_price_kwd: number;
  trial_duration_days: number;
  started_at: string;
  ends_at: string;
  payment_status: PaymentStatus;
  payment_transaction_id: string | null;
  payment_date: string | null;
  converted_to_paid: boolean;
  converted_at: string | null;
  created_at: string;
}

// ============================================
// View Types
// ============================================

export interface UserCreditSummary {
  user_id: string;
  subscription_id: string;
  tier_name: SubscriptionTierName;
  tier_display_name_ar: string;
  status: SubscriptionStatus;
  is_trial: boolean;
  credits_balance: number;
  credits_allocated_this_period: number;
  credits_bonus_earned: number;
  credits_rollover: number;
  daily_bonus_credits: number;
  current_period_start: string;
  current_period_end: string;
  is_active_subscription: boolean;
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateSubscriptionRequest {
  tier_name: SubscriptionTierName;
  is_trial?: boolean;
  payment_method: 'upayments' | 'stripe';
}

export interface CreateSubscriptionResponse {
  subscription: UserSubscription;
  payment_url?: string; // For redirecting to payment gateway
}

export interface DeductCreditsRequest {
  operation_type: OperationType;
  operation_metadata?: Record<string, any>;
}

export interface DeductCreditsResponse {
  success: boolean;
  transaction: CreditTransaction;
  remaining_balance: number;
}

export interface ClaimDailyBonusResponse {
  success: boolean;
  bonus_amount: number;
  transaction?: CreditTransaction;
  message: string;
}

export interface CreditBalanceResponse {
  credits_balance: number;
  tier_name: SubscriptionTierName;
  tier_display_name_ar: string;
  daily_bonus_credits: number;
  can_claim_bonus: boolean;
  subscription_status: SubscriptionStatus;
  period_end: string;
}

// ============================================
// Constants
// ============================================

export const CREDIT_COSTS: Record<OperationType, number> = {
  chat: 1.0,
  simple_edit: 0.5,
  component: 2.0,
  page: 3.0,
  complex: 4.0,
  banana_image: 2.5,
  deploy: 1.0,
  orchestrate: 0, // Free - orchestration is part of generation flow, credits deducted at generation
};

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTierName,
  {
    price_kwd: number;
    credits_per_month: number;
    daily_bonus_credits: number;
    display_name_ar: string;
    display_name_en: string;
  }
> = {
  basic: {
    price_kwd: 23,
    credits_per_month: 100,
    daily_bonus_credits: 5,
    display_name_ar: 'أساسي',
    display_name_en: 'Basic',
  },
  pro: {
    price_kwd: 38,
    credits_per_month: 200,
    daily_bonus_credits: 8,
    display_name_ar: 'احترافي',
    display_name_en: 'Pro',
  },
  premium: {
    price_kwd: 59,
    credits_per_month: 350,
    daily_bonus_credits: 12,
    display_name_ar: 'مميز',
    display_name_en: 'Premium',
  },
  enterprise: {
    price_kwd: 75,
    credits_per_month: 500,
    daily_bonus_credits: 15,
    display_name_ar: 'مؤسسي',
    display_name_en: 'Enterprise',
  },
};

export const TRIAL_CONFIG = {
  price_kwd: 1.0,
  duration_days: 7,
  allowed_tier: 'basic' as const,
  credits: 100, // Same as Basic tier
  daily_bonus: 5, // Same as Basic tier
};
