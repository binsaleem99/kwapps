/**
 * BenefitsStep - Step 1 of Paywall
 *
 * Shows value proposition and key benefits
 * Goal: Get user excited about the product
 *
 * Key Elements:
 * - Hero visual (illustration/icon)
 * - 5-6 key benefits with icons
 * - Emphasis on "FREE TRIAL" (mentioned 2-3 times)
 * - Clear CTA to continue
 */

'use client'

import { Sparkles, Zap, Shield, Globe, TrendingUp, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BenefitsStepProps {
  onContinue: () => void
}

export function BenefitsStep({ onContinue }: BenefitsStepProps) {
  const benefits = [
    {
      icon: Sparkles,
      title: 'مواقع احترافية بالذكاء الاصطناعي',
      description: 'احصل على موقع كامل في دقائق بدلاً من أسابيع',
    },
    {
      icon: Zap,
      title: 'تعديلات غير محدودة',
      description: 'عدّل موقعك بسهولة عبر الدردشة بالعربية',
    },
    {
      icon: Globe,
      title: 'نشر بنقرة واحدة',
      description: 'اجعل موقعك متاحاً على الإنترنت فوراً',
    },
    {
      icon: Shield,
      title: 'استضافة آمنة ومجانية',
      description: 'استضافة سريعة وآمنة على شبكة Vercel العالمية',
    },
    {
      icon: TrendingUp,
      title: 'لوحة إدارة تلقائية',
      description: 'أدر منتجاتك وطلباتك بدون كود برمجي',
    },
    {
      icon: Crown,
      title: 'قوالب عربية جاهزة',
      description: '15+ قالب احترافي للمطاعم والصالونات والمتاجر',
    },
  ]

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
          🎁 تجربة مجانية لمدة 7 أيام
        </div>
        <h2 className="text-4xl font-bold mb-4">
          ابنِ موقعك الاحترافي اليوم
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          جرّب جميع المميزات <span className="font-bold text-primary">مجاناً لمدة أسبوع</span> - لن يتم خصم أي مبلغ اليوم
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={index}
              className="flex gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700
                       hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* FREE TRIAL Emphasis */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl p-6 text-center">
        <div className="text-6xl mb-3">🎯</div>
        <h3 className="text-2xl font-bold mb-2">
          7 أيام تجربة مجانية - بدون بطاقة ائتمان
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          جرّب جميع المميزات بدون أي التزام • إلغاء في أي وقت
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full text-lg py-6 font-bold"
          onClick={onContinue}
        >
          ابدأ تجربتك المجانية الآن 🚀
        </Button>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          لن يتم خصم أي مبلغ اليوم • إلغاء في أي وقت
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900"
              />
            ))}
          </div>
          <span>انضم إلى 500+ مستخدم في الكويت والخليج</span>
        </div>
      </div>
    </div>
  )
}
