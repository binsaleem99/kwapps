/**
 * AbandonmentPopup Component
 *
 * Appears when user closes payment modal without completing
 * Last-chance offer with time-limited discount
 *
 * Features:
 * - 20% instant discount
 * - 15-minute expiry timer
 * - Urgency messaging
 * - One-click return to checkout
 *
 * Usage:
 * <AbandonmentPopup
 *   isOpen={showAbandonment}
 *   planSelected="basic"
 *   onAccept={() => returnToCheckout()}
 *   onDecline={() => closePopup()}
 * />
 */

'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, Gift, X } from 'lucide-react'

interface AbandonmentPopupProps {
  isOpen: boolean
  planSelected: string
  planPrice: number // in KWD
  onAccept: (discountCode: string) => void
  onDecline: () => void
}

export function AbandonmentPopup({
  isOpen,
  planSelected,
  planPrice,
  onAccept,
  onDecline,
}: AbandonmentPopupProps) {
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [discountCode, setDiscountCode] = useState('')

  // Generate abandonment discount code
  useEffect(() => {
    if (isOpen && !discountCode) {
      generateAbandonmentOffer()
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onDecline() // Auto-close when expired
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  const generateAbandonmentOffer = async () => {
    try {
      const response = await fetch('/api/paywall/abandonment/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planSelected,
          sessionId: sessionStorage.getItem('paywall_session_id'),
        }),
      })

      const data = await response.json()
      setDiscountCode(data.discountCode)
    } catch (error) {
      console.error('Failed to generate abandonment offer:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const discountedPrice = planPrice * 0.80 // 20% off
  const savings = planPrice - discountedPrice

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-md" dir="rtl">
        {/* Close Button */}
        <button
          onClick={onDecline}
          className="absolute top-4 end-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">انتظر! 🎁</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              لاحظنا أنك لم تكمل الاشتراك...
            </p>
          </div>

          {/* Special Offer */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-500 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-sm font-bold text-orange-600 mb-2">
                عرض خاص لك فقط
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                خصم 20%
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold">{discountedPrice.toFixed(3)} د.ك</span>
                <span className="text-lg text-gray-400 line-through">
                  {planPrice.toFixed(3)} د.ك
                </span>
              </div>
              <div className="text-sm text-green-600 font-bold mt-1">
                وفّر {savings.toFixed(3)} د.ك شهرياً!
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3">
              <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
              <span className="text-sm font-medium">ينتهي العرض خلال:</span>
              <span className="text-xl font-bold text-orange-600 font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Benefits Reminder */}
          <div className="space-y-2">
            <p className="font-bold text-center">لماذا يختار مئات العملاء KWQ8؟</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>مواقع احترافية في دقائق</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>استضافة مجانية وآمنة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>دعم فني باللغة العربية</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>إلغاء في أي وقت</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full text-lg py-6 font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              onClick={() => onAccept(discountCode)}
            >
              نعم! أريد الخصم 20% 🎉
            </Button>

            <button
              onClick={onDecline}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              لا شكراً، سأدفع السعر الكامل
            </button>
          </div>

          {/* Urgency Message */}
          <div className="text-center text-xs text-gray-500">
            ⚠️ هذا العرض متاح فقط لهذه الجلسة ولن يظهر مرة أخرى
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
