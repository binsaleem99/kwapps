// ============================================
// KW APPS Template System Components
// ============================================

// Main Components
export { TemplateChoiceModal } from './TemplateChoiceModal';
export { TemplateCategoryGrid } from './TemplateCategoryGrid';
export { TemplateSelectionModal } from './TemplateSelectionModal';
export { TemplatePreviewCard } from './TemplatePreviewCard';
export { TemplateDetailModal } from './TemplateDetailModal';
export { TemplateSelectionDemo } from './TemplateSelectionDemo';

// Legacy Component (for backwards compatibility)
export { TemplateGallery } from './TemplateGallery';

// Hook
export { useTemplateSelection } from '@/hooks/useTemplateSelection';

// Re-export types
export type {
  Template,
  TemplateCategory,
  TemplateCategoryInfo,
  TemplateSection,
  TemplateWithSections,
} from '@/types/templates';

export {
  TEMPLATE_CATEGORIES,
  MOCK_TEMPLATES,
  getTemplatesByCategory,
  getFeaturedTemplates,
  getTemplateBySlug,
} from '@/types/templates';
