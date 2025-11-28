/**
 * Code Transformation Utilities
 *
 * Transforms React components into standalone HTML files
 * ready for deployment to Vercel as static sites
 */

/**
 * Transform React component code to standalone HTML
 *
 * Wraps the React component with all necessary CDN dependencies:
 * - React 18 (production build)
 * - ReactDOM 18
 * - Babel Standalone (for JSX transformation)
 * - Tailwind CSS
 * - Cairo font (Google Fonts)
 * - Framer Motion (for animations)
 *
 * @param reactCode - Generated React component code
 * @param projectName - Project name for <title> tag
 * @returns Complete HTML document ready for deployment
 */
export function transformReactToHTML(
  reactCode: string,
  projectName: string
): string {
  // Extract component name from code
  // Supports both: function ComponentName() and const ComponentName = () =>
  const functionMatch = reactCode.match(/(?:function|const)\s+(\w+)\s*[=(]/)
  const componentName = functionMatch ? functionMatch[1] : 'App'

  // Clean the code (remove markdown fences if present)
  const cleanCode = cleanReactCode(reactCode)

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(projectName)} - بناها بواسطة KW APPS">
  <title>${escapeHtml(projectName)}</title>

  <!-- Cairo Font (Google Fonts) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Cairo', 'sans-serif']
          },
          colors: {
            primary: '#0f172a', // slate-900
            accent: '#3b82f6'    // blue-500
          }
        }
      }
    }
  </script>

  <!-- React 18 (Production) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone (for JSX) -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Framer Motion (for animations) -->
  <script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js"></script>

  <!-- Lucide Icons (if needed) -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cairo', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Ensure RTL support */
    [dir="rtl"] {
      direction: rtl;
      text-align: right;
    }

    /* Loading state */
    #loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 1.5rem;
      color: #64748b;
    }

    #loading.hidden {
      display: none;
    }
  </style>
</head>
<body>
  <!-- Loading State -->
  <div id="loading">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>جاري التحميل...</p>
    </div>
  </div>

  <!-- React Root -->
  <div id="root"></div>

  <!-- React Component Code -->
  <script type="text/babel">
    ${cleanCode}

    // Render the component
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);

    try {
      root.render(<${componentName} />);

      // Hide loading state
      document.getElementById('loading').classList.add('hidden');
    } catch (error) {
      console.error('Error rendering component:', error);
      rootElement.innerHTML = \`
        <div class="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
          <div class="text-center p-8">
            <h1 class="text-2xl font-bold text-red-600 mb-4">خطأ في التحميل</h1>
            <p class="text-gray-600">حدث خطأ أثناء تحميل التطبيق. يرجى المحاولة مرة أخرى.</p>
          </div>
        </div>
      \`;
      document.getElementById('loading').classList.add('hidden');
    }
  </script>

  <!-- Initialize Lucide Icons -->
  <script>
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  </script>

  <!-- KW APPS Branding (Optional) -->
  <script>
    console.log('%c بُني بواسطة KW APPS ', 'background: #0f172a; color: #3b82f6; font-size: 16px; padding: 8px; font-weight: bold;');
    console.log('%c https://kwapps.com ', 'color: #64748b; font-size: 12px;');
  </script>
</body>
</html>`
}

/**
 * Clean React code by removing markdown fences and extra whitespace
 *
 * @param code - Raw React component code
 * @returns Cleaned code
 */
function cleanReactCode(code: string): string {
  let cleaned = code

  // Remove markdown code fences
  cleaned = cleaned.replace(/```(?:jsx?|typescript|tsx?)?\n?/g, '')
  cleaned = cleaned.replace(/```\n?$/g, '')

  // Trim whitespace
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * Escape HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }

  return text.replace(/[&<>"']/g, char => map[char])
}

/**
 * Extract component name from React code
 *
 * @param code - React component code
 * @returns Component name or 'App' as fallback
 */
export function extractComponentName(code: string): string {
  // Try to match: function ComponentName() or const ComponentName = () =>
  const functionMatch = code.match(/(?:function|const)\s+(\w+)\s*[=(]/)

  if (functionMatch && functionMatch[1]) {
    return functionMatch[1]
  }

  // Fallback
  return 'App'
}

/**
 * Validate React code before transformation
 * Checks for common issues that would break deployment
 *
 * @param code - React component code
 * @returns Object with isValid flag and error message if invalid
 */
export function validateReactCode(code: string): {
  isValid: boolean
  error?: string
} {
  // Check if code is empty
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: 'الكود فارغ'
    }
  }

  // Check for dangerous patterns (should have been caught earlier, but double-check)
  const dangerousPatterns = [
    /eval\s*\(/,
    /Function\s*\(/,
    /innerHTML\s*=/,
    /dangerouslySetInnerHTML/
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        isValid: false,
        error: 'الكود يحتوي على أنماط خطرة غير مسموح بها'
      }
    }
  }

  // Check for component definition
  const hasComponent = /(?:function|const)\s+\w+\s*[=(]/.test(code)

  if (!hasComponent) {
    return {
      isValid: false,
      error: 'لم يتم العثور على مكون React صالح'
    }
  }

  return { isValid: true }
}

/**
 * Generate a preview HTML (for testing before deployment)
 * Similar to transformReactToHTML but with additional debugging
 *
 * @param reactCode - React component code
 * @param projectName - Project name
 * @returns HTML with debugging enabled
 */
export function generatePreviewHTML(
  reactCode: string,
  projectName: string
): string {
  const html = transformReactToHTML(reactCode, projectName)

  // Add debugging script
  const debugScript = `
  <script>
    // Enable debugging
    window.addEventListener('error', (e) => {
      console.error('Runtime Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
    });
  </script>
  `

  return html.replace('</body>', `${debugScript}</body>`)
}
