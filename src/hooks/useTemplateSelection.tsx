'use client';

/**
 * Template Selection Hook
 *
 * Manages the full template selection flow:
 * 1. Initial choice: Template vs Build from scratch
 * 2. Category selection (if template chosen)
 * 3. Template browsing and selection
 *
 * Usage:
 * const { openChoiceModal, TemplateModals } = useTemplateSelection({
 *   onSelectTemplate: (template) => { ... },
 *   onBuildFromScratch: () => { ... }
 * });
 */

import { useState, useCallback } from 'react';
import { TemplateChoiceModal } from '@/components/templates/TemplateChoiceModal';
import { TemplateSelectionModal } from '@/components/templates/TemplateSelectionModal';
import type { Template, TemplateCategory } from '@/types/templates';

interface UseTemplateSelectionOptions {
  onSelectTemplate: (template: Template) => void;
  onBuildFromScratch: () => void;
}

type ModalState = 'closed' | 'choice' | 'category' | 'templates';

export function useTemplateSelection({
  onSelectTemplate,
  onBuildFromScratch,
}: UseTemplateSelectionOptions) {
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);

  // Open the initial choice modal
  const openChoiceModal = useCallback(() => {
    setModalState('choice');
  }, []);

  // Close all modals
  const closeAll = useCallback(() => {
    setModalState('closed');
    setSelectedCategory(null);
  }, []);

  // Handle choice: use template
  const handleChooseTemplate = useCallback(() => {
    setModalState('templates');
  }, []);

  // Handle choice: build from scratch
  const handleBuildFromScratch = useCallback(() => {
    closeAll();
    onBuildFromScratch();
  }, [closeAll, onBuildFromScratch]);

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (template: Template) => {
      closeAll();
      onSelectTemplate(template);
    },
    [closeAll, onSelectTemplate]
  );

  // Open directly to templates with a specific category
  const openTemplatesWithCategory = useCallback((category: TemplateCategory) => {
    setSelectedCategory(category);
    setModalState('templates');
  }, []);

  // Open directly to templates (all categories)
  const openTemplates = useCallback(() => {
    setSelectedCategory(null);
    setModalState('templates');
  }, []);

  // Modal components to render
  const TemplateModals = (
    <>
      {/* Choice Modal */}
      <TemplateChoiceModal
        open={modalState === 'choice'}
        onOpenChange={(open) => !open && closeAll()}
        onChooseTemplate={handleChooseTemplate}
        onBuildFromScratch={handleBuildFromScratch}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={modalState === 'templates'}
        onOpenChange={(open) => !open && closeAll()}
        onSelectTemplate={handleSelectTemplate}
        initialCategory={selectedCategory}
      />
    </>
  );

  return {
    // State
    modalState,
    selectedCategory,

    // Actions
    openChoiceModal,
    openTemplates,
    openTemplatesWithCategory,
    closeAll,

    // Components
    TemplateModals,
  };
}
