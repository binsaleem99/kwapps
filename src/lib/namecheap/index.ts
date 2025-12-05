/**
 * Namecheap Domain API - Main Export
 *
 * Domain management for KWq8.com:
 * - Check availability
 * - Get pricing (FREE ≤$15, 20% markup >$15)
 * - Purchase domains
 * - Manage DNS
 */

// Types
export type {
  DomainAvailability,
  DomainPrice,
  DomainPricing,
  DomainPurchase,
  DomainSearchResult,
  DomainSuggestion,
  NamecheapConfig,
} from './types'

export {
  DOMAIN_STATUS_AR,
  FREE_DOMAIN_THRESHOLD_USD,
  PREMIUM_DOMAIN_MARKUP,
  USD_TO_KWD_RATE,
  COMMON_TLDS,
} from './types'

// Client
export {
  NamecheapClient,
  getNamecheapClient,
  createNamecheapClient,
  type DomainRegistrant,
} from './client'

// Pricing
export {
  calculateDomainPricing,
  getPricingDisplayAr,
  hasUsedFreeDomainThisYear,
  calculateRenewalPricing,
  generateDomainSuggestions,
  formatPriceKWD,
  formatPriceUSD,
  validateDomainName,
  type UserPlan,
} from './pricing'
