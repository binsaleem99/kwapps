'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PricingCardProps {
  name: string
  nameAr: string
  nameEn: string
  price: number
  features: string[]
  maxProjects: number
  maxStorage: number
  maxPrompts: number
  isPopular?: boolean
}

export function PricingCard({
  name,
  nameAr,
  nameEn,
  price,
  features,
  maxProjects,
  maxStorage,
  maxPrompts,
  isPopular = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSelectPlan = async () => {
    setLoading(true)

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to signup with plan in query
        router.push(`/signup?plan=${name}`)
        return
      }

      // If free plan, activate directly
      if (name === 'free') {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_name: name }),
        })

        const data = await response.json()

        if (data.success) {
          router.push('/dashboard?subscription=activated')
        } else {
          alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
        }
      } else {
        // For paid plans, create checkout session
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_name: name,
            tokenize_card: true, // Save card for recurring billing
          }),
        })

        const data = await response.json()

        if (data.success && data.payment_link) {
          // Redirect to UPayments checkout
          window.location.href = data.payment_link
        } else {
          alert(data.error || 'حدث خطأ. يرجى المحاولة مرة أخرى.')
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error)
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${mb / 1024} GB`
    }
    return `${mb} MB`
  }

  return (
    <Card
      className={`relative p-6 ${
        isPopular
          ? 'border-2 border-primary shadow-lg scale-105'
          : 'border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          الأكثر شعبية
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
          {nameAr}
        </h3>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-primary">
            {price === 0 ? 'مجاناً' : `${price} د.ك`}
          </span>
          {price > 0 && <span className="text-gray-500">/شهرياً</span>}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {name !== 'hosting' && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>
                {maxProjects === 0
                  ? 'لا يمكن إنشاء مشاريع جديدة'
                  : `${maxProjects} ${maxProjects === 1 ? 'مشروع' : 'مشاريع'}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{formatStorage(maxStorage)} تخزين</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>
                {maxPrompts === 0 ? 'لا توجد طلبات AI' : `${maxPrompts} طلب AI يومياً`}
              </span>
            </div>
          </>
        )}

        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSelectPlan}
        disabled={loading}
        className={`w-full ${
          isPopular
            ? 'bg-primary hover:bg-primary/90'
            : 'bg-gray-900 hover:bg-gray-800'
        }`}
      >
        {loading ? 'جاري التحميل...' : name === 'free' ? 'ابدأ مجاناً' : 'اختر الخطة'}
      </Button>

      {name === 'hosting' && (
        <p className="text-xs text-gray-500 text-center mt-3">
          * يحافظ على المشاريع الحالية فقط
        </p>
      )}
    </Card>
  )
}
