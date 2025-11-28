"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Check } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50"
      dir="rtl"
    >
      {/* Subtle animated background elements - BLUE NOT PURPLE */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[128px] animate-glow-pulse"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }} /* blue-500 */
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-[128px] animate-glow-pulse"
          style={{ backgroundColor: 'rgba(96, 165, 250, 0.08)', animationDelay: '1.5s' }} /* blue-400 */
        />
      </div>

      <div className="container mx-auto px-4 pt-40 pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Overline badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 mb-12 rounded-full border-2 bg-white shadow-sm border-blue-200"
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"
              />
            </span>
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold tracking-wide text-blue-600">
              منصة عربية 100% • مدعومة بالذكاء الاصطناعي
            </span>
          </motion.div>

          {/* Main headline - BOLD & DISTINCTIVE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl md:text-9xl font-black mb-8 leading-[1.1] tracking-tight"
          >
            <span className="block text-gradient">أنشئ</span>
            <span className="block text-slate-900">موقعك</span>
            <span className="block text-gradient">بالذكاء الاصطناعي</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-3xl mb-16 max-w-3xl mx-auto leading-relaxed text-slate-600"
          >
            من الفكرة إلى الموقع الكامل في دقائق
            <br />
            <span className="font-bold text-blue-600">بدون كتابة سطر واحد من الكود</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              size="lg"
              className="group relative px-12 py-7 text-xl font-bold bg-gradient-primary hover:shadow-glow text-white border-0 shadow-lg transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/signup">
                <ArrowLeft className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                ابدأ مجاناً الآن
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="group px-12 py-7 text-xl font-bold bg-white border-2 border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-blue-500 transition-all duration-300"
              asChild
            >
              <Link href="#features">
                شاهد كيف يعمل
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">مجاني للبدء</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">بدون بطاقة ائتمانية</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium">نشر فوري</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
