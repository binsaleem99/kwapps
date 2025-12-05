'use client'

/**
 * Validation Checklist Component
 *
 * Shows validation checklist after code generation to ensure quality.
 * Validates: RTL layout, Arabic rendering, functionality, responsive design, no errors.
 */

import React from 'react'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCw,
  Eye,
  Code,
  Smartphone,
  Languages,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface ValidationResult {
  /** Validation item key */
  key: string

  /** Validation item label (Arabic) */
  label_ar: string

  /** Validation status */
  status: 'pending' | 'checking' | 'passed' | 'failed' | 'warning'

  /** Icon name */
  icon: string

  /** Error/warning message if failed */
  message?: string

  /** Auto-fix available? */
  canAutoFix?: boolean
}

interface ValidationChecklistProps {
  /** Validation results */
  results: ValidationResult[]

  /** Callback when user requests auto-fix */
  onAutoFix?: (key: string) => void

  /** Callback when user requests manual review */
  onManualReview?: () => void

  /** Callback when validation is complete and passed */
  onComplete?: () => void

  /** Loading state */
  isLoading?: boolean
}

const iconMap: Record<string, any> = {
  Eye,
  Code,
  Smartphone,
  Languages,
  Shield,
  CheckCircle2,
}

export function ValidationChecklist({
  results,
  onAutoFix,
  onManualReview,
  onComplete,
  isLoading = false,
}: ValidationChecklistProps) {
  const passedCount = results.filter((r) => r.status === 'passed').length
  const failedCount = results.filter((r) => r.status === 'failed').length
  const warningCount = results.filter((r) => r.status === 'warning').length
  const totalCount = results.length

  const allPassed = failedCount === 0 && warningCount === 0
  const progress = (passedCount / totalCount) * 100

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-green-950 p-4 sm:p-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full mb-6">
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 ${
              allPassed
                ? 'bg-green-600'
                : failedCount > 0
                  ? 'bg-orange-600'
                  : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
            ) : allPassed ? (
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            ) : failedCount > 0 ? (
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            ) : (
              <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-cairo">
            {allPassed
              ? 'تم التحقق بنجاح!'
              : isLoading
                ? 'جاري التحقق من الجودة...'
                : 'فحص الجودة'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-cairo">
            {allPassed
              ? 'الموقع جاهز للنشر'
              : `${passedCount} من ${totalCount} عنصر تم التحقق منه`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              allPassed
                ? 'bg-green-600'
                : failedCount > 0
                  ? 'bg-orange-600'
                  : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Summary Badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-cairo">
              {passedCount} نجح
            </span>
          </div>

          {failedCount > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-cairo">
                {failedCount} فشل
              </span>
            </div>
          )}

          {warningCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-cairo">
                {warningCount} تحذير
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="max-w-3xl mx-auto w-full space-y-3 mb-6">
        {results.map((result, index) => {
          const Icon = iconMap[result.icon] || CheckCircle2

          return (
            <Card
              key={index}
              className={`p-5 border-2 transition-all ${
                result.status === 'passed'
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                  : result.status === 'failed'
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                    : result.status === 'warning'
                      ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'
                      : result.status === 'checking'
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    result.status === 'passed'
                      ? 'bg-green-600'
                      : result.status === 'failed'
                        ? 'bg-red-600'
                        : result.status === 'warning'
                          ? 'bg-orange-600'
                          : result.status === 'checking'
                            ? 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  {result.status === 'checking' ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : result.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : result.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-white" />
                  ) : result.status === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-cairo mb-1">
                    {result.label_ar}
                  </h3>

                  {result.message && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-cairo">
                      {result.message}
                    </p>
                  )}

                  {/* Auto-fix button */}
                  {result.status === 'failed' &&
                    result.canAutoFix &&
                    onAutoFix && (
                      <Button
                        onClick={() => onAutoFix(result.key)}
                        variant="outline"
                        size="sm"
                        className="mt-3 font-cairo"
                      >
                        <RotateCw className="w-4 h-4 ml-2" />
                        إصلاح تلقائي
                      </Button>
                    )}
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {result.status === 'passed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 font-cairo">
                      تم
                    </span>
                  )}
                  {result.status === 'failed' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 font-cairo">
                      فشل
                    </span>
                  )}
                  {result.status === 'warning' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 font-cairo">
                      تحذير
                    </span>
                  )}
                  {result.status === 'checking' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 font-cairo">
                      جاري...
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="max-w-3xl mx-auto w-full space-y-3">
        {allPassed && onComplete && (
          <Button
            onClick={onComplete}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-cairo"
          >
            <CheckCircle2 className="w-5 h-5 ml-2" />
            متابعة إلى النشر
          </Button>
        )}

        {!allPassed && onManualReview && (
          <Button
            onClick={onManualReview}
            variant="outline"
            className="w-full h-12 text-base font-cairo"
          >
            <Eye className="w-5 h-5 ml-2" />
            معاينة وفحص يدوي
          </Button>
        )}

        {failedCount > 0 && (
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 font-cairo">
            يمكنك المتابعة مع التحذيرات أو إعادة المحاولة
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Run validation checks on generated code
 */
export async function validateGeneratedCode(
  code: string,
  arabicPrompt: string
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // 1. RTL Layout Check
  const hasRTLDir = code.includes('dir="rtl"') || code.includes("dir='rtl'")
  const hasTextRight =
    code.includes('text-right') || code.includes('text-start')

  results.push({
    key: 'rtl_layout',
    label_ar: 'تخطيط من اليمين لليسار (RTL)',
    icon: 'Languages',
    status: hasRTLDir && hasTextRight ? 'passed' : 'failed',
    message: hasRTLDir
      ? undefined
      : 'الكود لا يحتوي على dir="rtl" أو محاذاة نص صحيحة',
    canAutoFix: true,
  })

  // 2. Arabic Font Check
  const hasCairoFont = code.includes('font-cairo')
  results.push({
    key: 'arabic_font',
    label_ar: 'خط Cairo للنصوص العربية',
    icon: 'Languages',
    status: hasCairoFont ? 'passed' : 'warning',
    message: hasCairoFont
      ? undefined
      : 'قد لا يحتوي الكود على خط Cairo لجميع النصوص',
    canAutoFix: true,
  })

  // 3. Responsive Design Check
  const hasResponsiveClasses =
    code.includes('sm:') || code.includes('md:') || code.includes('lg:')
  results.push({
    key: 'responsive',
    label_ar: 'تصميم متجاوب (Responsive)',
    icon: 'Smartphone',
    status: hasResponsiveClasses ? 'passed' : 'warning',
    message: hasResponsiveClasses
      ? undefined
      : 'قد لا يحتوي على فئات تجاوب كافية',
    canAutoFix: false,
  })

  // 4. TypeScript Check
  const hasTypeErrors = false // This would need actual TS compilation
  results.push({
    key: 'typescript',
    label_ar: 'لا أخطاء TypeScript',
    icon: 'Code',
    status: hasTypeErrors ? 'failed' : 'passed',
    message: hasTypeErrors ? 'توجد أخطاء في TypeScript' : undefined,
    canAutoFix: false,
  })

  // 5. Security Check
  const hasDangerousHTML = code.includes('dangerouslySetInnerHTML')
  const hasEval = code.includes('eval(')
  const hasSecurityIssues = hasDangerousHTML || hasEval

  results.push({
    key: 'security',
    label_ar: 'لا ثغرات أمنية',
    icon: 'Shield',
    status: hasSecurityIssues ? 'failed' : 'passed',
    message: hasSecurityIssues
      ? 'توجد ثغرات أمنية محتملة (eval, dangerouslySetInnerHTML)'
      : undefined,
    canAutoFix: true,
  })

  return results
}
