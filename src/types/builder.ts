/**
 * Builder Types
 * Types for AI Website Builder Visual Editor
 */

import type { Template, TemplateCategory } from '@/app/actions/templates'

// Message types for chat
export interface BuilderMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used?: number
  credit_cost?: number
  created_at: string
  metadata?: {
    type?: 'question' | 'answer' | 'code' | 'error'
    questions?: ClarifyingQuestionItem[]
  }
}

// Clarifying question from Gemini
export interface ClarifyingQuestionItem {
  id: string
  question_ar: string
  question_en?: string
  type: 'multiple_choice' | 'checkboxes' | 'text'
  options?: {
    value: string
    label_ar: string
    label_en?: string
    icon?: string
  }[]
  priority: 'high' | 'medium' | 'low'
  skipable?: boolean
  key: string
}

// Device modes for preview
export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export const DEVICE_DIMENSIONS: Record<DeviceMode, { width: number; height: number; label: string }> = {
  desktop: { width: 1280, height: 800, label: 'سطح المكتب' },
  tablet: { width: 768, height: 1024, label: 'جهاز لوحي' },
  mobile: { width: 375, height: 667, label: 'هاتف' },
}

// Builder project state
export interface BuilderProject {
  id: string
  name: string
  status: 'draft' | 'preview' | 'deployed'
  generated_code: string | null
  arabic_prompt?: string
  english_prompt?: string
  template_id?: string
  deployment_url?: string
  created_at: string
  updated_at?: string
}

// Page in multi-page project
export interface BuilderPage {
  id: string
  name: string
  slug: string
  code: string
  isHomePage?: boolean
}

// Asset in project
export interface BuilderAsset {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'font' | 'other'
  size?: number
  created_at: string
}

// Sidebar section types
export type SidebarSection = 'pages' | 'components' | 'assets' | 'settings'

// Builder state
export interface BuilderState {
  project: BuilderProject | null
  messages: BuilderMessage[]
  pages: BuilderPage[]
  assets: BuilderAsset[]
  currentPageId: string | null
  deviceMode: DeviceMode
  isGenerating: boolean
  isSaving: boolean
  error: string | null
  sidebarOpen: boolean
  activeSidebarSection: SidebarSection
}

// Credit costs
export const CREDIT_COSTS = {
  message: 1,
  generation: 5,
  save: 0,
  publish: 10,
} as const

// Mock template data for builder
export interface MockTemplate {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar: string
  description_en: string
  category: TemplateCategory
  preview_url?: string
  thumbnail_url?: string
  base_code: string
  is_premium: boolean
}

// Generation progress state
export interface GenerationProgress {
  stage: 'analyzing' | 'translating' | 'generating' | 'verifying' | 'securing' | 'complete'
  percent: number
  message: string
}

// Orchestration response
export interface OrchestrationResponse {
  type: 'clarifying_questions' | 'ready_to_generate'
  questions?: ClarifyingQuestionItem[]
  parameters?: Record<string, any>
}
