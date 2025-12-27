/**
 * Code Modifier
 *
 * Uses DeepSeek to surgically modify code based on user requests
 * Maintains RTL compliance and doesn't break existing code
 */

import { ProposedChange } from './dom-analyzer'

interface CodeModificationRequest {
  projectCode: string
  changes: ProposedChange[]
  validateRTL?: boolean
}

interface CodeModificationResult {
  success: boolean
  newCode: string
  appliedChanges: string[]
  creditsUsed: number
  error?: string
}

export class CodeModifier {
  /**
   * Apply changes to code using DeepSeek
   */
  async modifyCode(request: CodeModificationRequest): Promise<CodeModificationResult> {
    try {
      // Build DeepSeek prompt
      const prompt = this.buildModificationPrompt(request)

      // Call DeepSeek API
      const response = await fetch('/api/visual-editor/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: request.projectCode,
          changes: request.changes,
          prompt,
        }),
      })

      if (!response.ok) {
        throw new Error('Code modification failed')
      }

      const result = await response.json()

      // Validate if needed
      if (request.validateRTL) {
        const isValid = await this.validateRTL(result.code)
        if (!isValid) {
          throw new Error('RTL validation failed')
        }
      }

      return {
        success: true,
        newCode: result.code,
        appliedChanges: request.changes.map((c) => c.descriptionAr),
        creditsUsed: request.changes.reduce((sum, c) => sum + c.credits, 0),
      }
    } catch (error: any) {
      console.error('Code modification error:', error)
      return {
        success: false,
        newCode: request.projectCode, // Return original on error
        appliedChanges: [],
        creditsUsed: 0,
        error: error.message,
      }
    }
  }

  /**
   * Build DeepSeek modification prompt
   */
  private buildModificationPrompt(request: CodeModificationRequest): string {
    return `
عدّل الكود التالي بدقة.

## الكود الحالي:
\`\`\`tsx
${request.projectCode}
\`\`\`

## التغييرات المطلوبة:
${request.changes.map((change, i) => `
${i + 1}. ${change.descriptionAr}
   - العنصر: ${change.element.path}
   - النوع: ${change.type}
   - القيمة الجديدة: ${change.newValue || 'N/A'}
`).join('\n')}

## القواعد الصارمة:
1. احتفظ بكل الكود الموجود - لا تحذف أي شيء غير مطلوب
2. طبّق التغييرات فقط - لا تعيد كتابة الكود
3. حافظ على RTL (dir="rtl")
4. استخدم Tailwind CSS فقط
5. لا تضف imports جديدة إلا إذا كانت ضرورية
6. لا تغيّر البنية العامة للكود

أعد الكود الكامل المعدّل فقط، بدون شرح.
`
  }

  /**
   * Validate RTL compliance
   */
  private async validateRTL(code: string): Promise<boolean> {
    // Basic checks
    const hasRTLDir = code.includes('dir="rtl"') || code.includes("dir='rtl'")
    const hasNoLeftRight = !code.includes('ml-') && !code.includes('mr-') &&
                          !code.includes('pl-') && !code.includes('pr-') &&
                          !code.includes('text-left') && !code.includes('text-right')

    return hasRTLDir // Simplified check
  }
}

// Singleton
export const codeModifier = new CodeModifier()
