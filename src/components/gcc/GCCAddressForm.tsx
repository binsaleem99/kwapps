/**
 * GCCAddressForm Component
 *
 * Country-specific address form for GCC countries
 * Adapts fields based on selected country:
 * - State/Region/Governorate field (country-specific labels)
 * - Postal code (required/optional, pattern validation)
 * - Country-specific validations
 *
 * Usage:
 * <GCCAddressForm
 *   value={address}
 *   onChange={(newAddress) => setAddress(newAddress)}
 *   country="KW"
 * />
 */

'use client'

import { useState, useEffect } from 'react'
import { GCC_COUNTRIES, type CountryCode } from '@/lib/gcc-config'

export interface GCCAddress {
  street: string
  city: string
  state?: string // Optional - depends on country
  postalCode?: string // Optional - depends on country
  country: CountryCode
}

interface GCCAddressFormProps {
  value: GCCAddress
  onChange: (address: GCCAddress) => void
  className?: string
  required?: boolean
  showCountrySelector?: boolean
}

export function GCCAddressForm({
  value,
  onChange,
  className = '',
  required = false,
  showCountrySelector = true,
}: GCCAddressFormProps) {
  const [address, setAddress] = useState<GCCAddress>(value)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const config = GCC_COUNTRIES[address.country]

  // Update parent on change
  useEffect(() => {
    onChange(address)
  }, [address])

  const handleChange = (field: keyof GCCAddress, val: string) => {
    setAddress({ ...address, [field]: val })

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (required && !address.street) {
      newErrors.street = 'العنوان مطلوب'
    }

    if (required && !address.city) {
      newErrors.city = 'المدينة مطلوبة'
    }

    if (config.address.hasState && required && !address.state) {
      newErrors.state = `${config.address.stateLabelAr} مطلوبة`
    }

    if (
      config.address.postalCodeRequired &&
      required &&
      !address.postalCode
    ) {
      newErrors.postalCode = 'الرمز البريدي مطلوب'
    }

    if (
      address.postalCode &&
      config.address.postalCodePattern &&
      !config.address.postalCodePattern.test(address.postalCode)
    ) {
      newErrors.postalCode = 'الرمز البريدي غير صحيح'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <div className={`${className} space-y-4`} dir="rtl">
      {/* Country Selector (if enabled) */}
      {showCountrySelector && (
        <div>
          <label className="block text-sm font-medium mb-1">
            الدولة {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={address.country}
            onChange={(e) => handleChange('country', e.target.value as CountryCode)}
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 px-3 py-2
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            {Object.values(GCC_COUNTRIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.nameAr}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium mb-1">
          العنوان {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => handleChange('street', e.target.value)}
          placeholder="مثال: شارع الخليج العربي، بناية 12، شقة 5"
          className={`block w-full rounded-lg border px-3 py-2
                   bg-white dark:bg-gray-800
                   focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                   ${errors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-600 text-end">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-1">
            المدينة {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="مثال: الكويت"
            className={`block w-full rounded-lg border px-3 py-2
                     bg-white dark:bg-gray-800
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                     ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 text-end">{errors.city}</p>
          )}
        </div>

        {/* State/Region/Governorate (if country has states) */}
        {config.address.hasState && (
          <div>
            <label className="block text-sm font-medium mb-1">
              {config.address.stateLabelAr || 'المنطقة'}{' '}
              {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={address.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder={`مثال: ${
                config.code === 'KW'
                  ? 'العاصمة'
                  : config.code === 'SA'
                  ? 'الرياض'
                  : 'المنطقة'
              }`}
              className={`block w-full rounded-lg border px-3 py-2
                       bg-white dark:bg-gray-800
                       focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                       ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 text-end">{errors.state}</p>
            )}
          </div>
        )}

        {/* Postal Code (if required or optional) */}
        {(config.address.postalCodeRequired || !config.address.hasState) && (
          <div className={config.address.hasState ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1">
              الرمز البريدي{' '}
              {config.address.postalCodeRequired && required && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              value={address.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder={
                config.code === 'KW'
                  ? '12345'
                  : config.code === 'SA'
                  ? '11564'
                  : 'الرمز البريدي'
              }
              className={`block w-full rounded-lg border px-3 py-2
                       bg-white dark:bg-gray-800
                       focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                       ${errors.postalCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              dir="ltr"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600 text-end">{errors.postalCode}</p>
            )}
          </div>
        )}
      </div>

      {/* Country Display (if selector hidden) */}
      {!showCountrySelector && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 justify-end">
          <span>{config.flag}</span>
          <span>{config.nameAr}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Read-only address display (for invoices, confirmations)
 */
export function AddressDisplay({
  address,
  className = '',
}: {
  address: GCCAddress
  className?: string
}) {
  const config = GCC_COUNTRIES[address.country]

  if (!config) return null

  return (
    <div className={`${className} text-sm space-y-1`} dir="rtl">
      <div>{address.street}</div>
      <div>
        {address.city}
        {address.state && `, ${address.state}`}
        {address.postalCode && ` ${address.postalCode}`}
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <span>{config.flag}</span>
        <span>{config.nameAr}</span>
      </div>
    </div>
  )
}

/**
 * Hook for programmatic address validation
 */
export function useGCCAddress(initialCountry: CountryCode = 'KW') {
  const [address, setAddress] = useState<GCCAddress>({
    street: '',
    city: '',
    country: initialCountry,
  })

  const [isValid, setIsValid] = useState(false)

  const validate = (): boolean => {
    const config = GCC_COUNTRIES[address.country]
    if (!config) return false

    const hasStreet = !!address.street
    const hasCity = !!address.city
    const hasRequiredState = !config.address.hasState || !!address.state
    const hasRequiredPostal =
      !config.address.postalCodeRequired || !!address.postalCode

    const valid = hasStreet && hasCity && hasRequiredState && hasRequiredPostal

    setIsValid(valid)
    return valid
  }

  return {
    address,
    setAddress,
    isValid,
    validate,
  }
}
