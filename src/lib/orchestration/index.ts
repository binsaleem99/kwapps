/**
 * Gemini Pro Orchestration Layer - Main Export
 *
 * Three-Tier AI Pipeline:
 * Tier 1: Gemini Pro (Orchestration) - Parameter detection, clarifying questions, validation
 * Tier 2: DeepSeek (Generation) - Code generation
 * Tier 3: Gemini Flash (Editing) - Real-time edits
 */

// Types
export type {
  DetectedParameters,
  BusinessTypeParam,
  ServicesParam,
  FunctionalityParam,
  StylingParam,
  LanguageParam,
  ClarifyingQuestion,
  QuestionOption,
  ClarifyingAnswers,
  DeepSeekPrompt,
  ValidationResult,
  ValidationCheck,
  OrchestrationState,
  OrchestrationStage,
  OrchestrationCost,
  QuestionType,
} from './types'

export { BUSINESS_TYPES, THEME_CATALOG, WIDGET_CATALOG } from './types'

// Parameter Detection
export {
  detectParameters,
  getMissingParameters,
  calculateConfidence,
} from './parameter-detector'

// Clarifying Questions
export {
  generateClarifyingQuestions,
  mergeAnswersWithParameters,
} from './clarifying-questions'

// Prompt Construction
export {
  constructDeepSeekPrompt,
  formatPromptForDeepSeek,
  promptToNaturalLanguage,
} from './prompt-constructor'

// Validation
export {
  validateGeneratedCode,
  autoFixCode,
  generateValidationSummary,
} from './validator'

// Main Orchestrator
export {
  GeminiOrchestrator,
  getOrchestrator,
  createOrchestrator,
  calculateOrchestrationCost,
} from './orchestrator'

// Session Manager (Supabase-backed)
export {
  SessionManager,
  getSessionManager,
  getOrCreateSession,
  hasResumableSession,
} from './session-manager'

export type {
  OrchestrationSession,
  SessionMessage,
  SessionContext,
  CreateSessionParams,
  UpdateSessionParams,
} from './session-manager'
