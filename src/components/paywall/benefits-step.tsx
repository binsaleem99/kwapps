'use client';

// ============================================
// Step 1: Benefits Showcase
// ============================================
// Highlights key benefits before showing pricing
// Mobile-first, Arabic RTL

import React from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  Globe,
  Rocket,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Benefit } from '@/types/paywall';

const BENEFITS: Benefit[] = [
  {
    icon: 'Sparkles',
    title_ar: 'ذكاء اصطناعي متقدم',
    description_ar: 'توليد مواقع احترافية بالكامل من وصف بسيط بالعربية',
  },
  {
    icon: 'Zap',
    title_ar: 'إنشاء فوري',
    description_ar: 'موقعك جاهز في دقائق، ليس ساعات أو أيام',
  },
  {
    icon: 'Globe',
    title_ar: 'نشر تلقائي',
    description_ar: 'نشر مباشر على الإنترنت بنقرة واحدة',
  },
  {
    icon: 'Shield',
    title_ar: 'آمن ومستضاف',
    description_ar: 'استضافة سحابية آمنة مع شهادة SSL مجانية',
  },
  {
    icon: 'Rocket',
    title_ar: 'أداء عالي',
    description_ar: 'مواقع سريعة ومحسّنة لمحركات البحث',
  },
  {
    icon: 'Award',
    title_ar: 'تصاميم حديثة',
    description_ar: 'قوالب عصرية متوافقة مع جميع الأجهزة',
  },
];

const iconMap: Record<string, any> = {
  Sparkles,
  Zap,
  Shield,
  Globe,
  Rocket,
  Award,
  Clock,
  Users,
};

interface BenefitsStepProps {
  onNext: () => void;
}

export function BenefitsStep({ onNext }: BenefitsStepProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900" dir="rtl">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 mb-4">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-cairo">
            جرّب أسبوع كامل بدينار واحد
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-cairo">
            وصول كامل لجميع الميزات بـ <span className="font-bold text-blue-600 dark:text-blue-400">1 د.ك فقط</span>
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="flex-1 px-4 pb-32 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {BENEFITS.map((benefit, index) => {
              const Icon = iconMap[benefit.icon];

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1 font-cairo">
                        {benefit.title_ar}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-cairo leading-relaxed">
                        {benefit.description_ar}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 font-cairo">
                100+
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-cairo">
                عميل راضٍ
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 font-cairo">
                4.9★
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-cairo">
                تقييم المستخدمين
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1 font-cairo">
                24/7
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-cairo">
                دعم فني
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
            className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-cairo"
          >
            جرّب أسبوع بدينار واحد
          </Button>

          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-3 font-cairo">
            دينار واحد فقط • K-Net وبطاقات معتمدة • إلغاء في أي وقت
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
