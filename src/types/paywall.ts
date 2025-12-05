// ============================================
// KW APPS Paywall Types
// ============================================

import type { SubscriptionTierName } from './billing';

// Re-export for convenience
export type { SubscriptionTierName };

export type PaywallStep = 'benefits' | 'trial-timeline' | 'offers';

export interface PaywallState {
  currentStep: PaywallStep;
  selectedTier: SubscriptionTierName | null;
  withTrial: boolean;
  isLoading: boolean;
}

export interface Benefit {
  icon: string; // Lucide icon name
  title_ar: string;
  description_ar: string;
}

export interface SocialProof {
  type: 'rating' | 'user_count' | 'testimonial';
  value: string;
  label_ar: string;
}

export interface PricingOffer {
  tier: SubscriptionTierName;
  display_name_ar: string;

  // Trial pricing
  trial_price_kwd: number;
  trial_duration_days: number;
  trial_label_ar: string;

  // Regular pricing
  price_kwd_monthly: number;
  price_kwd_weekly: number; // For framing

  // Features
  credits_per_month: number;
  daily_bonus_credits: number;
  features_ar: string[];

  // UI
  is_popular?: boolean;
  badge_ar?: string;
}

export interface TrialTimelineStep {
  day: number;
  label_ar: string;
  icon: string;
  is_payment_reminder?: boolean;
}
