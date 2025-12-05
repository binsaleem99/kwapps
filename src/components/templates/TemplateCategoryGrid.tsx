'use client';

/**
 * Template Category Grid
 *
 * Industry category selection: صالون، مطعم، متجر، محفظة
 * ThemeForest-inspired quality design
 *
 * RTL, Cairo font, mobile-first (375px)
 */

import { useState } from 'react';
import {
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { TEMPLATE_CATEGORIES, type TemplateCategory, getTemplatesByCategory } from '@/types/templates';

// Icon mapping
const CATEGORY_ICONS: Record<TemplateCategory, React.ComponentType<{ className?: string }>> = {
  salon: Scissors,
  restaurant: UtensilsCrossed,
  store: ShoppingBag,
  portfolio: Briefcase,
};

interface TemplateCategoryGridProps {
  onSelectCategory: (category: TemplateCategory) => void;
  selectedCategory?: TemplateCategory | null;
}

export function TemplateCategoryGrid({
  onSelectCategory,
  selectedCategory,
}: TemplateCategoryGridProps) {
  const [hoveredCategory, setHoveredCategory] = useState<TemplateCategory | null>(null);

  const categories = Object.values(TEMPLATE_CATEGORIES);

  return (
    <div className="font-['Cairo']" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>اختر مجال عملك</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          ما نوع الموقع الذي تريد إنشاءه؟
        </h2>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
          اختر الفئة المناسبة لمشروعك وستجد قوالب مصممة خصيصاً لها
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const templateCount = getTemplatesByCategory(category.id).length;
          const isSelected = selectedCategory === category.id;
          const isHovered = hoveredCategory === category.id;

          return (
            <button
              key={category.id}
              className={`relative group p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-right overflow-hidden ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-xl shadow-blue-500/20'
                  : isHovered
                    ? 'border-slate-300 bg-white shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onSelectCategory(category.id)}
            >
              {/* Background gradient on hover/select */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 transition-opacity duration-300 ${
                  isSelected || isHovered ? 'opacity-5' : ''
                }`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg`
                      : isHovered
                        ? `bg-gradient-to-br ${category.gradient} text-white`
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* Category Name */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  {category.nameAr}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2">
                  {category.descriptionAr}
                </p>

                {/* Template Count & Arrow */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    {templateCount} قوالب
                  </span>
                  <ChevronLeft
                    className={`w-5 h-5 transition-all duration-300 ${
                      isSelected || isHovered
                        ? 'text-blue-500 -translate-x-1'
                        : 'text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="text-center mt-8 text-slate-500 text-sm">
        <p>
          لا تجد فئتك؟{' '}
          <button className="text-blue-600 hover:text-blue-700 font-medium underline-offset-2 hover:underline">
            أنشئ موقعك من الصفر
          </button>
        </p>
      </div>
    </div>
  );
}
