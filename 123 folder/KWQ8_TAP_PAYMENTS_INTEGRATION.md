# 💳 KWQ8.COM TAP PAYMENTS INTEGRATION
## Comprehensive Payment System Specification
### Replacing UPayments with Tap Payments

---

# WHY TAP PAYMENTS

## Comparison: UPayments vs Tap Payments

| Feature | UPayments | Tap Payments | Winner |
|---------|-----------|--------------|--------|
| **GCC Coverage** | Kuwait only | KW, SA, AE, BH, OM, QA + EG, JO, LB | ✅ Tap |
| **Recurring/Subscriptions** | Limited | Native support | ✅ Tap |
| **Multi-Currency** | KWD only | 15+ currencies | ✅ Tap |
| **Auto Currency Detection** | ❌ No | ✅ Yes | ✅ Tap |
| **Payment Methods** | KNET, Cards | KNET, mada, Cards, Apple Pay, Google Pay | ✅ Tap |
| **Documentation** | Arabic | Arabic + English | ✅ Tap |
| **API Quality** | Good | Excellent (REST + SDKs) | ✅ Tap |
| **Webhook Support** | Basic | Comprehensive | ✅ Tap |
| **PCI Compliance** | Level 1 | Level 1 | Tie |
| **Pricing** | ~2.5% | ~2.75% | UPayments |

**Decision: Tap Payments** - Superior GCC coverage, native subscriptions, multi-currency support justifies slightly higher fees.

---

# TAP PAYMENTS OVERVIEW

## Supported Countries & Payment Methods

| Country | Currency | Local Methods | Cards |
|---------|----------|---------------|-------|
| 🇰🇼 Kuwait | KWD | KNET | ✅ |
| 🇸🇦 Saudi Arabia | SAR | mada, STC Pay | ✅ |
| 🇦🇪 UAE | AED | - | ✅ |
| 🇶🇦 Qatar | QAR | - | ✅ |
| 🇧🇭 Bahrain | BHD | Benefit | ✅ |
| 🇴🇲 Oman | OMR | - | ✅ |
| 🇪🇬 Egypt | EGP | Fawry | ✅ |
| 🇯🇴 Jordan | JOD | - | ✅ |

## Supported Payment Methods

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT METHODS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CARDS                                                          │
│  ├── Visa                                                       │
│  ├── Mastercard                                                 │
│  ├── American Express                                           │
│  └── Mada (Saudi debit)                                         │
│                                                                 │
│  LOCAL METHODS                                                  │
│  ├── KNET (Kuwait)                                              │
│  ├── mada (Saudi Arabia)                                        │
│  ├── Benefit (Bahrain)                                          │
│  ├── STC Pay (Saudi Arabia)                                     │
│  └── Fawry (Egypt)                                              │
│                                                                 │
│  WALLETS                                                        │
│  ├── Apple Pay                                                  │
│  └── Google Pay                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   KWQ8      │    │    Tap      │    │   Banks     │         │
│  │  Frontend   │───▶│  Checkout   │───▶│   KNET     │         │
│  │             │    │   (goSell)  │    │   mada     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                                    │
│         │                  │                                    │
│         ▼                  ▼                                    │
│  ┌─────────────┐    ┌─────────────┐                            │
│  │   KWQ8      │◀───│    Tap      │                            │
│  │  Backend    │    │  Webhooks   │                            │
│  │             │    │             │                            │
│  └─────────────┘    └─────────────┘                            │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │  Supabase   │                                               │
│  │  Database   │                                               │
│  └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Components

| Component | Purpose |
|-----------|---------|
| **goSell.js** | Tap's JavaScript SDK for checkout |
| **Tap API** | Backend API for subscriptions, refunds |
| **Webhooks** | Real-time payment notifications |
| **Currency Service** | Auto-detection and conversion |

---

# AUTO-CURRENCY SYSTEM

## Currency Detection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 AUTO-CURRENCY DETECTION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Visits KWQ8.com                                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                       │
│  │ 1. Check IP Geolocation             │                       │
│  │    (Cloudflare/MaxMind)             │                       │
│  └─────────────────────────────────────┘                       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                       │
│  │ 2. Map Country → Currency           │                       │
│  │    KW → KWD, SA → SAR, AE → AED     │                       │
│  └─────────────────────────────────────┘                       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                       │
│  │ 3. Store in Session/Cookie          │                       │
│  │    + Allow Manual Override          │                       │
│  └─────────────────────────────────────┘                       │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                       │
│  │ 4. Display Prices in Local Currency │                       │
│  │    All UI updates automatically     │                       │
│  └─────────────────────────────────────┘                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Currency Configuration

```typescript
// lib/currency/config.ts

export const GCC_CURRENCIES = {
  KW: {
    code: 'KWD',
    symbol: 'د.ك',
    symbolPosition: 'after', // 23.000 د.ك
    decimals: 3,
    name: 'دينار كويتي',
    nameEn: 'Kuwaiti Dinar',
  },
  SA: {
    code: 'SAR',
    symbol: 'ر.س',
    symbolPosition: 'after',
    decimals: 2,
    name: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
  },
  AE: {
    code: 'AED',
    symbol: 'د.إ',
    symbolPosition: 'after',
    decimals: 2,
    name: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
  },
  QA: {
    code: 'QAR',
    symbol: 'ر.ق',
    symbolPosition: 'after',
    decimals: 2,
    name: 'ريال قطري',
    nameEn: 'Qatari Riyal',
  },
  BH: {
    code: 'BHD',
    symbol: 'د.ب',
    symbolPosition: 'after',
    decimals: 3,
    name: 'دينار بحريني',
    nameEn: 'Bahraini Dinar',
  },
  OM: {
    code: 'OMR',
    symbol: 'ر.ع',
    symbolPosition: 'after',
    decimals: 3,
    name: 'ريال عماني',
    nameEn: 'Omani Rial',
  },
} as const;

// Base prices in KWD (multiply by exchange rate)
export const BASE_PRICES_KWD = {
  basic: 22.99,
  pro: 37.50,
  premium: 58.75,
  enterprise: 74.50,
};

// Exchange rates (updated daily via API)
export const DEFAULT_EXCHANGE_RATES = {
  KWD: 1.00,
  SAR: 12.20,  // 1 KWD ≈ 12.20 SAR
  AED: 11.95,  // 1 KWD ≈ 11.95 AED
  QAR: 11.85,  // 1 KWD ≈ 11.85 QAR
  BHD: 1.23,   // 1 KWD ≈ 1.23 BHD
  OMR: 1.25,   // 1 KWD ≈ 1.25 OMR
};
```

## Currency Service Implementation

```typescript
// lib/currency/service.ts

import { GCC_CURRENCIES, BASE_PRICES_KWD, DEFAULT_EXCHANGE_RATES } from './config';

export class CurrencyService {
  private exchangeRates: Record<string, number> = DEFAULT_EXCHANGE_RATES;
  private lastUpdated: Date | null = null;

  constructor() {
    this.refreshRates();
  }

  // Refresh exchange rates from API (daily)
  async refreshRates(): Promise<void> {
    try {
      // Use exchangerate-api.com or similar
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/KWD`
      );
      const data = await response.json();
      
      if (data.result === 'success') {
        this.exchangeRates = {
          KWD: 1,
          SAR: data.conversion_rates.SAR,
          AED: data.conversion_rates.AED,
          QAR: data.conversion_rates.QAR,
          BHD: data.conversion_rates.BHD,
          OMR: data.conversion_rates.OMR,
        };
        this.lastUpdated = new Date();
        
        // Cache in database
        await this.cacheRates();
      }
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      // Fall back to defaults
    }
  }

  // Detect currency from country code
  detectCurrency(countryCode: string): string {
    const currency = GCC_CURRENCIES[countryCode as keyof typeof GCC_CURRENCIES];
    return currency?.code || 'KWD'; // Default to KWD
  }

  // Convert price from KWD to target currency
  convert(amountKWD: number, targetCurrency: string): number {
    const rate = this.exchangeRates[targetCurrency] || 1;
    const converted = amountKWD * rate;
    
    // Round to appropriate decimals
    const decimals = GCC_CURRENCIES[
      Object.keys(GCC_CURRENCIES).find(
        k => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === targetCurrency
      ) as keyof typeof GCC_CURRENCIES
    ]?.decimals || 2;
    
    return Number(converted.toFixed(decimals));
  }

  // Format price for display
  formatPrice(amount: number, currencyCode: string): string {
    const currencyKey = Object.keys(GCC_CURRENCIES).find(
      k => GCC_CURRENCIES[k as keyof typeof GCC_CURRENCIES].code === currencyCode
    ) as keyof typeof GCC_CURRENCIES;
    
    const config = GCC_CURRENCIES[currencyKey];
    if (!config) return `${amount} ${currencyCode}`;
    
    const formatted = amount.toFixed(config.decimals);
    
    if (config.symbolPosition === 'after') {
      return `${formatted} ${config.symbol}`;
    }
    return `${config.symbol} ${formatted}`;
  }

  // Get localized pricing for a tier
  getLocalizedPricing(tier: keyof typeof BASE_PRICES_KWD, currencyCode: string) {
    const basePrice = BASE_PRICES_KWD[tier];
    const localPrice = this.convert(basePrice, currencyCode);
    
    return {
      amount: localPrice,
      currency: currencyCode,
      formatted: this.formatPrice(localPrice, currencyCode),
      baseKWD: basePrice,
    };
  }

  // Get all tier prices in a currency
  getAllPrices(currencyCode: string) {
    return {
      basic: this.getLocalizedPricing('basic', currencyCode),
      pro: this.getLocalizedPricing('pro', currencyCode),
      premium: this.getLocalizedPricing('premium', currencyCode),
      enterprise: this.getLocalizedPricing('enterprise', currencyCode),
    };
  }

  private async cacheRates(): Promise<void> {
    // Store in Supabase for persistence
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('exchange_rates').upsert({
      id: 1,
      rates: this.exchangeRates,
      updated_at: new Date().toISOString(),
    });
  }
}

export const currencyService = new CurrencyService();
```

## Auto-Detection Hook

```typescript
// hooks/useCurrency.ts

import { useState, useEffect } from 'react';
import { currencyService } from '@/lib/currency/service';
import { GCC_CURRENCIES } from '@/lib/currency/config';

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('KWD');
  const [country, setCountry] = useState<string>('KW');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    detectCurrency();
  }, []);

  const detectCurrency = async () => {
    setIsLoading(true);
    
    try {
      // Check localStorage first (user preference)
      const savedCurrency = localStorage.getItem('kwq8_currency');
      const savedCountry = localStorage.getItem('kwq8_country');
      
      if (savedCurrency && savedCountry) {
        setCurrency(savedCurrency);
        setCountry(savedCountry);
        setIsLoading(false);
        return;
      }
      
      // Detect from IP (using Cloudflare headers or API)
      const response = await fetch('/api/geo/detect');
      const { countryCode } = await response.json();
      
      // Map to currency
      const detectedCurrency = currencyService.detectCurrency(countryCode);
      
      setCurrency(detectedCurrency);
      setCountry(countryCode);
      
      // Save preference
      localStorage.setItem('kwq8_currency', detectedCurrency);
      localStorage.setItem('kwq8_country', countryCode);
      
    } catch (error) {
      console.error('Currency detection failed:', error);
      // Default to KWD
      setCurrency('KWD');
      setCountry('KW');
    }
    
    setIsLoading(false);
  };

  const changeCurrency = (newCurrency: string, newCountry: string) => {
    setCurrency(newCurrency);
    setCountry(newCountry);
    localStorage.setItem('kwq8_currency', newCurrency);
    localStorage.setItem('kwq8_country', newCountry);
  };

  const formatPrice = (amountKWD: number) => {
    const localAmount = currencyService.convert(amountKWD, currency);
    return currencyService.formatPrice(localAmount, currency);
  };

  const getAllPrices = () => {
    return currencyService.getAllPrices(currency);
  };

  return {
    currency,
    country,
    isLoading,
    changeCurrency,
    formatPrice,
    getAllPrices,
    currencyConfig: GCC_CURRENCIES[country as keyof typeof GCC_CURRENCIES],
  };
}
```

## Currency Selector Component

```tsx
// components/CurrencySelector.tsx

'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { GCC_CURRENCIES } from '@/lib/currency/config';

export function CurrencySelector() {
  const { currency, country, changeCurrency } = useCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    const newCurrency = GCC_CURRENCIES[selectedCountry as keyof typeof GCC_CURRENCIES].code;
    changeCurrency(newCurrency, selectedCountry);
  };

  return (
    <div className="relative">
      <select
        value={country}
        onChange={handleChange}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 
                   dark:border-gray-600 rounded-lg px-4 py-2 pe-10 text-sm
                   focus:ring-2 focus:ring-primary focus:border-transparent"
        dir="rtl"
      >
        {Object.entries(GCC_CURRENCIES).map(([code, config]) => (
          <option key={code} value={code}>
            {config.name} ({config.code})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <span className="text-lg">{getFlagEmoji(country)}</span>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    KW: '🇰🇼',
    SA: '🇸🇦',
    AE: '🇦🇪',
    QA: '🇶🇦',
    BH: '🇧🇭',
    OM: '🇴🇲',
  };
  return flags[countryCode] || '🌍';
}
```

---

# RECURRING PAYMENTS (SUBSCRIPTIONS)

## Tap Subscription API

Tap Payments has native subscription support. Here's the implementation:

## Subscription Plans Configuration

```typescript
// lib/tap/plans.ts

export interface TapPlan {
  id: string;
  name: string;
  nameAr: string;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  trialDays: number;
  amount: number; // In smallest currency unit
  currency: string;
}

export const SUBSCRIPTION_PLANS: Record<string, TapPlan> = {
  // Basic Monthly
  basic_monthly_kwd: {
    id: 'plan_basic_monthly_kwd',
    name: 'Basic Monthly',
    nameAr: 'الباقة الأساسية - شهري',
    interval: 'month',
    intervalCount: 1,
    trialDays: 7,
    amount: 22990, // 22.990 KWD in fils
    currency: 'KWD',
  },
  
  // Basic Annual
  basic_annual_kwd: {
    id: 'plan_basic_annual_kwd',
    name: 'Basic Annual',
    nameAr: 'الباقة الأساسية - سنوي',
    interval: 'year',
    intervalCount: 1,
    trialDays: 7,
    amount: 229900, // 229.900 KWD (2 months free)
    currency: 'KWD',
  },
  
  // Pro Monthly
  pro_monthly_kwd: {
    id: 'plan_pro_monthly_kwd',
    name: 'Pro Monthly',
    nameAr: 'الباقة الاحترافية - شهري',
    interval: 'month',
    intervalCount: 1,
    trialDays: 0, // No trial for Pro
    amount: 37500,
    currency: 'KWD',
  },
  
  // Pro Annual
  pro_annual_kwd: {
    id: 'plan_pro_annual_kwd',
    name: 'Pro Annual',
    nameAr: 'الباقة الاحترافية - سنوي',
    interval: 'year',
    intervalCount: 1,
    trialDays: 0,
    amount: 375000, // 2 months free
    currency: 'KWD',
  },
  
  // Premium Monthly
  premium_monthly_kwd: {
    id: 'plan_premium_monthly_kwd',
    name: 'Premium Monthly',
    nameAr: 'الباقة المميزة - شهري',
    interval: 'month',
    intervalCount: 1,
    trialDays: 0,
    amount: 58750,
    currency: 'KWD',
  },
  
  // Premium Annual
  premium_annual_kwd: {
    id: 'plan_premium_annual_kwd',
    name: 'Premium Annual',
    nameAr: 'الباقة المميزة - سنوي',
    interval: 'year',
    intervalCount: 1,
    trialDays: 0,
    amount: 587500,
    currency: 'KWD',
  },
  
  // Enterprise Monthly
  enterprise_monthly_kwd: {
    id: 'plan_enterprise_monthly_kwd',
    name: 'Enterprise Monthly',
    nameAr: 'باقة المؤسسات - شهري',
    interval: 'month',
    intervalCount: 1,
    trialDays: 0,
    amount: 74500,
    currency: 'KWD',
  },
  
  // Enterprise Annual
  enterprise_annual_kwd: {
    id: 'plan_enterprise_annual_kwd',
    name: 'Enterprise Annual',
    nameAr: 'باقة المؤسسات - سنوي',
    interval: 'year',
    intervalCount: 1,
    trialDays: 0,
    amount: 745000,
    currency: 'KWD',
  },
  
  // Trial Plan (1 KWD/week)
  trial_weekly_kwd: {
    id: 'plan_trial_weekly_kwd',
    name: 'Trial',
    nameAr: 'الفترة التجريبية',
    interval: 'week',
    intervalCount: 1,
    trialDays: 0,
    amount: 1000, // 1.000 KWD
    currency: 'KWD',
  },
};
```

## Tap Subscription Service

```typescript
// lib/tap/subscriptions.ts

import { SUBSCRIPTION_PLANS } from './plans';

const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY!;
const TAP_API_URL = 'https://api.tap.company/v2';

interface CreateSubscriptionParams {
  customerId: string;
  planId: string;
  email: string;
  phone?: string;
  metadata?: Record<string, string>;
}

interface TapSubscription {
  id: string;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' | 'PAUSED';
  current_period_start: string;
  current_period_end: string;
  plan: {
    id: string;
    amount: number;
    currency: string;
    interval: string;
  };
  customer: {
    id: string;
    email: string;
  };
}

export class TapSubscriptionService {
  private headers = {
    'Authorization': `Bearer ${TAP_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  // Create a new subscription
  async createSubscription(params: CreateSubscriptionParams): Promise<TapSubscription> {
    const plan = SUBSCRIPTION_PLANS[params.planId];
    if (!plan) throw new Error(`Plan not found: ${params.planId}`);

    const response = await fetch(`${TAP_API_URL}/subscriptions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        term: {
          interval: plan.interval,
          period: plan.intervalCount,
          from: new Date().toISOString(),
          due: 0, // Due immediately
          auto_renew: true,
        },
        trial: plan.trialDays > 0 ? {
          days: plan.trialDays,
        } : undefined,
        charge: {
          amount: plan.amount / 1000, // Convert from fils to KWD
          currency: plan.currency,
          description: `KWQ8 ${plan.name}`,
          receipt: {
            email: true,
            sms: !!params.phone,
          },
          metadata: {
            ...params.metadata,
            plan_id: params.planId,
            kwq8_plan: plan.name,
          },
        },
        customer: {
          id: params.customerId,
          // Or create new customer inline:
          // email: params.email,
          // phone: { country_code: '965', number: params.phone },
        },
        post: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/tap/subscription`,
        },
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Tap API error: ${error.message}`);
    }

    return response.json();
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_API_URL}/subscriptions/${subscriptionId}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    return response.json();
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<TapSubscription> {
    const response = await fetch(`${TAP_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: this.headers,
      body: JSON.stringify({
        cancel_at_period_end: cancelAtPeriodEnd,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return response.json();
  }

  // Upgrade/Downgrade subscription
  async updateSubscription(subscriptionId: string, newPlanId: string): Promise<TapSubscription> {
    const plan = SUBSCRIPTION_PLANS[newPlanId];
    if (!plan) throw new Error(`Plan not found: ${newPlanId}`);

    const response = await fetch(`${TAP_API_URL}/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        charge: {
          amount: plan.amount / 1000,
          currency: plan.currency,
        },
        term: {
          interval: plan.interval,
          period: plan.intervalCount,
        },
        prorate: true, // Prorate the charge
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update subscription');
    }

    return response.json();
  }

  // Pause subscription
  async pauseSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_API_URL}/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to pause subscription');
    }

    return response.json();
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string): Promise<TapSubscription> {
    const response = await fetch(`${TAP_API_URL}/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error('Failed to resume subscription');
    }

    return response.json();
  }

  // List customer subscriptions
  async listSubscriptions(customerId: string): Promise<TapSubscription[]> {
    const response = await fetch(
      `${TAP_API_URL}/subscriptions?customer=${customerId}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error('Failed to list subscriptions');
    }

    const data = await response.json();
    return data.subscriptions || [];
  }

  // Retry failed payment
  async retryPayment(subscriptionId: string): Promise<void> {
    const response = await fetch(
      `${TAP_API_URL}/subscriptions/${subscriptionId}/retry`,
      {
        method: 'POST',
        headers: this.headers,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to retry payment');
    }
  }
}

export const tapSubscriptionService = new TapSubscriptionService();
```

## Subscription Webhook Handler

```typescript
// app/api/webhooks/tap/subscription/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TAP_WEBHOOK_SECRET = process.env.TAP_WEBHOOK_SECRET!;

// Verify Tap webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', TAP_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('tap-signature') || '';

    // Verify webhook authenticity
    if (!verifySignature(payload, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const { id: eventId, type, data } = event;

    console.log(`Processing Tap webhook: ${type}`, { eventId });

    // Handle different event types
    switch (type) {
      case 'SUBSCRIPTION_CREATED':
        await handleSubscriptionCreated(data);
        break;
        
      case 'SUBSCRIPTION_ACTIVATED':
        await handleSubscriptionActivated(data);
        break;
        
      case 'SUBSCRIPTION_RENEWED':
        await handleSubscriptionRenewed(data);
        break;
        
      case 'SUBSCRIPTION_CANCELLED':
        await handleSubscriptionCancelled(data);
        break;
        
      case 'SUBSCRIPTION_PAUSED':
        await handleSubscriptionPaused(data);
        break;
        
      case 'SUBSCRIPTION_RESUMED':
        await handleSubscriptionResumed(data);
        break;
        
      case 'INVOICE_PAID':
        await handleInvoicePaid(data);
        break;
        
      case 'INVOICE_PAYMENT_FAILED':
        await handlePaymentFailed(data);
        break;
        
      case 'SUBSCRIPTION_TRIAL_ENDING':
        await handleTrialEnding(data);
        break;
        
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    // Log webhook event
    await supabase.from('webhook_events').insert({
      provider: 'tap',
      event_id: eventId,
      event_type: type,
      payload: event,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleSubscriptionCreated(data: any) {
  const { id, customer, metadata } = data;
  
  await supabase.from('subscriptions').insert({
    tap_subscription_id: id,
    user_id: metadata.user_id,
    plan_id: metadata.plan_id,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

async function handleSubscriptionActivated(data: any) {
  const { id, current_period_start, current_period_end, charge } = data;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: current_period_start,
      current_period_end: current_period_end,
      amount: charge.amount,
      currency: charge.currency,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id);

  // Grant credits to user
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('tap_subscription_id', id)
    .single();

  if (subscription) {
    await grantCredits(subscription.user_id, subscription.plan_id);
  }
}

async function handleSubscriptionRenewed(data: any) {
  const { id, current_period_start, current_period_end } = data;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: current_period_start,
      current_period_end: current_period_end,
      renewal_count: supabase.rpc('increment', { x: 1 }),
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id);

  // Refresh credits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('tap_subscription_id', id)
    .single();

  if (subscription) {
    await refreshCredits(subscription.user_id, subscription.plan_id);
  }
}

async function handleSubscriptionCancelled(data: any) {
  const { id, cancel_at_period_end, cancelled_at } = data;
  
  await supabase
    .from('subscriptions')
    .update({
      status: cancel_at_period_end ? 'cancelling' : 'cancelled',
      cancelled_at: cancelled_at,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id);
}

async function handleSubscriptionPaused(data: any) {
  const { id } = data;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id);
}

async function handleSubscriptionResumed(data: any) {
  const { id, current_period_end } = data;
  
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_end: current_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', id);
}

async function handleInvoicePaid(data: any) {
  const { id, subscription, amount, currency } = data;
  
  await supabase.from('billing_events').insert({
    tap_invoice_id: id,
    tap_subscription_id: subscription?.id,
    type: 'payment_success',
    amount: amount,
    currency: currency,
    created_at: new Date().toISOString(),
  });
}

async function handlePaymentFailed(data: any) {
  const { id, subscription, failure_reason } = data;
  
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('tap_subscription_id', subscription?.id);

  // Log failure
  await supabase.from('billing_events').insert({
    tap_invoice_id: id,
    tap_subscription_id: subscription?.id,
    type: 'payment_failed',
    failure_reason: failure_reason,
    created_at: new Date().toISOString(),
  });

  // Trigger retry logic (3 attempts over 7 days)
  await schedulePaymentRetry(subscription?.id);
}

async function handleTrialEnding(data: any) {
  const { id, trial_end, customer } = data;
  
  // Send reminder email to user
  await supabase.from('email_queue').insert({
    template: 'trial_ending',
    recipient_email: customer.email,
    data: {
      trial_end: trial_end,
      subscription_id: id,
    },
    scheduled_for: new Date().toISOString(),
  });
}

// Helper functions
async function grantCredits(userId: string, planId: string) {
  const creditAllocation: Record<string, number> = {
    basic_monthly_kwd: 3000,    // 100/day × 30
    basic_annual_kwd: 36500,    // 100/day × 365
    pro_monthly_kwd: 6000,      // 200/day × 30
    pro_annual_kwd: 73000,      // 200/day × 365
    premium_monthly_kwd: 12000, // 400/day × 30
    premium_annual_kwd: 146000, // 400/day × 365
    enterprise_monthly_kwd: 24000, // 800/day × 30
    enterprise_annual_kwd: 292000, // 800/day × 365
    trial_weekly_kwd: 700,      // 100/day × 7
  };

  const credits = creditAllocation[planId] || 3000;

  await supabase.from('user_credits').upsert({
    user_id: userId,
    total_credits: credits,
    used_credits: 0,
    updated_at: new Date().toISOString(),
  });
}

async function refreshCredits(userId: string, planId: string) {
  // Reset used credits for new billing period
  await supabase
    .from('user_credits')
    .update({
      used_credits: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

async function schedulePaymentRetry(subscriptionId: string) {
  // Schedule retry attempts: Day 1, Day 3, Day 7
  const retryDays = [1, 3, 7];
  
  for (const days of retryDays) {
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + days);
    
    await supabase.from('scheduled_tasks').insert({
      type: 'payment_retry',
      data: { subscription_id: subscriptionId },
      scheduled_for: retryDate.toISOString(),
    });
  }
}
```

---

# ONE-TIME PAYMENTS

## goSell.js Integration (Checkout)

```typescript
// lib/tap/checkout.ts

declare global {
  interface Window {
    goSell: any;
  }
}

interface CheckoutConfig {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export function initTapCheckout(config: CheckoutConfig) {
  if (typeof window === 'undefined' || !window.goSell) {
    console.error('goSell not loaded');
    return;
  }

  window.goSell.config({
    containerID: 'tap-checkout-container',
    gateway: {
      publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY,
      language: 'ar', // Arabic UI
      supportedCurrencies: ['KWD', 'SAR', 'AED', 'QAR', 'BHD', 'OMR'],
      supportedPaymentMethods: ['all'],
      saveCardOption: true,
      customerCards: {
        saveCard: true,
        autoSaveCard: false,
      },
      callback: (response: any) => {
        if (response.status === 'CAPTURED') {
          config.onSuccess(response);
        } else {
          config.onError(response);
        }
      },
      onClose: config.onClose,
      labels: {
        cardNumber: 'رقم البطاقة',
        expirationDate: 'تاريخ الانتهاء',
        cvv: 'رمز الأمان',
        cardHolder: 'اسم حامل البطاقة',
      },
      style: {
        base: {
          color: '#1a1a1a',
          lineHeight: '24px',
          fontFamily: 'Cairo, Tajawal, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    },
    customer: {
      email: config.customerEmail,
      phone: config.customerPhone ? {
        country_code: '965',
        number: config.customerPhone,
      } : undefined,
    },
    order: {
      amount: config.amount,
      currency: config.currency,
      description: config.description,
      metadata: config.metadata || {},
    },
    transaction: {
      mode: 'charge', // or 'authorize' for holding funds
      charge: {
        auto: {
          type: 'VOID',
          time: 100,
        },
      },
    },
  });

  window.goSell.openLightBox();
}
```

## Checkout Component

```tsx
// components/payments/TapCheckout.tsx

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { initTapCheckout } from '@/lib/tap/checkout';
import { useCurrency } from '@/hooks/useCurrency';

interface TapCheckoutProps {
  planId: string;
  planName: string;
  amount: number; // in KWD
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export function TapCheckout({ planId, planName, amount, onSuccess, onCancel }: TapCheckoutProps) {
  const { currency, formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [goSellLoaded, setGoSellLoaded] = useState(false);

  const localAmount = useCurrency().currencyService?.convert(amount, currency) || amount;

  const handleCheckout = () => {
    if (!goSellLoaded) {
      alert('جاري تحميل نظام الدفع، يرجى الانتظار');
      return;
    }

    setIsLoading(true);

    initTapCheckout({
      amount: localAmount,
      currency: currency,
      description: `اشتراك KWQ8 - ${planName}`,
      customerEmail: 'user@example.com', // Get from auth
      metadata: {
        plan_id: planId,
        platform: 'kwq8',
      },
      onSuccess: (response) => {
        setIsLoading(false);
        onSuccess(response.id);
      },
      onError: (error) => {
        setIsLoading(false);
        console.error('Payment failed:', error);
        alert('فشل الدفع. يرجى المحاولة مرة أخرى.');
      },
      onClose: () => {
        setIsLoading(false);
        onCancel();
      },
    });
  };

  return (
    <>
      <Script
        src="https://goSellSDK.b-cdn.net/v2.0.0/js/gosell.js"
        onLoad={() => setGoSellLoaded(true)}
      />
      
      <div className="space-y-4" dir="rtl">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">الخطة:</span>
            <span className="font-semibold">{planName}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 dark:text-gray-400">المبلغ:</span>
            <span className="font-bold text-xl text-primary">
              {formatPrice(amount)}
            </span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isLoading || !goSellLoaded}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold 
                     py-4 px-6 rounded-xl transition-all disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>جاري المعالجة...</span>
            </>
          ) : (
            <>
              <span>الدفع الآن</span>
              <span>💳</span>
            </>
          )}
        </button>

        <div id="tap-checkout-container" />

        <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
          <span>مدعوم بواسطة</span>
          <img src="/images/tap-logo.svg" alt="Tap Payments" className="h-6" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <img src="/images/visa.svg" alt="Visa" className="h-6" />
          <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" />
          <img src="/images/knet.svg" alt="KNET" className="h-6" />
          <img src="/images/mada.svg" alt="mada" className="h-6" />
          <img src="/images/applepay.svg" alt="Apple Pay" className="h-6" />
        </div>
      </div>
    </>
  );
}
```

---

# DATABASE SCHEMA

## Subscriptions Table

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tap_subscription_id TEXT UNIQUE,
  tap_customer_id TEXT,
  
  -- Plan info
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'trialing', 'past_due', 
                      'paused', 'cancelling', 'cancelled', 'expired')),
  
  -- Billing
  amount DECIMAL(10, 3) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KWD',
  billing_interval TEXT NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('week', 'month', 'year')),
  
  -- Periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,
  
  -- Metadata
  renewal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tap_id ON subscriptions(tap_subscription_id);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

## Billing Events Table

```sql
-- Billing events table
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Tap references
  tap_invoice_id TEXT,
  tap_subscription_id TEXT,
  tap_charge_id TEXT,
  
  -- Event details
  type TEXT NOT NULL
    CHECK (type IN ('subscription_created', 'subscription_activated', 
                    'subscription_renewed', 'subscription_cancelled',
                    'payment_success', 'payment_failed', 'refund',
                    'trial_started', 'trial_ended', 'plan_changed')),
  
  -- Financial
  amount DECIMAL(10, 3),
  currency TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending',
  failure_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_billing_events_user ON billing_events(user_id);
CREATE INDEX idx_billing_events_subscription ON billing_events(subscription_id);
CREATE INDEX idx_billing_events_type ON billing_events(type);
CREATE INDEX idx_billing_events_created ON billing_events(created_at DESC);

-- RLS
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing events"
  ON billing_events FOR SELECT
  USING (auth.uid() = user_id);
```

## Exchange Rates Table

```sql
-- Exchange rates table
CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY DEFAULT 1,
  base_currency TEXT DEFAULT 'KWD',
  rates JSONB NOT NULL DEFAULT '{
    "KWD": 1,
    "SAR": 12.20,
    "AED": 11.95,
    "QAR": 11.85,
    "BHD": 1.23,
    "OMR": 1.25
  }',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO exchange_rates (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
```

## Webhook Events Table

```sql
-- Webhook events table (for debugging/audit)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'tap', 'namecheap', etc.
  event_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for debugging
CREATE INDEX idx_webhook_events_provider ON webhook_events(provider, event_type);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);
```

---

# PAYMENT RETRY LOGIC

## Dunning Management

```typescript
// lib/tap/dunning.ts

import { tapSubscriptionService } from './subscriptions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DunningConfig {
  maxRetries: number;
  retryIntervals: number[]; // Days between retries
  gracePeriodDays: number;
}

const DUNNING_CONFIG: DunningConfig = {
  maxRetries: 3,
  retryIntervals: [1, 3, 7], // Retry on day 1, 3, 7
  gracePeriodDays: 10,
};

export class DunningService {
  // Process failed payment
  async handleFailedPayment(subscriptionId: string, attemptNumber: number) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, users(email, name)')
      .eq('tap_subscription_id', subscriptionId)
      .single();

    if (!subscription) return;

    // Send email based on attempt number
    const emailTemplates = {
      1: 'payment_failed_first',
      2: 'payment_failed_second',
      3: 'payment_failed_final',
    };

    await this.sendDunningEmail(
      subscription.users.email,
      emailTemplates[attemptNumber as keyof typeof emailTemplates] || 'payment_failed_first',
      {
        name: subscription.users.name,
        amount: subscription.amount,
        currency: subscription.currency,
        retryDate: this.getNextRetryDate(attemptNumber),
        updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/payment-method`,
      }
    );

    // Schedule next retry if not exhausted
    if (attemptNumber < DUNNING_CONFIG.maxRetries) {
      await this.scheduleRetry(subscriptionId, attemptNumber + 1);
    } else {
      // Cancel subscription after max retries
      await this.cancelAfterDunning(subscriptionId);
    }
  }

  // Retry payment
  async retryPayment(subscriptionId: string, attemptNumber: number) {
    try {
      await tapSubscriptionService.retryPayment(subscriptionId);
      console.log(`Payment retry ${attemptNumber} succeeded for ${subscriptionId}`);
    } catch (error) {
      console.error(`Payment retry ${attemptNumber} failed for ${subscriptionId}:`, error);
      await this.handleFailedPayment(subscriptionId, attemptNumber);
    }
  }

  // Schedule retry
  private async scheduleRetry(subscriptionId: string, attemptNumber: number) {
    const retryDate = this.getNextRetryDate(attemptNumber);
    
    await supabase.from('scheduled_tasks').insert({
      type: 'payment_retry',
      data: { 
        subscription_id: subscriptionId,
        attempt_number: attemptNumber,
      },
      scheduled_for: retryDate.toISOString(),
    });
  }

  // Get next retry date
  private getNextRetryDate(attemptNumber: number): Date {
    const daysUntilRetry = DUNNING_CONFIG.retryIntervals[attemptNumber - 1] || 7;
    const retryDate = new Date();
    retryDate.setDate(retryDate.getDate() + daysUntilRetry);
    return retryDate;
  }

  // Cancel subscription after dunning exhausted
  private async cancelAfterDunning(subscriptionId: string) {
    await tapSubscriptionService.cancelSubscription(subscriptionId, false);
    
    // Update local status
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancellation_reason: 'payment_failed_dunning_exhausted',
        cancelled_at: new Date().toISOString(),
      })
      .eq('tap_subscription_id', subscriptionId);

    // Send final cancellation email
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, users(email, name)')
      .eq('tap_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      await this.sendDunningEmail(
        subscription.users.email,
        'subscription_cancelled_payment_failed',
        {
          name: subscription.users.name,
          reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        }
      );
    }
  }

  // Send dunning email
  private async sendDunningEmail(
    email: string, 
    template: string, 
    data: Record<string, any>
  ) {
    await supabase.from('email_queue').insert({
      template: template,
      recipient_email: email,
      data: data,
      scheduled_for: new Date().toISOString(),
    });
  }
}

export const dunningService = new DunningService();
```

---

# ENVIRONMENT VARIABLES

```env
# Tap Payments
TAP_SECRET_KEY=sk_live_xxxxxxxxxxxxxx
NEXT_PUBLIC_TAP_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxx
TAP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx

# Exchange Rate API
EXCHANGE_API_KEY=xxxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://kwq8.com
```

---

# IMPLEMENTATION TIMELINE

## Sprint 7 (Updated): Tap Payments Integration

| # | Task | Owner | Hours | Status |
|---|------|-------|-------|--------|
| 7.1 | Remove UPayments code | Backend | 2 | ⬜ |
| 7.2 | Integrate Tap Payments SDK | Backend | 8 | ⬜ |
| 7.3 | Implement currency detection | Backend | 4 | ⬜ |
| 7.4 | Build currency service | Backend | 6 | ⬜ |
| 7.5 | Create subscription plans | Backend | 4 | ⬜ |
| 7.6 | Implement subscription webhooks | Backend | 8 | ⬜ |
| 7.7 | Build dunning/retry system | Backend | 6 | ⬜ |
| 7.8 | Create checkout component | Frontend | 6 | ⬜ |
| 7.9 | Add currency selector | Frontend | 2 | ⬜ |
| 7.10 | Update pricing page | Frontend | 4 | ⬜ |
| 7.11 | Test all GCC currencies | QA | 4 | ⬜ |

**Total: 54 hours**

---

# TESTING CHECKLIST

## Currency Tests

- [ ] Auto-detect Kuwait IP → KWD displayed
- [ ] Auto-detect Saudi IP → SAR displayed
- [ ] Manual currency switch works
- [ ] Prices update correctly across all pages
- [ ] 3 decimals for KWD/BHD/OMR
- [ ] 2 decimals for SAR/AED/QAR

## Subscription Tests

- [ ] Create new subscription (all plans)
- [ ] 7-day trial starts correctly
- [ ] Trial converts to paid
- [ ] Subscription renews automatically
- [ ] Upgrade plan mid-cycle (prorated)
- [ ] Downgrade plan mid-cycle
- [ ] Cancel subscription (end of period)
- [ ] Cancel immediately
- [ ] Pause/resume subscription

## Payment Tests

- [ ] Card payment (Visa/MC)
- [ ] KNET payment (Kuwait)
- [ ] mada payment (Saudi)
- [ ] Apple Pay
- [ ] Payment failure handled
- [ ] Retry logic works (3 attempts)
- [ ] Dunning emails sent

## Webhook Tests

- [ ] All event types received
- [ ] Signature verification works
- [ ] Database updated correctly
- [ ] Credits granted on activation
- [ ] Credits refreshed on renewal

---

**Document Version:** 1.0  
**Created:** December 27, 2025  
**Replaces:** UPayments integration  
**Status:** Ready for Implementation
