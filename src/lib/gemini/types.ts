/**
 * Gemini AI Types for KW APPS
 *
 * TypeScript interfaces for Gemini planning and annotation features
 */

/**
 * Gemini Plan - Output from planFromPrompt
 * Represents a structured plan for the app to be generated
 */
export interface GeminiPlan {
  /** Brief summary of what will be built (Arabic) */
  summary: string

  /** App type/category */
  appType: 'landing' | 'ecommerce' | 'dashboard' | 'portfolio' | 'restaurant' | 'saas' | 'booking' | 'other'

  /** Main sections/components to include */
  sections: GeminiSection[]

  /** Suggested color scheme */
  colorScheme: {
    primary: string
    secondary: string
    accent: string
    background: string
  }

  /** Layout hints */
  layout: {
    direction: 'rtl' | 'ltr'
    headerStyle: 'fixed' | 'static' | 'transparent'
    footerIncluded: boolean
  }

  /** Key features to implement */
  features: string[]

  /** Arabic copy suggestions */
  copyHints: {
    headline?: string
    subheadline?: string
    ctaText?: string
  }

  /** Confidence score (0-1) */
  confidence: number
}

/**
 * Section definition in the plan
 */
export interface GeminiSection {
  /** Section identifier */
  id: string

  /** Section name in Arabic */
  name: string

  /** Section type */
  type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'gallery' | 'contact' | 'faq' | 'team' | 'stats' | 'custom'

  /** Brief description */
  description: string

  /** Order in the page (1-based) */
  order: number

  /** Whether this section is essential */
  essential: boolean
}

/**
 * Gemini Annotations - Output from annotateCode
 * Represents analysis and suggestions for generated code
 */
export interface GeminiAnnotations {
  /** Summary of what the page does (Arabic) */
  summary: string

  /** Overall quality score (1-10) */
  qualityScore: number

  /** UX and conversion suggestions (Arabic) */
  suggestions: GeminiSuggestion[]

  /** Inline comments for specific lines */
  inlineComments: GeminiInlineComment[]

  /** Accessibility notes */
  accessibilityNotes: string[]

  /** Performance tips */
  performanceTips: string[]

  /** RTL compliance status */
  rtlCompliance: {
    score: number
    issues: string[]
  }
}

/**
 * Individual suggestion
 */
export interface GeminiSuggestion {
  /** Suggestion category */
  category: 'ux' | 'conversion' | 'design' | 'content' | 'accessibility' | 'performance'

  /** Priority level */
  priority: 'high' | 'medium' | 'low'

  /** Suggestion text (Arabic) */
  text: string

  /** Optional code snippet to implement */
  codeHint?: string
}

/**
 * Inline comment for specific code line
 */
export interface GeminiInlineComment {
  /** Line number (1-based) */
  line: number

  /** Comment text (Arabic) */
  comment: string

  /** Comment type */
  type: 'suggestion' | 'issue' | 'praise'
}

/**
 * Project context passed to Gemini
 */
export interface GeminiProjectContext {
  /** Project name */
  projectName?: string

  /** Project description */
  projectDescription?: string

  /** Previous messages/prompts */
  previousPrompts?: string[]

  /** Current code (for annotations) */
  currentCode?: string

  /** User's plan level */
  userPlan?: 'free' | 'builder' | 'pro' | 'hosting_only'
}

/**
 * Generation mode
 */
export type GenerationMode = 'standard' | 'smart'

/**
 * Gemini API response wrapper
 */
export interface GeminiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    messageAr: string
  }
  tokensUsed?: number
}
