/**
 * Namecheap Domain API Types
 *
 * Domain Pricing Rules (KWq8.com):
 * - Domains ≤$15 = FREE (1 year + SSL) for Pro/Enterprise users
 * - Domains >$15 = Cost + 20% markup
 */

export interface DomainAvailability {
  domain: string
  available: boolean
  premium: boolean
  price?: DomainPrice
}

export interface DomainPrice {
  registration: number      // First year price in USD
  renewal: number          // Annual renewal price in USD
  transfer: number         // Transfer price in USD
  currency: 'USD'
}

export interface DomainPricing {
  domain: string
  tld: string
  basePrice: number        // Namecheap price in USD
  markup: number           // Our markup (0 for free, 20% for premium)
  finalPriceUSD: number    // Final price in USD
  finalPriceKWD: number    // Final price in KWD
  isFree: boolean          // True if ≤$15 and user is Pro/Enterprise
  includesSSL: boolean     // Always true
  yearIncluded: number     // 1 year included
}

export interface DomainPurchase {
  id: string
  userId: string
  projectId: string
  domain: string
  tld: string
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  purchasePrice: number    // What user paid (KWD)
  namecheapCost: number    // What we paid Namecheap (USD)
  registeredAt: string
  expiresAt: string
  autoRenew: boolean
  sslEnabled: boolean
  nameservers: string[]
}

export interface DomainSearchResult {
  query: string
  suggestions: DomainSuggestion[]
  available: DomainAvailability[]
}

export interface DomainSuggestion {
  domain: string
  tld: string
  available: boolean
  price: DomainPrice | null
}

// Namecheap API Response Types
export interface NamecheapApiResponse<T> {
  ApiResponse: {
    Status: 'OK' | 'ERROR'
    Errors?: { Error: { Number: string; Message: string }[] }
    CommandResponse: T
  }
}

export interface NamecheapDomainCheckResponse {
  DomainCheckResult: {
    Domain: string
    Available: string
    IsPremiumName: string
    PremiumRegistrationPrice?: string
  }[]
}

export interface NamecheapDomainPriceResponse {
  UserGetPricingResult: {
    ProductType: string
    ProductCategory: string
    ProductName: string
    Price: string
    RegularPrice: string
    YourPrice: string
    Currency: string
  }[]
}

export interface NamecheapDomainCreateResponse {
  DomainCreateResult: {
    Domain: string
    DomainID: string
    Registered: string
    OrderID: string
    TransactionID: string
    ChargedAmount: string
  }
}

// Config
export interface NamecheapConfig {
  apiUser: string
  apiKey: string
  username: string
  clientIp: string
  sandbox: boolean
}

// Arabic labels
export const DOMAIN_STATUS_AR: Record<DomainPurchase['status'], string> = {
  pending: 'قيد المعالجة',
  active: 'نشط',
  expired: 'منتهي',
  cancelled: 'ملغي',
}

// Free domain threshold
export const FREE_DOMAIN_THRESHOLD_USD = 15

// Markup percentage for premium domains
export const PREMIUM_DOMAIN_MARKUP = 0.20 // 20%

// USD to KWD exchange rate (should be fetched dynamically in production)
export const USD_TO_KWD_RATE = 0.31

// Common TLDs with typical prices
export const COMMON_TLDS = [
  { tld: 'com', typical: 12.98 },
  { tld: 'net', typical: 14.98 },
  { tld: 'org', typical: 12.98 },
  { tld: 'co', typical: 11.98 },
  { tld: 'io', typical: 32.98 },
  { tld: 'app', typical: 15.98 },
  { tld: 'dev', typical: 15.98 },
  { tld: 'me', typical: 8.98 },
  { tld: 'site', typical: 3.98 },
  { tld: 'online', typical: 4.98 },
  { tld: 'store', typical: 5.98 },
  { tld: 'shop', typical: 11.98 },
  { tld: 'kw', typical: 49.00 }, // Kuwait TLD
]
