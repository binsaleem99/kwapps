/**
 * Gemini AI Client for KW APPS
 *
 * Provides planning and annotation capabilities using Google's Gemini API
 * Used alongside DeepSeek for hybrid AI generation pipeline
 */

import type {
  GeminiPlan,
  GeminiAnnotations,
  GeminiProjectContext,
  GeminiResponse,
  GeminiSection,
  GeminiSuggestion,
} from './types'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Gemini Client for planning and annotation
 */
export class GeminiClient {
  private apiKey: string
  private modelId: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
    this.modelId = process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash-exp'

    if (!this.apiKey) {
      console.warn('[GeminiClient] GEMINI_API_KEY not configured')
    }
  }

  /**
   * Check if Gemini is configured and available
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_gemini_api_key_here'
  }

  /**
   * Generate a structured plan from an Arabic prompt
   * Stage 1 of the Smart mode pipeline
   */
  async planFromPrompt(
    arabicPrompt: string,
    context?: GeminiProjectContext
  ): Promise<GeminiResponse<GeminiPlan>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          code: 'NOT_CONFIGURED',
          message: 'Gemini API key not configured',
          messageAr: 'مفتاح Gemini غير مهيأ',
        },
      }
    }

    try {
      const systemPrompt = `You are an expert Arabic web app planner for KW APPS, a Kuwaiti website builder.
Your job is to analyze Arabic prompts and create structured plans for React web applications.

IMPORTANT RULES:
1. Always respond in valid JSON format
2. All text content should be in Arabic
3. Focus on RTL (right-to-left) layouts
4. Suggest Cairo font for Arabic typography
5. Recommend high-contrast color schemes (no purple/indigo AI clichés)
6. Be specific about sections and features

OUTPUT FORMAT (JSON only, no markdown):
{
  "summary": "وصف موجز للتطبيق بالعربية",
  "appType": "landing|ecommerce|dashboard|portfolio|restaurant|saas|booking|other",
  "sections": [
    {
      "id": "hero",
      "name": "القسم الرئيسي",
      "type": "hero|features|pricing|testimonials|cta|gallery|contact|faq|team|stats|custom",
      "description": "وصف القسم",
      "order": 1,
      "essential": true
    }
  ],
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "layout": {
    "direction": "rtl",
    "headerStyle": "fixed|static|transparent",
    "footerIncluded": true
  },
  "features": ["ميزة 1", "ميزة 2"],
  "copyHints": {
    "headline": "عنوان مقترح",
    "subheadline": "عنوان فرعي",
    "ctaText": "نص الزر"
  },
  "confidence": 0.85
}`

      const userPrompt = `طلب المستخدم: ${arabicPrompt}

${context?.projectName ? `اسم المشروع: ${context.projectName}` : ''}
${context?.projectDescription ? `وصف المشروع: ${context.projectDescription}` : ''}
${context?.previousPrompts?.length ? `الطلبات السابقة: ${context.previousPrompts.join(', ')}` : ''}

قم بتحليل هذا الطلب وإنشاء خطة مفصلة للتطبيق. أعد JSON فقط بدون أي نص إضافي.`

      const response = await this.callGeminiAPI(systemPrompt, userPrompt)

      if (!response.success || !response.text) {
        return {
          success: false,
          error: response.error || {
            code: 'GENERATION_FAILED',
            message: 'Failed to generate plan',
            messageAr: 'فشل إنشاء الخطة',
          },
        }
      }

      // Parse JSON response
      const plan = this.parseJsonResponse<GeminiPlan>(response.text)

      if (!plan) {
        return {
          success: false,
          error: {
            code: 'PARSE_FAILED',
            message: 'Failed to parse plan response',
            messageAr: 'فشل تحليل استجابة الخطة',
          },
        }
      }

      return {
        success: true,
        data: plan,
        tokensUsed: response.tokensUsed,
      }
    } catch (error: any) {
      console.error('[GeminiClient] planFromPrompt error:', error)
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error.message || 'Unknown error',
          messageAr: 'حدث خطأ في الاتصال بـ Gemini',
        },
      }
    }
  }

  /**
   * Analyze generated code and provide annotations
   * Stage 3 of the Smart mode pipeline (on demand)
   */
  async annotateCode(
    code: string,
    arabicPrompt: string,
    context?: GeminiProjectContext
  ): Promise<GeminiResponse<GeminiAnnotations>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: {
          code: 'NOT_CONFIGURED',
          message: 'Gemini API key not configured',
          messageAr: 'مفتاح Gemini غير مهيأ',
        },
      }
    }

    try {
      const systemPrompt = `You are an expert Arabic web development reviewer for KW APPS.
Analyze React code and provide constructive feedback in Arabic.

IMPORTANT RULES:
1. Always respond in valid JSON format
2. All feedback should be in Arabic
3. Focus on UX, accessibility, and conversion optimization
4. Check for proper RTL support
5. Be constructive and specific
6. Prioritize suggestions by impact

OUTPUT FORMAT (JSON only, no markdown):
{
  "summary": "ملخص ما تفعله الصفحة بالعربية",
  "qualityScore": 8,
  "suggestions": [
    {
      "category": "ux|conversion|design|content|accessibility|performance",
      "priority": "high|medium|low",
      "text": "نص الاقتراح بالعربية",
      "codeHint": "optional code snippet"
    }
  ],
  "inlineComments": [
    {
      "line": 10,
      "comment": "تعليق على سطر معين",
      "type": "suggestion|issue|praise"
    }
  ],
  "accessibilityNotes": ["ملاحظة 1", "ملاحظة 2"],
  "performanceTips": ["نصيحة 1", "نصيحة 2"],
  "rtlCompliance": {
    "score": 9,
    "issues": ["مشكلة محتملة"]
  }
}`

      const userPrompt = `الطلب الأصلي: ${arabicPrompt}

الكود المُنشأ:
\`\`\`tsx
${code}
\`\`\`

قم بتحليل هذا الكود وتقديم ملاحظات بناءة. أعد JSON فقط بدون أي نص إضافي.`

      const response = await this.callGeminiAPI(systemPrompt, userPrompt)

      if (!response.success || !response.text) {
        return {
          success: false,
          error: response.error || {
            code: 'GENERATION_FAILED',
            message: 'Failed to generate annotations',
            messageAr: 'فشل إنشاء التعليقات التوضيحية',
          },
        }
      }

      // Parse JSON response
      const annotations = this.parseJsonResponse<GeminiAnnotations>(response.text)

      if (!annotations) {
        return {
          success: false,
          error: {
            code: 'PARSE_FAILED',
            message: 'Failed to parse annotations response',
            messageAr: 'فشل تحليل استجابة التعليقات',
          },
        }
      }

      return {
        success: true,
        data: annotations,
        tokensUsed: response.tokensUsed,
      }
    } catch (error: any) {
      console.error('[GeminiClient] annotateCode error:', error)
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: error.message || 'Unknown error',
          messageAr: 'حدث خطأ في الاتصال بـ Gemini',
        },
      }
    }
  }

  /**
   * Call the Gemini API
   */
  private async callGeminiAPI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{
    success: boolean
    text?: string
    tokensUsed?: number
    error?: { code: string; message: string; messageAr: string }
  }> {
    const url = `${GEMINI_API_URL}/${this.modelId}:generateContent?key=${this.apiKey}`

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\n---\n\n${userPrompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: 'text/plain',
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    }

    console.log('[GeminiClient] Calling API:', this.modelId)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[GeminiClient] API error:', response.status, errorText)
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `Gemini API error: ${response.status}`,
          messageAr: `خطأ في Gemini API: ${response.status}`,
        },
      }
    }

    const data = await response.json()

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('[GeminiClient] No text in response:', data)
      return {
        success: false,
        error: {
          code: 'NO_CONTENT',
          message: 'No content in Gemini response',
          messageAr: 'لا يوجد محتوى في استجابة Gemini',
        },
      }
    }

    // Extract token usage if available
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0

    console.log('[GeminiClient] Response received, tokens:', tokensUsed)

    return {
      success: true,
      text,
      tokensUsed,
    }
  }

  /**
   * Parse JSON from response text (handles markdown code blocks)
   */
  private parseJsonResponse<T>(text: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim()

      // Clean up any trailing commas or common JSON issues
      const cleanedJson = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')

      return JSON.parse(cleanedJson) as T
    } catch (error) {
      console.error('[GeminiClient] JSON parse error:', error)
      console.error('[GeminiClient] Raw text:', text.substring(0, 500))
      return null
    }
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient()

/**
 * Helper function to format Gemini plan as prompt enhancement for DeepSeek
 */
export function formatPlanForDeepSeek(plan: GeminiPlan): string {
  const sections = plan.sections
    .sort((a, b) => a.order - b.order)
    .map((s) => `- ${s.name} (${s.type}): ${s.description}`)
    .join('\n')

  return `
## خطة التطبيق (من Gemini)

**الملخص**: ${plan.summary}

**نوع التطبيق**: ${plan.appType}

**الأقسام المطلوبة**:
${sections}

**نظام الألوان**:
- اللون الرئيسي: ${plan.colorScheme.primary}
- اللون الثانوي: ${plan.colorScheme.secondary}
- لون التمييز: ${plan.colorScheme.accent}
- لون الخلفية: ${plan.colorScheme.background}

**التخطيط**:
- الاتجاه: ${plan.layout.direction === 'rtl' ? 'من اليمين لليسار' : 'من اليسار لليمين'}
- نمط الرأس: ${plan.layout.headerStyle}
- تضمين التذييل: ${plan.layout.footerIncluded ? 'نعم' : 'لا'}

**الميزات الرئيسية**:
${plan.features.map((f) => `- ${f}`).join('\n')}

${plan.copyHints.headline ? `**العنوان الرئيسي المقترح**: ${plan.copyHints.headline}` : ''}
${plan.copyHints.subheadline ? `**العنوان الفرعي**: ${plan.copyHints.subheadline}` : ''}
${plan.copyHints.ctaText ? `**نص زر الدعوة للعمل**: ${plan.copyHints.ctaText}` : ''}

---
يجب اتباع هذه الخطة بدقة عند إنشاء الكود.
`.trim()
}
