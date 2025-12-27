/**
 * TrialToggle Component
 *
 * Allows users to choose between:
 * 1. With Trial: 7 days free, then regular price
 * 2. Without Trial: Start immediately with 15% discount
 *
 * Psychological pricing to increase perceived value
 */

'use client'

import { Gift, Zap } from 'lucide-react'

interface TrialToggleProps {
  withTrial: boolean
  onToggle: (withTrial: boolean) => void
  planPrice: number // Monthly price in KWD
  className?: string
}

export function TrialToggle({
  withTrial,
  onToggle,
  planPrice,
  className = '',
}: TrialToggleProps) {
  const noTrialPrice = planPrice * 0.85 // 15% discount
  const weeklyPrice = planPrice / 4.33 // ~4.33 weeks per month

  return (
    <div className={`${className}`} dir="rtl">
      <h3 className="text-lg font-bold mb-4 text-center">
        اختر طريقة البدء:
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* With Trial Option */}
        <div
          onClick={() => onToggle(true)}
          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all
                   ${
                     withTrial
                       ? 'border-primary bg-primary/5 shadow-lg scale-105'
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                   }`}
        >
          {/* Badge */}
          <div className="absolute -top-3 start-1/2 -translate-x-1/2">
            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              الأكثر شعبية
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-center mb-2">
            مع تجربة مجانية
          </h4>

          {/* Price Display */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-primary">
              0.000 د.ك
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              لأول 7 أيام
            </div>
            <div className="text-lg font-semibold mt-2">
              ثم {planPrice.toFixed(3)} د.ك/شهر
            </div>
            <div className="text-xs text-gray-500">
              ({weeklyPrice.toFixed(3)} د.ك/أسبوع)
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>جرّب بدون أي التزام</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>تذكير قبل الدفع بيومين</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>إلغاء في أي وقت</span>
            </li>
          </ul>

          {/* Selection Indicator */}
          {withTrial && (
            <div className="absolute top-4 start-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          )}
        </div>

        {/* Without Trial Option */}
        <div
          onClick={() => onToggle(false)}
          className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all
                   ${
                     !withTrial
                       ? 'border-orange-500 bg-orange-500/5 shadow-lg scale-105'
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                   }`}
        >
          {/* Badge */}
          <div className="absolute -top-3 start-1/2 -translate-x-1/2">
            <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              خصم فوري 15%
            </span>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-center mb-2">
            بدون تجربة
          </h4>

          {/* Price Display */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="text-3xl font-bold text-orange-600">
                {noTrialPrice.toFixed(3)} د.ك
              </div>
              <div className="text-xl text-gray-400 line-through">
                {planPrice.toFixed(3)}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              شهرياً
            </div>
            <div className="text-lg font-semibold text-green-600 mt-2">
              وفّر {(planPrice - noTrialPrice).toFixed(3)} د.ك/شهر
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <span className="text-orange-600">✓</span>
              <span>توفير فوري 15%</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-orange-600">✓</span>
              <span>وصول فوري كامل</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <span className="text-orange-600">✓</span>
              <span>بدون انتظار</span>
            </li>
          </ul>

          {/* Selection Indicator */}
          {!withTrial && (
            <div className="absolute top-4 start-4 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        💡 نصيحة: التجربة المجانية تمنحك الوقت لاستكشاف جميع المميزات بدون أي خطر
      </div>
    </div>
  )
}
