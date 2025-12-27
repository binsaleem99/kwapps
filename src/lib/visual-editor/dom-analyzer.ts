/**
 * DOM Analyzer
 *
 * Uses Gemini AI to analyze Arabic user requests and identify target elements
 * Examples:
 * - "غيّر لون الخلفية" → Identify background element
 * - "أضف زر" → Identify where to add button
 * - "حذف الصورة" → Identify which image
 */

interface DOMAnalysisRequest {
  projectCode: string
  userRequest: string // Arabic: "غيّر لون الخلفية إلى أزرق"
  selectedElement?: string
  currentPage: string
  previousChanges: Change[]
}

interface DOMAnalysisResponse {
  understood: boolean
  interpretation: string // Arabic explanation
  targetElements: ElementTarget[]
  suggestedChanges: ProposedChange[]
  clarificationNeeded?: string
  creditsCost: number
}

interface ElementTarget {
  path: string // CSS selector
  type: string // 'heading', 'button', 'section', etc.
  currentValue?: string
  confidence: number // 0-1
}

interface ProposedChange {
  id: string
  type: 'text' | 'color' | 'layout' | 'add' | 'remove' | 'image'
  description: string
  descriptionAr: string
  element: ElementTarget
  newValue?: any
  credits: number
}

interface Change {
  type: string
  description: string
  timestamp: string
}

export class DOMAnalyzer {
  /**
   * Analyze user request to identify target elements and proposed changes
   */
  async analyze(request: DOMAnalysisRequest): Promise<DOMAnalysisResponse> {
    try {
      // Build Gemini prompt
      const prompt = this.buildAnalysisPrompt(request)

      // Call Gemini API
      const response = await fetch('/api/visual-editor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, code: request.projectCode }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()

      return {
        understood: result.understood,
        interpretation: result.interpretation,
        targetElements: result.targetElements,
        suggestedChanges: result.suggestedChanges,
        clarificationNeeded: result.clarificationNeeded,
        creditsCost: this.calculateCreditsCost(result.suggestedChanges),
      }
    } catch (error) {
      console.error('DOM analysis error:', error)
      return {
        understood: false,
        interpretation: 'عذراً، لم أفهم الطلب',
        targetElements: [],
        suggestedChanges: [],
        clarificationNeeded: 'يرجى إعادة صياغة الطلب بشكل أوضح',
        creditsCost: 0,
      }
    }
  }

  /**
   * Build Gemini analysis prompt
   */
  private buildAnalysisPrompt(request: DOMAnalysisRequest): string {
    return `
أنت محلل DOM خبير. حلّل طلب المستخدم وحدد العنصر المقصود والتغيير المطلوب.

## طلب المستخدم:
"${request.userRequest}"

## الكود الحالي:
\`\`\`tsx
${request.projectCode.substring(0, 5000)} // First 5000 chars
\`\`\`

${request.selectedElement ? `## العنصر المحدد:\n${request.selectedElement}` : ''}

${request.previousChanges.length > 0 ? `## التغييرات السابقة:\n${request.previousChanges.map(c => `- ${c.description}`).join('\n')}` : ''}

## المطلوب منك:
1. فهم طلب المستخدم
2. تحديد العنصر/العناصر المقصودة (CSS selector)
3. تحديد نوع التغيير (text, color, layout, add, remove, image)
4. اقتراح التغييرات الدقيقة

## أنواع العناصر الشائعة:
- "العنوان" أو "العنوان الرئيسي" → h1, .hero-title, header h1
- "الزر" أو "زر" → button, .btn, .cta-button
- "الصورة" → img, picture
- "الخلفية" → body, .hero, section
- "القائمة" → nav, .navbar, .menu
- "الفوتر" → footer
- "النص" → p, span, div

## الإجابة (JSON):
{
  "understood": true/false,
  "interpretation": "فهمت أنك تريد...",
  "targetElements": [
    {
      "path": "header > h1",
      "type": "heading",
      "currentValue": "النص الحالي",
      "confidence": 0.9
    }
  ],
  "suggestedChanges": [
    {
      "id": "change-1",
      "type": "color",
      "description": "Change background color to blue",
      "descriptionAr": "تغيير لون الخلفية إلى أزرق",
      "element": {...},
      "newValue": "#3b82f6",
      "credits": 5
    }
  ],
  "clarificationNeeded": null أو "أي صورة تقصد؟ يوجد 3 صور"
}
`
  }

  /**
   * Calculate total credits cost for changes
   */
  private calculateCreditsCost(changes: ProposedChange[]): number {
    return changes.reduce((total, change) => total + change.credits, 0)
  }

  /**
   * Map Arabic element names to CSS selectors
   */
  getElementSelectorHints(): Record<string, string[]> {
    return {
      'العنوان الرئيسي': ['h1', '.hero-title', 'header h1', '.main-heading'],
      العنوان: ['h1', 'h2', 'h3', '.title', '.heading'],
      الزر: ['button', '.btn', '.button', 'a.cta'],
      زر: ['button', '.btn'],
      الصورة: ['img', 'picture', '.image'],
      صورة: ['img'],
      الخلفية: ['body', '.hero', 'section', '.background'],
      القائمة: ['nav', '.navbar', '.menu', 'header nav'],
      الفوتر: ['footer', '.footer'],
      القسم: ['section', '.section'],
      النص: ['p', 'span', 'div', '.text'],
      الشعار: ['.logo', 'img.logo', 'header img'],
    }
  }
}

// Singleton
export const domAnalyzer = new DOMAnalyzer()
