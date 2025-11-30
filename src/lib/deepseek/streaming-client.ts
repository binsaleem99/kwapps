/**
 * Streaming DeepSeek API Client
 *
 * Provides real-time streaming code generation with progress updates
 * Supports Server-Sent Events (SSE) for live user feedback
 */

import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import {
  translateArabicToEnglish,
  ensureRTLArabic,
  validateSecurity,
  type GenerationType,
} from './client'
import {
  COMPONENT_LIBRARY_SUMMARY,
  generateAllImports,
} from '@/lib/components/component-registry'
import { MASTER_UI_PROMPT } from '@/lib/prompts/master-ui-prompt'

// Initialize OpenAI client with DeepSeek base URL
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

const MODELS = {
  CHAT: 'deepseek-chat',
  CODER: 'deepseek-coder',
} as const

const DEFAULT_TEMPERATURE = 0.7
const MAX_TOKENS = 4000 // Reduced from 8000 for faster streaming

export interface StreamProgress {
  stage: 'translating' | 'generating' | 'verifying' | 'securing' | 'complete'
  percent: number
  message: string
}

export interface TokenInfo {
  input?: number
  output?: number
  total?: number
}

export class StreamingDeepSeekClient {
  private deepseek: OpenAI

  constructor() {
    this.deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: 'https://api.deepseek.com',
    })
  }

  /**
   * Generates code with streaming and progress updates
   *
   * @param prompt - Arabic prompt from user
   * @param projectId - Project ID for conversation context
   * @param onProgress - Callback for progress updates
   * @param onTokens - Callback for token tracking
   */
  async *generateWithProgress(
    prompt: string,
    projectId: string,
    onProgress: (progress: StreamProgress, tokens?: TokenInfo) => void,
    generationType: GenerationType = 'client_app'
  ): AsyncGenerator<string, { totalTokens: number }, unknown> {
    let totalTokens = 0

    try {
      // Stage 1: Translation
      onProgress({ stage: 'translating', percent: 10, message: 'جاري الترجمة...' })

      const { english: englishPrompt, tokensUsed: translateTokens } =
        await translateArabicToEnglish(prompt)

      totalTokens += translateTokens
      onProgress(
        { stage: 'translating', percent: 20, message: 'تمت الترجمة' },
        { total: translateTokens }
      )

      // Stage 2: Code Generation (streaming)
      onProgress({ stage: 'generating', percent: 30, message: 'جاري إنشاء الكود...' })

      // Load UI prompt
      const uiPromptType = generationType === 'internal_ui' ? 'website' : 'client'
      let uiPrompt: string

      try {
        const filename =
          uiPromptType === 'website'
            ? 'master-ui-website.md'
            : 'master-ui-deepseek-client.md'
        const filepath = path.join(process.cwd(), 'prompts', filename)
        uiPrompt = await fs.readFile(filepath, 'utf-8')
      } catch (error) {
        // Fallback to TypeScript export if markdown file doesn't exist
        uiPrompt = MASTER_UI_PROMPT
      }

      const systemPrompt = `You are an expert React developer specializing in creating beautiful, Arabic-first UI components.

You have access to these MIT-licensed component libraries:
${COMPONENT_LIBRARY_SUMMARY}

Available imports:
${generateAllImports()}

${uiPrompt}

Generate production-ready React code following the Master UI Prompt guidelines above.
Return ONLY the React component code, no explanations or markdown formatting.`

      const userPrompt = `English Request: ${englishPrompt}\nArabic Request: ${prompt}

Generate a React component that fulfills this request.`

      const stream = await this.deepseek.chat.completions.create({
        model: MODELS.CODER,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: true, // ENABLE STREAMING
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: MAX_TOKENS,
      })

      let accumulatedCode = ''
      let lastPercent = 30
      let streamTokensEstimate = 0

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        accumulatedCode += content

        // Estimate progress based on content length (rough approximation)
        // Assume max code will be ~4000 tokens
        streamTokensEstimate = Math.min(MAX_TOKENS, accumulatedCode.length / 4)
        lastPercent = Math.min(60, 30 + (streamTokensEstimate / MAX_TOKENS) * 30)

        onProgress({
          stage: 'generating',
          percent: Math.round(lastPercent),
          message: 'جاري إنشاء الكود...',
        })

        // Yield each chunk to the caller
        yield content
      }

      // Clean accumulated code
      accumulatedCode = this.cleanCodeOutput(accumulatedCode)

      // Estimate tokens for the generation (will be refined by actual usage later)
      const generateTokensEstimate = streamTokensEstimate
      totalTokens += generateTokensEstimate

      onProgress(
        { stage: 'generating', percent: 65, message: 'تم إنشاء الكود' },
        { output: generateTokensEstimate, total: totalTokens }
      )

      // Stage 3: RTL Verification
      onProgress({ stage: 'verifying', percent: 70, message: 'جاري التحقق من RTL...' })

      const { code: rtlVerifiedCode, tokensUsed: rtlTokens } =
        await ensureRTLArabic(accumulatedCode, prompt)

      totalTokens += rtlTokens
      onProgress(
        { stage: 'verifying', percent: 85, message: 'تم التحقق من RTL' },
        { total: rtlTokens }
      )

      // Use verified code for final output
      accumulatedCode = rtlVerifiedCode

      // Stage 4: Security Validation
      onProgress({ stage: 'securing', percent: 90, message: 'فحص الأمان...' })

      const { code: finalCode, tokensUsed: securityTokens } =
        await validateSecurity(accumulatedCode)

      totalTokens += securityTokens
      onProgress(
        { stage: 'securing', percent: 95, message: 'تم فحص الأمان' },
        { total: securityTokens }
      )

      // Update with final code
      accumulatedCode = finalCode

      // Stage 5: Complete
      onProgress({ stage: 'complete', percent: 100, message: 'تم!' })

      return { totalTokens }
    } catch (error) {
      console.error('Streaming generation error:', error)
      throw error
    }
  }

  /**
   * Cleans code output by removing markdown formatting
   */
  private cleanCodeOutput(code: string): string {
    // Remove markdown code blocks
    code = code.replace(/```tsx?\n?/g, '').replace(/```\n?/g, '')

    // Remove leading/trailing whitespace
    code = code.trim()

    return code
  }
}
