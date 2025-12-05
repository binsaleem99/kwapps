'use client';

/**
 * Template Choice Modal
 *
 * Initial popup asking user to choose between:
 * - Using a template (organized selection)
 * - Building from scratch (AI-powered)
 *
 * RTL, Cairo font, mobile-first (375px)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LayoutTemplate,
  Sparkles,
  ArrowLeft,
  Zap,
  Clock,
  Palette,
  Code2,
  Wand2,
  CheckCircle,
} from 'lucide-react';

interface TemplateChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChooseTemplate: () => void;
  onBuildFromScratch: () => void;
}

export function TemplateChoiceModal({
  open,
  onOpenChange,
  onChooseTemplate,
  onBuildFromScratch,
}: TemplateChoiceModalProps) {
  const [hoveredOption, setHoveredOption] = useState<'template' | 'scratch' | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[680px] p-0 overflow-hidden font-['Cairo']"
        dir="rtl"
        showCloseButton={true}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-l from-slate-900 to-slate-800 px-6 py-8 text-white">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl sm:text-3xl font-bold mb-2">
              كيف تريد أن تبدأ؟
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-base sm:text-lg">
              اختر الطريقة المناسبة لإنشاء موقعك
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Template Option */}
          <button
            className={`w-full p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 text-right ${
              hoveredOption === 'template'
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
            onMouseEnter={() => setHoveredOption('template')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={onChooseTemplate}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  hoveredOption === 'template'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <LayoutTemplate className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  اختر من القوالب الجاهزة
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">
                  قوالب احترافية جاهزة مصممة لمختلف المجالات. اختر قالبك وابدأ التخصيص فوراً.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    سريع جداً
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Palette className="w-3.5 h-3.5 text-pink-500" />
                    تصاميم احترافية
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    جاهز للاستخدام
                  </span>
                </div>
              </div>
              <ArrowLeft
                className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all duration-300 ${
                  hoveredOption === 'template'
                    ? 'text-blue-500 -translate-x-1'
                    : 'text-slate-400'
                }`}
              />
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm font-medium">أو</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Build from Scratch Option */}
          <button
            className={`w-full p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 text-right ${
              hoveredOption === 'scratch'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
            onMouseEnter={() => setHoveredOption('scratch')}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={onBuildFromScratch}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  hoveredOption === 'scratch'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Wand2 className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  أنشئ من الصفر بالذكاء الاصطناعي
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mb-4 leading-relaxed">
                  صف ما تريده بالعربية ودع الذكاء الاصطناعي يبني موقعك المخصص بالكامل.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    ذكاء اصطناعي
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                    تخصيص كامل
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    مرونة عالية
                  </span>
                </div>
              </div>
              <ArrowLeft
                className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-all duration-300 ${
                  hoveredOption === 'scratch'
                    ? 'text-emerald-500 -translate-x-1'
                    : 'text-slate-400'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <p className="text-center text-slate-500 text-sm">
            يمكنك تغيير قرارك لاحقاً في أي وقت
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
