/**
 * VATCalculator Component
 *
 * Automatically calculates VAT based on GCC country
 * Supports all 6 GCC countries with official VAT rates:
 * - Kuwait: 0%
 * - Saudi Arabia: 15%
 * - UAE: 5%
 * - Qatar: 0%
 * - Bahrain: 10%
 * - Oman: 5%
 *
 * Usage:
 * <VATCalculator amount={100} country="SA" />
 */

'use client'

import { useMemo } from 'react'
import { GCC_COUNTRIES, calculateVAT, formatCurrency, type CountryCode } from '@/lib/gcc-config'

interface VATCalculatorProps {
  amount: number
  country: CountryCode
  className?: string
  showBreakdown?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function VATCalculator({
  amount,
  country,
  className = '',
  showBreakdown = true,
  size = 'md',
}: VATCalculatorProps) {
  const config = GCC_COUNTRIES[country]

  const calculation = useMemo(() => {
    return calculateVAT(amount, country)
  }, [amount, country])

  if (!config) {
    return (
      <div className={`text-red-600 ${className}`}>
        خطأ: رمز الدولة غير صالح
      </div>
    )
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const sizeClass = sizeClasses[size]

  // If no VAT (Kuwait, Qatar)
  if (config.vat.rate === 0) {
    return (
      <div className={`${className} ${sizeClass}`} dir="rtl">
        <div className="flex justify-between items-center font-bold">
          <span>المجموع:</span>
          <span className="text-primary">
            {formatCurrency(calculation.total, country)}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-end">
          {config.nameAr} - لا تخضع للضريبة
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} ${sizeClass}`} dir="rtl">
      {showBreakdown && (
        <div className="space-y-2 mb-3 border-b pb-3">
          <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span>المجموع الفرعي:</span>
            <span>{formatCurrency(calculation.subtotal, country)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span>
              {config.vat.nameAr} ({(config.vat.rate * 100).toFixed(0)}%):
            </span>
            <span>{formatCurrency(calculation.vat, country)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center font-bold text-lg">
        <span>المجموع الإجمالي:</span>
        <span className="text-primary">
          {formatCurrency(calculation.total, country)}
        </span>
      </div>

      {showBreakdown && (
        <div className="text-xs text-gray-500 mt-2 text-end">
          شامل {config.vat.nameAr} ({(config.vat.rate * 100).toFixed(0)}%)
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for inline display
 */
export function VATCalculatorInline({
  amount,
  country,
  className = '',
}: Pick<VATCalculatorProps, 'amount' | 'country' | 'className'>) {
  return (
    <VATCalculator
      amount={amount}
      country={country}
      className={className}
      showBreakdown={false}
      size="sm"
    />
  )
}

/**
 * Detailed version for checkout/invoices
 */
export function VATCalculatorDetailed({
  amount,
  country,
  className = '',
}: Pick<VATCalculatorProps, 'amount' | 'country' | 'className'>) {
  const config = GCC_COUNTRIES[country]
  const calculation = calculateVAT(amount, country)

  return (
    <div className={`${className} space-y-3`} dir="rtl">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span>
          <span className="font-semibold">{formatCurrency(calculation.subtotal, country)}</span>
        </div>

        {config.vat.rate > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              {config.vat.nameAr} ({(config.vat.rate * 100).toFixed(0)}%):
            </span>
            <span className="font-semibold">{formatCurrency(calculation.vat, country)}</span>
          </div>
        )}

        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center text-xl">
            <span className="font-bold">المجموع الإجمالي:</span>
            <span className="font-bold text-primary">
              {formatCurrency(calculation.total, country)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{config.flag}</span>
        <span>{config.nameAr}</span>
        {config.vat.rate > 0 && (
          <span>• شامل {config.vat.nameAr}</span>
        )}
      </div>
    </div>
  )
}
