"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "أحمد الكندري",
    role: "رائد أعمال",
    company: "متجر إلكتروني",
    content: "KW APPS غيّرت طريقة عملي تماماً. أنشأت موقعي الإلكتروني في ساعة واحدة بدلاً من أسابيع!",
    rating: 5,
    avatar: "أ",
  },
  {
    name: "فاطمة العلي",
    role: "مصممة",
    company: "استوديو إبداعي",
    content: "أفضل منصة عربية لبناء المواقع. الذكاء الاصطناعي يفهم احتياجاتي بالضبط والنتائج مذهلة.",
    rating: 5,
    avatar: "ف",
  },
  {
    name: "محمد الشمري",
    role: "صاحب مطعم",
    company: "مطعم الديرة",
    content: "بدون أي خبرة برمجية، أصبح لدي موقع احترافي لمطعمي. الدعم ممتاز والأسعار معقولة جداً.",
    rating: 5,
    avatar: "م",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
            <Star className="w-4 h-4 fill-blue-500" />
            آراء عملائنا
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            ماذا يقول <span className="text-gradient">المستخدمون</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            انضم إلى المستخدمين الذين يثقون بـ KW APPS لبناء مشاريعهم الرقمية
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-blue-500/20 mb-4 group-hover:text-blue-500/40 transition-colors" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 text-lg leading-relaxed mb-6 font-medium">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-glow">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-full">
            <span className="text-2xl">🇰🇼</span>
            <span className="font-bold">منصة كويتية موثوقة</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
