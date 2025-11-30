'use client'

import { useState } from 'react'
import { Monitor, Tablet, Smartphone, Maximize2, RotateCcw, Loader2, AlertCircle, Code2, Download, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LiveProvider, LiveError, LivePreview } from 'react-live'
import * as React from 'react'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface PreviewPanelProps {
  code: string | null
  isLoading?: boolean
}

export default function PreviewPanel({ code, isLoading = false }: PreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [showCode, setShowCode] = useState(false)
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
            {/* Code/Preview Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="font-['Cairo'] border-2"
            >
              {showCode ? 'المعاينة المباشرة' : 'عرض الكود'}
            </Button>

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

            {/* Device Mode Selector */}
            {!showCode && (
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

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-lg font-['Cairo']">جاري إنشاء التطبيق...</p>
          </div>
        ) : showCode ? (
          <Card className="w-full max-w-4xl p-4 bg-white">
            <pre className="text-sm overflow-x-auto" dir="ltr">
              <code>{code}</code>
            </pre>
          </Card>
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
              scope={{
                React,
                useState: React.useState,
                useEffect: React.useEffect,
                useRef: React.useRef,
                useCallback: React.useCallback,
                useMemo: React.useMemo,
              }}
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
      {code && !isLoading && !showCode && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500 text-center font-['Cairo']">
            معاينة مباشرة بدون عزل • {deviceMode === 'desktop' ? 'سطح المكتب' : deviceMode === 'tablet' ? 'تابلت' : 'موبايل'}
          </p>
        </div>
      )}
    </div>
  )
}
