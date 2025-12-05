/**
 * Parameter Detection Service
 *
 * Uses Gemini Pro to analyze Arabic prompts and extract:
 * 1. Business Type
 * 2. Services
 * 3. Functionality
 * 4. Styling
 * 5. Language
 */

import { geminiClient } from '../gemini/client'
import type {
  DetectedParameters,
  BusinessTypeParam,
  ServicesParam,
  FunctionalityParam,
  StylingParam,
  LanguageParam,
} from './types'
import { BUSINESS_TYPES, THEME_CATALOG, WIDGET_CATALOG } from './types'

const DETECTION_SYSTEM_PROMPT = `أنت محلل ذكي للطلبات باللغة العربية لمنصة KWq8.com لبناء المواقع.

مهمتك: تحليل طلب المستخدم واستخراج 5 معاملات:

1. **نوع العمل** (Business Type):
   - ابحث عن كلمات مثل: صالون، مطعم، متجر، عيادة، معرض أعمال
   - حدد النوع المناسب من القائمة المتاحة
   - قيّم مستوى الثقة (0-1)

2. **الخدمات** (Services):
   - ابحث عن أسماء خدمات محددة
   - مثال: قص شعر، توصيل، حجز، مكياج
   - استخرج قائمة بالخدمات

3. **الوظائف** (Functionality):
   - ابحث عن طلبات مثل: نظام حجز، سلة شراء، خريطة
   - حدد الويدجت والصفحات المطلوبة

4. **التصميم** (Styling):
   - ابحث عن كلمات مثل: عصري، كلاسيكي، بسيط، جريء، أنثوي
   - حدد الثيم المناسب
   - استخرج الألوان إذا ذُكرت

5. **اللغة** (Language):
   - حدد لغة المحتوى (عربي/إنجليزي)
   - الاتجاه (RTL/LTR)
   - الخط المناسب

أجب فقط بصيغة JSON بدون أي نص إضافي.`

const DETECTION_OUTPUT_FORMAT = `{
  "businessType": {
    "type": "beauty_salon",
    "keywords": ["صالون", "تجميل"],
    "confidence": 0.95,
    "arabicName": "صالون تجميل"
  },
  "services": {
    "services": ["haircut", "makeup"],
    "arabicServices": ["قص شعر", "مكياج"],
    "confidence": 0.8
  },
  "functionality": {
    "widgets": ["booking_calendar", "gallery"],
    "pages": ["home", "services", "booking"],
    "confidence": 0.7
  },
  "styling": {
    "theme": "feminine_modern",
    "colors": {
      "primary": "#E91E63"
    },
    "arabicTheme": "أنثوي وعصري",
    "confidence": 0.6
  },
  "language": {
    "primary": "ar",
    "direction": "rtl",
    "font": "Cairo",
    "detected": true
  }
}`

/**
 * Detect parameters from Arabic prompt using Gemini Pro
 */
export async function detectParameters(
  arabicPrompt: string
): Promise<{ success: boolean; parameters?: DetectedParameters; error?: any }> {
  try {
    console.log('[ParameterDetector] Analyzing prompt:', arabicPrompt.substring(0, 100))

    // Check if Gemini is configured
    if (!geminiClient.isConfigured()) {
      console.warn('[ParameterDetector] Gemini not configured, using fallback')
      return {
        success: true,
        parameters: fallbackDetection(arabicPrompt),
      }
    }

    // Prepare user prompt with business types and themes context
    const businessTypesContext = Object.entries(BUSINESS_TYPES)
      .map(([key, val]) => `- ${key}: ${val.ar} (${val.keywords.join(', ')})`)
      .join('\n')

    const themesContext = Object.entries(THEME_CATALOG)
      .map(([key, val]) => `- ${key}: ${val.ar} (${val.keywords.join(', ')})`)
      .join('\n')

    const widgetsContext = Object.entries(WIDGET_CATALOG)
      .map(([key, val]) => `- ${key}: ${val.ar}`)
      .join('\n')

    const userPrompt = `حلل هذا الطلب:

"${arabicPrompt}"

الأنواع المتاحة:
${businessTypesContext}

الثيمات المتاحة:
${themesContext}

الويدجت المتاحة:
${widgetsContext}

أجب بصيغة JSON مثل هذا المثال:
${DETECTION_OUTPUT_FORMAT}`

    // Call Gemini Pro
    const response = await geminiClient['callGeminiAPI'](DETECTION_SYSTEM_PROMPT, userPrompt)

    if (!response.success) {
      console.error('[ParameterDetector] Gemini API error:', response.error)
      return {
        success: true,
        parameters: fallbackDetection(arabicPrompt),
      }
    }

    // Parse JSON response
    const rawText = response.text
    if (!rawText) {
      console.error('[ParameterDetector] No text in response')
      return {
        success: true,
        parameters: fallbackDetection(arabicPrompt),
      }
    }
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('[ParameterDetector] No JSON found in response')
      return {
        success: true,
        parameters: fallbackDetection(arabicPrompt),
      }
    }

    const detected: DetectedParameters = JSON.parse(jsonMatch[0])

    // Validate and normalize
    const normalized = normalizeDetectedParameters(detected)

    console.log('[ParameterDetector] Successfully detected parameters')
    return {
      success: true,
      parameters: normalized,
    }
  } catch (error) {
    console.error('[ParameterDetector] Error:', error)
    return {
      success: false,
      error: {
        code: 'DETECTION_FAILED',
        message: 'Failed to detect parameters',
        messageAr: 'فشل في تحليل المعاملات',
      },
    }
  }
}

/**
 * Fallback detection using keyword matching (when Gemini unavailable)
 */
function fallbackDetection(prompt: string): DetectedParameters {
  const lowerPrompt = prompt.toLowerCase()

  // Detect business type
  let businessType: BusinessTypeParam | null = null
  for (const [key, config] of Object.entries(BUSINESS_TYPES)) {
    const matches = config.keywords.filter((kw) => lowerPrompt.includes(kw))
    if (matches.length > 0) {
      businessType = {
        type: key,
        keywords: matches,
        confidence: Math.min(0.9, matches.length * 0.3),
        arabicName: config.ar,
      }
      break
    }
  }

  // Detect theme
  let styling: StylingParam | null = null
  for (const [key, config] of Object.entries(THEME_CATALOG)) {
    const matches = config.keywords.filter((kw) => lowerPrompt.includes(kw))
    if (matches.length > 0) {
      styling = {
        theme: key,
        colors: config.colors,
        arabicTheme: config.ar,
        confidence: Math.min(0.9, matches.length * 0.3),
      }
      break
    }
  }

  // Detect language (Arabic if Arabic chars found)
  const hasArabic = /[\u0600-\u06FF]/.test(prompt)
  const language: LanguageParam = {
    primary: hasArabic ? 'ar' : 'en',
    direction: hasArabic ? 'rtl' : 'ltr',
    font: hasArabic ? 'Cairo' : 'Inter',
    detected: true,
  }

  // Services and functionality are null - require clarifying questions
  return {
    businessType,
    services: null,
    functionality: null,
    styling,
    language,
  }
}

/**
 * Normalize and validate detected parameters
 */
function normalizeDetectedParameters(detected: any): DetectedParameters {
  // Ensure business type is valid
  if (detected.businessType && !BUSINESS_TYPES[detected.businessType.type as keyof typeof BUSINESS_TYPES]) {
    detected.businessType = null
  }

  // Ensure theme is valid
  if (detected.styling && !THEME_CATALOG[detected.styling.theme as keyof typeof THEME_CATALOG]) {
    detected.styling = null
  }

  // Ensure widgets are valid
  if (detected.functionality?.widgets) {
    detected.functionality.widgets = detected.functionality.widgets.filter(
      (w: string) => WIDGET_CATALOG[w as keyof typeof WIDGET_CATALOG]
    )
  }

  // Ensure language defaults
  if (!detected.language) {
    detected.language = {
      primary: 'ar',
      direction: 'rtl',
      font: 'Cairo',
      detected: true,
    }
  }

  return detected as DetectedParameters
}

/**
 * Get missing parameters (null or low confidence)
 */
export function getMissingParameters(params: DetectedParameters): string[] {
  const missing: string[] = []

  if (!params.businessType || params.businessType.confidence < 0.5) {
    missing.push('businessType')
  }

  if (!params.services || params.services.confidence < 0.5) {
    missing.push('services')
  }

  if (!params.functionality || params.functionality.confidence < 0.5) {
    missing.push('functionality')
  }

  if (!params.styling || params.styling.confidence < 0.5) {
    missing.push('styling')
  }

  return missing
}

/**
 * Calculate overall confidence score
 */
export function calculateConfidence(params: DetectedParameters): number {
  const scores = [
    params.businessType?.confidence ?? 0,
    params.services?.confidence ?? 0,
    params.functionality?.confidence ?? 0,
    params.styling?.confidence ?? 0,
    1, // Language always detected
  ]

  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}
