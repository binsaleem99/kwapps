/**
 * ContactFormArabic Component
 *
 * Full-featured RTL contact form with GCC phone validation
 * Includes: Name, Email, Phone (GCC), Subject, Message
 * Built-in validation and submission handling
 *
 * Usage:
 * <ContactFormArabic
 *   country="KW"
 *   onSubmit={async (data) => await sendEmail(data)}
 * />
 */

'use client'

import { useState } from 'react'
import { GCCPhoneInput } from './GCCPhoneInput'
import { GCC_COUNTRIES, type CountryCode } from '@/lib/gcc-config'

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  country: CountryCode
}

interface ContactFormArabicProps {
  country?: CountryCode
  allowCountryChange?: boolean
  onSubmit: (data: ContactFormData) => Promise<void>
  className?: string
  submitText?: string
  includeName?: boolean
  includeSubject?: boolean
  includePhone?: boolean
}

export function ContactFormArabic({
  country = 'KW',
  allowCountryChange = true,
  onSubmit,
  className = '',
  submitText = 'إرسال',
  includeName = true,
  includeSubject = true,
  includePhone = true,
}: ContactFormArabicProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    country,
  })

  const [phoneValid, setPhoneValid] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handlePhoneChange = (phoneValue: string, isValid: boolean) => {
    setFormData({ ...formData, phone: phoneValue })
    setPhoneValid(isValid)
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {}

    if (includeName && !formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (includePhone && !phoneValid) {
      newErrors.phone = 'رقم الهاتف غير صحيح'
    }

    if (includeSubject && !formData.subject.trim()) {
      newErrors.subject = 'الموضوع مطلوب'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setSubmitted(true)
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        country: formData.country,
      })
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ message: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success message
  if (submitted) {
    return (
      <div className={`${className} text-center p-8`} dir="rtl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">تم إرسال رسالتك بنجاح!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          سنتواصل معك في أقرب وقت ممكن
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-primary hover:underline"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${className} space-y-4`}
      dir="rtl"
      noValidate
    >
      {/* Name */}
      {includeName && (
        <div>
          <label className="block text-sm font-medium mb-1">
            الاسم <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="الاسم الكامل"
            className={`block w-full rounded-lg border px-3 py-2
                     bg-white dark:bg-gray-800
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                     ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 text-end">{errors.name}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="example@email.com"
          className={`block w-full rounded-lg border px-3 py-2
                   bg-white dark:bg-gray-800
                   focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                   ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          dir="ltr"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 text-end">{errors.email}</p>
        )}
      </div>

      {/* Phone (GCC validated) */}
      {includePhone && (
        <div>
          <label className="block text-sm font-medium mb-1">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <GCCPhoneInput
            value={formData.phone}
            onChange={handlePhoneChange}
            country={formData.country}
            allowCountryChange={allowCountryChange}
            required
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 text-end">{errors.phone}</p>
          )}
        </div>
      )}

      {/* Subject */}
      {includeSubject && (
        <div>
          <label className="block text-sm font-medium mb-1">
            الموضوع <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="موضوع الرسالة"
            className={`block w-full rounded-lg border px-3 py-2
                     bg-white dark:bg-gray-800
                     focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                     ${errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600 text-end">{errors.subject}</p>
          )}
        </div>
      )}

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-1">
          الرسالة <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          rows={5}
          className={`block w-full rounded-lg border px-3 py-2
                   bg-white dark:bg-gray-800
                   focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50
                   resize-vertical
                   ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600 text-end">{errors.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold
                 py-3 px-6 rounded-lg transition-all disabled:opacity-50
                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            <span>جاري الإرسال...</span>
          </>
        ) : (
          <>
            <span>{submitText}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

/**
 * Minimal contact form (email + message only)
 */
export function ContactFormMinimal({
  onSubmit,
  className = '',
}: {
  onSubmit: (data: { email: string; message: string }) => Promise<void>
  className?: string
}) {
  return (
    <ContactFormArabic
      onSubmit={async (data) => onSubmit({ email: data.email, message: data.message })}
      className={className}
      includeName={false}
      includeSubject={false}
      includePhone={false}
      submitText="إرسال"
    />
  )
}
