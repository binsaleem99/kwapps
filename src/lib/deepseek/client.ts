/**
 * DeepSeek API Client
 *
 * Provides functions for AI-powered translation and code generation
 * using DeepSeek's cost-efficient models.
 *
 * Models:
 * - deepseek-chat: General purpose, translation ($0.14/$0.28 per 1M tokens)
 * - deepseek-coder: Code generation ($0.14/$0.28 per 1M tokens)
 *
 * Base URL: https://api.deepseek.com (OpenAI-compatible)
 */

import OpenAI from 'openai'
import {
  MASTER_UI_PROMPT,
  getMasterUIPromptWithContext,
  RTL_VERIFICATION_PROMPT,
  SECURITY_VALIDATION_PROMPT,
} from '@/lib/prompts/master-ui-prompt'
import {
  COMPONENT_LIBRARY_SUMMARY,
  generateAllImports,
} from '@/lib/components/component-registry'

// Initialize OpenAI client with DeepSeek base URL
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// Model configurations
const MODELS = {
  CHAT: 'deepseek-chat',
  CODER: 'deepseek-coder',
} as const

// Generation parameters
const DEFAULT_TEMPERATURE = 0.7
const MAX_TOKENS = 8000

/**
 * Translates Arabic text to English using DeepSeek Chat
 *
 * @param arabicText - The Arabic prompt to translate
 * @returns Promise<string> - English translation
 */
export async function translateArabicToEnglish(
  arabicText: string
): Promise<{ english: string; tokensUsed: number }> {
  try {
    const completion = await deepseek.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: `You are a professional Arabic to English translator specializing in web development and UI design terminology.

Translate the following Arabic text to English, preserving:
- Technical terms and web development concepts
- Design intent and user requirements
- Specific UI component requests
- Layout and styling preferences

Provide ONLY the English translation, no explanations or additional text.`,
        },
        {
          role: 'user',
          content: arabicText,
        },
      ],
      temperature: 0.3, // Lower temperature for more accurate translation
      max_tokens: 1000,
    })

    const english = completion.choices[0]?.message?.content?.trim() || ''
    const tokensUsed = completion.usage?.total_tokens || 0

    if (!english) {
      throw new Error('Failed to translate: Empty response from DeepSeek')
    }

    return { english, tokensUsed }
  } catch (error) {
    console.error('DeepSeek translation error:', error)
    throw new Error(
      `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generates React code using DeepSeek Coder with Master UI Prompt
 *
 * @param params - Generation parameters
 * @returns Promise<{ code: string, tokensUsed: number }>
 */
export async function generateReactCode(params: {
  englishPrompt: string
  arabicPrompt: string
}): Promise<{ code: string; tokensUsed: number }> {
  const { englishPrompt, arabicPrompt } = params

  try {
    const systemPrompt = `You are an expert React developer specializing in creating beautiful, Arabic-first UI components.

You have access to these MIT-licensed component libraries:
${COMPONENT_LIBRARY_SUMMARY}

Available imports:
${generateAllImports()}

Generate production-ready React code following the Master UI Prompt guidelines.
Return ONLY the React component code, no explanations or markdown formatting.`

    const userPrompt = getMasterUIPromptWithContext(
      `English: ${englishPrompt}\nArabic: ${arabicPrompt}`
    )

    const completion = await deepseek.chat.completions.create({
      model: MODELS.CODER,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: MAX_TOKENS,
    })

    let code = completion.choices[0]?.message?.content?.trim() || ''
    const tokensUsed = completion.usage?.total_tokens || 0

    if (!code) {
      throw new Error('Failed to generate code: Empty response from DeepSeek')
    }

    // Clean code: Remove markdown code blocks if present
    code = cleanCodeOutput(code)

    return { code, tokensUsed }
  } catch (error) {
    console.error('DeepSeek code generation error:', error)
    throw new Error(
      `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Verifies and fixes RTL and Arabic compliance in generated code
 *
 * @param code - The generated React code to verify
 * @param arabicPrompt - Original Arabic prompt for context
 * @returns Promise<{ code: string, issues: string[], tokensUsed: number }>
 */
export async function ensureRTLArabic(
  code: string,
  arabicPrompt: string
): Promise<{ code: string; issues: string[]; tokensUsed: number }> {
  try {
    const completion = await deepseek.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: RTL_VERIFICATION_PROMPT,
        },
        {
          role: 'user',
          content: `Original Arabic Prompt: ${arabicPrompt}

Generated Code:
\`\`\`tsx
${code}
\`\`\`

Review this code and fix any RTL or Arabic issues. Return the corrected code with a list of issues found.

Format your response as JSON:
{
  "issues": ["list of issues found"],
  "code": "corrected code here"
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
    })

    const response = completion.choices[0]?.message?.content?.trim() || ''
    const tokensUsed = completion.usage?.total_tokens || 0

    if (!response) {
      throw new Error('Failed to verify RTL: Empty response from DeepSeek')
    }

    try {
      const parsed = JSON.parse(response)
      return {
        code: cleanCodeOutput(parsed.code),
        issues: parsed.issues || [],
        tokensUsed,
      }
    } catch {
      // If JSON parsing fails, return original code
      return {
        code,
        issues: ['RTL verification could not parse response'],
        tokensUsed,
      }
    }
  } catch (error) {
    console.error('DeepSeek RTL verification error:', error)
    // Don't throw - return original code if verification fails
    return {
      code,
      issues: ['RTL verification failed'],
      tokensUsed: 0,
    }
  }
}

/**
 * Validates code security and removes potential vulnerabilities
 *
 * @param code - The React code to validate
 * @returns Promise<{ code: string, vulnerabilities: string[], tokensUsed: number }>
 */
export async function validateSecurity(
  code: string
): Promise<{ code: string; vulnerabilities: string[]; tokensUsed: number }> {
  try {
    // First, check for obvious security issues without AI
    const quickChecks = performQuickSecurityChecks(code)
    if (quickChecks.length > 0) {
      return {
        code,
        vulnerabilities: quickChecks,
        tokensUsed: 0,
      }
    }

    // Use AI for deeper security analysis
    const completion = await deepseek.chat.completions.create({
      model: MODELS.CHAT,
      messages: [
        {
          role: 'system',
          content: SECURITY_VALIDATION_PROMPT,
        },
        {
          role: 'user',
          content: `Review this React code for security issues:

\`\`\`tsx
${code}
\`\`\`

Return response as JSON:
{
  "vulnerabilities": ["list of security issues found"],
  "code": "corrected code if issues found, otherwise original code"
}`,
        },
      ],
      temperature: 0.2,
      max_tokens: MAX_TOKENS,
    })

    const response = completion.choices[0]?.message?.content?.trim() || ''
    const tokensUsed = completion.usage?.total_tokens || 0

    if (!response) {
      throw new Error('Failed to validate security: Empty response')
    }

    try {
      const parsed = JSON.parse(response)
      return {
        code: cleanCodeOutput(parsed.code),
        vulnerabilities: parsed.vulnerabilities || [],
        tokensUsed,
      }
    } catch {
      // If JSON parsing fails, return original code
      return {
        code,
        vulnerabilities: ['Security validation could not parse response'],
        tokensUsed,
      }
    }
  } catch (error) {
    console.error('DeepSeek security validation error:', error)
    return {
      code,
      vulnerabilities: ['Security validation failed'],
      tokensUsed: 0,
    }
  }
}

/**
 * Performs quick security checks without AI
 */
function performQuickSecurityChecks(code: string): string[] {
  const issues: string[] = []

  // Check for eval()
  if (code.includes('eval(') || code.includes('Function(')) {
    issues.push('Contains eval() or Function() - potential code injection')
  }

  // Check for dangerouslySetInnerHTML
  if (code.includes('dangerouslySetInnerHTML')) {
    issues.push('Contains dangerouslySetInnerHTML - potential XSS vulnerability')
  }

  // Check for external API calls
  if (
    code.includes('fetch(') ||
    code.includes('axios') ||
    code.includes('XMLHttpRequest')
  ) {
    issues.push('Contains external API calls - not allowed in generated code')
  }

  // Check for inline event handlers with string code
  if (code.match(/on\w+="[^"]*\([^)]*\)"/)) {
    issues.push('Contains inline event handlers with code strings')
  }

  return issues
}

/**
 * Cleans code output by removing markdown formatting
 */
function cleanCodeOutput(code: string): string {
  // Remove markdown code blocks
  code = code.replace(/```tsx?\n?/g, '').replace(/```\n?/g, '')

  // Remove leading/trailing whitespace
  code = code.trim()

  return code
}

/**
 * Complete generation pipeline: translate → generate → verify → validate
 *
 * This is a convenience function that combines all steps.
 */
export async function generateCompleteCode(arabicPrompt: string): Promise<{
  code: string
  englishPrompt: string
  totalTokens: number
  issues: string[]
  vulnerabilities: string[]
}> {
  // Step 1: Translate
  const { english: englishPrompt, tokensUsed: translateTokens } =
    await translateArabicToEnglish(arabicPrompt)

  // Step 2: Generate code
  const { code: generatedCode, tokensUsed: generateTokens } =
    await generateReactCode({
      englishPrompt,
      arabicPrompt,
    })

  // Step 3: Verify RTL and Arabic
  const {
    code: rtlVerifiedCode,
    issues,
    tokensUsed: rtlTokens,
  } = await ensureRTLArabic(generatedCode, arabicPrompt)

  // Step 4: Validate security
  const {
    code: finalCode,
    vulnerabilities,
    tokensUsed: securityTokens,
  } = await validateSecurity(rtlVerifiedCode)

  const totalTokens =
    translateTokens + generateTokens + rtlTokens + securityTokens

  return {
    code: finalCode,
    englishPrompt,
    totalTokens,
    issues,
    vulnerabilities,
  }
}

// Export usage calculation helper
export function calculateCost(tokens: number): number {
  // DeepSeek pricing: ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens
  // Simplified average: $0.21 per 1M tokens
  const costPerMillionTokens = 0.21
  return (tokens / 1_000_000) * costPerMillionTokens
}
