// ==============================================
// KW APPS - DeepSeek Code Generator Service
// ==============================================
// Receives structured prompts from Gemini orchestrator
// Generates websites, components, and code edits
// ==============================================

import OpenAI from 'openai'
import {
  getSystemPrompt,
  detectGenerationType,
  validateCodeSecurity,
  validateRTLCompliance,
  type GenerationPromptType,
} from './templates'

// Initialize DeepSeek client (OpenAI-compatible)
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Model configuration
const MODELS = {
  CHAT: process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-chat',
  CODER: process.env.DEEPSEEK_CODE_MODEL || 'deepseek-coder',
} as const

// Token estimation (approximate: 1 token ≈ 4 characters for English, 2-3 for Arabic)
const CHARS_PER_TOKEN = 3

/**
 * Structured prompt from Gemini orchestrator
 */
export interface StructuredPrompt {
  // Original user request
  userPrompt: string
  userPromptAr: string

  // Gemini-enhanced details
  summary?: string
  components?: Array<{
    name: string
    type: string
    description: string
    styling?: string[]
  }>
  layout?: {
    type: string
    sections: string[]
    responsive?: string
  }
  styling?: {
    colors?: string[]
    typography?: string
    spacing?: string
  }
  features?: string[]
  arabicContent?: Record<string, string>

  // Generation metadata
  generationType?: GenerationPromptType
  projectContext?: string
  existingCode?: string
}

/**
 * Generation result
 */
export interface GenerationResult {
  code: string
  tokensUsed: number
  estimatedCost: number
  generationType: GenerationPromptType
  validationResult: {
    security: { isValid: boolean; violations: string[] }
    rtl: { isValid: boolean; issues: string[] }
  }
}

/**
 * Stream chunk for real-time preview
 */
export interface StreamChunk {
  type: 'content' | 'done' | 'error'
  content?: string
  tokensUsed?: number
  error?: string
}

/**
 * Code Generator Class
 */
export class CodeGenerator {
  private model: string

  constructor(model: 'chat' | 'coder' = 'coder') {
    this.model = model === 'chat' ? MODELS.CHAT : MODELS.CODER
  }

  /**
   * Generate complete website from structured prompt
   */
  async generateWebsite(prompt: StructuredPrompt): Promise<GenerationResult> {
    const systemPrompt = this.buildSystemPrompt(prompt, 'website')
    const userPrompt = this.buildUserPrompt(prompt)

    const completion = await deepseek.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    })

    const code = this.cleanCode(completion.choices[0]?.message?.content || '')
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(code)

    return this.buildResult(code, tokensUsed, 'website')
  }

  /**
   * Generate single component from spec
   */
  async generateComponent(prompt: StructuredPrompt): Promise<GenerationResult> {
    const systemPrompt = this.buildSystemPrompt(prompt, 'component')
    const userPrompt = this.buildUserPrompt(prompt)

    const completion = await deepseek.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const code = this.cleanCode(completion.choices[0]?.message?.content || '')
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(code)

    return this.buildResult(code, tokensUsed, 'component')
  }

  /**
   * Edit existing code with instruction
   */
  async editCode(
    existingCode: string,
    editInstruction: string
  ): Promise<GenerationResult> {
    const systemPrompt = getSystemPrompt('edit')

    const userPrompt = `## الكود الحالي:
\`\`\`tsx
${existingCode}
\`\`\`

## التعديل المطلوب:
${editInstruction}

أرجع الكود المعدل كاملاً في code block واحد.`

    const completion = await deepseek.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5, // Lower for more precise edits
      max_tokens: 8000,
    })

    const code = this.cleanCode(completion.choices[0]?.message?.content || '')
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(code)

    return this.buildResult(code, tokensUsed, 'edit')
  }

  /**
   * Stream code generation for real-time preview
   */
  async *streamGeneration(
    prompt: StructuredPrompt
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const generationType = prompt.generationType || detectGenerationType(prompt.userPrompt)
    const systemPrompt = this.buildSystemPrompt(prompt, generationType)
    const userPrompt = this.buildUserPrompt(prompt)

    try {
      const stream = await deepseek.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
        stream: true,
      })

      let totalContent = ''
      let estimatedTokens = 0

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          totalContent += content
          estimatedTokens = this.estimateTokens(totalContent)

          yield {
            type: 'content',
            content,
            tokensUsed: estimatedTokens,
          }
        }
      }

      yield {
        type: 'done',
        content: this.cleanCode(totalContent),
        tokensUsed: estimatedTokens,
      }
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'خطأ في إنشاء الكود',
      }
    }
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(
    prompt: StructuredPrompt,
    type: GenerationPromptType
  ): string {
    let systemPrompt = getSystemPrompt(type)

    // Add Gemini styling context if available
    if (prompt.styling) {
      systemPrompt += `\n\n## إرشادات التصميم من المخطط:
- الألوان: ${prompt.styling.colors?.join(', ') || 'slate, blue'}
- الخطوط: ${prompt.styling.typography || 'Cairo'}
- التباعد: ${prompt.styling.spacing || 'متوسط'}`
    }

    // Add layout instructions if available
    if (prompt.layout) {
      systemPrompt += `\n\n## التخطيط:
- النوع: ${prompt.layout.type}
- الأقسام: ${prompt.layout.sections.join(' → ')}`
    }

    // Add Arabic content suggestions
    if (prompt.arabicContent) {
      systemPrompt += `\n\n## المحتوى العربي المقترح:`
      for (const [key, value] of Object.entries(prompt.arabicContent)) {
        systemPrompt += `\n- ${key}: "${value}"`
      }
    }

    return systemPrompt
  }

  /**
   * Build user prompt from structured input
   */
  private buildUserPrompt(prompt: StructuredPrompt): string {
    let userPrompt = `## الطلب:
${prompt.userPromptAr || prompt.userPrompt}`

    // Add summary if available
    if (prompt.summary) {
      userPrompt += `\n\n## الملخص:
${prompt.summary}`
    }

    // Add component details
    if (prompt.components && prompt.components.length > 0) {
      userPrompt += `\n\n## المكونات المطلوبة:`
      for (const comp of prompt.components) {
        userPrompt += `\n- **${comp.name}** (${comp.type}): ${comp.description}`
        if (comp.styling && comp.styling.length > 0) {
          userPrompt += `\n  التصميم: ${comp.styling.join(', ')}`
        }
      }
    }

    // Add features
    if (prompt.features && prompt.features.length > 0) {
      userPrompt += `\n\n## الميزات:
${prompt.features.map(f => `- ${f}`).join('\n')}`
    }

    // Add project context if editing
    if (prompt.projectContext) {
      userPrompt += `\n\n## سياق المشروع:
${prompt.projectContext}`
    }

    userPrompt += `\n\nأنشئ الكود المطلوب مع مراعاة جميع المتطلبات.`

    return userPrompt
  }

  /**
   * Clean generated code
   */
  private cleanCode(code: string): string {
    // Extract code from markdown blocks
    const codeBlockRegex = /```(?:tsx?|jsx?|typescript|javascript)?\s*\n([\s\S]*?)```/g
    const matches = []
    let match

    while ((match = codeBlockRegex.exec(code)) !== null) {
      matches.push(match[1].trim())
    }

    if (matches.length > 0) {
      code = matches.join('\n\n')
    }

    // Remove import statements (for react-live compatibility)
    code = code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    code = code.replace(/^import\s+['"].*?['"];?\s*$/gm, '')

    // Remove export statements
    code = code.replace(/^export\s+default\s+/gm, '')
    code = code.replace(/^export\s+\{[^}]+\};?\s*$/gm, '')
    code = code.replace(/^export\s+(const|function|class)/gm, '$1')

    // Remove "use client" directive
    code = code.replace(/^['"]use client['"];?\s*$/gm, '')

    return code.trim()
  }

  /**
   * Estimate tokens from content
   */
  private estimateTokens(content: string): number {
    return Math.ceil(content.length / CHARS_PER_TOKEN)
  }

  /**
   * Calculate cost from tokens
   * DeepSeek pricing: ~$0.14/1M input, ~$0.28/1M output
   */
  private calculateCost(tokens: number): number {
    const avgCostPerMillion = 0.21
    return (tokens / 1_000_000) * avgCostPerMillion
  }

  /**
   * Build generation result with validation
   */
  private buildResult(
    code: string,
    tokensUsed: number,
    generationType: GenerationPromptType
  ): GenerationResult {
    const security = validateCodeSecurity(code)
    const rtl = validateRTLCompliance(code)

    return {
      code,
      tokensUsed,
      estimatedCost: this.calculateCost(tokensUsed),
      generationType,
      validationResult: {
        security,
        rtl,
      },
    }
  }
}

/**
 * Credit costs for different operations
 */
export const CREDIT_COSTS = {
  component_generation: 2,
  page_generation: 3,
  complex_feature: 4,
  simple_edit: 0.5,
  chat: 1,
} as const

export type CreditOperationType = keyof typeof CREDIT_COSTS

/**
 * Determine credit cost from generation type
 */
export function getCreditCost(generationType: GenerationPromptType): number {
  const costMap: Record<GenerationPromptType, number> = {
    component: CREDIT_COSTS.component_generation,
    website: CREDIT_COSTS.page_generation,
    landing: CREDIT_COSTS.page_generation,
    ecommerce: CREDIT_COSTS.complex_feature,
    dashboard: CREDIT_COSTS.complex_feature,
    form: CREDIT_COSTS.component_generation,
    edit: CREDIT_COSTS.simple_edit,
  }

  return costMap[generationType] || CREDIT_COSTS.component_generation
}

/**
 * Map generation type to credit operation type for database
 */
export function mapToOperationType(generationType: GenerationPromptType): string {
  const operationMap: Record<GenerationPromptType, string> = {
    component: 'component',
    website: 'page',
    landing: 'page',
    ecommerce: 'complex',
    dashboard: 'complex',
    form: 'component',
    edit: 'simple_edit',
  }

  return operationMap[generationType] || 'component'
}

// Export singleton instance
export const codeGenerator = new CodeGenerator('coder')

// Export types
export type { GenerationPromptType }
