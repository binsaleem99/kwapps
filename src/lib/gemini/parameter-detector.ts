/**
 * Gemini Parameter Detector
 *
 * Detects and extracts structured parameters from Arabic user prompts
 * for the AI generation pipeline.
 *
 * Parameters detected:
 * - Business type (restaurant, gym, clinic, ecommerce, etc.)
 * - Services offered
 * - Functionality requirements
 * - Styling preferences (colors, theme, fonts)
 * - Language preferences (Arabic, English, bilingual)
 */

import { geminiClient } from './client'

/**
 * Detected parameters from user prompt
 */
export interface DetectedParameters {
  /** Business type/industry */
  businessType?: {
    type: string // e.g., "restaurant", "gym", "clinic"
    confidence: number // 0-1
    label_ar: string // "مطعم", "صالة رياضية"
  }

  /** Services/offerings */
  services?: {
    items: string[] // ["توصيل", "حجز", "استشارات"]
    confidence: number
  }

  /** Functionality requirements */
  functionality?: {
    features: string[] // ["نظام حجز", "عرض القائمة", "نموذج اتصال"]
    integrations?: string[] // ["واتساب", "خرائط جوجل"]
    confidence: number
  }

  /** Styling preferences */
  styling?: {
    colors?: {
      primary?: string
      secondary?: string
      theme?: 'light' | 'dark' | 'modern' | 'classic'
    }
    fonts?: string[] // ["Cairo", "Tajawal"]
    aesthetic?: string // "minimalist", "vibrant", "professional"
    confidence: number
  }

  /** Language preferences */
  language?: {
    primary: 'ar' | 'en' | 'both'
    arabicDialect?: 'modern_standard' | 'kuwaiti' | 'gulf'
    confidence: number
  }

  /** Additional context */
  context?: {
    targetAudience?: string // "العائلات", "الشباب", "رجال الأعمال"
    brandName?: string
    existingWebsite?: string
  }

  /** Overall detection confidence */
  overallConfidence: number

  /** Missing parameters that need clarification */
  missingParameters: Array<{
    key: string
    label_ar: string
    priority: 'high' | 'medium' | 'low'
  }>
}

/**
 * Detect parameters from Arabic user prompt using Gemini
 */
export async function detectParameters(
  arabicPrompt: string,
  context?: {
    previousPrompts?: string[]
    projectName?: string
  }
): Promise<{
  success: boolean
  parameters?: DetectedParameters
  error?: string
  tokensUsed?: number
}> {
  if (!geminiClient.isConfigured()) {
    return {
      success: false,
      error: 'Gemini API not configured',
    }
  }

  try {
    const systemPrompt = `أنت نظام ذكي لتحليل طلبات المستخدمين بالعربية لإنشاء مواقع ويب.
مهمتك: استخراج المعلومات الهيكلية من النص العربي لفهم ما يريده المستخدم بالضبط.

قم بتحليل الطلب واستخراج:
1. نوع النشاط التجاري (Business Type)
2. الخدمات المقدمة (Services)
3. الوظائف المطلوبة (Functionality)
4. تفضيلات التصميم (Styling)
5. تفضيلات اللغة (Language)

أعد النتيجة بصيغة JSON فقط:

{
  "businessType": {
    "type": "restaurant|gym|clinic|ecommerce|portfolio|saas|booking|corporate|other",
    "confidence": 0.9,
    "label_ar": "مطعم"
  },
  "services": {
    "items": ["توصيل", "حجز طاولات", "قائمة طعام"],
    "confidence": 0.85
  },
  "functionality": {
    "features": ["نظام حجز أونلاين", "عرض القائمة", "نموذج اتصال"],
    "integrations": ["واتساب", "خرائط جوجل"],
    "confidence": 0.8
  },
  "styling": {
    "colors": {
      "primary": "#d4af37",
      "secondary": "#2c3e50",
      "theme": "modern"
    },
    "fonts": ["Cairo"],
    "aesthetic": "elegant",
    "confidence": 0.7
  },
  "language": {
    "primary": "ar",
    "arabicDialect": "modern_standard",
    "confidence": 0.95
  },
  "context": {
    "targetAudience": "العائلات والشباب",
    "brandName": "مطعم الذوق الرفيع",
    "existingWebsite": null
  },
  "overallConfidence": 0.82,
  "missingParameters": [
    {
      "key": "services",
      "label_ar": "الخدمات المقدمة",
      "priority": "high"
    },
    {
      "key": "styling.colors",
      "label_ar": "الألوان المفضلة",
      "priority": "medium"
    }
  ]
}

ملاحظات مهمة:
- إذا لم يحدد المستخدم معلومة، ضع null أو أضفها إلى missingParameters
- confidence يجب أن يعكس مدى تأكدك من الاستنتاج
- missingParameters هي المعلومات الناقصة التي يجب سؤال المستخدم عنها
- أولوية high للمعلومات الضرورية، medium للمفيدة، low للاختيارية`

    const userPrompt = `طلب المستخدم:
${arabicPrompt}

${context?.previousPrompts?.length ? `الطلبات السابقة:\n${context.previousPrompts.join('\n')}` : ''}
${context?.projectName ? `اسم المشروع: ${context.projectName}` : ''}

قم بتحليل هذا الطلب واستخراج المعلومات. أعد JSON فقط.`

    // Call Gemini API directly
    const response = await (geminiClient as any).callGeminiAPI(
      systemPrompt,
      userPrompt
    )

    if (!response.success || !response.text) {
      return {
        success: false,
        error: response.error?.message || 'Failed to detect parameters',
      }
    }

    // Parse JSON response
    const parameters = (geminiClient as any).parseJsonResponse(
      response.text
    ) as DetectedParameters | null

    if (!parameters) {
      return {
        success: false,
        error: 'Failed to parse parameter detection response',
      }
    }

    return {
      success: true,
      parameters,
      tokensUsed: response.tokensUsed,
    }
  } catch (error: any) {
    console.error('[ParameterDetector] Error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Generate clarifying questions in Arabic for missing parameters
 */
export interface ClarifyingQuestion {
  key: string // Parameter key (e.g., "services", "styling.colors")
  question_ar: string // Question in Arabic
  type: 'multiple_choice' | 'checkboxes' | 'text' | 'color_picker'
  options?: Array<{
    value: string
    label_ar: string
    icon?: string // Lucide icon name
  }>
  priority: 'high' | 'medium' | 'low'
  skipable: boolean
}

export async function generateClarifyingQuestions(
  parameters: DetectedParameters
): Promise<{
  success: boolean
  questions?: ClarifyingQuestion[]
  error?: string
  tokensUsed?: number
}> {
  if (!geminiClient.isConfigured()) {
    return {
      success: false,
      error: 'Gemini API not configured',
    }
  }

  if (!parameters.missingParameters.length) {
    // No missing parameters - no questions needed
    return {
      success: true,
      questions: [],
      tokensUsed: 0,
    }
  }

  try {
    const systemPrompt = `أنت خبير في تصميم أسئلة واضحة ومفيدة بالعربية.
مهمتك: إنشاء أسئلة توضيحية للحصول على المعلومات الناقصة من المستخدم.

الأسئلة يجب أن تكون:
- واضحة ومباشرة بالعربية
- مع خيارات متعددة عندما يكون ذلك مناسباً
- مرتبة حسب الأولوية (high → medium → low)
- قابلة للتخطي إذا كانت اختيارية

أعد النتيجة بصيغة JSON:

{
  "questions": [
    {
      "key": "services",
      "question_ar": "ما هي الخدمات التي تقدمها؟",
      "type": "checkboxes",
      "options": [
        { "value": "delivery", "label_ar": "التوصيل", "icon": "Truck" },
        { "value": "booking", "label_ar": "الحجز أونلاين", "icon": "Calendar" },
        { "value": "consultation", "label_ar": "استشارات", "icon": "MessageCircle" }
      ],
      "priority": "high",
      "skipable": false
    },
    {
      "key": "styling.colors",
      "question_ar": "ما هي الألوان المفضلة للموقع؟",
      "type": "multiple_choice",
      "options": [
        { "value": "modern", "label_ar": "ألوان عصرية (أزرق، رمادي)", "icon": "Sparkles" },
        { "value": "warm", "label_ar": "ألوان دافئة (أحمر، برتقالي)", "icon": "Flame" },
        { "value": "elegant", "label_ar": "ألوان فخمة (ذهبي، أسود)", "icon": "Crown" },
        { "value": "custom", "label_ar": "ألوان مخصصة", "icon": "Palette" }
      ],
      "priority": "medium",
      "skipable": true
    }
  ]
}`

    const userPrompt = `المعلومات المكتشفة:
${JSON.stringify(parameters, null, 2)}

المعلومات الناقصة:
${parameters.missingParameters.map((mp) => `- ${mp.label_ar} (${mp.key}): أولوية ${mp.priority}`).join('\n')}

قم بإنشاء أسئلة توضيحية لجمع هذه المعلومات. أعد JSON فقط.`

    const response = await (geminiClient as any).callGeminiAPI(
      systemPrompt,
      userPrompt
    )

    if (!response.success || !response.text) {
      return {
        success: false,
        error: response.error?.message || 'Failed to generate questions',
      }
    }

    const result = (geminiClient as any).parseJsonResponse(response.text) as {
      questions: ClarifyingQuestion[]
    } | null

    if (!result || !result.questions) {
      return {
        success: false,
        error: 'Failed to parse clarifying questions response',
      }
    }

    // Sort by priority: high → medium → low
    const sortedQuestions = result.questions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    return {
      success: true,
      questions: sortedQuestions,
      tokensUsed: response.tokensUsed,
    }
  } catch (error: any) {
    console.error('[ParameterDetector] generateClarifyingQuestions error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Merge user answers with detected parameters
 */
export function mergeParameters(
  detected: DetectedParameters,
  answers: Record<string, any>
): DetectedParameters {
  const merged = { ...detected }

  // Update parameters based on answers
  Object.entries(answers).forEach(([key, value]) => {
    if (key === 'services' && Array.isArray(value)) {
      merged.services = {
        items: value,
        confidence: 1.0, // User-provided = 100% confidence
      }
    } else if (key === 'styling.colors') {
      if (!merged.styling) merged.styling = { confidence: 0 }
      merged.styling.colors = value
      merged.styling.confidence = Math.max(merged.styling.confidence, 0.9)
    } else if (key === 'businessType') {
      merged.businessType = {
        ...value,
        confidence: 1.0,
      }
    }
    // Add more key mappings as needed
  })

  // Remove answered parameters from missingParameters
  merged.missingParameters = merged.missingParameters.filter(
    (mp) => !Object.keys(answers).includes(mp.key)
  )

  // Recalculate overall confidence
  const confidences: number[] = []
  if (merged.businessType) confidences.push(merged.businessType.confidence)
  if (merged.services) confidences.push(merged.services.confidence)
  if (merged.functionality) confidences.push(merged.functionality.confidence)
  if (merged.styling) confidences.push(merged.styling.confidence)
  if (merged.language) confidences.push(merged.language.confidence)

  merged.overallConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0

  return merged
}
