"use client";

import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "واجهة عربية كاملة",
    description: "مصممة خصيصاً للمستخدم العربي. كل شيء بالعربية من اليمين لليسار - ليس مجرد ترجمة",
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "ذكاء اصطناعي متطور",
    description: "فقط اكتب ما تريد بالعربية. نموذج AI يفهم السياق ويبني التطبيق بالكامل تلقائياً",
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "نشر بنقرة واحدة",
    description: "تطبيقك جاهز للعالم في ثوانٍ. استضافة سريعة، نطاق مخصص، وSSL مجاني",
    icon: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" style={{ '--tw-gradient-via': 'rgba(59, 130, 246, 0.05)' } as any} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-24"
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <span className="text-sm font-bold" style={{ color: '#3B82F6' }}>المزايا</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span style={{ color: 'rgb(17, 24, 39)' }}>كل ما تحتاجه</span>
            <br />
            <span className="text-gradient">في منصة واحدة</span>
          </h2>
          <p className="text-xl font-serif leading-relaxed" style={{ color: 'rgb(107, 114, 128)' }}>
            ثلاثة أسباب تجعل KW APPS الخيار الأفضل لبناء تطبيقك القادم
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="card-clean group p-8 h-full flex flex-col">
                {/* Number & Icon */}
                <div className="flex items-start justify-between mb-8">
                  <span className="text-7xl font-black leading-none" style={{ color: 'rgba(59, 130, 246, 0.2)' }}>
                    {feature.number}
                  </span>
                  <div className="w-12 h-12 transition-colors duration-300" style={{ color: '#3B82F6' }}>
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-3xl font-black mb-4 group-hover:text-gradient transition-all duration-300" style={{ color: 'rgb(17, 24, 39)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed font-serif" style={{ color: 'rgb(107, 114, 128)' }}>
                    {feature.description}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#3B82F6' }}>
                  <span className="text-sm font-bold">اعرف المزيد</span>
                  <svg className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l-5 5 5 5" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
            <span className="text-lg font-bold" style={{ color: 'rgb(55, 65, 81)' }}>
              جاهز لتجربة القوة الكاملة؟
            </span>
            <a
              href="#pricing"
              className="px-6 py-2 rounded-full bg-gradient-primary text-white font-bold transition-all duration-300 shadow-glow"
            >
              ابدأ الآن
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
