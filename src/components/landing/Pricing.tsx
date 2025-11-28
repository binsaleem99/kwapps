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
    gradient: "from-gray-50 to-gray-100",
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
    gradient: "from-blue-600 to-blue-500",
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
    gradient: "from-gray-50 to-gray-100",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 w-full h-full bg-gradient-to-b from-transparent via-transparent to-transparent" style={{ background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.03) 0%, transparent 100%)' }} />
        <div className="absolute bottom-0 right-1/2 w-full h-full bg-gradient-to-t from-transparent via-transparent to-transparent" style={{ background: 'linear-gradient(0deg, rgba(96, 165, 250, 0.03) 0%, transparent 100%)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-24"
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <span className="text-sm font-bold" style={{ color: '#3B82F6' }}>الأسعار</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span style={{ color: 'rgb(17, 24, 39)' }}>خطط واضحة</span>
            <br />
            <span className="text-gradient">أسعار عادلة</span>
          </h2>
          <p className="text-xl font-serif leading-relaxed" style={{ color: 'rgb(107, 114, 128)' }}>
            ابدأ مجاناً وترقّى عندما تكون جاهزاً. بدون مفاجآت
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.nameEn}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={plan.highlighted ? "md:-mt-8" : ""}
            >
              <div className={`relative h-full rounded-2xl overflow-hidden ${
                plan.highlighted ? "ring-2 ring-blue-500/30 shadow-2xl" : ""
              }`} style={plan.highlighted ? { boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.2)' } : {}}>
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-center py-2">
                    <span className="text-sm font-black text-white tracking-wide">
                      الأكثر شعبية
                    </span>
                  </div>
                )}

                {/* Card content */}
                <div className={`p-8 h-full flex flex-col bg-white border ${plan.highlighted ? "pt-14" : ""}`} style={{ borderColor: 'rgb(229, 231, 235)' }}>
                  {/* Plan name */}
                  <div className="mb-8">
                    <div className="text-sm font-bold mb-2" style={{ color: 'rgb(107, 114, 128)' }}>{plan.nameEn}</div>
                    <h3 className="text-3xl font-black mb-2" style={{ color: 'rgb(17, 24, 39)' }}>{plan.name}</h3>
                    <p className="text-sm font-serif" style={{ color: 'rgb(107, 114, 128)' }}>{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-6xl font-black ${
                        plan.highlighted ? "text-gradient" : ""
                      }`} style={!plan.highlighted ? { color: 'rgb(17, 24, 39)' } : {}}>
                        {plan.price}
                      </span>
                      {plan.price !== "0" && (
                        <span className="text-2xl font-bold" style={{ color: 'rgb(107, 114, 128)' }}>د.ك</span>
                      )}
                    </div>
                    <div className="mt-2" style={{ color: 'rgb(107, 114, 128)' }}>{plan.period}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 flex-1 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          style={{ color: '#2ECC71' }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium" style={{ color: 'rgb(55, 65, 81)' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    className={`w-full text-lg font-black transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gradient-primary text-white shadow-glow"
                        : ""
                    }`}
                    style={!plan.highlighted
                      ? { backgroundColor: 'rgb(243, 244, 246)', color: 'rgb(17, 24, 39)' }
                      : undefined
                    }
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hosting add-on */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border" style={{ borderColor: 'rgb(229, 231, 235)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#2ECC71' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <span style={{ color: 'rgb(55, 65, 81)' }}>
              استضافة التطبيقات:{" "}
              <span className="font-black text-gradient">5 د.ك/شهرياً</span> لكل تطبيق
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
