'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PreviewIframeProps {
  code: string
  onError?: (error: string) => void
  className?: string
}

/**
 * Preview Iframe Component
 *
 * Renders generated React code in a sandboxed iframe with:
 * - Cairo font support
 * - Tailwind CSS styling
 * - React 18 runtime
 * - Framer Motion animations
 * - RTL and Arabic support
 */
export function PreviewIframe({ code, onError, className }: PreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iframeKey, setIframeKey] = useState(0) // For forcing iframe refresh

  useEffect(() => {
    if (!code || !iframeRef.current) return

    setIsLoading(true)
    setError(null)

    const iframe = iframeRef.current
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (!iframeDoc) {
      const errorMsg = 'Failed to access iframe document'
      setError(errorMsg)
      onError?.(errorMsg)
      setIsLoading(false)
      return
    }

    // Generate the complete HTML document
    const htmlContent = generateHTMLDocument(code)

    try {
      // Write to iframe
      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      // Listen for errors in iframe
      iframe.contentWindow?.addEventListener('error', (event) => {
        const errorMsg = `Runtime error: ${event.message}`
        console.error('Iframe error:', event)
        setError(errorMsg)
        onError?.(errorMsg)
      })

      // Mark as loaded
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to render preview'
      console.error('Preview error:', err)
      setError(errorMsg)
      onError?.(errorMsg)
      setIsLoading(false)
    }
  }, [code, onError, iframeKey])

  const handleDownload = () => {
    const htmlContent = generateHTMLDocument(code)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `generated-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenInNewWindow = () => {
    const htmlContent = generateHTMLDocument(code)
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
    }
  }

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 font-medium">معاينة</span>
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            title="تحديث المعاينة"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleOpenInNewWindow}
            title="فتح في نافذة جديدة"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            title="تحميل كـ HTML"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-right">{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview Iframe */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  )
}

/**
 * Generates complete HTML document for iframe
 */
function generateHTMLDocument(code: string): string {
  // Extract component code and prepare for rendering
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

  <!-- React 18 CDN (for development) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Framer Motion CDN -->
  <script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js"></script>

  <!-- Babel Standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    * {
      font-family: 'Cairo', sans-serif;
    }

    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }

    /* RTL Support */
    [dir="rtl"] {
      text-align: right;
      direction: rtl;
    }

    /* Smooth animations */
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    // Component code
    ${componentCode}

    // Render
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
  // Remove imports (CDN provides these)
  let cleaned = code.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')

  // Remove 'use client' directive
  cleaned = cleaned.replace(/'use client';?\n?/g, '')
  cleaned = cleaned.replace(/"use client";?\n?/g, '')

  // If code doesn't export default, wrap it
  if (!cleaned.includes('export default')) {
    // Find the component name
    const componentMatch = cleaned.match(/(?:function|const)\s+(\w+)\s*[=\(]/)
    const componentName = componentMatch ? componentMatch[1] : 'GeneratedComponent'

    // Add export if missing
    cleaned = `${cleaned}\n\nconst Component = ${componentName};`
  } else {
    // Replace 'export default' with 'const Component ='
    cleaned = cleaned.replace(/export\s+default\s+(?:function\s+)?(\w+)/, 'const Component = $1')
    cleaned = cleaned.replace(/export\s+default\s+/, 'const Component = ')
  }

  return cleaned
}

/**
 * Static preview for showing loading state
 */
export function PreviewSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-slate-50">
        <span className="text-sm text-slate-600">معاينة</span>
        <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
      </div>
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">جاري التحميل...</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state when no code is generated yet
 */
export function PreviewEmpty() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-slate-50">
        <span className="text-sm text-slate-600">معاينة</span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <ExternalLink className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا يوجد معاينة بعد</p>
          <p className="text-xs mt-1">اكتب وصفاً لإنشاء موقعك</p>
        </div>
      </div>
    </div>
  )
}
