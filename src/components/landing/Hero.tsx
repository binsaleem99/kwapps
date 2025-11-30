"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Check } from "lucide-react";
import MeshGradient from "@/components/background/mesh-gradient";
import NoiseTexture from "@/components/background/noise-texture";
import FloatingShapes from "@/components/background/floating-shapes";

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      dir="rtl"
    >
      {/* LAYERED ATMOSPHERIC BACKGROUNDS - Fighting AI Slop */}
      {/* Layer 1: Mesh gradient (4-corner radials) */}
      <MeshGradient variant="hero" animated />

      {/* Layer 2: Noise texture (film grain) */}
      <NoiseTexture opacity={0.15} blend="multiply" />

      {/* Layer 3: Floating geometric shapes */}
      <FloatingShapes count={5} variant="bold" />

      {/* ASYMMETRIC 40/60 LAYOUT - Fighting predictable 50/50 grids */}
      <div className="container mx-auto px-4 pt-32 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* RIGHT COLUMN: 60% - EXTREME TYPOGRAPHY */}
          <div className="lg:col-span-7 text-right">
            {/* STEP 1: Badge (delay 0s) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-white/80 backdrop-blur-xl border border-blue-200 shadow-glow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-extrabold tracking-wide text-blue-600">
                منصة عربية 100% • مدعومة بالذكاء الاصطناعي
              </span>
            </motion.div>

            {/* STEP 2: MASSIVE 10xl HEADLINE (delay 0.2s) */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-10xl mb-6"
            >
              <span className="block text-slate-900">أنشئ</span>
              <span className="block text-gradient">تطبيقك</span>
            </motion.h1>

            {/* STEP 3: SUB-HEADLINE (delay 0.4s) */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-extrabold mb-4 text-slate-700 leading-tight"
            >
              بالذكاء الاصطناعي
            </motion.p>

            {/* STEP 4: SUPPORTING TEXT (delay 0.6s) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl mb-12 max-w-2xl text-slate-600 leading-relaxed"
            >
              من الفكرة إلى التطبيق الكامل في دقائق.{' '}
              <span className="font-extrabold text-blue-600">
                بدون كتابة سطر واحد من الكود
              </span>
            </motion.p>

            {/* STEP 5: CTA BUTTONS (delay 0.8s) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-start gap-6"
            >
              <Button
                size="lg"
                className="group relative px-12 py-7 text-xl font-black bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-glow-lg hover:shadow-glow-xl hover:scale-105 transition-all duration-300 border-0"
                asChild
              >
                <Link href="/signup">
                  <ArrowLeft className="ml-3 h-6 w-6 transition-transform group-hover:-translate-x-2" />
                  ابدأ مجاناً الآن
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group px-12 py-7 text-xl font-black bg-white/60 backdrop-blur-sm border-3 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300"
                asChild
              >
                <Link href="#features">شاهد كيف يعمل</Link>
              </Button>
            </motion.div>
          </div>

          {/* LEFT COLUMN: 40% - TRUST INDICATORS & STATS */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="space-y-8"
            >
              {/* Trust indicators with bold design */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-glow border border-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-electric">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">
                      مجاني للبدء
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-electric">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">
                      بدون بطاقة ائتمانية
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-electric">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">
                      نشر فوري على الإنترنت
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-glow-lg text-white">
                <div className="text-6xl font-black mb-2 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                  +1000
                </div>
                <p className="text-lg font-bold text-slate-300">
                  تطبيق تم إنشاؤه بنجاح
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
