'use client'

/**
 * PreviewPanel Component
 *
 * Live preview of generated code
 * - iframe for live preview
 * - Device mode toggle: Desktop/Tablet/Mobile
 * - Refresh button
 * - "Open in new tab" button
 * - Loading skeleton
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Download,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { DeviceMode, DEVICE_DIMENSIONS } from '@/types/builder'

interface PreviewPanelProps {
  code: string | null
  isLoading?: boolean
  className?: string
}

export function PreviewPanel({
  code,
  isLoading = false,
  className,
}: PreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [zoom, setZoom] = useState(100)
  const [iframeKey, setIframeKey] = useState(0)
  const [isIframeLoading, setIsIframeLoading] = useState(false)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentDevice = DEVICE_DIMENSIONS[deviceMode]

  // Write code to iframe
  useEffect(() => {
    if (!code || !iframeRef.current) return

    setIsIframeLoading(true)
    setIframeError(null)

    const iframe = iframeRef.current
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (!iframeDoc) {
      setIframeError('فشل في الوصول إلى المعاينة')
      setIsIframeLoading(false)
      return
    }

    try {
      const htmlContent = generateHTMLDocument(code)
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      // Listen for errors
      iframe.contentWindow?.addEventListener('error', (event) => {
        console.error('Iframe error:', event)
        setIframeError(`خطأ: ${event.message}`)
      })

      setTimeout(() => setIsIframeLoading(false), 500)
    } catch (err) {
      console.error('Preview error:', err)
      setIframeError('فشل في عرض المعاينة')
      setIsIframeLoading(false)
    }
  }, [code, iframeKey])

  // Refresh preview
  const handleRefresh = useCallback(() => {
    setIframeKey(prev => prev + 1)
  }, [])

  // Open in new window
  const handleOpenInNewWindow = useCallback(() => {
    if (!code) return
    const htmlContent = generateHTMLDocument(code)
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
    }
  }, [code])

  // Download as HTML
  const handleDownload = useCallback(() => {
    if (!code) return
    const htmlContent = generateHTMLDocument(code)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `preview-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }, [code])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50))
  const handleZoomReset = () => setZoom(100)

  // Empty state
  if (!code && !isLoading) {
    return (
      <div className={cn('flex flex-col h-full bg-slate-100', className)}>
        <PreviewToolbar
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onRefresh={handleRefresh}
          onOpenNew={handleOpenInNewWindow}
          onDownload={handleDownload}
          hasCode={false}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-base font-['Cairo']">لا يوجد معاينة بعد</p>
            <p className="text-sm mt-1 font-['Cairo']">اكتب وصفاً لإنشاء موقعك</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex flex-col h-full bg-slate-100', className)}>
        <PreviewToolbar
          deviceMode={deviceMode}
          setDeviceMode={setDeviceMode}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
          onRefresh={handleRefresh}
          onOpenNew={handleOpenInNewWindow}
          onDownload={handleDownload}
          hasCode={false}
          isLoading
        />
        <div className="flex-1 p-6">
          <PreviewSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-slate-100', className)}>
      {/* Toolbar */}
      <PreviewToolbar
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onRefresh={handleRefresh}
        onOpenNew={handleOpenInNewWindow}
        onDownload={handleDownload}
        hasCode={!!code}
        isLoading={isIframeLoading}
        error={iframeError}
      />

      {/* Preview container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex items-center justify-center"
      >
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
            deviceMode === 'desktop' && 'w-full h-full',
            deviceMode !== 'desktop' && 'border-8 border-slate-800 rounded-[2rem]'
          )}
          style={{
            width: deviceMode !== 'desktop' ? currentDevice.width : undefined,
            height: deviceMode !== 'desktop' ? currentDevice.height : undefined,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Device frame elements for mobile/tablet */}
          {deviceMode !== 'desktop' && (
            <div className="h-6 bg-slate-800 flex items-center justify-center">
              <div className="w-16 h-1 bg-slate-600 rounded-full" />
            </div>
          )}

          {/* Iframe */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
            className={cn(
              'w-full bg-white border-0',
              deviceMode === 'desktop' ? 'h-full' : 'h-[calc(100%-1.5rem)]'
            )}
          />
        </div>
      </div>
    </div>
  )
}

// Toolbar component
function PreviewToolbar({
  deviceMode,
  setDeviceMode,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onRefresh,
  onOpenNew,
  onDownload,
  hasCode,
  isLoading,
  error,
}: {
  deviceMode: DeviceMode
  setDeviceMode: (mode: DeviceMode) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onRefresh: () => void
  onOpenNew: () => void
  onDownload: () => void
  hasCode: boolean
  isLoading?: boolean
  error?: string | null
}) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-2">
      <div className="flex items-center justify-between" dir="rtl">
        {/* Left side: Device mode + status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 font-['Cairo']">معاينة</span>

          {/* Status indicator */}
          {isLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="font-['Cairo']">جاري التحميل...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-['Cairo']">{error}</span>
            </div>
          ) : hasCode ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-['Cairo']">جاهز</span>
            </div>
          ) : null}
        </div>

        {/* Center: Device mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
                  size="icon-sm"
                  onClick={() => setDeviceMode('desktop')}
                  className={cn(deviceMode === 'desktop' && 'bg-blue-500 hover:bg-blue-600')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>سطح المكتب</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
                  size="icon-sm"
                  onClick={() => setDeviceMode('tablet')}
                  className={cn(deviceMode === 'tablet' && 'bg-blue-500 hover:bg-blue-600')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>جهاز لوحي</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
                  size="icon-sm"
                  onClick={() => setDeviceMode('mobile')}
                  className={cn(deviceMode === 'mobile' && 'bg-blue-500 hover:bg-blue-600')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>هاتف</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 border-l border-slate-200 pl-2 ml-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={onZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تصغير</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="ghost"
              size="sm"
              onClick={onZoomReset}
              className="text-xs px-2 min-w-[3rem]"
            >
              {zoom}%
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" onClick={onZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تكبير</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Action buttons */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onRefresh} disabled={!hasCode}>
                  <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تحديث</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onOpenNew} disabled={!hasCode}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>فتح في نافذة جديدة</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onDownload} disabled={!hasCode}>
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تحميل HTML</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}

// Loading skeleton
function PreviewSkeleton() {
  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

/**
 * Generates complete HTML document for iframe
 */
function generateHTMLDocument(code: string): string {
  const componentCode = prepareComponentCode(code)

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KW APPS Preview</title>

  <!-- Cairo Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Cairo', 'sans-serif'],
          },
        },
      },
    }
  </script>

  <!-- React 18 CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Framer Motion CDN -->
  <script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js"></script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    * { font-family: 'Cairo', sans-serif; }
    body { margin: 0; padding: 0; min-height: 100vh; }
    [dir="rtl"] { text-align: right; direction: rtl; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    ${componentCode}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    try {
      root.render(<Component />);
    } catch (error) {
      console.error('Render error:', error);
      document.getElementById('root').innerHTML = \`
        <div style="padding: 2rem; text-align: center; direction: rtl;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">خطأ في العرض</h1>
          <p style="color: #475569;">\${error.message}</p>
        </div>
      \`;
    }
  </script>
</body>
</html>`
}

/**
 * Prepares component code for iframe rendering
 */
function prepareComponentCode(code: string): string {
  let cleaned = code.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
  cleaned = cleaned.replace(/'use client';?\n?/g, '')
  cleaned = cleaned.replace(/"use client";?\n?/g, '')

  if (!cleaned.includes('export default')) {
    const componentMatch = cleaned.match(/(?:function|const)\s+(\w+)\s*[=\(]/)
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'
    cleaned = `${cleaned}\n\nconst Component = ${componentName};`
  } else {
    cleaned = cleaned.replace(/export\s+default\s+(?:function\s+)?(\w+)/, 'const Component = $1')
    cleaned = cleaned.replace(/export\s+default\s+/, 'const Component = ')
  }

  return cleaned
}
