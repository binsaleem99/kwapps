'use client';

/**
 * Template Preview Card
 *
 * Individual template card with preview, features, and actions
 * ThemeForest-inspired quality design
 *
 * RTL, Cairo font, mobile-first (375px)
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Star,
  Users,
  Sparkles,
  Check,
  ExternalLink,
  Zap,
} from 'lucide-react';
import type { Template } from '@/types/templates';

interface TemplatePreviewCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onSelect: (template: Template) => void;
}

export function TemplatePreviewCard({
  template,
  onPreview,
  onSelect,
}: TemplatePreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-slate-200 font-['Cairo']"
      dir="rtl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {/* Placeholder gradient while loading */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse transition-opacity duration-300 ${
            imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Template Preview Image */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            template.category === 'salon'
              ? 'from-pink-100 to-rose-200'
              : template.category === 'restaurant'
                ? 'from-orange-100 to-amber-200'
                : template.category === 'store'
                  ? 'from-blue-100 to-cyan-200'
                  : 'from-emerald-100 to-teal-200'
          } flex items-center justify-center transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        >
          {/* Placeholder design */}
          <div className="w-3/4 h-3/4 bg-white/80 rounded-lg shadow-lg p-4 flex flex-col">
            <div className="h-2 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-1.5 bg-slate-100 rounded w-3/4 mb-2" />
            <div className="h-1.5 bg-slate-100 rounded w-2/3 mb-4" />
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="bg-slate-100 rounded" />
              <div className="bg-slate-100 rounded" />
              <div className="bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-slate-100 text-slate-900"
            onClick={() => onPreview(template)}
          >
            <Eye className="w-4 h-4 ml-2" />
            معاينة
          </Button>
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => onSelect(template)}
          >
            <Zap className="w-4 h-4 ml-2" />
            استخدم
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {template.isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md">
              <Sparkles className="w-3 h-3 ml-1" />
              جديد
            </Badge>
          )}
          {template.isPremium && (
            <Badge className="bg-gradient-to-l from-amber-400 to-orange-500 text-white border-0 shadow-md">
              <Star className="w-3 h-3 ml-1" />
              مميز
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-sm shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-medium text-slate-700">{template.rating}</span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 sm:p-5">
        {/* Title & Description */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 text-right">
          {template.nameAr}
        </h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 text-right leading-relaxed">
          {template.descriptionAr}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-4">
          {template.featuresAr.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-right">{feature}</span>
            </div>
          ))}
          {template.featuresAr.length > 3 && (
            <span className="text-xs text-slate-400 block text-right">
              +{template.featuresAr.length - 3} ميزات أخرى
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Users className="w-4 h-4" />
            <span>{template.usageCount.toLocaleString('ar-EG')}</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
            onClick={() => onPreview(template)}
          >
            التفاصيل
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
