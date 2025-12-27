/**
 * GCC Countries Configuration
 *
 * Centralized configuration for all 6 Gulf Cooperation Council countries:
 * Kuwait, Saudi Arabia, UAE, Qatar, Bahrain, Oman
 *
 * Used by: GCC Components (VAT, Phone, Currency, Address, Invoice, Contact)
 */

export interface GCCCountryConfig {
  code: string
  nameEn: string
  nameAr: string
  currency: {
    code: string
    symbol: string
    symbolPosition: 'before' | 'after'
    decimals: number
    nameEn: string
    nameAr: string
  }
  vat: {
    rate: number // 0.15 = 15%
    nameEn: string
    nameAr: string
  }
  phone: {
    code: string
    digits: number
    pattern: RegExp
    placeholder: string
    exampleEn: string
    exampleAr: string
  }
  address: {
    hasState: boolean
    stateLabel?: string
    stateLabelAr?: string
    postalCodeRequired: boolean
    postalCodePattern?: RegExp
  }
  flag: string // Emoji
}

export const GCC_COUNTRIES: Record<string, GCCCountryConfig> = {
  KW: {
    code: 'KW',
    nameEn: 'Kuwait',
    nameAr: 'الكويت',
    currency: {
      code: 'KWD',
      symbol: 'د.ك',
      symbolPosition: 'after',
      decimals: 3,
      nameEn: 'Kuwaiti Dinar',
      nameAr: 'دينار كويتي',
    },
    vat: {
      rate: 0,
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+965',
      digits: 8,
      pattern: /^[569]\d{7}$/,
      placeholder: '5123 4567',
      exampleEn: '5123 4567',
      exampleAr: '٥١٢٣ ٤٥٦٧',
    },
    address: {
      hasState: true,
      stateLabel: 'Governorate',
      stateLabelAr: 'المحافظة',
      postalCodeRequired: true,
      postalCodePattern: /^\d{5}$/,
    },
    flag: '🇰🇼',
  },

  SA: {
    code: 'SA',
    nameEn: 'Saudi Arabia',
    nameAr: 'السعودية',
    currency: {
      code: 'SAR',
      symbol: 'ر.س',
      symbolPosition: 'after',
      decimals: 2,
      nameEn: 'Saudi Riyal',
      nameAr: 'ريال سعودي',
    },
    vat: {
      rate: 0.15, // 15%
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+966',
      digits: 9,
      pattern: /^5\d{8}$/,
      placeholder: '512 345 678',
      exampleEn: '512 345 678',
      exampleAr: '٥١٢ ٣٤٥ ٦٧٨',
    },
    address: {
      hasState: true,
      stateLabel: 'Region',
      stateLabelAr: 'المنطقة',
      postalCodeRequired: true,
      postalCodePattern: /^\d{5}$/,
    },
    flag: '🇸🇦',
  },

  AE: {
    code: 'AE',
    nameEn: 'United Arab Emirates',
    nameAr: 'الإمارات',
    currency: {
      code: 'AED',
      symbol: 'د.إ',
      symbolPosition: 'after',
      decimals: 2,
      nameEn: 'UAE Dirham',
      nameAr: 'درهم إماراتي',
    },
    vat: {
      rate: 0.05, // 5%
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+971',
      digits: 9,
      pattern: /^(50|51|52|54|55|56|58)\d{7}$/,
      placeholder: '50 123 4567',
      exampleEn: '50 123 4567',
      exampleAr: '٥٠ ١٢٣ ٤٥٦٧',
    },
    address: {
      hasState: true,
      stateLabel: 'Emirate',
      stateLabelAr: 'الإمارة',
      postalCodeRequired: false,
    },
    flag: '🇦🇪',
  },

  QA: {
    code: 'QA',
    nameEn: 'Qatar',
    nameAr: 'قطر',
    currency: {
      code: 'QAR',
      symbol: 'ر.ق',
      symbolPosition: 'after',
      decimals: 2,
      nameEn: 'Qatari Riyal',
      nameAr: 'ريال قطري',
    },
    vat: {
      rate: 0,
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+974',
      digits: 8,
      pattern: /^[3567]\d{7}$/,
      placeholder: '5512 3456',
      exampleEn: '5512 3456',
      exampleAr: '٥٥١٢ ٣٤٥٦',
    },
    address: {
      hasState: false,
      postalCodeRequired: false,
    },
    flag: '🇶🇦',
  },

  BH: {
    code: 'BH',
    nameEn: 'Bahrain',
    nameAr: 'البحرين',
    currency: {
      code: 'BHD',
      symbol: 'د.ب',
      symbolPosition: 'after',
      decimals: 3,
      nameEn: 'Bahraini Dinar',
      nameAr: 'دينار بحريني',
    },
    vat: {
      rate: 0.10, // 10%
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+973',
      digits: 8,
      pattern: /^(3|6)\d{7}$/,
      placeholder: '3612 3456',
      exampleEn: '3612 3456',
      exampleAr: '٣٦١٢ ٣٤٥٦',
    },
    address: {
      hasState: false,
      postalCodeRequired: true,
      postalCodePattern: /^\d{3,4}$/,
    },
    flag: '🇧🇭',
  },

  OM: {
    code: 'OM',
    nameEn: 'Oman',
    nameAr: 'عمان',
    currency: {
      code: 'OMR',
      symbol: 'ر.ع',
      symbolPosition: 'after',
      decimals: 3,
      nameEn: 'Omani Rial',
      nameAr: 'ريال عماني',
    },
    vat: {
      rate: 0.05, // 5%
      nameEn: 'VAT',
      nameAr: 'ضريبة القيمة المضافة',
    },
    phone: {
      code: '+968',
      digits: 8,
      pattern: /^(9|7)\d{7}$/,
      placeholder: '9123 4567',
      exampleEn: '9123 4567',
      exampleAr: '٩١٢٣ ٤٥٦٧',
    },
    address: {
      hasState: true,
      stateLabel: 'Region',
      stateLabelAr: 'المنطقة',
      postalCodeRequired: true,
      postalCodePattern: /^\d{3}$/,
    },
    flag: '🇴🇲',
  },
}

/**
 * Utility Functions
 */

/**
 * Format currency amount with correct decimals and symbol
 */
export function formatCurrency(
  amount: number,
  countryCode: string
): string {
  const config = GCC_COUNTRIES[countryCode]
  if (!config) return `${amount}`

  const { currency } = config
  const formatted = amount.toFixed(currency.decimals)

  if (currency.symbolPosition === 'after') {
    return `${formatted} ${currency.symbol}`
  }
  return `${currency.symbol} ${formatted}`
}

/**
 * Calculate VAT based on country
 */
export function calculateVAT(
  amount: number,
  countryCode: string
): { subtotal: number; vat: number; total: number } {
  const config = GCC_COUNTRIES[countryCode]
  if (!config) {
    return { subtotal: amount, vat: 0, total: amount }
  }

  const vat = amount * config.vat.rate
  const total = amount + vat

  return {
    subtotal: Number(amount.toFixed(config.currency.decimals)),
    vat: Number(vat.toFixed(config.currency.decimals)),
    total: Number(total.toFixed(config.currency.decimals)),
  }
}

/**
 * Validate phone number for a specific country
 */
export function validatePhone(
  phone: string,
  countryCode: string
): { valid: boolean; formatted?: string; error?: string } {
  const config = GCC_COUNTRIES[countryCode]
  if (!config) {
    return { valid: false, error: 'Invalid country code' }
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Check length
  if (cleaned.length !== config.phone.digits) {
    return {
      valid: false,
      error: `Phone number must be ${config.phone.digits} digits`,
    }
  }

  // Validate pattern
  if (!config.phone.pattern.test(cleaned)) {
    return {
      valid: false,
      error: `Invalid phone number format for ${config.nameEn}`,
    }
  }

  return {
    valid: true,
    formatted: `${config.phone.code} ${cleaned}`,
  }
}

/**
 * Get country by phone code
 */
export function getCountryByPhoneCode(phoneCode: string): GCCCountryConfig | null {
  return Object.values(GCC_COUNTRIES).find(
    (country) => country.phone.code === phoneCode
  ) || null
}

/**
 * Get country by currency code
 */
export function getCountryByCurrency(currencyCode: string): GCCCountryConfig | null {
  return Object.values(GCC_COUNTRIES).find(
    (country) => country.currency.code === currencyCode
  ) || null
}

/**
 * Get all countries as array
 */
export function getAllCountries(): GCCCountryConfig[] {
  return Object.values(GCC_COUNTRIES)
}

/**
 * Type exports for components
 */
export type CountryCode = keyof typeof GCC_COUNTRIES
export type CurrencyCode = 'KWD' | 'SAR' | 'AED' | 'QAR' | 'BHD' | 'OMR'
