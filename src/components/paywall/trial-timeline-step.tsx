'use client';

// ============================================
// Step 2: Trial Timeline with Reminder
// ============================================
// Shows what happens during the free trial
// Emphasizes "free trial" multiple times

import React from 'react';
import {
  Check,
  Calendar,
  Bell,
  CreditCard,
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TrialTimelineStep } from '@/types/paywall';

const TIMELINE: TrialTimelineStep[] = [
  {
    day: 0,
    label_ar: 'اليوم: ابدأ تجربتك المجانية',
    icon: 'Gift',
  },
  {
    day: 1,
    label_ar: 'اليوم 1: وصول كامل لجميع الميزات',
    icon: 'Sparkles',
  },
  {
    day: 5,
    label_ar: 'اليوم 5: تذكير بانتهاء التجربة المجانية',
    icon: 'Bell',
    is_payment_reminder: false,
  },
  {
    day: 7,
    label_ar: 'اليوم 7: بداية الاشتراك المدفوع',
    icon: 'CreditCard',
    is_payment_reminder: true,
  },
];

const iconMap: Record<string, any> = {
  Gift,
  Sparkles,
  Bell,
  CreditCard,
  Calendar,
};

interface TrialTimelineStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function TrialTimelineStepComponent({
  onNext,
  onBack,
}: TrialTimelineStepProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950" dir="rtl">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-cairo text-sm"
          >
            ← رجوع
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-cairo">
              تجربة مجانية لمدة 7 أيام
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-cairo">
              جرّب كل شيء <span className="font-bold text-blue-600 dark:text-blue-400">مجاناً</span> قبل أن تدفع
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 pb-32 sm:px-6">
        <div className="max-w-md mx-auto">
          {/* Key Benefits Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                ماذا تحصل خلال التجربة المجانية؟
              </h3>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-cairo">
                  وصول كامل لجميع الميزات المتقدمة
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-cairo">
                  100 رصيد + 5 رصيد يومي مجاني
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-cairo">
                  دعم فني مباشر على مدار الساعة
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-cairo">
                  إلغاء في أي وقت قبل اليوم السابع
                </span>
              </li>
            </ul>
          </div>

          {/* Timeline Steps */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-300 to-indigo-300 dark:from-blue-700 dark:to-indigo-700" />

            <div className="space-y-6">
              {TIMELINE.map((step, index) => {
                const Icon = iconMap[step.icon];
                const isLast = index === TIMELINE.length - 1;

                return (
                  <div
                    key={index}
                    className="relative flex items-start gap-4"
                    style={{
                      animation: `fadeInRight 0.5s ease-out ${index * 0.15}s both`,
                    }}
                  >
                    {/* Icon Circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isLast
                          ? 'bg-gradient-to-br from-orange-500 to-red-500'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 rounded-xl p-4 ${
                        isLast
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isLast
                              ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          } font-cairo`}
                        >
                          {step.day === 0 ? 'اليوم' : `اليوم ${step.day}`}
                        </span>
                      </div>

                      <p
                        className={`text-sm sm:text-base font-medium font-cairo ${
                          isLast
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {step.label_ar}
                      </p>

                      {step.is_payment_reminder && (
                        <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mt-2 font-cairo">
                          💳 سنرسل تذكيراً قبل يومين
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guarantee Box */}
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-base font-bold text-green-900 dark:text-green-100 mb-1 font-cairo">
                  ضمان استرجاع كامل
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200 font-cairo">
                  إذا لم تكن راضياً خلال التجربة المجانية، ألغِ بدون أي رسوم
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4 sm:px-6 sm:py-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <div className="max-w-md mx-auto">
          <Button
            onClick={onNext}
            className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-cairo group"
          >
            <span>ابدأ التجربة المجانية الآن</span>
            <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 font-cairo">
            دينار واحد فقط لأسبوع كامل • إلغاء في أي وقت
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
