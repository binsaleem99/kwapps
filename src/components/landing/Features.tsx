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
    <section id="features" className="relative py-40 overflow-hidden bg-white">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header - EXTREME TYPOGRAPHY */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-4xl mb-32"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-blue-500/10 border-2 border-blue-500/20">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-black text-blue-600">المزايا</span>
          </div>
          <h2 className="text-8xl mb-8">
            <span className="block text-slate-900">كل ما تحتاجه</span>
            <span className="block bg-gradient-to-l from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              في منصة واحدة
            </span>
          </h2>
          <p className="text-2xl font-extrabold text-slate-600 leading-relaxed max-w-2xl">
            ثلاثة أسباب تجعل KW APPS الخيار الأفضل لبناء تطبيقك القادم
          </p>
        </motion.div>

        {/* Features Grid - BOLD CARDS with dramatic shadows */}
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative h-full bg-white rounded-3xl p-10 border-2 border-slate-200 shadow-lg hover:shadow-glow-xl hover:-translate-y-3 hover:border-blue-500 transition-all duration-500">
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 rounded-3xl transition-all duration-500" />

                {/* Content container */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Number & Icon */}
                  <div className="flex items-start justify-between mb-10">
                    <span className="text-9xl font-black leading-none text-blue-500/15 group-hover:text-blue-500/30 transition-colors duration-500">
                      {feature.number}
                    </span>
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-electric transition-all duration-500">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-4xl font-black mb-5 text-slate-900 group-hover:bg-gradient-to-l group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                      {feature.title}
                    </h3>
                    <p className="text-lg leading-relaxed font-extrabold text-slate-600 group-hover:text-slate-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <div className="mt-10 flex items-center gap-2 text-blue-600 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    <span className="text-sm font-black">اعرف المزيد</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l-5 5 5 5" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - ELECTRIC */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 text-center"
        >
          <div className="inline-flex items-center gap-6 px-10 py-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-glow hover:shadow-glow-lg transition-all duration-500">
            <span className="text-2xl font-black text-slate-900">
              جاهز لتجربة القوة الكاملة؟
            </span>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black shadow-glow-lg hover:shadow-electric hover:scale-110 transition-all duration-300"
            >
              ابدأ الآن
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
