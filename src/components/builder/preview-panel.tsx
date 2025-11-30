'use client'

import { useState, useEffect, useRef } from 'react'
import { Monitor, Tablet, Smartphone, Maximize2, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface PreviewPanelProps {
  code: string | null
  isLoading?: boolean
}

export default function PreviewPanel({ code, isLoading = false }: PreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [iframeKey, setIframeKey] = useState(0)
  const [iframeHtml, setIframeHtml] = useState<string>('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  console.log('[PreviewPanel] ===== RENDER =====')
  console.log('[PreviewPanel] Received code prop length:', code?.length)
  console.log('[PreviewPanel] isLoading:', isLoading)
  console.log('[PreviewPanel] iframeKey:', iframeKey)
  console.log('[PreviewPanel] iframeHtml length:', iframeHtml?.length)

  // Build HTML when code changes - using state instead of direct DOM manipulation
  useEffect(() => {
    console.log('[PreviewPanel] ========== useEffect TRIGGERED ==========')
    console.log('[PreviewPanel] Code length:', code?.length)

    if (!code) {
      console.warn('[PreviewPanel] ⚠️ No code to display, clearing iframe HTML')
      setIframeHtml('')
      console.log('[PreviewPanel] ========== useEffect COMPLETE ==========')
      return
    }

    console.log('[PreviewPanel] ✅ Building HTML for iframe...')
    console.log('[PreviewPanel] Code preview (first 300 chars):', code.substring(0, 300))

    try {
      // Create complete HTML document with React
      const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Cairo Font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- React & ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Framer Motion (for animations) -->
  <script src="https://unpkg.com/framer-motion@10/dist/framer-motion.js"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    * {
      font-family: 'Cairo', sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    #root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    ${code}

    // Automatically detect and render the component
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);

    // Find the first function/component definition in the code
    const componentMatch = \`${code}\`.match(/(?:function|const)\\s+(\\w+)\\s*(?:=|\\()/);
    const ComponentName = componentMatch ? componentMatch[1] : 'App';

    // Try to render the detected component
    try {
      const Component = eval(ComponentName);
      root.render(<Component />);
    } catch (e) {
      // Fallback: try common export names
      try {
        if (typeof App !== 'undefined') {
          root.render(<App />);
        } else if (typeof HomePage !== 'undefined') {
          root.render(<HomePage />);
        } else if (typeof LandingPage !== 'undefined') {
          root.render(<LandingPage />);
        } else {
          root.render(<div style={{padding: '2rem', textAlign: 'center', direction: 'rtl'}}>
            <h1>خطأ في العرض</h1>
            <p>تعذر العثور على المكون. يرجى التأكد من تصدير المكون بشكل صحيح.</p>
          </div>);
        }
      } catch (fallbackError) {
        console.error('Render error:', fallbackError);
        root.render(<div style={{padding: '2rem', textAlign: 'center', direction: 'rtl'}}>
          <h1>خطأ في العرض</h1>
          <p>{fallbackError.toString()}</p>
        </div>);
      }
    }
  </script>

  <script>
    // Initialize Lucide icons after render
    setTimeout(() => {
      if (window.lucide) {
        lucide.createIcons();
      }
    }, 100);
  </script>
</body>
</html>`

      console.log('[PreviewPanel] HTML built successfully, length:', html.length)
      setIframeHtml(html)
      console.log('[PreviewPanel] ✅ ✅ ✅ Iframe HTML STATE UPDATED ✅ ✅ ✅')
    } catch (error) {
      console.error('[PreviewPanel] ❌ Error building HTML:', error)
      setIframeHtml(`
        <!DOCTYPE html>
        <html>
          <body style="padding: 2rem; text-align: center; font-family: Cairo, sans-serif; direction: rtl;">
            <h1 style="color: red;">خطأ في بناء HTML</h1>
            <p>${error instanceof Error ? error.message : String(error)}</p>
          </body>
        </html>
      `)
    }

    console.log('[PreviewPanel] ========== useEffect COMPLETE ==========')
  }, [code, iframeKey])

  function handleReload() {
    setIframeKey(prev => prev + 1)
  }

  function handleFullscreen() {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen()
    }
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
            {/* Device Mode Selector */}
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

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleFullscreen}
              title="ملء الشاشة"
              disabled={!code}
              className="border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              <Maximize2 className="w-4 h-4" />
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
        ) : !code ? (
          <div className="text-center text-gray-500">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-['Cairo']">لا يوجد معاينة بعد</p>
            <p className="text-sm mt-2 font-['Cairo']">ابدأ بإنشاء تطبيقك من المحادثة</p>
          </div>
        ) : (
          <div
            className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ${deviceSizes[deviceMode]}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={iframeHtml}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
              onLoad={() => {
                console.log('[PreviewPanel] 🎉 Iframe loaded successfully!')
              }}
              onError={(e) => {
                console.error('[PreviewPanel] ❌ Iframe error:', e)
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      {code && !isLoading && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500 text-center font-['Cairo']">
            المعاينة محمية في بيئة معزولة • {deviceMode === 'desktop' ? 'سطح المكتب' : deviceMode === 'tablet' ? 'تابلت' : 'موبايل'}
          </p>
        </div>
      )}
    </div>
  )
}
