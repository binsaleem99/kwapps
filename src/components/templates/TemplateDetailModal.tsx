'use client';

/**
 * Template Detail Modal
 *
 * Full template preview with:
 * - Live preview mockup with Arabic content
 * - Features list
 * - Color scheme preview
 * - Use template action
 *
 * RTL, Cairo font, mobile-first (375px)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Star,
  Users,
  Check,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Zap,
  Palette,
  Layout,
  Clock,
} from 'lucide-react';
import type { Template } from '@/types/templates';
import { TEMPLATE_CATEGORIES } from '@/types/templates';

interface TemplateDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template;
  onSelect: (template: Template) => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function TemplateDetailModal({
  open,
  onOpenChange,
  template,
  onSelect,
}: TemplateDetailModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  const category = TEMPLATE_CATEGORIES[template.category];

  // Sample Arabic content for preview based on category
  const sampleContent = getSampleContent(template.category, template.nameAr);

  const handleSelect = () => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] lg:max-w-6xl h-[90vh] p-0 overflow-hidden font-['Cairo']"
        dir="rtl"
        showCloseButton={false}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Preview Section */}
          <div className="flex-1 bg-slate-100 flex flex-col">
            {/* Device Selector */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </Button>
                <span className="text-sm text-slate-500">معاينة القالب</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('desktop')}
                  className="h-8 px-3"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('tablet')}
                  className="h-8 px-3"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('mobile')}
                  className="h-8 px-3"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => window.open(template.demoUrl || '#', '_blank')}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                فتح في نافذة جديدة
              </Button>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
              <div
                className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
                  deviceMode === 'desktop'
                    ? 'w-full max-w-4xl aspect-[16/10]'
                    : deviceMode === 'tablet'
                      ? 'w-[768px] max-w-full aspect-[4/3]'
                      : 'w-[375px] max-w-full aspect-[9/16]'
                }`}
              >
                {/* Mock Preview Content */}
                <TemplateMockPreview
                  template={template}
                  sampleContent={sampleContent}
                  deviceMode={deviceMode}
                />
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-r border-slate-200 bg-white flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start gap-2 mb-3">
                    {template.isNew && (
                      <Badge className="bg-emerald-500 text-white border-0">
                        <Sparkles className="w-3 h-3 ml-1" />
                        جديد
                      </Badge>
                    )}
                    {template.isPremium && (
                      <Badge className="bg-gradient-to-l from-amber-400 to-orange-500 text-white border-0">
                        <Star className="w-3 h-3 ml-1" />
                        مميز
                      </Badge>
                    )}
                    <Badge variant="outline" className="mr-auto">
                      {category.nameAr}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {template.nameAr}
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    {template.descriptionAr}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-bold text-slate-900">
                        {template.rating}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">التقييم</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-slate-900">
                        {template.usageCount.toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">استخدام</span>
                  </div>
                </div>

                {/* Color Scheme */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    الألوان
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex-1 text-center">
                      <div
                        className="w-full h-10 rounded-lg mb-1 border border-slate-200"
                        style={{ backgroundColor: template.colorScheme.primary }}
                      />
                      <span className="text-xs text-slate-500">رئيسي</span>
                    </div>
                    <div className="flex-1 text-center">
                      <div
                        className="w-full h-10 rounded-lg mb-1 border border-slate-200"
                        style={{ backgroundColor: template.colorScheme.secondary }}
                      />
                      <span className="text-xs text-slate-500">ثانوي</span>
                    </div>
                    <div className="flex-1 text-center">
                      <div
                        className="w-full h-10 rounded-lg mb-1 border border-slate-200"
                        style={{ backgroundColor: template.colorScheme.accent }}
                      />
                      <span className="text-xs text-slate-500">خلفية</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    المميزات
                  </h3>
                  <div className="space-y-2">
                    {template.featuresAr.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        جاهز في دقائق
                      </p>
                      <p className="text-xs text-blue-700">
                        يمكنك تخصيص هذا القالب بالكامل باستخدام الذكاء الاصطناعي
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Action Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <Button
                size="lg"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                onClick={handleSelect}
              >
                <Zap className="w-5 h-5 ml-2" />
                استخدم هذا القالب
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mock Preview Component
function TemplateMockPreview({
  template,
  sampleContent,
  deviceMode,
}: {
  template: Template;
  sampleContent: SampleContent;
  deviceMode: DeviceMode;
}) {
  const isMobile = deviceMode === 'mobile';

  return (
    <div
      className="h-full overflow-auto font-['Cairo']"
      dir="rtl"
      style={{ backgroundColor: template.colorScheme.accent }}
    >
      {/* Navigation */}
      <nav
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: template.colorScheme.primary }}
      >
        <span className="text-white font-bold text-sm sm:text-base">
          {template.nameAr}
        </span>
        {!isMobile && (
          <div className="flex gap-4 text-white/80 text-xs sm:text-sm">
            <span>الرئيسية</span>
            <span>خدماتنا</span>
            <span>اتصل بنا</span>
          </div>
        )}
        {isMobile && (
          <div className="w-6 h-6 flex flex-col justify-center gap-1">
            <span className="w-full h-0.5 bg-white rounded" />
            <span className="w-3/4 h-0.5 bg-white rounded" />
            <span className="w-1/2 h-0.5 bg-white rounded" />
          </div>
        )}
      </nav>

      {/* Hero */}
      <div
        className={`${isMobile ? 'px-4 py-8' : 'px-8 py-12'} text-center`}
        style={{
          background: `linear-gradient(135deg, ${template.colorScheme.primary}20, ${template.colorScheme.secondary}30)`,
        }}
      >
        <h1
          className={`font-bold mb-3 ${isMobile ? 'text-xl' : 'text-2xl sm:text-3xl'}`}
          style={{ color: template.colorScheme.primary }}
        >
          {sampleContent.heroTitle}
        </h1>
        <p className={`text-slate-600 mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {sampleContent.heroSubtitle}
        </p>
        <button
          className={`px-6 py-2 rounded-lg text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}
          style={{ backgroundColor: template.colorScheme.primary }}
        >
          {sampleContent.ctaText}
        </button>
      </div>

      {/* Features Grid */}
      <div className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} bg-white`}>
        <h2
          className={`font-bold text-center mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
          style={{ color: template.colorScheme.primary }}
        >
          {sampleContent.featuresTitle}
        </h2>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-3 sm:gap-4`}>
          {sampleContent.features.slice(0, isMobile ? 4 : 6).map((feature, i) => (
            <div
              key={i}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: template.colorScheme.accent }}
            >
              <div
                className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                style={{ backgroundColor: template.colorScheme.secondary }}
              >
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        className={`${isMobile ? 'px-4 py-6' : 'px-8 py-8'} text-center`}
        style={{ backgroundColor: template.colorScheme.primary }}
      >
        <h3 className={`text-white font-bold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          {sampleContent.ctaTitle}
        </h3>
        <p className="text-white/80 text-sm mb-4">{sampleContent.ctaSubtitle}</p>
        <button
          className={`px-6 py-2 rounded-lg font-medium ${isMobile ? 'text-sm' : 'text-base'}`}
          style={{
            backgroundColor: template.colorScheme.accent,
            color: template.colorScheme.primary,
          }}
        >
          تواصل معنا
        </button>
      </div>

      {/* Footer */}
      <footer className="px-4 py-4 text-center text-slate-500 text-xs bg-white border-t border-slate-100">
        جميع الحقوق محفوظة © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

// Sample Content Generator
interface SampleContent {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  featuresTitle: string;
  features: string[];
  ctaTitle: string;
  ctaSubtitle: string;
}

function getSampleContent(category: string, templateName: string): SampleContent {
  const contentMap: Record<string, SampleContent> = {
    salon: {
      heroTitle: 'أهلاً بك في صالوننا',
      heroSubtitle: 'نقدم لك أفضل خدمات التجميل والعناية بالجمال',
      ctaText: 'احجز موعدك',
      featuresTitle: 'خدماتنا المميزة',
      features: ['قص الشعر', 'صبغات الشعر', 'العناية بالبشرة', 'المكياج', 'الأظافر', 'السبا'],
      ctaTitle: 'احجز موعدك الآن',
      ctaSubtitle: 'فريق متخصص بانتظارك',
    },
    restaurant: {
      heroTitle: 'مذاق لا يُنسى',
      heroSubtitle: 'أشهى الأطباق العربية والعالمية',
      ctaText: 'اطلب الآن',
      featuresTitle: 'قائمة الطعام',
      features: ['المقبلات', 'الأطباق الرئيسية', 'المشويات', 'الحلويات', 'المشروبات', 'العروض'],
      ctaTitle: 'اطلب توصيل',
      ctaSubtitle: 'توصيل سريع لباب منزلك',
    },
    store: {
      heroTitle: 'تسوق بسهولة',
      heroSubtitle: 'أفضل المنتجات بأفضل الأسعار',
      ctaText: 'تسوق الآن',
      featuresTitle: 'الأقسام',
      features: ['جديد الموسم', 'الأكثر مبيعاً', 'العروض', 'الماركات', 'هدايا', 'التخفيضات'],
      ctaTitle: 'اشترك واحصل على خصم',
      ctaSubtitle: 'خصم 10% على طلبك الأول',
    },
    portfolio: {
      heroTitle: 'مرحباً، أنا مصمم مبدع',
      heroSubtitle: 'أساعد الشركات على بناء هويتها البصرية',
      ctaText: 'شاهد أعمالي',
      featuresTitle: 'خدماتي',
      features: ['تصميم الشعارات', 'الهوية البصرية', 'تصميم المواقع', 'التصوير', 'الموشن', 'الطباعة'],
      ctaTitle: 'لديك مشروع؟',
      ctaSubtitle: 'دعنا نتحدث عن فكرتك',
    },
  };

  return contentMap[category] || contentMap.portfolio;
}
