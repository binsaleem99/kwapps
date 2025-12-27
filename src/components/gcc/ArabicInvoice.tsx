/**
 * ArabicInvoice Component
 *
 * Printable RTL invoice template for GCC businesses
 * Features:
 * - Full RTL layout
 * - VAT calculation per country
 * - Multiple currencies supported
 * - Print-optimized CSS
 * - Arabic number formatting
 * - QR code support (optional)
 *
 * Usage:
 * <ArabicInvoice
 *   invoiceNumber="INV-001"
 *   items={items}
 *   business={businessInfo}
 *   customer={customerInfo}
 *   country="KW"
 * />
 */

'use client'

import { useMemo } from 'react'
import { GCC_COUNTRIES, formatCurrency, calculateVAT, type CountryCode } from '@/lib/gcc-config'
import { AddressDisplay, type GCCAddress } from './GCCAddressForm'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface BusinessInfo {
  name: string
  nameAr: string
  address: GCCAddress
  phone: string
  email: string
  logo?: string
  vatNumber?: string // For Saudi Arabia, UAE
  commercialRegistration?: string
}

export interface CustomerInfo {
  name: string
  address: GCCAddress
  phone: string
  email: string
}

interface ArabicInvoiceProps {
  invoiceNumber: string
  invoiceDate?: Date
  dueDate?: Date
  items: InvoiceItem[]
  business: BusinessInfo
  customer: CustomerInfo
  country: CountryCode
  notes?: string
  className?: string
  showQR?: boolean
  qrData?: string
}

export function ArabicInvoice({
  invoiceNumber,
  invoiceDate = new Date(),
  dueDate,
  items,
  business,
  customer,
  country,
  notes,
  className = '',
  showQR = false,
  qrData,
}: ArabicInvoiceProps) {
  const config = GCC_COUNTRIES[country]

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const { vat, total } = calculateVAT(subtotal, country)

    return {
      subtotal,
      vat,
      total,
      itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
  }, [items, country])

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={`${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`} dir="rtl">
      {/* Print Button (hidden when printing) */}
      <div className="mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/90 text-white font-bold
                   py-2 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          طباعة الفاتورة
        </button>
      </div>

      {/* Invoice Container */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 print:border-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {/* Business Info */}
          <div className="flex-1">
            {business.logo && (
              <img
                src={business.logo}
                alt={business.nameAr}
                className="h-16 mb-4 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold mb-2">{business.nameAr}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <AddressDisplay address={business.address} />
              <div>{business.phone}</div>
              <div dir="ltr">{business.email}</div>
              {business.vatNumber && (
                <div>رقم الضريبة: {business.vatNumber}</div>
              )}
              {business.commercialRegistration && (
                <div>رقم السجل التجاري: {business.commercialRegistration}</div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="text-end">
            <h2 className="text-3xl font-bold text-primary mb-4">فاتورة</h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">رقم الفاتورة:</span>{' '}
                <span className="font-bold">{invoiceNumber}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">تاريخ الإصدار:</span>{' '}
                <span>{formatDate(invoiceDate)}</span>
              </div>
              {dueDate && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">تاريخ الاستحقاق:</span>{' '}
                  <span>{formatDate(dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2">فاتورة إلى:</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm space-y-1">
            <div className="font-semibold">{customer.name}</div>
            <AddressDisplay address={customer.address} />
            <div>{customer.phone}</div>
            <div dir="ltr">{customer.email}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                <th className="text-end py-3 px-2 font-bold">الوصف</th>
                <th className="text-center py-3 px-2 font-bold w-20">الكمية</th>
                <th className="text-end py-3 px-2 font-bold w-32">سعر الوحدة</th>
                <th className="text-end py-3 px-2 font-bold w-32">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice
                return (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                  >
                    <td className="text-end py-3 px-2">{item.description}</td>
                    <td className="text-center py-3 px-2" dir="ltr">
                      {item.quantity}
                    </td>
                    <td className="text-end py-3 px-2" dir="ltr">
                      {formatCurrency(item.unitPrice, country)}
                    </td>
                    <td className="text-end py-3 px-2 font-semibold" dir="ltr">
                      {formatCurrency(itemTotal, country)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي:</span>
              <span className="font-semibold" dir="ltr">
                {formatCurrency(calculations.subtotal, country)}
              </span>
            </div>

            {config.vat.rate > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {config.vat.nameAr} ({(config.vat.rate * 100).toFixed(0)}%):
                </span>
                <span className="font-semibold" dir="ltr">
                  {formatCurrency(calculations.vat, country)}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 border-t-2 border-gray-300 dark:border-gray-700">
              <span className="font-bold text-lg">المجموع الإجمالي:</span>
              <span className="font-bold text-lg text-primary" dir="ltr">
                {formatCurrency(calculations.total, country)}
              </span>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-end">
              إجمالي {calculations.itemsCount} منتج
              {config.vat.rate > 0 && ` • شامل ${config.vat.nameAr}`}
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-bold mb-2">ملاحظات:</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>شكراً لثقتكم بنا</p>
            <p className="mt-1">
              {business.nameAr} • {config.flag} {config.nameAr}
            </p>
          </div>

          {/* QR Code (for Saudi Arabia e-invoicing compliance) */}
          {showQR && qrData && (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {/* QR code would be generated here */}
                <span className="text-xs">QR Code</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">رمز QR</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

/**
 * Generate invoice PDF (server action or client-side)
 */
export async function generateInvoicePDF(invoice: ArabicInvoiceProps): Promise<Blob> {
  // This would use a library like jsPDF or Puppeteer
  // For now, use browser print functionality
  throw new Error('PDF generation not implemented - use print functionality')
}
