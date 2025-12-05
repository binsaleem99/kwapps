// ============================================
// KW APPS Billing Module Exports
// ============================================

// Credit operations
export {
  getUserCreditBalance,
  hasEnoughCredits,
  deductCredits,
  addCredits,
  canClaimDailyBonus,
  claimDailyBonus,
  getCreditTransactionHistory,
  getTransactionSummary,
  // Credit reservation system (for streaming operations)
  reserveCredits,
  commitCredits,
  releaseCredits,
  getUserReservations,
  getAvailableCredits,
} from './credit-service';

// Subscription management
export {
  createSubscription,
  renewSubscription,
  processSubscriptionRenewals,
  cancelSubscription,
  expireCancelledSubscriptions,
  changeSubscriptionTier,
  getSubscriptionTiers,
  getUserSubscription,
} from './subscription-service';

// Trial management
export {
  isEligibleForTrial,
  createTrialSubscription,
  processTrialPayment,
  processTrialPaymentFailure,
  convertTrialToPaid,
  expireTrialSubscriptions,
  getUserTrial,
  getTrialConfig,
} from './trial-service';

// Payment processing
export {
  createCheckout,
  getPaymentByOrderId,
  getUserPaymentHistory,
  checkPaymentStatus,
  createRefund,
  getSavedCards,
  deleteSavedCard,
  getSubscriptionPricing,
  type CheckoutParams,
  type CheckoutResult,
  type PaymentTransaction,
} from './payment-service';
