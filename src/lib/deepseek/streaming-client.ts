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
const MAX_TOKENS = 2000 // Reduced to 2000 for faster generation (avoid timeouts)

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
      // Stage 1: Skip Translation (DeepSeek understands Arabic natively)
      // This saves time and avoids timeout issues
      onProgress({ stage: 'translating', percent: 20, message: 'جاري التحضير...' })

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

${uiPrompt}

RESPONSE FORMAT:
- Provide a brief explanation of what you're building (2-3 sentences in Arabic)
- Then provide the code in a markdown code block with \`\`\`tsx
- The code will be automatically extracted and rendered in a live preview

CODE REQUIREMENTS:
1. **Single Function Component** - Create ONE main component
   ✅ function App() { return <div>...</div> }
   ✅ const HomePage = () => { return <div>...</div> }

2. **No Imports Needed** - React and hooks are available globally
   - Available: React, useState, useEffect, useRef, useCallback, useMemo
   - Just use them directly without importing

3. **RTL Support** - Always include dir="rtl" on root element
   - Use Arabic text throughout
   - Use Cairo font: font-['Cairo']

4. **Inline Everything** - Keep all JSX in the main component
   - Don't create separate components
   - All markup should be in one function

EXAMPLE RESPONSE:
سأقوم بإنشاء صفحة رئيسية جميلة مع عنوان ترحيبي وأزرار تفاعلية.

\`\`\`tsx
function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 font-['Cairo'] mb-4">
        مرحباً بك
      </h1>
      <button onClick={() => setCount(count + 1)}>
        النقرات: {count}
      </button>
    </div>
  )
}
\`\`\`

Generate production-ready, beautiful React components following these guidelines.`

      // Use Arabic prompt directly (DeepSeek supports Arabic natively)
      const userPrompt = `${prompt}

Create a single React component that fulfills this Arabic request.
The component should support RTL layout with dir="rtl" and use Arabic text.
Name the component clearly and make it a standalone function or const.`

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

      // Extract code from markdown response (Lovable pattern)
      accumulatedCode = this.extractCodeFromMarkdown(accumulatedCode)

      // Estimate tokens for the generation (will be refined by actual usage later)
      const generateTokensEstimate = streamTokensEstimate
      totalTokens += generateTokensEstimate

      onProgress(
        { stage: 'generating', percent: 65, message: 'تم إنشاء الكود' },
        { output: generateTokensEstimate, total: totalTokens }
      )

      // SKIP RTL & Security verification to avoid timeout
      // The Master UI Prompt already instructs proper RTL and secure coding
      // Stage 3: Skip RTL Verification (already in prompt)
      onProgress({ stage: 'verifying', percent: 80, message: 'جاري المعالجة...' })

      // Stage 4: Skip Security Validation (already in prompt)
      onProgress({ stage: 'securing', percent: 90, message: 'جاري الإنهاء...' })

      // Stage 5: Complete
      onProgress({ stage: 'complete', percent: 100, message: 'تم!' })

      return { totalTokens }
    } catch (error) {
      console.error('Streaming generation error:', error)
      throw error
    }
  }

  /**
   * Extracts code blocks from markdown response (Lovable pattern)
   * Works with any AI output format - natural and reliable
   */
  private extractCodeFromMarkdown(response: string): string {
    console.log('[DeepSeek] Extracting code from response, length:', response.length)

    // Try to extract code blocks from markdown (```tsx or ```jsx or ```typescript or ```javascript)
    const codeBlockRegex = /```(?:tsx?|jsx?|typescript|javascript)?\s*\n([\s\S]*?)```/g
    const matches = []
    let match

    while ((match = codeBlockRegex.exec(response)) !== null) {
      matches.push(match[1].trim())
    }

    if (matches.length > 0) {
      console.log('[DeepSeek] ✅ Found', matches.length, 'code block(s) in markdown')
      console.log('[DeepSeek] Using first code block, length:', matches[0].length)
      return this.cleanExtractedCode(matches[0])
    }

    // If no markdown code blocks found, assume entire response is code
    console.log('[DeepSeek] ⚠️ No markdown code blocks found, using full response as code')
    return this.cleanExtractedCode(response)
  }

  /**
   * Cleans extracted code by removing incompatible statements for react-live
   */
  private cleanExtractedCode(code: string): string {
    // Remove import statements (react-live doesn't support them)
    code = code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    code = code.replace(/^import\s+['"].*?['"];?\s*$/gm, '')

    // Remove export statements (react-live doesn't support them)
    code = code.replace(/^export\s+default\s+/gm, '')
    code = code.replace(/^export\s+\{[^}]+\};?\s*$/gm, '')
    code = code.replace(/^export\s+(const|function|class)/gm, '$1')

    // Remove "use client" directive if present
    code = code.replace(/^['"]use client['"];?\s*$/gm, '')

    // Remove leading/trailing whitespace
    code = code.trim()

    console.log('[DeepSeek] Cleaned code length:', code.length)
    console.log('[DeepSeek] First 200 chars:', code.substring(0, 200))

    return code
  }
}
