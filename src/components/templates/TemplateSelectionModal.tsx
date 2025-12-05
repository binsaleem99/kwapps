'use client';

/**
 * Template Selection Modal
 *
 * Full-screen modal for template browsing and selection
 * - Category filters
 * - Template grid with previews
 * - Search functionality
 *
 * RTL, Cairo font, mobile-first (375px)
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  X,
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  LayoutGrid,
  ArrowRight,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  TEMPLATE_CATEGORIES,
  MOCK_TEMPLATES,
  type TemplateCategory,
  type Template,
} from '@/types/templates';
import { TemplatePreviewCard } from './TemplatePreviewCard';
import { TemplateDetailModal } from './TemplateDetailModal';

// Icon mapping
const CATEGORY_ICONS: Record<TemplateCategory | 'all', React.ComponentType<{ className?: string }>> = {
  all: LayoutGrid,
  salon: Scissors,
  restaurant: UtensilsCrossed,
  store: ShoppingBag,
  portfolio: Briefcase,
};

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
  initialCategory?: TemplateCategory | null;
}

export function TemplateSelectionModal({
  open,
  onOpenChange,
  onSelectTemplate,
  initialCategory = null,
}: TemplateSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>(
    initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let templates = MOCK_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.nameAr.includes(query) ||
          t.nameEn.toLowerCase().includes(query) ||
          t.descriptionAr.includes(query) ||
          t.featuresAr.some((f) => f.includes(query))
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MOCK_TEMPLATES.length };
    Object.keys(TEMPLATE_CATEGORIES).forEach((cat) => {
      counts[cat] = MOCK_TEMPLATES.filter((t) => t.category === cat).length;
    });
    return counts;
  }, []);

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleSelect = (template: Template) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const handleBack = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl h-[90vh] p-0 overflow-hidden font-['Cairo']"
          dir="rtl"
          showCloseButton={false}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <DialogHeader className="text-right p-0">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                      اختر قالبك
                    </DialogTitle>
                  </DialogHeader>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="ابحث عن قالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 text-right"
                  />
                </div>

                {/* Category Filter Pills - Mobile */}
                <div className="sm:hidden">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex gap-2 pb-2">
                      <CategoryPill
                        id="all"
                        label="الكل"
                        count={categoryCounts.all}
                        isSelected={selectedCategory === 'all'}
                        onClick={() => setSelectedCategory('all')}
                      />
                      {Object.values(TEMPLATE_CATEGORIES).map((cat) => (
                        <CategoryPill
                          key={cat.id}
                          id={cat.id}
                          label={cat.nameAr}
                          count={categoryCounts[cat.id]}
                          isSelected={selectedCategory === cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar - Desktop */}
            <div className="hidden sm:block w-56 lg:w-64 border-l border-slate-200 bg-slate-50/50 p-4">
              <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                الفئات
              </h3>
              <div className="space-y-1">
                <SidebarCategory
                  id="all"
                  label="جميع القوالب"
                  count={categoryCounts.all}
                  isSelected={selectedCategory === 'all'}
                  onClick={() => setSelectedCategory('all')}
                />
                {Object.values(TEMPLATE_CATEGORIES).map((cat) => (
                  <SidebarCategory
                    key={cat.id}
                    id={cat.id}
                    label={cat.nameAr}
                    count={categoryCounts[cat.id]}
                    isSelected={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                  />
                ))}
              </div>

              {/* Pro tip */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">نصيحة</p>
                    <p className="text-xs text-blue-700">
                      يمكنك تخصيص أي قالب بالكامل بعد اختياره
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Grid */}
            <ScrollArea className="flex-1">
              <div className="p-4 sm:p-6">
                {/* Results count */}
                <div className="mb-4 text-sm text-slate-500">
                  {filteredTemplates.length === 0 ? (
                    'لا توجد قوالب'
                  ) : (
                    <>
                      عرض <span className="font-semibold text-slate-700">{filteredTemplates.length}</span> قالب
                      {selectedCategory !== 'all' && (
                        <span>
                          {' '}
                          في{' '}
                          <span className="font-semibold text-slate-700">
                            {TEMPLATE_CATEGORIES[selectedCategory].nameAr}
                          </span>
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Empty State */}
                {filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      لم نجد قوالب مطابقة
                    </h3>
                    <p className="text-slate-500 mb-4 max-w-sm">
                      جرب البحث بكلمات مختلفة أو اختر فئة أخرى
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                    >
                      عرض جميع القوالب
                    </Button>
                  </div>
                ) : (
                  /* Templates Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplatePreviewCard
                        key={template.id}
                        template={template}
                        onPreview={handlePreview}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Detail Modal */}
      {previewTemplate && (
        <TemplateDetailModal
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          template={previewTemplate}
          onSelect={handleSelect}
        />
      )}
    </>
  );
}

// Helper Components
function CategoryPill({
  id,
  label,
  count,
  isSelected,
  onClick,
}: {
  id: string;
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = CATEGORY_ICONS[id as keyof typeof CATEGORY_ICONS] || LayoutGrid;

  return (
    <button
      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      onClick={onClick}
    >
      <Icon className="w-4 h-4" />
      {label}
      <span
        className={`text-xs ${
          isSelected ? 'text-blue-100' : 'text-slate-400'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SidebarCategory({
  id,
  label,
  count,
  isSelected,
  onClick,
}: {
  id: string;
  label: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = CATEGORY_ICONS[id as keyof typeof CATEGORY_ICONS] || LayoutGrid;

  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-blue-400 text-white' : 'bg-slate-200 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
