// ==============================================
// KW APPS - DeepSeek Module Exports
// ==============================================
// Central export for all DeepSeek functionality
// ==============================================

// Client exports
export {
  translateArabicToEnglish,
  generateReactCode,
  ensureRTLArabic,
  validateSecurity,
  generateCompleteCode,
  calculateCost,
  type GenerationType,
} from './client'

// Streaming client exports
export {
  StreamingDeepSeekClient,
  type StreamProgress,
  type TokenInfo,
} from './streaming-client'

// Code generator exports
export {
  CodeGenerator,
  codeGenerator,
  getCreditCost,
  mapToOperationType,
  CREDIT_COSTS,
  type StructuredPrompt,
  type GenerationResult,
  type StreamChunk,
  type CreditOperationType,
  type GenerationPromptType,
} from './code-generator'

// Template exports
export {
  BASE_SYSTEM_PROMPT,
  WEBSITE_GENERATION_PROMPT,
  COMPONENT_GENERATION_PROMPT,
  CODE_EDIT_PROMPT,
  LANDING_PAGE_PROMPT,
  ECOMMERCE_PROMPT,
  DASHBOARD_PROMPT,
  FORM_PROMPT,
  getSystemPrompt,
  detectGenerationType,
  validateCodeSecurity,
  validateRTLCompliance,
  SECURITY_RULES,
} from './templates'

// Token tracker exports
export {
  TokenTracker,
  PLAN_LIMITS,
} from './token-tracker'

// Conversation manager exports
export {
  ConversationManager,
} from './conversation-manager'
