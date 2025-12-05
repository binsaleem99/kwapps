/**
 * Gemini Pro Orchestration Layer
 *
 * Main orchestrator that coordinates the three-tier AI pipeline:
 * Tier 1: Gemini Pro (Orchestration) - This file
 * Tier 2: DeepSeek (Generation)
 * Tier 3: Gemini Flash (Editing)
 */

import type {
  OrchestrationState,
  OrchestrationStage,
  DetectedParameters,
  ClarifyingAnswers,
  DeepSeekPrompt,
  OrchestrationCost,
} from './types'
import { detectParameters, getMissingParameters, calculateConfidence } from './parameter-detector'
import {
  generateClarifyingQuestions,
  mergeAnswersWithParameters,
} from './clarifying-questions'
import { constructDeepSeekPrompt } from './prompt-constructor'
import { validateGeneratedCode } from './validator'

/**
 * Main Orchestrator Class
 */
export class GeminiOrchestrator {
  private state: OrchestrationState

  constructor() {
    this.state = {
      stage: 'detection',
      detectedParams: null,
      clarifyingQuestions: [],
      answers: {},
      deepseekPrompt: null,
      validationResult: null,
    }
  }

  /**
   * Step 1: Analyze user prompt and detect parameters
   */
  async analyzePrompt(arabicPrompt: string): Promise<{
    success: boolean
    needsClarification: boolean
    questions?: any[]
    confidence?: number
    error?: any
  }> {
    try {
      console.log('[Orchestrator] Stage 1: Parameter Detection')
      this.state.stage = 'detection'

      // Detect parameters using Gemini Pro
      const detectionResult = await detectParameters(arabicPrompt)

      if (!detectionResult.success) {
        this.state.stage = 'failed'
        this.state.error = detectionResult.error
        return {
          success: false,
          needsClarification: false,
          error: detectionResult.error,
        }
      }

      this.state.detectedParams = detectionResult.parameters!

      // Calculate confidence
      const confidence = calculateConfidence(this.state.detectedParams)
      console.log('[Orchestrator] Detection confidence:', confidence)

      // Check if clarification needed
      const missingParams = getMissingParameters(this.state.detectedParams)
      const needsClarification = missingParams.length > 0 || confidence < 0.7

      if (needsClarification) {
        console.log('[Orchestrator] Missing parameters:', missingParams)
        this.state.stage = 'clarifying'

        // Generate clarifying questions
        const questions = generateClarifyingQuestions(this.state.detectedParams, missingParams)
        this.state.clarifyingQuestions = questions

        return {
          success: true,
          needsClarification: true,
          questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.answerType,
            options: q.options,
            required: q.required,
          })),
          confidence,
        }
      }

      // Sufficient confidence, proceed to construction
      return {
        success: true,
        needsClarification: false,
        confidence,
      }
    } catch (error) {
      console.error('[Orchestrator] Error in analyzePrompt:', error)
      this.state.stage = 'failed'
      return {
        success: false,
        needsClarification: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Failed to analyze prompt',
          messageAr: 'فشل في تحليل الطلب',
        },
      }
    }
  }

  /**
   * Step 2: Receive clarifying answers and merge with detected params
   */
  submitAnswers(answers: ClarifyingAnswers): {
    success: boolean
    readyForGeneration: boolean
  } {
    console.log('[Orchestrator] Received clarifying answers')
    this.state.answers = answers

    // Merge answers with detected parameters
    if (this.state.detectedParams) {
      this.state.detectedParams = mergeAnswersWithParameters(this.state.detectedParams, answers)
    }

    // Check if we have enough info now
    const confidence = calculateConfidence(this.state.detectedParams!)
    const readyForGeneration = confidence >= 0.8

    if (readyForGeneration) {
      console.log('[Orchestrator] Ready for generation with confidence:', confidence)
    }

    return {
      success: true,
      readyForGeneration,
    }
  }

  /**
   * Step 3: Construct structured DeepSeek prompt
   */
  constructPrompt(originalPrompt?: string): {
    success: boolean
    prompt?: DeepSeekPrompt
    error?: any
  } {
    try {
      console.log('[Orchestrator] Stage 2: Prompt Construction')
      this.state.stage = 'constructing'

      if (!this.state.detectedParams) {
        return {
          success: false,
          error: {
            code: 'NO_PARAMETERS',
            message: 'No parameters detected',
            messageAr: 'لم يتم اكتشاف معاملات',
          },
        }
      }

      // Construct structured prompt for DeepSeek
      const deepseekPrompt = constructDeepSeekPrompt(this.state.detectedParams, originalPrompt)
      this.state.deepseekPrompt = deepseekPrompt

      console.log('[Orchestrator] DeepSeek prompt constructed:', deepseekPrompt.project_type)

      return {
        success: true,
        prompt: deepseekPrompt,
      }
    } catch (error) {
      console.error('[Orchestrator] Error in constructPrompt:', error)
      this.state.stage = 'failed'
      return {
        success: false,
        error: {
          code: 'CONSTRUCTION_FAILED',
          message: 'Failed to construct prompt',
          messageAr: 'فشل في بناء الطلب',
        },
      }
    }
  }

  /**
   * Step 4: Validate generated code from DeepSeek
   */
  async validateCode(generatedCode: string): Promise<{
    success: boolean
    validationResult?: any
    autoFixedCode?: string
    error?: any
  }> {
    try {
      console.log('[Orchestrator] Stage 3: Validation')
      this.state.stage = 'validating'

      if (!this.state.deepseekPrompt) {
        return {
          success: false,
          error: {
            code: 'NO_PROMPT',
            message: 'No DeepSeek prompt available',
            messageAr: 'لا يوجد طلب DeepSeek',
          },
        }
      }

      // Run validation checks
      const validationResult = await validateGeneratedCode(
        generatedCode,
        this.state.deepseekPrompt
      )

      this.state.validationResult = validationResult

      console.log('[Orchestrator] Validation score:', validationResult.score)
      console.log('[Orchestrator] Validation passed:', validationResult.passed)

      // Auto-fix if possible
      let autoFixedCode: string | undefined
      if (!validationResult.passed) {
        const { autoFixCode } = await import('./validator')
        autoFixedCode = autoFixCode(generatedCode, validationResult)

        if (autoFixedCode !== generatedCode) {
          console.log('[Orchestrator] Auto-fixed validation issues')
        }
      }

      if (validationResult.passed) {
        this.state.stage = 'completed'
      }

      return {
        success: true,
        validationResult: {
          passed: validationResult.passed,
          score: validationResult.score,
          checks: validationResult.checks.map((c) => ({
            name: c.nameAr,
            passed: c.passed,
            severity: c.severity,
            message: c.messageAr,
          })),
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
        autoFixedCode,
      }
    } catch (error) {
      console.error('[Orchestrator] Error in validateCode:', error)
      this.state.stage = 'failed'
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Failed to validate code',
          messageAr: 'فشل في التحقق من الكود',
        },
      }
    }
  }

  /**
   * Get current orchestration state
   */
  getState(): OrchestrationState {
    return { ...this.state }
  }

  /**
   * Reset orchestrator for new session
   */
  reset(): void {
    this.state = {
      stage: 'detection',
      detectedParams: null,
      clarifyingQuestions: [],
      answers: {},
      deepseekPrompt: null,
      validationResult: null,
    }
  }

  /**
   * Get detected parameters (for debugging)
   */
  getDetectedParameters(): DetectedParameters | null {
    return this.state.detectedParams
  }

  /**
   * Get DeepSeek prompt (for debugging)
   */
  getDeepSeekPrompt(): DeepSeekPrompt | null {
    return this.state.deepseekPrompt
  }
}

/**
 * Calculate cost for orchestration
 */
export function calculateOrchestrationCost(
  geminiProTokens: number,
  deepseekTokens: number,
  geminiFlashTokens: number = 0
): OrchestrationCost {
  // Pricing (per 1M tokens)
  const GEMINI_PRO_COST = 0.014 // $0.014 per 1M tokens
  const DEEPSEEK_COST = 0.14 // $0.14 per 1M tokens input (much cheaper!)
  const GEMINI_FLASH_COST = 0.002 // $0.002 per 1M tokens
  const USD_TO_KWD = 0.307 // 1 USD = 0.307 KWD

  const geminiProCostUSD = (geminiProTokens / 1_000_000) * GEMINI_PRO_COST
  const deepseekCostUSD = (deepseekTokens / 1_000_000) * DEEPSEEK_COST
  const geminiFlashCostUSD = (geminiFlashTokens / 1_000_000) * GEMINI_FLASH_COST

  const totalCostUSD = geminiProCostUSD + deepseekCostUSD + geminiFlashCostUSD
  const totalCostKWD = totalCostUSD * USD_TO_KWD

  return {
    geminiProTokens,
    deepseekTokens,
    geminiFlashTokens,
    totalTokens: geminiProTokens + deepseekTokens + geminiFlashTokens,
    estimatedCostUSD: Number(totalCostUSD.toFixed(6)),
    estimatedCostKWD: Number(totalCostKWD.toFixed(6)),
    timestamp: new Date(),
  }
}

/**
 * Singleton instance
 */
let orchestratorInstance: GeminiOrchestrator | null = null

export function getOrchestrator(): GeminiOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new GeminiOrchestrator()
  }
  return orchestratorInstance
}

/**
 * Create new orchestrator instance (for isolated sessions)
 */
export function createOrchestrator(): GeminiOrchestrator {
  return new GeminiOrchestrator()
}
