'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SUBSCRIPTION_TIERS, type SubscriptionTierName } from '@/types/billing'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tierInfo, setTierInfo] = useState<{
    name: SubscriptionTierName
    displayName: string
    price: number
    isTrial: boolean
  } | null>(null)

  const tierParam = searchParams.get('tier') as SubscriptionTierName | null
  const trialParam = searchParams.get('trial') === 'true'

  useEffect(() => {
    const processCheckout = async () => {
      try {
        // Validate tier
        if (!tierParam || !['basic', 'pro', 'premium', 'enterprise'].includes(tierParam)) {
          setError('خطة غير صالحة')
          setLoading(false)
          return
        }

        // Get tier info
        const tier = SUBSCRIPTION_TIERS[tierParam]
        setTierInfo({
          name: tierParam,
          displayName: tier.display_name_ar,
          price: trialParam ? 1 : tier.price_kwd,
          isTrial: trialParam,
        })

        // Check if user is authenticated
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push(`/sign-in?redirect=/checkout&tier=${tierParam}&trial=${trialParam}`)
          return
        }

        // Call checkout API
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier_name: tierParam,
            is_trial: trialParam,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.error_en || 'فشل إنشاء جلسة الدفع')
        }

        // Redirect to UPayments payment page
        if (data.payment_link) {
          window.location.href = data.payment_link
        } else {
          throw new Error('لم يتم استلام رابط الدفع')
        }
      } catch (err: any) {
        console.error('Checkout error:', err)
        setError(err.message || 'حدث خطأ أثناء معالجة الدفع')
        setLoading(false)
      }
    }

    processCheckout()
  }, [tierParam, trialParam, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50" dir="rtl">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100 text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Cairo']">
                جاري تجهيز الدفع...
              </h1>
              {tierInfo && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-600 font-['Cairo']">
                    الخطة: <span className="font-bold text-slate-900">{tierInfo.displayName}</span>
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {tierInfo.price} د.ك
                    {tierInfo.isTrial && (
                      <span className="text-sm text-slate-500 mr-2">(فترة تجريبية)</span>
                    )}
                  </p>
                </div>
              )}
              <p className="text-slate-500 mt-4 font-['Cairo']">
                سيتم تحويلك إلى بوابة الدفع...
              </p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Cairo']">
                حدث خطأ
              </h1>
              <p className="text-red-600 mb-6 font-['Cairo']">{error}</p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold"
                >
                  إعادة المحاولة
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-2 border-slate-900"
                >
                  <Link href="/pricing">العودة للأسعار</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Cairo']">
                جاري تحويلك للدفع...
              </h1>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50" dir="rtl">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-100 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 font-['Cairo']">
            جاري التحميل...
          </h1>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  )
}
