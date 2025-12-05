'use client';

// ============================================
// Step 3: Offers with Social Proof & Price Reveal
// ============================================
// Shows pricing with trial toggle
// Unusual pricing (23.33, etc.) for authenticity
// Hides full price until interaction

import React, { useState } from 'react';
import {
  Check,
  Star,
  Users,
  TrendingUp,
  Sparkles,
  Clock,
  Gift,
  ArrowRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PricingOffer, SubscriptionTierName } from '@/types/paywall';

const PRICING_OFFERS: PricingOffer[] = [
  {
    tier: 'basic',
    display_name_ar: 'أساسي',
    trial_price_kwd: 1.0,
    trial_duration_days: 7,
    trial_label_ar: 'جرّب مجاناً ثم',
    price_kwd_monthly: 23.0,
    price_kwd_weekly: 5.33, // 23 / 4.3 weeks = ~5.33
    credits_per_month: 100,
    daily_bonus_credits: 5,
    features_ar: [
      '100 رصيد شهرياً',
      '5 رصيد يومي مجاني',
      'توليد مواقع غير محدود',
      'نشر تلقائي',
      'دعم عبر البريد',
    ],
  },
  {
    tier: 'pro',
    display_name_ar: 'احترافي',
    trial_price_kwd: 1.33,
    trial_duration_days: 7,
    trial_label_ar: 'جرّب مجاناً ثم',
    price_kwd_monthly: 38.0,
    price_kwd_weekly: 8.84, // 38 / 4.3 = ~8.84
    credits_per_month: 200,
    daily_bonus_credits: 8,
    features_ar: [
      '200 رصيد شهرياً',
      '8 رصيد يومي مجاني',
      'جميع ميزات الباقة الأساسية',
      'أولوية في الدعم الفني',
      'تحليلات متقدمة',
    ],
    is_popular: true,
    badge_ar: 'الأكثر شعبية',
  },
  {
    tier: 'premium',
    display_name_ar: 'مميز',
    trial_price_kwd: 2.0,
    trial_duration_days: 7,
    trial_label_ar: 'جرّب مجاناً ثم',
    price_kwd_monthly: 59.0,
    price_kwd_weekly: 13.72, // 59 / 4.3 = ~13.72
    credits_per_month: 350,
    daily_bonus_credits: 12,
    features_ar: [
      '350 رصيد شهرياً',
      '12 رصيد يومي مجاني',
      'جميع ميزات الباقة الاحترافية',
      'دعم فوري عبر الدردشة',
      'استشارات مخصصة',
    ],
  },
];

interface OffersStepProps {
  onSelectTier: (tier: SubscriptionTierName, withTrial: boolean) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OffersStep({ onSelectTier, onBack, isLoading }: OffersStepProps) {
  const [withTrial, setWithTrial] = useState(true);
  const [revealedPrices, setRevealedPrices] = useState<Set<SubscriptionTierName>>(
    new Set()
  );

  const togglePriceReveal = (tier: SubscriptionTierName) => {
    setRevealedPrices((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" dir="rtl">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-cairo text-sm"
          >
            ← رجوع
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-cairo">
              اختر باقتك المثالية
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-cairo">
              جرّب أسبوع كامل بـ <span className="font-bold text-blue-600 dark:text-blue-400">دينار واحد فقط</span>
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900" />
                <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-white dark:border-slate-900" />
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300 font-cairo">
                <span className="font-bold">100+</span> عميل راضٍ
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-sm text-slate-700 dark:text-slate-300 font-cairo mr-1">
                4.9/5
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-cairo">
                <span className="font-bold">نمو 300%</span> هذا الشهر
              </span>
            </div>
          </div>

          {/* Trial Toggle */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 shadow-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-cairo">
                      جرّب أسبوع كامل بدينار
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-cairo">
                      {withTrial ? '1 د.ك للأسبوع الأول' : 'بدون تجربة (خصم 10%)'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setWithTrial(!withTrial)}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    withTrial
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${
                      withTrial ? 'left-1' : 'left-7'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex-1 px-4 pb-8 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {PRICING_OFFERS.map((offer, index) => {
              const isRevealed = revealedPrices.has(offer.tier);
              const finalPrice = withTrial
                ? offer.trial_price_kwd
                : offer.price_kwd_monthly * 0.9; // 10% discount without trial

              return (
                <div
                  key={offer.tier}
                  className={`relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border-2 transition-all ${
                    offer.is_popular
                      ? 'border-blue-600 dark:border-blue-500 shadow-xl scale-105 md:scale-110'
                      : 'border-slate-200 dark:border-slate-700 shadow-md'
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Popular Badge */}
                  {offer.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold font-cairo shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {offer.badge_ar}
                      </div>
                    </div>
                  )}

                  {/* Tier Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-cairo mb-1">
                      {offer.display_name_ar}
                    </h3>
                  </div>

                  {/* Price Section */}
                  <div className="text-center mb-6">
                    {!isRevealed ? (
                      <button
                        onClick={() => togglePriceReveal(offer.tier)}
                        className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 rounded-xl p-4 transition-all group"
                      >
                        <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                          <span className="font-bold font-cairo">
                            اضغط لعرض السعر
                          </span>
                          <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                        </div>
                      </button>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => togglePriceReveal(offer.tier)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                        </button>

                        {withTrial ? (
                          <>
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-cairo mb-1">
                              {offer.trial_label_ar}
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-cairo">
                                {finalPrice.toFixed(2)}
                              </span>
                              <span className="text-lg text-slate-600 dark:text-slate-400 font-cairo">
                                د.ك
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-cairo mt-1">
                              لمدة {offer.trial_duration_days} أيام
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 font-cairo mt-2">
                              ثم {offer.price_kwd_monthly} د.ك/شهر
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-cairo">
                              (فقط {offer.price_kwd_weekly.toFixed(2)} د.ك/أسبوع)
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-cairo">
                                {finalPrice.toFixed(2)}
                              </span>
                              <span className="text-lg text-slate-600 dark:text-slate-400 font-cairo">
                                د.ك
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-cairo mt-1">
                              شهرياً
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 font-cairo font-bold mt-1">
                              وفّر 10% بدون تجربة
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {offer.features_ar.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-cairo">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => onSelectTier(offer.tier, withTrial)}
                    disabled={isLoading}
                    className={`w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl transition-all font-cairo ${
                      offer.is_popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جارٍ التحميل...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>
                          {withTrial ? 'جرّب أسبوع بدينار' : 'اشترك الآن'}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Trust Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200 font-cairo">
                ضمان استرجاع كامل خلال 30 يوم
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-cairo">
              إلغاء في أي وقت • K-Net وبطاقات معتمدة • دينار واحد للتجربة
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
