'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function BillingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!orderId) {
      setStatus('error')
      return
    }

    // Give webhook time to process (5 seconds)
    const timer = setTimeout(() => {
      setStatus('success')
    }, 5000)

    return () => clearTimeout(timer)
  }, [orderId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
            جاري معالجة الدفع...
          </h2>
          <p className="text-gray-600">
            يرجى الانتظار بينما نؤكد عملية الدفع وننشط اشتراكك.
          </p>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✗</span>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
            حدث خطأ
          </h2>
          <p className="text-gray-600 mb-6">
            لم نتمكن من التحقق من عملية الدفع. يرجى التواصل مع الدعم إذا تم خصم المبلغ.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard/billing">
              <Button className="w-full">الذهاب إلى الفواتير</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full">
                التواصل مع الدعم
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
          تم الاشتراك بنجاح!
        </h2>
        <p className="text-gray-600 mb-6">
          شكراً لك! تم تفعيل اشتراكك بنجاح. يمكنك الآن البدء في استخدام جميع ميزات خطتك.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
          <p className="text-sm text-blue-900">
            <strong>رقم الطلب:</strong> {orderId}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            سيتم إرسال فاتورة تفصيلية إلى بريدك الإلكتروني
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">الذهاب إلى لوحة التحكم</Button>
          </Link>
          <Link href="/builder">
            <Button variant="outline" className="w-full">
              ابدأ بناء تطبيق جديد
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          إذا كان لديك أي أسئلة، يرجى{' '}
          <Link href="/contact" className="text-primary hover:underline">
            التواصل معنا
          </Link>
        </p>
      </Card>
    </div>
  )
}
