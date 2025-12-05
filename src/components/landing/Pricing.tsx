"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SubscriptionTierName } from "@/types/billing";

const plans = [
  {
    name: "أساسي",
    nameEn: "BASIC",
    tierName: "basic" as SubscriptionTierName,
    price: "23",
    period: "شهرياً",
    description: "للمطورين المستقلين",
    hasTrial: true,
    trialPrice: "1",
    features: [
      "100 رصيد شهرياً",
      "5 رصيد يومي إضافي",
      "تصدير الكود",
      "دعم عبر البريد",
      "معاينة مباشرة",
    ],
    cta: "جرب بدينار واحد",
    highlighted: true,
  },
  {
    name: "احترافي",
    nameEn: "PRO",
    tierName: "pro" as SubscriptionTierName,
    price: "38",
    period: "شهرياً",
    description: "للفرق الصغيرة",
    hasTrial: false,
    features: [
      "200 رصيد شهرياً",
      "8 رصيد يومي إضافي",
      "تصدير الكود",
      "دعم ذو أولوية",
      "نشر على Vercel",
      "تحليلات متقدمة",
    ],
    cta: "اشترك الآن",
    highlighted: false,
  },
  {
    name: "مميز",
    nameEn: "PREMIUM",
    tierName: "premium" as SubscriptionTierName,
    price: "59",
    period: "شهرياً",
    description: "للمحترفين",
    hasTrial: false,
    features: [
      "350 رصيد شهرياً",
      "12 رصيد يومي إضافي",
      "توليد صور AI",
      "نطاق مخصص",
      "دعم مباشر",
      "أولوية في الطلبات",
    ],
    cta: "اشترك الآن",
    highlighted: false,
  },
  {
    name: "مؤسسي",
    nameEn: "ENTERPRISE",
    tierName: "enterprise" as SubscriptionTierName,
    price: "75",
    period: "شهرياً",
    description: "للشركات والوكالات",
    hasTrial: false,
    features: [
      "500 رصيد شهرياً",
      "15 رصيد يومي إضافي",
      "توليد صور AI",
      "دعم 24/7",
      "White Label",
      "API مخصص",
    ],
    cta: "تواصل معنا",
    highlighted: false,
  },
];

export function Pricing() {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (tierName: SubscriptionTierName, isTrial: boolean = false) => {
    setLoadingTier(tierName);
    setError(null);

    try {
      // Check if user is authenticated
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to sign-in with return URL to pricing
        router.push(`/sign-in?redirect=/pricing&tier=${tierName}&trial=${isTrial}`);
        return;
      }

      // Call checkout API
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier_name: tierName,
          is_trial: isTrial,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.error_en || 'فشل إنشاء جلسة الدفع');
      }

      // Redirect to UPayments payment page
      if (data.payment_link) {
        window.location.href = data.payment_link;
      } else {
        throw new Error('لم يتم استلام رابط الدفع');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'حدث خطأ أثناء الاشتراك');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <section id="pricing" className="relative py-40 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Dramatic background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - EXTREME TYPOGRAPHY */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center max-w-4xl mx-auto mb-32"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-blue-500/10 border-2 border-blue-500/20">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-black text-blue-600">الأسعار</span>
          </div>
          <h2 className="text-8xl mb-8">
            <span className="block text-slate-900">خطط واضحة</span>
            <span className="block bg-gradient-to-l from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              أسعار عادلة
            </span>
          </h2>
          <p className="text-2xl font-extrabold text-slate-600 leading-relaxed">
            جرب الخطة الأساسية بدينار واحد لأسبوع كامل. بدون مفاجآت
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-bold">
              {error}
            </div>
          )}
        </motion.div>

        {/* Pricing Grid - BOLD CARDS with dark highlighted plan */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.nameEn}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className={`${plan.highlighted ? "md:-mt-8 md:mb-8" : ""}`}
            >
              <div className={`relative h-full rounded-3xl overflow-hidden ${
                plan.highlighted
                  ? "bg-gradient-to-br from-slate-900 to-slate-800 shadow-glow-2xl border-2 border-blue-500"
                  : "bg-white border-2 border-slate-200 shadow-lg hover:shadow-glow-xl"
              } transition-all duration-500 hover:-translate-y-2`}>
                {/* Trial badge for developer plan */}
                {plan.hasTrial && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-center py-3 shadow-electric">
                    <span className="text-sm font-black text-white tracking-wide">
                      🎯 جرب أسبوع كامل بدينار واحد فقط
                    </span>
                  </div>
                )}

                {/* Card content */}
                <div className={`p-10 h-full flex flex-col ${plan.hasTrial ? "pt-16" : ""}`}>
                  {/* Plan name */}
                  <div className="mb-8">
                    <div className={`text-xs font-black mb-2 tracking-wider ${
                      plan.highlighted ? "text-blue-400" : "text-slate-500"
                    }`}>{plan.nameEn}</div>
                    <h3 className={`text-4xl font-black mb-3 ${
                      plan.highlighted ? "text-white" : "text-slate-900"
                    }`}>{plan.name}</h3>
                    <p className={`text-sm font-extrabold ${
                      plan.highlighted ? "text-slate-400" : "text-slate-600"
                    }`}>{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-7xl font-black ${
                        plan.highlighted
                          ? "bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                          : "text-slate-900"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.price !== "0" && (
                        <span className={`text-3xl font-black ${
                          plan.highlighted ? "text-slate-400" : "text-slate-600"
                        }`}>د.ك</span>
                      )}
                    </div>
                    <div className={`mt-2 font-extrabold ${
                      plan.highlighted ? "text-slate-500" : "text-slate-600"
                    }`}>{plan.period}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-5 flex-1 mb-10">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.highlighted
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`font-extrabold ${
                          plan.highlighted ? "text-slate-300" : "text-slate-700"
                        }`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    onClick={() => handleSubscribe(plan.tierName, plan.hasTrial)}
                    disabled={loadingTier !== null}
                    className={`w-full text-lg font-black py-6 transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-lg hover:shadow-electric hover:scale-105"
                        : "bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:scale-105"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingTier === plan.tierName ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري التحميل...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hosting add-on - ELECTRIC */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-4 px-10 py-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-glow hover:shadow-glow-lg transition-all duration-500">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <span className="text-xl font-black text-slate-900">
              استضافة التطبيقات:{" "}
              <span className="bg-gradient-to-l from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                5 د.ك/شهرياً
              </span>{" "}
              لكل تطبيق
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
