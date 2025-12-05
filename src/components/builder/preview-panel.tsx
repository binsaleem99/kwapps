'use client'

import { useState } from 'react'
import { Monitor, Tablet, Smartphone, RotateCcw, Loader2, Code2, Download, Copy, Check, Sparkles, AlertTriangle, CheckCircle2, Lightbulb, Accessibility, Zap, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LiveProvider, LiveError, LivePreview } from 'react-live'
import { Progress } from '@/components/ui/progress'
import * as React from 'react'
import type { GeminiAnnotations } from '@/lib/gemini/types'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type ViewMode = 'preview' | 'code' | 'annotations'

interface PreviewPanelProps {
  code: string | null
  isLoading?: boolean
  annotations?: GeminiAnnotations | null
  onRequestAnnotations?: () => void
  isAnnotating?: boolean
}

export default function PreviewPanel({
  code,
  isLoading = false,
  annotations = null,
  onRequestAnnotations,
  isAnnotating = false
}: PreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [copied, setCopied] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  console.log('[PreviewPanel] ===== RENDER (react-live version) =====')
  console.log('[PreviewPanel] Received code prop length:', code?.length)
  console.log('[PreviewPanel] isLoading:', isLoading)

  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    console.log('[PreviewPanel] Code copied to clipboard')
  }

  const handleDownload = () => {
    if (!code) return
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-code-${Date.now()}.jsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('[PreviewPanel] Code downloaded')
  }

  const handleReload = () => {
    console.log('[PreviewPanel] Reloading preview...')
    setPreviewKey((prev) => prev + 1)
  }

  const deviceSizes = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px]',
    mobile: 'w-[375px] h-[667px]',
  }

  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  }

  if (!code && !isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 font-['Cairo']">معاينة مباشرة</h2>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-['Cairo']">لا يوجد معاينة بعد</p>
            <p className="text-sm mt-2 font-['Cairo']">ابدأ بإنشاء تطبيقك من المحادثة</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 font-['Cairo']">معاينة مباشرة</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-['Cairo'] ${
                  viewMode === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>معاينة</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-['Cairo'] ${
                  viewMode === 'code'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>الكود</span>
              </button>
              <button
                onClick={() => setViewMode('annotations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all font-['Cairo'] ${
                  viewMode === 'annotations'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>تحليل</span>
                {annotations && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full">
                    {annotations.qualityScore}/10
                  </span>
                )}
              </button>
            </div>

            {/* Copy */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="نسخ الكود"
              disabled={!code}
              className="border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              title="تنزيل الكود"
              disabled={!code}
              className="border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Device Mode Selector - only show in preview mode */}
            {viewMode === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
                {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => {
                  const Icon = deviceIcons[mode]
                  return (
                    <button
                      key={mode}
                      onClick={() => setDeviceMode(mode)}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        deviceMode === mode
                          ? 'bg-white text-blue-600 shadow-md scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                      title={mode === 'desktop' ? 'سطح المكتب' : mode === 'tablet' ? 'تابلت' : 'موبايل'}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Reload */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleReload}
              title="إعادة تحميل"
              disabled={!code}
              className="border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-lg font-['Cairo']">جاري إنشاء التطبيق...</p>
          </div>
        ) : viewMode === 'code' ? (
          <Card className="w-full max-w-4xl p-4 bg-white">
            <pre className="text-sm overflow-x-auto" dir="ltr">
              <code>{code}</code>
            </pre>
          </Card>
        ) : viewMode === 'annotations' ? (
          <AnnotationsView
            annotations={annotations}
            onRequestAnnotations={onRequestAnnotations}
            isAnnotating={isAnnotating}
            hasCode={!!code}
          />
        ) : (
          <div
            className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${deviceSizes[deviceMode]}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <LiveProvider
              key={previewKey}
              code={code || ''}
              scope={{ React }}
              noInline={false}
            >
              <div className="w-full h-full overflow-auto">
                {/* Error Display */}
                <LiveError className="bg-red-50 text-red-700 p-4 m-4 rounded-lg text-sm flex items-start gap-2" />

                {/* Live Preview */}
                <div className="min-h-full p-4" dir="rtl">
                  <LivePreview />
                </div>
              </div>
            </LiveProvider>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {code && !isLoading && viewMode === 'preview' && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500 text-center font-['Cairo']">
            معاينة مباشرة بدون عزل • {deviceMode === 'desktop' ? 'سطح المكتب' : deviceMode === 'tablet' ? 'تابلت' : 'موبايل'}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Annotations View Component
 * Displays Gemini's code analysis and suggestions
 */
function AnnotationsView({
  annotations,
  onRequestAnnotations,
  isAnnotating,
  hasCode
}: {
  annotations: GeminiAnnotations | null
  onRequestAnnotations?: () => void
  isAnnotating: boolean
  hasCode: boolean
}) {
  if (isAnnotating) {
    return (
      <div className="flex flex-col items-center gap-4 text-gray-500">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <p className="text-lg font-['Cairo']">جاري تحليل الكود بـ Gemini...</p>
      </div>
    )
  }

  if (!annotations) {
    return (
      <div className="text-center text-gray-500 max-w-md" dir="rtl">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-emerald-400 opacity-50" />
        <p className="text-lg mb-2 font-['Cairo'] font-semibold">تحليل الكود بـ Gemini</p>
        <p className="text-sm font-['Cairo'] mb-6">
          احصل على تقييم شامل لتطبيقك مع اقتراحات لتحسين تجربة المستخدم والتحويل والأداء
        </p>
        {hasCode && onRequestAnnotations && (
          <Button
            onClick={onRequestAnnotations}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-['Cairo'] font-bold"
          >
            <Sparkles className="w-4 h-4 ml-2" />
            تحليل الكود
          </Button>
        )}
        {!hasCode && (
          <p className="text-sm text-gray-400 font-['Cairo']">
            قم بإنشاء تطبيق أولاً للحصول على التحليل
          </p>
        )}
      </div>
    )
  }

  const categoryIcons = {
    ux: <Lightbulb className="w-4 h-4" />,
    conversion: <Zap className="w-4 h-4" />,
    design: <Monitor className="w-4 h-4" />,
    content: <Languages className="w-4 h-4" />,
    accessibility: <Accessibility className="w-4 h-4" />,
    performance: <Zap className="w-4 h-4" />
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  }

  return (
    <div className="w-full max-w-3xl space-y-6 overflow-auto" dir="rtl">
      {/* Quality Score Card */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-emerald-600">{annotations.qualityScore}</span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-['Cairo']">تقييم الجودة</h3>
              <p className="text-sm text-gray-600 font-['Cairo']">{annotations.summary}</p>
            </div>
          </div>
        </div>

        {/* RTL Compliance */}
        <div className="flex items-center gap-4 pt-4 border-t border-emerald-200">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium font-['Cairo']">توافق RTL:</span>
            <span className="text-sm font-bold text-emerald-700">{annotations.rtlCompliance.score}/10</span>
          </div>
          {annotations.rtlCompliance.issues.length > 0 && (
            <span className="text-xs text-amber-600 font-['Cairo']">
              ({annotations.rtlCompliance.issues.length} مشاكل)
            </span>
          )}
        </div>
      </Card>

      {/* Suggestions */}
      {annotations.suggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-['Cairo'] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            اقتراحات التحسين
          </h3>
          <div className="space-y-3">
            {annotations.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${priorityColors[suggestion.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5">{categoryIcons[suggestion.category]}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white">
                        {suggestion.category === 'ux' ? 'تجربة المستخدم' :
                          suggestion.category === 'conversion' ? 'التحويل' :
                          suggestion.category === 'design' ? 'التصميم' :
                          suggestion.category === 'content' ? 'المحتوى' :
                          suggestion.category === 'accessibility' ? 'إمكانية الوصول' :
                          'الأداء'}
                      </span>
                      <span className="text-xs">
                        {suggestion.priority === 'high' ? '⚡ عالية' :
                          suggestion.priority === 'medium' ? '⏺ متوسطة' : '○ منخفضة'}
                      </span>
                    </div>
                    <p className="text-sm font-['Cairo']">{suggestion.text}</p>
                    {suggestion.codeHint && (
                      <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto" dir="ltr">
                        <code>{suggestion.codeHint}</code>
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Accessibility Notes */}
      {annotations.accessibilityNotes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-['Cairo'] mb-4 flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-blue-500" />
            ملاحظات إمكانية الوصول
          </h3>
          <ul className="space-y-2">
            {annotations.accessibilityNotes.map((note, index) => (
              <li key={index} className="flex items-start gap-2 text-sm font-['Cairo']">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Performance Tips */}
      {annotations.performanceTips.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-['Cairo'] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            نصائح الأداء
          </h3>
          <ul className="space-y-2">
            {annotations.performanceTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm font-['Cairo']">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* RTL Issues */}
      {annotations.rtlCompliance.issues.length > 0 && (
        <Card className="p-6 border-amber-200">
          <h3 className="text-lg font-bold text-gray-900 font-['Cairo'] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            مشاكل RTL
          </h3>
          <ul className="space-y-2">
            {annotations.rtlCompliance.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2 text-sm font-['Cairo']">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
