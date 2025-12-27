/**
 * TrialTimelineStep - Step 2 of Paywall
 *
 * Shows trial timeline and removes fear of commitment
 * Goal: Reassure user about trial process
 *
 * Key Elements:
 * - Visual timeline (Day 0 → Day 7)
 * - Clear explanation of what happens
 * - Emphasis on "cancel anytime"
 * - Reminder timeline
 * - Continue CTA
 */

'use client'

import { Calendar, Mail, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrialTimelineStepProps {
  withTrial: boolean
  onContinue: () => void
  onBack: () => void
}

export function TrialTimelineStep({
  withTrial,
  onContinue,
  onBack,
}: TrialTimelineStepProps) {
  const timeline = [
    {
      day: 0,
      icon: Calendar,
      title: 'اليوم: تبدأ تجربتك المجانية',
      description: 'وصول فوري لجميع المميزات',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      day: 5,
      icon: Mail,
      title: 'اليوم 5: تذكير ودي',
      description: 'نرسل لك بريد إلكتروني بأن تجربتك تنتهي قريباً',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      day: 7,
      icon: CreditCard,
      title: 'اليوم 7: أول دفعة (إذا لم تلغِ)',
      description: 'يمكنك الإلغاء في أي وقت قبل اليوم 7',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ]

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">كيف تعمل التجربة المجانية؟</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          شفافية كاملة - لا مفاجآت 🎯
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6">
        {/* Connecting Line */}
        <div className="absolute top-0 bottom-0 start-5 w-1 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500" />

        {timeline.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="relative flex gap-6">
              {/* Icon Circle */}
              <div className={`relative z-10 flex-shrink-0 w-10 h-10 ${item.bgColor} rounded-full
                           flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                             rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-bold px-2 py-1 rounded ${item.bgColor} ${item.color}`}>
                      اليوم {item.day}
                    </span>
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cancellation Promise */}
      <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full
                       flex items-center justify-center">
            <X className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">إلغاء بنقرة واحدة، في أي وقت</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              لا تحتاج للاتصال بأحد أو إرسال بريد إلكتروني. فقط انقر على "إلغاء الاشتراك" من لوحة التحكم.
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>لا توجد رسوم إلغاء</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>لا توجد أسئلة</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>تلغي خلال 30 ثانية</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full text-xl py-7 font-bold"
          onClick={onContinue}
        >
          متابعة - ابدأ تجربتك المجانية 🎁
        </Button>

        <div className="text-center text-sm text-gray-500">
          <span className="font-bold">تجربة مجانية لمدة 7 أيام</span> • لا حاجة لبطاقة ائتمان
        </div>
      </div>

      {/* Trust Signals */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>معلومات آمنة ومشفرة</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⭐⭐⭐⭐⭐</span>
          <span>تقييم 4.9/5</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span>صُنع في الكويت 🇰🇼</span>
        </div>
      </div>
    </div>
  )
}
