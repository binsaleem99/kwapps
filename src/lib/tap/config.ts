/**
 * Tap Payments Configuration
 *
 * Central configuration for Tap Payments integration
 * Supports all 6 GCC currencies + payment methods
 */

export const TAP_CONFIG = {
  apiUrl: 'https://api.tap.company/v2',
  secretKey: process.env.TAP_SECRET_KEY!,
  publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY!,
  webhookSecret: process.env.TAP_WEBHOOK_SECRET!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
} as const

export const GCC_CURRENCIES = {
  KW: { code: 'KWD', symbol: 'د.ك', decimals: 3, name: 'دينار كويتي', smallest_unit: 'fils' },
  SA: { code: 'SAR', symbol: 'ر.س', decimals: 2, name: 'ريال سعودي', smallest_unit: 'halalah' },
  AE: { code: 'AED', symbol: 'د.إ', decimals: 2, name: 'درهم إماراتي', smallest_unit: 'fils' },
  QA: { code: 'QAR', symbol: 'ر.ق', decimals: 2, name: 'ريال قطري', smallest_unit: 'dirham' },
  BH: { code: 'BHD', symbol: 'د.ب', decimals: 3, name: 'دينار بحريني', smallest_unit: 'fils' },
  OM: { code: 'OMR', symbol: 'ر.ع', decimals: 3, name: 'ريال عماني', smallest_unit: 'baisa' },
} as const

// Base prices in KWD (multiply by exchange rate for other currencies)
export const BASE_PRICES_KWD = {
  basic: { monthly: 22.99, annual: 229.90, weekly_trial: 1.0 },
  pro: { monthly: 37.50, annual: 375.00 },
  premium: { monthly: 58.75, annual: 587.50 },
  enterprise: { monthly: 74.50, annual: 745.00 },
} as const

// Default exchange rates (updated daily)
export const DEFAULT_EXCHANGE_RATES = {
  KWD: 1.00,
  SAR: 12.20, // 1 KWD ≈ 12.20 SAR
  AED: 11.95, // 1 KWD ≈ 11.95 AED
  QAR: 11.85, // 1 KWD ≈ 11.85 QAR
  BHD: 1.23, // 1 KWD ≈ 1.23 BHD
  OMR: 1.25, // 1 KWD ≈ 1.25 OMR
} as const

// Tap payment methods by country
export const PAYMENT_METHODS_BY_COUNTRY = {
  KW: ['KNET', 'VISA', 'MASTERCARD', 'AMEX', 'APPLEPAY', 'GOOGLEPAY'],
  SA: ['MADA', 'VISA', 'MASTERCARD', 'AMEX', 'STC_PAY', 'APPLEPAY', 'GOOGLEPAY'],
  AE: ['VISA', 'MASTERCARD', 'AMEX', 'APPLEPAY', 'GOOGLEPAY'],
  QA: ['VISA', 'MASTERCARD', 'AMEX', 'APPLEPAY', 'GOOGLEPAY'],
  BH: ['BENEFIT', 'VISA', 'MASTERCARD', 'AMEX', 'APPLEPAY', 'GOOGLEPAY'],
  OM: ['VISA', 'MASTERCARD', 'AMEX', 'APPLEPAY', 'GOOGLEPAY'],
} as const

// Convert amount to smallest currency unit (for Tap API)
export function toSmallestUnit(amount: number, currency: string): number {
  const currencyKey = Object.keys(GCC_CURRENCIES).find(
    (k) => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currency
  ) as keyof typeof GCC_CURRENCIES | undefined

  if (!currencyKey) return Math.round(amount * 1000)

  const decimals = GCC_CURRENCIES[currencyKey].decimals
  return Math.round(amount * Math.pow(10, decimals))
}

// Convert from smallest unit to decimal
export function fromSmallestUnit(amount: number, currency: string): number {
  const currencyKey = Object.keys(GCC_CURRENCIES).find(
    (k) => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currency
  ) as keyof typeof GCC_CURRENCIES | undefined

  if (!currencyKey) return amount / 1000

  const decimals = GCC_CURRENCIES[currencyKey].decimals
  return amount / Math.pow(10, decimals)
}
