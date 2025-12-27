/**
 * CurrencyDisplay Component
 *
 * Displays currency amounts with correct formatting for GCC countries:
 * - KWD, BHD, OMR: 3 decimal places (e.g., 22.990 د.ك)
 * - SAR, AED, QAR: 2 decimal places (e.g., 299.00 ر.س)
 * - Symbol position: AFTER amount (Arabic RTL convention)
 *
 * Usage:
 * <CurrencyDisplay amount={22.99} country="KW" />
 * <CurrencyDisplay amount={299} country="SA" size="lg" />
 */

'use client'

import { useMemo } from 'react'
import { GCC_COUNTRIES, formatCurrency, type CountryCode } from '@/lib/gcc-config'

interface CurrencyDisplayProps {
  amount: number
  country: CountryCode
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showSymbol?: boolean
  showCurrencyCode?: boolean
  bold?: boolean
}

export function CurrencyDisplay({
  amount,
  country,
  className = '',
  size = 'md',
  showSymbol = true,
  showCurrencyCode = false,
  bold = false,
}: CurrencyDisplayProps) {
  const config = GCC_COUNTRIES[country]

  const formatted = useMemo(() => {
    if (!config) return `${amount}`

    const { currency } = config
    const value = amount.toFixed(currency.decimals)

    if (!showSymbol && !showCurrencyCode) {
      return value
    }

    if (showCurrencyCode) {
      return `${value} ${currency.code}`
    }

    if (currency.symbolPosition === 'after') {
      return `${value} ${currency.symbol}`
    }

    return `${currency.symbol} ${value}`
  }, [amount, country, showSymbol, showCurrencyCode])

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }

  const sizeClass = sizeClasses[size]
  const boldClass = bold ? 'font-bold' : 'font-medium'

  if (!config) {
    return (
      <span className={`${className} ${sizeClass} text-red-600`}>
        Invalid currency
      </span>
    )
  }

  return (
    <span
      className={`${className} ${sizeClass} ${boldClass} tabular-nums`}
      dir="ltr"
      lang="ar"
    >
      {formatted}
    </span>
  )
}

/**
 * Displays price with optional comparison/discount
 */
export function PriceDisplay({
  amount,
  country,
  originalAmount,
  showSavings = true,
  className = '',
}: {
  amount: number
  country: CountryCode
  originalAmount?: number
  showSavings?: boolean
  className?: string
}) {
  const config = GCC_COUNTRIES[country]
  const hasDiscount = originalAmount && originalAmount > amount

  return (
    <div className={`${className}`} dir="rtl">
      <div className="flex items-center gap-2 justify-end">
        <CurrencyDisplay amount={amount} country={country} size="2xl" bold />

        {hasDiscount && (
          <CurrencyDisplay
            amount={originalAmount}
            country={country}
            size="lg"
            className="line-through text-gray-500 dark:text-gray-400"
          />
        )}
      </div>

      {hasDiscount && showSavings && (
        <div className="text-sm text-green-600 dark:text-green-400 mt-1 text-end">
          وفّر {formatCurrency(originalAmount - amount, country)}
        </div>
      )}

      {config && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-end">
          {config.currency.nameAr}
        </div>
      )}
    </div>
  )
}

/**
 * Compact currency for tables/lists
 */
export function CurrencyCompact({
  amount,
  country,
  className = '',
}: Pick<CurrencyDisplayProps, 'amount' | 'country' | 'className'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      country={country}
      className={className}
      size="sm"
      showSymbol
    />
  )
}

/**
 * Large currency for pricing pages
 */
export function CurrencyLarge({
  amount,
  country,
  className = '',
}: Pick<CurrencyDisplayProps, 'amount' | 'country' | 'className'>) {
  return (
    <CurrencyDisplay
      amount={amount}
      country={country}
      className={className}
      size="2xl"
      bold
    />
  )
}
