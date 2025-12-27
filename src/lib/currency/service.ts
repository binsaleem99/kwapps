/**
 * Currency Service
 *
 * Handles multi-currency support for GCC countries:
 * - Auto-detection from IP geolocation
 * - Exchange rate management (daily updates)
 * - Currency conversion
 * - Price formatting
 */

import { createClient } from '@supabase/supabase-js'
import { GCC_CURRENCIES, DEFAULT_EXCHANGE_RATES } from '../tap/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class CurrencyService {
  private exchangeRates: Record<string, number> = DEFAULT_EXCHANGE_RATES
  private lastUpdated: Date | null = null

  constructor() {
    this.loadCachedRates()
  }

  // ============================================
  // CURRENCY DETECTION
  // ============================================

  /**
   * Detect currency from IP address using Cloudflare headers or external API
   */
  async detectFromIP(request: Request): Promise<string> {
    try {
      // Try Cloudflare headers first (available when deployed on Vercel/Cloudflare)
      const cfCountry = request.headers.get('cf-ipcountry')
      if (cfCountry) {
        return this.mapCountryToCurrency(cfCountry)
      }

      // Fallback: Use external geolocation API
      const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip')

      if (clientIP && clientIP !== '127.0.0.1') {
        const country = await this.getCountryFromIP(clientIP)
        return this.mapCountryToCurrency(country)
      }

      // Default to KWD
      return 'KWD'
    } catch (error) {
      console.error('Currency detection failed:', error)
      return 'KWD'
    }
  }

  /**
   * Map country code to currency code
   */
  mapCountryToCurrency(countryCode: string): string {
    const mapping: Record<string, string> = {
      KW: 'KWD',
      SA: 'SAR',
      AE: 'AED',
      QA: 'QAR',
      BH: 'BHD',
      OM: 'OMR',
    }
    return mapping[countryCode] || 'KWD'
  }

  /**
   * Get country from IP using free geolocation API
   */
  private async getCountryFromIP(ip: string): Promise<string> {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/country/`)
      const country = await response.text()
      return country.trim()
    } catch (error) {
      return 'KW' // Default to Kuwait
    }
  }

  // ============================================
  // EXCHANGE RATES
  // ============================================

  /**
   * Load cached rates from database
   */
  private async loadCachedRates(): Promise<void> {
    try {
      const { data } = await supabase
        .from('exchange_rates')
        .select('rates, last_updated')
        .eq('id', 1)
        .single()

      if (data && data.rates) {
        this.exchangeRates = data.rates as Record<string, number>
        this.lastUpdated = data.last_updated ? new Date(data.last_updated) : null
      }
    } catch (error) {
      console.error('Failed to load cached rates:', error)
      this.exchangeRates = DEFAULT_EXCHANGE_RATES
    }
  }

  /**
   * Refresh exchange rates from API (call daily via cron)
   */
  async refreshRates(): Promise<void> {
    try {
      const apiKey = process.env.EXCHANGE_API_KEY
      if (!apiKey) {
        console.warn('EXCHANGE_API_KEY not set, using default rates')
        return
      }

      // Using exchangerate-api.com (free tier: 1500 requests/month)
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/KWD`
      )

      const data = await response.json()

      if (data.result === 'success') {
        this.exchangeRates = {
          KWD: 1,
          SAR: data.conversion_rates.SAR,
          AED: data.conversion_rates.AED,
          QAR: data.conversion_rates.QAR,
          BHD: data.conversion_rates.BHD,
          OMR: data.conversion_rates.OMR,
        }

        this.lastUpdated = new Date()

        // Cache in database
        await supabase
          .from('exchange_rates')
          .upsert({
            id: 1,
            rates: this.exchangeRates,
            last_updated: this.lastUpdated.toISOString(),
            source: 'exchangerate-api.com',
          })

        console.log('Exchange rates refreshed:', this.exchangeRates)
      }
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error)
    }
  }

  /**
   * Get current exchange rates
   */
  getRates(): Record<string, number> {
    return { ...this.exchangeRates }
  }

  /**
   * Check if rates are stale (older than 24 hours)
   */
  areRatesStale(): boolean {
    if (!this.lastUpdated) return true
    const hoursSinceUpdate = (Date.now() - this.lastUpdated.getTime()) / (1000 * 60 * 60)
    return hoursSinceUpdate > 24
  }

  // ============================================
  // CURRENCY CONVERSION
  // ============================================

  /**
   * Convert from KWD to target currency
   */
  convertFromKWD(amountKWD: number, targetCurrency: string): number {
    const rate = this.exchangeRates[targetCurrency] || 1
    const converted = amountKWD * rate

    // Round to appropriate decimals
    const decimals = this.getCurrencyDecimals(targetCurrency)
    return Number(converted.toFixed(decimals))
  }

  /**
   * Convert to KWD from source currency
   */
  convertToKWD(amount: number, sourceCurrency: string): number {
    if (sourceCurrency === 'KWD') return amount

    const rate = this.exchangeRates[sourceCurrency] || 1
    const converted = amount / rate

    return Number(converted.toFixed(3))
  }

  /**
   * Convert between any two currencies
   */
  convert(amount: number, from: string, to: string): number {
    if (from === to) return amount

    // Convert to KWD first, then to target
    const amountKWD = this.convertToKWD(amount, from)
    return this.convertFromKWD(amountKWD, to)
  }

  // ============================================
  // FORMATTING
  // ============================================

  /**
   * Format price with correct decimals and symbol
   */
  formatPrice(amount: number, currency: string): string {
    const decimals = this.getCurrencyDecimals(currency)
    const formatted = amount.toFixed(decimals)

    const currencyKey = Object.keys(GCC_CURRENCIES).find(
      (k) => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currency
    ) as keyof typeof GCC_CURRENCIES | undefined

    if (!currencyKey) {
      return `${formatted} ${currency}`
    }

    const config = GCC_CURRENCIES[currencyKey]
    return `${formatted} ${config.symbol}`
  }

  /**
   * Get decimal places for currency
   */
  private getCurrencyDecimals(currency: string): number {
    const currencyKey = Object.keys(GCC_CURRENCIES).find(
      (k) => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currency
    ) as keyof typeof GCC_CURRENCIES | undefined

    return currencyKey ? GCC_CURRENCIES[currencyKey].decimals : 2
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    const currencyKey = Object.keys(GCC_CURRENCIES).find(
      (k) => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currency
    ) as keyof typeof GCC_CURRENCIES | undefined

    return currencyKey ? GCC_CURRENCIES[currencyKey].symbol : currency
  }

  // ============================================
  // PRICING
  // ============================================

  /**
   * Get localized pricing for a tier
   */
  getLocalizedPricing(
    tier: 'basic' | 'pro' | 'premium' | 'enterprise',
    interval: 'monthly' | 'annual' | 'weekly_trial',
    currency: string
  ) {
    const BASE_PRICES = {
      basic: { monthly: 22.99, annual: 229.90, weekly_trial: 1.0 },
      pro: { monthly: 37.50, annual: 375.00, weekly_trial: 0 },
      premium: { monthly: 58.75, annual: 587.50, weekly_trial: 0 },
      enterprise: { monthly: 74.50, annual: 745.00, weekly_trial: 0 },
    }

    const basePrice = BASE_PRICES[tier][interval]
    const localPrice = this.convertFromKWD(basePrice, currency)

    return {
      amount: localPrice,
      currency,
      formatted: this.formatPrice(localPrice, currency),
      baseKWD: basePrice,
    }
  }

  /**
   * Get all tier prices in a currency
   */
  getAllPrices(currency: string) {
    return {
      basic: {
        monthly: this.getLocalizedPricing('basic', 'monthly', currency),
        annual: this.getLocalizedPricing('basic', 'annual', currency),
        trial: this.getLocalizedPricing('basic', 'weekly_trial', currency),
      },
      pro: {
        monthly: this.getLocalizedPricing('pro', 'monthly', currency),
        annual: this.getLocalizedPricing('pro', 'annual', currency),
      },
      premium: {
        monthly: this.getLocalizedPricing('premium', 'monthly', currency),
        annual: this.getLocalizedPricing('premium', 'annual', currency),
      },
      enterprise: {
        monthly: this.getLocalizedPricing('enterprise', 'monthly', currency),
        annual: this.getLocalizedPricing('enterprise', 'annual', currency),
      },
    }
  }
}

// Singleton instance
export const currencyService = new CurrencyService()
