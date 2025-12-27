/**
 * GCCPhoneInput Component
 *
 * Phone number input with GCC country-specific validation:
 * - Kuwait: +965, 8 digits, starts with 5, 6, or 9
 * - Saudi Arabia: +966, 9 digits, starts with 5
 * - UAE: +971, 9 digits, starts with 50, 51, 52, 54, 55, 56, 58
 * - Qatar: +974, 8 digits, starts with 3, 5, 6, or 7
 * - Bahrain: +973, 8 digits, starts with 3 or 6
 * - Oman: +968, 8 digits, starts with 7 or 9
 *
 * Usage:
 * <GCCPhoneInput
 *   value={phone}
 *   onChange={(value, isValid) => setPhone(value)}
 *   country="KW"
 * />
 */

'use client'

import { useState, useEffect } from 'react'
import {
  GCC_COUNTRIES,
  validatePhone,
  getAllCountries,
  type CountryCode,
} from '@/lib/gcc-config'

interface GCCPhoneInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  country?: CountryCode
  allowCountryChange?: boolean
  className?: string
  placeholder?: string
  required?: boolean
  autoFocus?: boolean
}

export function GCCPhoneInput({
  value,
  onChange,
  country: initialCountry = 'KW',
  allowCountryChange = true,
  className = '',
  placeholder,
  required = false,
  autoFocus = false,
}: GCCPhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry)
  const [inputValue, setInputValue] = useState(value)
  const [validation, setValidation] = useState<{
    valid: boolean
    error?: string
  }>({ valid: false })

  const config = GCC_COUNTRIES[selectedCountry]
  const countries = getAllCountries()

  // Validate on input change
  useEffect(() => {
    if (!inputValue) {
      setValidation({ valid: false })
      onChange('', false)
      return
    }

    const result = validatePhone(inputValue, selectedCountry)
    setValidation(result)
    onChange(result.formatted || inputValue, result.valid)
  }, [inputValue, selectedCountry])

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as CountryCode
    setSelectedCountry(newCountry)
    setInputValue('') // Reset input
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '')
    setInputValue(cleaned)
  }

  const inputPlaceholder = placeholder || config.phone.placeholder

  return (
    <div className={`${className}`} dir="rtl">
      <div className="flex gap-2">
        {/* Country Selector */}
        {allowCountryChange ? (
          <select
            value={selectedCountry}
            onChange={handleCountryChange}
            className="block w-32 rounded-lg border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 px-3 py-2 text-sm
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            dir="rtl"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.nameAr}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-lg">{config.flag}</span>
            <span className="text-sm font-medium">{config.phone.code}</span>
          </div>
        )}

        {/* Phone Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={inputPlaceholder}
            required={required}
            autoFocus={autoFocus}
            maxLength={config.phone.digits}
            className={`block w-full rounded-lg border px-3 py-2
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                     ${
                       validation.valid
                         ? 'border-green-500 dark:border-green-600'
                         : inputValue && !validation.valid
                         ? 'border-red-500 dark:border-red-600'
                         : 'border-gray-300 dark:border-gray-600'
                     }
                     bg-white dark:bg-gray-800 text-base`}
            dir="ltr" // Phone numbers always LTR
          />

          {/* Validation Icon */}
          {inputValue && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
              {validation.valid ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {inputValue && !validation.valid && validation.error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 text-end">
          {validation.error}
        </p>
      )}

      {/* Helper Text */}
      {!inputValue && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-end">
          مثال: {config.phone.exampleAr}
        </p>
      )}
    </div>
  )
}

/**
 * Simplified version for forms (no country selector)
 */
export function GCCPhoneInputSimple({
  value,
  onChange,
  country,
  className,
  placeholder,
  required,
}: Omit<GCCPhoneInputProps, 'allowCountryChange'>) {
  return (
    <GCCPhoneInput
      value={value}
      onChange={onChange}
      country={country}
      allowCountryChange={false}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  )
}

/**
 * Hook for programmatic phone validation
 */
export function useGCCPhone(country: CountryCode = 'KW') {
  const [phone, setPhone] = useState('')
  const [isValid, setIsValid] = useState(false)

  const handleChange = (value: string, valid: boolean) => {
    setPhone(value)
    setIsValid(valid)
  }

  return {
    phone,
    isValid,
    handleChange,
    config: GCC_COUNTRIES[country],
  }
}
