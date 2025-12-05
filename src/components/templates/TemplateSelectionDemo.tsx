'use client';

/**
 * Template Selection Demo
 *
 * Demonstrates the full template selection flow.
 * Can be used as a standalone page or embedded in the builder.
 *
 * Usage:
 * - Import and render <TemplateSelectionDemo /> in any page
 * - Or use the useTemplateSelection hook for custom integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  LayoutTemplate,
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Rocket,
  CheckCircle,
} from 'lucide-react';
import { useTemplateSelection } from '@/hooks/useTemplateSelection';
import { TemplateCategoryGrid } from './TemplateCategoryGrid';
import type { Template, TemplateCategory } from '@/types/templates';
import { TEMPLATE_CATEGORIES } from '@/types/templates';

export function TemplateSelectionDemo() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [buildMode, setBuildMode] = useState<'template' | 'scratch' | null>(null);

  const {
    openChoiceModal,
    openTemplates,
    openTemplatesWithCategory,
    TemplateModals,
  } = useTemplateSelection({
    onSelectTemplate: (template) => {
      setSelectedTemplate(template);
      setBuildMode('template');
    },
    onBuildFromScratch: () => {
      setSelectedTemplate(null);
      setBuildMode('scratch');
    },
  });

  const handleCategorySelect = (category: TemplateCategory) => {
    openTemplatesWithCategory(category);
  };

  const handleReset = () => {
    setSelectedTemplate(null);
    setBuildMode(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-['Cairo']" dir="rtl">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-700 mb-4 px-4 py-1">
            <Sparkles className="w-4 h-4 ml-2" />
            نظام اختيار القوالب
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            أنشئ موقعك الآن
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            اختر من القوالب الجاهزة أو ابدأ من الصفر بمساعدة الذكاء الاصطناعي
          </p>
        </div>

        {/* Main Action */}
        {!buildMode ? (
          <>
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg shadow-lg shadow-blue-500/20"
                onClick={openChoiceModal}
              >
                <Rocket className="w-5 h-5 ml-2" />
                ابدأ مشروعك الآن
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg"
                onClick={openTemplates}
              >
                <LayoutTemplate className="w-5 h-5 ml-2" />
                تصفح القوالب
              </Button>
            </div>

            {/* Category Grid */}
            <div className="max-w-4xl mx-auto">
              <TemplateCategoryGrid
                onSelectCategory={handleCategorySelect}
              />
            </div>
          </>
        ) : (
          /* Selection Result */
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div
                className={`h-2 ${
                  buildMode === 'template' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}
              />
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <CheckCircle
                    className={`w-8 h-8 ${
                      buildMode === 'template' ? 'text-blue-500' : 'text-emerald-500'
                    }`}
                  />
                </div>
                <CardTitle className="text-2xl">
                  {buildMode === 'template' ? 'تم اختيار القالب!' : 'البناء من الصفر'}
                </CardTitle>
                <CardDescription className="text-base">
                  {buildMode === 'template'
                    ? 'يمكنك الآن البدء في تخصيص قالبك'
                    : 'صف ما تريده ودع الذكاء الاصطناعي يبنيه لك'}
                </CardDescription>
              </CardHeader>

              {selectedTemplate && (
                <CardContent className="pt-0">
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedTemplate.category === 'salon'
                            ? 'bg-pink-100 text-pink-600'
                            : selectedTemplate.category === 'restaurant'
                              ? 'bg-orange-100 text-orange-600'
                              : selectedTemplate.category === 'store'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {selectedTemplate.category === 'salon' && <Scissors className="w-6 h-6" />}
                        {selectedTemplate.category === 'restaurant' && <UtensilsCrossed className="w-6 h-6" />}
                        {selectedTemplate.category === 'store' && <ShoppingBag className="w-6 h-6" />}
                        {selectedTemplate.category === 'portfolio' && <Briefcase className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{selectedTemplate.nameAr}</h3>
                        <p className="text-sm text-slate-500">
                          {TEMPLATE_CATEGORIES[selectedTemplate.category].nameAr}
                        </p>
                      </div>
                      {selectedTemplate.isPremium && (
                        <Badge className="bg-gradient-to-l from-amber-400 to-orange-500 text-white border-0">
                          مميز
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}

              <CardContent className="pt-0">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      // Navigate to builder with template
                      window.location.href = selectedTemplate
                        ? `/builder?template=${selectedTemplate.slug}`
                        : '/builder';
                    }}
                  >
                    <Sparkles className="w-4 h-4 ml-2" />
                    {buildMode === 'template' ? 'تخصيص القالب' : 'ابدأ البناء'}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    تغيير الاختيار
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modals */}
        {TemplateModals}
      </div>
    </div>
  );
}
