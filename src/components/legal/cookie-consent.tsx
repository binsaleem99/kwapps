'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Cookie } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500"
      dir="rtl"
    >
      <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2 border-primary/20 bg-white/95 backdrop-blur">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
              🍪 نستخدم ملفات تعريف الارتباط
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على موقعنا، وتذكر تفضيلاتك، وتحليل حركة
              المرور. من خلال الاستمرار في استخدام هذا الموقع، فإنك توافق على استخدامنا لملفات تعريف
              الارتباط وفقاً لـ{' '}
              <Link href="/privacy" className="text-primary hover:underline font-semibold">
                سياسة الخصوصية
              </Link>
              .
            </p>

            {/* Cookie Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="bg-gray-50 rounded p-2">
                <strong className="text-gray-900">ضرورية</strong>
                <p className="text-gray-600 mt-1">للأمان وتسجيل الدخول</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <strong className="text-gray-900">وظيفية</strong>
                <p className="text-gray-600 mt-1">لحفظ التفضيلات</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <strong className="text-gray-900">تحليلية</strong>
                <p className="text-gray-600 mt-1">لفهم كيفية الاستخدام</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAccept} size="sm" className="flex-1 sm:flex-none">
                قبول جميع ملفات الكوكيز
              </Button>
              <Button onClick={handleDecline} variant="outline" size="sm" className="flex-1 sm:flex-none">
                الضرورية فقط
              </Button>
              <Link href="/privacy" className="flex-1 sm:flex-none">
                <Button variant="ghost" size="sm" className="w-full">
                  اعرف المزيد
                </Button>
              </Link>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDecline}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  )
}
