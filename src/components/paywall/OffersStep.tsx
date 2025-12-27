/**
 * OffersStep - Step 3 of Paywall
 *
 * Shows pricing offers with social proof and final CTA
 * Goal: Convert user to paying customer
 *
 * Key Elements:
 * - Plan selection (4 tiers)
 * - Trial toggle (with/without trial pricing)
 * - Social proof (testimonials, stats)
 * - Discount code input
 * - Final CTA with urgency
 */

'use client'

import { useState } from 'react'
import { Check, Star, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyDisplay } from '@/components/gcc/CurrencyDisplay'
import { TrialToggle } from './TrialToggle'

interface OffersStepProps {
  selectedPlan: string
  onPlanChange: (plan: string) => void
  withTrial: boolean
  onTrialToggle: (withTrial: boolean) => void
  discountCode?: string
  onDiscountChange: (code?: string) => void
  onSubscribe: (data: SubscriptionData) => Promise<void>
  onBack: () => void
}

interface SubscriptionData {
  plan: string
  billingInterval: 'monthly' | 'annual'
  withTrial: boolean
}

export function OffersStep({
  selectedPlan,
  onPlanChange,
  withTrial,
  onTrialToggle,
  discountCode,
  onDiscountChange,
  onSubscribe,
  onBack,
}: OffersStepProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [discountInput, setDiscountInput] = useState(discountCode || '')
  const [discountValid, setDiscountValid] = useState<boolean | null>(null)

  const plans = [
    {
      id: 'basic',
      name: 'الباقة الأساسية',
      nameEn: 'Basic',
      monthlyKWD: 22.99,
      annualKWD: 229.90,
      credits: 100,
      badge: 'الأكثر شعبية',
      color: 'border-primary',
      features: [
        '100 رصيد يومياً',
        '3 مواقع نشطة',
        'استضافة مجانية',
        'دعم فني',
        'تجربة مجانية 7 أيام',
      ],
    },
    {
      id: 'pro',
      name: 'الباقة الاحترافية',
      nameEn: 'Pro',
      monthlyKWD: 37.50,
      annualKWD: 375.00,
      credits: 200,
      badge: 'الأفضل للشركات',
      color: 'border-blue-500',
      features: [
        '200 رصيد يومياً',
        '10 مواقع نشطة',
        'نطاق مجاني سنوياً',
        'أولوية في الدعم',
        'تحليلات متقدمة',
      ],
    },
    {
      id: 'premium',
      name: 'الباقة المميزة',
      nameEn: 'Premium',
      monthlyKWD: 58.75,
      annualKWD: 587.50,
      credits: 400,
      badge: 'توليد صور AI',
      color: 'border-purple-500',
      features: [
        '400 رصيد يومياً',
        'مواقع غير محدودة',
        'توليد صور بالذكاء الاصطناعي',
        'نطاقين مجانيين',
        'دعم VIP',
      ],
    },
    {
      id: 'enterprise',
      name: 'باقة المؤسسات',
      nameEn: 'Enterprise',
      monthlyKWD: 74.50,
      annualKWD: 745.00,
      credits: 800,
      badge: 'للفرق',
      color: 'border-orange-500',
      features: [
        '800 رصيد يومياً',
        'كل شيء في Premium',
        'مستخدمين متعددين',
        'API مخصص',
        'مدير حساب مخصص',
      ],
    },
  ]

  const handleDiscountCheck = async () => {
    if (!discountInput) return

    try {
      const response = await fetch('/api/paywall/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountInput, plan: selectedPlan }),
      })

      const data = await response.json()

      if (data.valid) {
        setDiscountValid(true)
        onDiscountChange(discountInput)
      } else {
        setDiscountValid(false)
      }
    } catch (error) {
      setDiscountValid(false)
    }
  }

  const handleSubscribe = async () => {
    setIsSubscribing(true)

    try {
      await onSubscribe({
        plan: selectedPlan,
        billingInterval,
        withTrial,
      })
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsSubscribing(false)
    }
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlan) || plans[0]
  const price =
    billingInterval === 'monthly'
      ? selectedPlanData.monthlyKWD
      : selectedPlanData.annualKWD / 12
  const annualSavings =
    billingInterval === 'annual'
      ? selectedPlanData.monthlyKWD * 12 - selectedPlanData.annualKWD
      : 0

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">اختر باقتك المثالية</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          جميع الباقات تشمل <span className="font-bold text-primary">تجربة مجانية 7 أيام</span>
        </p>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingInterval === 'monthly'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingInterval === 'annual'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            سنوي
            <span className="ms-2 text-green-600 text-sm">وفّر 40%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const planPrice =
            billingInterval === 'monthly' ? plan.monthlyKWD : plan.annualKWD / 12

          return (
            <div
              key={plan.id}
              onClick={() => onPlanChange(plan.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all
                       ${isSelected ? `${plan.color} shadow-xl scale-105` : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
            >
              {/* Badge */}
              <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>

              {/* Plan Header */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <CurrencyDisplay
                    amount={planPrice}
                    country="KW"
                    size="2xl"
                    bold
                  />
                  <span className="text-gray-500">/شهر</span>
                </div>
                {billingInterval === 'annual' && (
                  <div className="text-sm text-gray-500 mt-1">
                    يُدفع {plan.annualKWD.toFixed(3)} د.ك سنوياً
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 start-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Trial Toggle */}
      <TrialToggle withTrial={withTrial} onToggle={onTrialToggle} planPrice={price} />

      {/* Discount Code */}
      <div>
        <label className="block text-sm font-medium mb-2">
          هل لديك كود خصم؟
        </label>
        <div className="flex gap-2">
          <Input
            value={discountInput}
            onChange={(e) => {
              setDiscountInput(e.target.value.toUpperCase())
              setDiscountValid(null)
            }}
            placeholder="أدخل كود الخصم"
            className={`flex-1 ${
              discountValid === true
                ? 'border-green-500'
                : discountValid === false
                ? 'border-red-500'
                : ''
            }`}
          />
          <Button
            variant="outline"
            onClick={handleDiscountCheck}
            disabled={!discountInput}
          >
            تطبيق
          </Button>
        </div>
        {discountValid === true && (
          <p className="text-sm text-green-600 mt-1">✓ كود الخصم صالح</p>
        )}
        {discountValid === false && (
          <p className="text-sm text-red-600 mt-1">✗ كود الخصم غير صالح</p>
        )}
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center mb-6">
          <div>
            <div className="text-3xl font-bold text-primary">500+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">عميل سعيد</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4.9</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>تقييم</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">2,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">موقع منشور</div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                "بنيت موقع صالوني في أقل من ساعة! الذكاء الاصطناعي فهم بالضبط ما أريد.
                رائع للأعمال الصغيرة."
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-bold">نورة الشمري</span> • صالون جمالي • الكويت
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="space-y-4">
        <Button
          size="lg"
          className="w-full text-xl py-7 font-bold"
          onClick={handleSubscribe}
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full me-2" />
              جاري المعالجة...
            </>
          ) : (
            <>
              {withTrial ? 'ابدأ تجربتك المجانية الآن 🎁' : 'اشترك الآن 🚀'}
            </>
          )}
        </Button>

        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-primary">
            {withTrial
              ? '7 أيام مجاناً • ثم ' + price.toFixed(3) + ' د.ك/شهر'
              : price.toFixed(3) + ' د.ك/شهر'}
          </p>
          {withTrial && (
            <p className="text-xs text-gray-500">
              سنذكرك قبل انتهاء التجربة • إلغاء في أي وقت
            </p>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ← رجوع
        </button>
      </div>

      {/* Trust Signals */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4 text-green-600" />
          <span>إلغاء في أي وقت</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4 text-green-600" />
          <span>دفع آمن ومشفر</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4 text-green-600" />
          <span>استرجاع المبلغ خلال 30 يوم</span>
        </div>
      </div>
    </div>
  )
}
