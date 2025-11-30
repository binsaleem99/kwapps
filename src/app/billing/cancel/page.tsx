'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function BillingCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const reason = searchParams.get('reason') || 'unknown'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
          تم إلغاء العملية
        </h2>

        <p className="text-gray-600 mb-6">
          لم يتم إكمال عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
        </p>

        {orderId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-gray-700">
              <strong>رقم الطلب:</strong> {orderId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              يمكنك إعادة المحاولة في أي وقت
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
          <p className="text-sm text-blue-900 mb-2">
            <strong>هل تحتاج مساعدة؟</strong>
          </p>
          <p className="text-xs text-blue-700">
            • تأكد من إدخال بيانات البطاقة بشكل صحيح
          </p>
          <p className="text-xs text-blue-700">
            • تحقق من وجود رصيد كافٍ في حسابك
          </p>
          <p className="text-xs text-blue-700">
            • تواصل مع البنك إذا استمرت المشكلة
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/pricing">
            <Button className="w-full">
              إعادة المحاولة
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              العودة إلى لوحة التحكم
            </Button>
          </Link>

          <Link href="/contact">
            <Button variant="ghost" className="w-full">
              التواصل مع الدعم
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          إذا كنت تعتقد أن هذا خطأ،{' '}
          <Link href="/contact" className="text-primary hover:underline">
            تواصل معنا فوراً
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default function BillingCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <BillingCancelContent />
    </Suspense>
  )
}
