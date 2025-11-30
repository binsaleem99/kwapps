"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "مجاني",
    nameEn: "FREE",
    price: "0",
    period: "للأبد",
    description: "للتجربة والبدء",
    features: [
      "3 مطالبات يومياً",
      "قوالب أساسية",
      "معاينة مباشرة",
      "دعم المجتمع",
    ],
    cta: "ابدأ مجاناً",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "منشئ",
    nameEn: "BUILDER",
    price: "33",
    period: "شهرياً",
    description: "للمطورين والوكالات",
    features: [
      "30 مطالبة يومياً",
      "جميع القوالب",
      "تصدير الكود",
      "دعم ذو أولوية",
      "مشاريع غير محدودة",
    ],
    cta: "ابدأ الآن",
    href: "/signup?plan=builder",
    highlighted: true,
  },
  {
    name: "احترافي",
    nameEn: "PRO",
    price: "59",
    period: "شهرياً",
    description: "للشركات والفرق",
    features: [
      "100 مطالبة يومياً",
      "قوالب مميزة",
      "نشر فوري",
      "تحكم بالإصدارات",
      "مشاركة الفريق",
      "دعم مباشر 24/7",
    ],
    cta: "ترقية",
    href: "/signup?plan=pro",
    highlighted: false,
  },
];

export function Pricing() {
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
            ابدأ مجاناً وترقّى عندما تكون جاهزاً. بدون مفاجآت
          </p>
        </motion.div>

        {/* Pricing Grid - BOLD CARDS with dark highlighted plan */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
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
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-center py-3 shadow-electric">
                    <span className="text-sm font-black text-white tracking-wide">
                      ⭐ الأكثر شعبية
                    </span>
                  </div>
                )}

                {/* Card content */}
                <div className={`p-10 h-full flex flex-col ${plan.highlighted ? "pt-16" : ""}`}>
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
                    className={`w-full text-lg font-black py-6 transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-glow-lg hover:shadow-electric hover:scale-105"
                        : "bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white hover:scale-105"
                    }`}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
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
