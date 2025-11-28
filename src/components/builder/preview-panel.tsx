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
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Update iframe when code changes
  useEffect(() => {
    if (code && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument
      if (iframeDoc) {
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

    // Render the default export
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<AppName />);
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

        iframeDoc.open()
        iframeDoc.write(html)
        iframeDoc.close()
      }
    }
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
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 font-['Cairo']">معاينة مباشرة</h2>

          <div className="flex items-center gap-2">
            {/* Device Mode Selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => {
                const Icon = deviceIcons[mode]
                return (
                  <button
                    key={mode}
                    onClick={() => setDeviceMode(mode)}
                    className={`p-2 rounded transition-colors ${
                      deviceMode === mode
                        ? 'bg-white text-blue-500 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
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
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
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
