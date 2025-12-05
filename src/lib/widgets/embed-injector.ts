/**
 * Widget Embed Injector
 *
 * Injects widget code into generated client HTML
 * - Works with server-rendered HTML
 * - Supports multiple injection points
 * - RTL-aware
 * - Mobile-responsive
 */

import type {
  WidgetType,
  AnyWidgetConfig,
  ProjectWidget,
  GeneratedWidget,
} from './types'

import { generateWidget, generateMultipleWidgets } from './widget-generator'

// ============================================
// Types
// ============================================

export interface InjectionOptions {
  /** Target location for injection */
  position?: 'body-start' | 'body-end' | 'head' | 'custom'
  /** Custom CSS selector for injection (when position is 'custom') */
  customSelector?: string
  /** Whether to include Cairo font import */
  includeFontImport?: boolean
  /** Whether to add defer attribute to scripts */
  deferScripts?: boolean
  /** Whether to wrap in a conditional loader */
  conditionalLoad?: boolean
  /** Minimum delay before showing widgets (ms) */
  showDelay?: number
  /** Only show widgets on specific pages (glob patterns) */
  pagePatterns?: string[]
}

export interface InjectionResult {
  success: boolean
  html: string
  error?: string
  widgetsInjected: number
}

// ============================================
// Font Import Generator
// ============================================

const CAIRO_FONT_IMPORT = `
<!-- KWq8 Cairo Font Import -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
`.trim()

// ============================================
// Conditional Loader Generator
// ============================================

function generateConditionalLoader(
  snippet: string,
  options: InjectionOptions
): string {
  const { showDelay = 0, pagePatterns = [] } = options

  // If no conditions, return snippet as-is
  if (showDelay === 0 && pagePatterns.length === 0) {
    return snippet
  }

  const pageCheck = pagePatterns.length > 0
    ? `
    // Check page patterns
    var patterns = ${JSON.stringify(pagePatterns)};
    var currentPath = window.location.pathname;
    var matchesPattern = patterns.some(function(pattern) {
      var regex = new RegExp('^' + pattern.replace(/\\*/g, '.*') + '$');
      return regex.test(currentPath);
    });
    if (!matchesPattern) return;
`
    : ''

  return `
<!-- KWq8 Widget Loader -->
<script>
(function() {
  ${pageCheck}

  function loadWidgets() {
    var container = document.createElement('div');
    container.innerHTML = ${JSON.stringify(snippet)};

    // Extract and apply styles
    var styles = container.querySelectorAll('style');
    styles.forEach(function(style) {
      document.head.appendChild(style);
    });

    // Extract and run scripts
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function(script) {
      var newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript);
    });

    // Add widget elements
    var widgets = container.querySelectorAll('[id^="kwq8-"]');
    widgets.forEach(function(widget) {
      document.body.appendChild(widget);
    });
  }

  ${showDelay > 0
    ? `setTimeout(loadWidgets, ${showDelay});`
    : `if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWidgets);
      } else {
        loadWidgets();
      }`
  }
})();
</script>
<!-- KWq8 Widget Loader End -->
`.trim()
}

// ============================================
// Main Injection Function
// ============================================

/**
 * Inject widget code into HTML
 */
export function injectWidgets(
  html: string,
  widgets: ProjectWidget[],
  options: InjectionOptions = {}
): InjectionResult {
  const {
    position = 'body-end',
    customSelector,
    includeFontImport = true,
    deferScripts = true,
    conditionalLoad = false,
    showDelay = 0,
    pagePatterns = [],
  } = options

  try {
    // Filter active widgets only
    const activeWidgets = widgets.filter((w) => w.is_active)

    if (activeWidgets.length === 0) {
      return {
        success: true,
        html,
        widgetsInjected: 0,
      }
    }

    // Generate combined widget code
    const widgetConfigs = activeWidgets.map((w) => ({
      type: w.widget_type as WidgetType,
      config: w.config as AnyWidgetConfig,
    }))

    const generated = generateMultipleWidgets(widgetConfigs)
    let widgetSnippet = generated.snippet

    // Wrap in conditional loader if needed
    if (conditionalLoad || showDelay > 0 || pagePatterns.length > 0) {
      widgetSnippet = generateConditionalLoader(widgetSnippet, {
        showDelay,
        pagePatterns,
      })
    }

    // Prepare font import
    const fontImport = includeFontImport ? CAIRO_FONT_IMPORT : ''

    // Determine injection point
    let modifiedHtml = html

    switch (position) {
      case 'head':
        // Inject font in head, widgets before </head>
        if (modifiedHtml.includes('</head>')) {
          modifiedHtml = modifiedHtml.replace(
            '</head>',
            `${fontImport}\n${widgetSnippet}\n</head>`
          )
        } else {
          // No head tag, prepend to html
          modifiedHtml = `${fontImport}\n${widgetSnippet}\n${modifiedHtml}`
        }
        break

      case 'body-start':
        // Inject right after <body>
        if (modifiedHtml.includes('</head>') && includeFontImport) {
          modifiedHtml = modifiedHtml.replace(
            '</head>',
            `${fontImport}\n</head>`
          )
        }

        const bodyStartRegex = /<body[^>]*>/i
        const bodyStartMatch = modifiedHtml.match(bodyStartRegex)
        if (bodyStartMatch) {
          const insertPoint = bodyStartMatch.index! + bodyStartMatch[0].length
          modifiedHtml =
            modifiedHtml.slice(0, insertPoint) +
            `\n${widgetSnippet}\n` +
            modifiedHtml.slice(insertPoint)
        } else {
          modifiedHtml = `${widgetSnippet}\n${modifiedHtml}`
        }
        break

      case 'body-end':
        // Inject before </body> (default, recommended)
        if (modifiedHtml.includes('</head>') && includeFontImport) {
          modifiedHtml = modifiedHtml.replace(
            '</head>',
            `${fontImport}\n</head>`
          )
        }

        if (modifiedHtml.includes('</body>')) {
          modifiedHtml = modifiedHtml.replace(
            '</body>',
            `${widgetSnippet}\n</body>`
          )
        } else {
          modifiedHtml = `${modifiedHtml}\n${widgetSnippet}`
        }
        break

      case 'custom':
        if (!customSelector) {
          return {
            success: false,
            html,
            error: 'Custom selector is required for custom position',
            widgetsInjected: 0,
          }
        }

        // For server-side, we can't use querySelector
        // Use a simple string-based approach for common patterns
        const selectorMatch = findSelectorInHtml(modifiedHtml, customSelector)
        if (selectorMatch) {
          const insertPoint = selectorMatch.endIndex
          modifiedHtml =
            modifiedHtml.slice(0, insertPoint) +
            `\n${widgetSnippet}\n` +
            modifiedHtml.slice(insertPoint)

          if (includeFontImport && modifiedHtml.includes('</head>')) {
            modifiedHtml = modifiedHtml.replace(
              '</head>',
              `${fontImport}\n</head>`
            )
          }
        } else {
          // Fallback to body-end
          if (modifiedHtml.includes('</body>')) {
            modifiedHtml = modifiedHtml.replace(
              '</body>',
              `${widgetSnippet}\n</body>`
            )
          } else {
            modifiedHtml = `${modifiedHtml}\n${widgetSnippet}`
          }
        }
        break
    }

    return {
      success: true,
      html: modifiedHtml,
      widgetsInjected: activeWidgets.length,
    }
  } catch (error) {
    console.error('[EmbedInjector] Error:', error)
    return {
      success: false,
      html,
      error: error instanceof Error ? error.message : 'Unknown error',
      widgetsInjected: 0,
    }
  }
}

/**
 * Inject a single widget into HTML
 */
export function injectSingleWidget(
  html: string,
  widgetType: WidgetType,
  config: Partial<AnyWidgetConfig> & { pageId?: string },
  options: InjectionOptions = {}
): InjectionResult {
  const widget: ProjectWidget = {
    id: 'single-widget',
    project_id: '',
    widget_type: widgetType,
    config: config as AnyWidgetConfig,
    is_active: true,
    position: (config.style?.position as any) || 'bottom-right',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return injectWidgets(html, [widget], options)
}

// ============================================
// React/Next.js Integration
// ============================================

/**
 * Generate a React component string for widgets
 * This can be used in Next.js pages
 */
export function generateReactWidgetComponent(
  widgets: ProjectWidget[]
): string {
  const activeWidgets = widgets.filter((w) => w.is_active)

  if (activeWidgets.length === 0) {
    return ''
  }

  const widgetConfigs = activeWidgets.map((w) => ({
    type: w.widget_type as WidgetType,
    config: w.config as AnyWidgetConfig,
  }))

  const generated = generateMultipleWidgets(widgetConfigs)

  // Create a React component that renders the widget
  return `
'use client'

import { useEffect } from 'react'

export default function KWq8Widgets() {
  useEffect(() => {
    // Inject styles
    const styleId = 'kwq8-widget-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = ${JSON.stringify(generated.css)}
      document.head.appendChild(style)
    }

    // Run scripts
    ${generated.js ? `
    const scriptId = 'kwq8-widget-scripts'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.textContent = ${JSON.stringify(generated.js)}
      document.body.appendChild(script)
    }
    ` : ''}

    return () => {
      // Cleanup on unmount
      const style = document.getElementById('kwq8-widget-styles')
      if (style) style.remove()
      const script = document.getElementById('kwq8-widget-scripts')
      if (script) script.remove()
    }
  }, [])

  return (
    <div dangerouslySetInnerHTML={{ __html: ${JSON.stringify(generated.html)} }} />
  )
}
`.trim()
}

/**
 * Generate inline script for widget injection
 * Useful for embedding in generated static sites
 */
export function generateEmbedScript(
  widgets: ProjectWidget[],
  options: {
    baseUrl?: string
    apiKey?: string
  } = {}
): string {
  const activeWidgets = widgets.filter((w) => w.is_active)

  if (activeWidgets.length === 0) {
    return ''
  }

  const widgetData = activeWidgets.map((w) => ({
    type: w.widget_type,
    config: w.config,
  }))

  return `
<!-- KWq8 Widget Embed Script -->
<script>
(function() {
  var widgetData = ${JSON.stringify(widgetData)};

  // Load widget CSS & JS from CDN (or inline)
  function loadWidget() {
    ${options.baseUrl ? `
    // Fetch generated code from API
    fetch('${options.baseUrl}/api/widgets/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ${options.apiKey ? `'Authorization': 'Bearer ${options.apiKey}'` : ''}
      },
      body: JSON.stringify({ widgets: widgetData })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success && data.snippet) {
        var container = document.createElement('div');
        container.innerHTML = data.snippet;
        document.body.appendChild(container);
      }
    });
    ` : `
    // Inline widget code - generated at build time
    console.log('[KWq8] Widget data:', widgetData);
    `}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget);
  } else {
    loadWidget();
  }
})();
</script>
`.trim()
}

// ============================================
// Helper Functions
// ============================================

interface SelectorMatch {
  startIndex: number
  endIndex: number
}

function findSelectorInHtml(html: string, selector: string): SelectorMatch | null {
  // Handle simple ID selectors: #myId
  if (selector.startsWith('#')) {
    const id = selector.slice(1)
    const regex = new RegExp(`<[^>]+id=["']${id}["'][^>]*>`, 'i')
    const match = html.match(regex)
    if (match && match.index !== undefined) {
      return {
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      }
    }
  }

  // Handle simple class selectors: .myClass
  if (selector.startsWith('.')) {
    const className = selector.slice(1)
    const regex = new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>`, 'i')
    const match = html.match(regex)
    if (match && match.index !== undefined) {
      return {
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      }
    }
  }

  // Handle tag selectors: div, main, footer
  const tagRegex = new RegExp(`<${selector}[^>]*>`, 'i')
  const tagMatch = html.match(tagRegex)
  if (tagMatch && tagMatch.index !== undefined) {
    return {
      startIndex: tagMatch.index,
      endIndex: tagMatch.index + tagMatch[0].length,
    }
  }

  return null
}

/**
 * Validate HTML has proper structure for injection
 */
export function validateHtmlStructure(html: string): {
  isValid: boolean
  hasHead: boolean
  hasBody: boolean
  recommendations: string[]
} {
  const hasHead = /<head[^>]*>/.test(html) && /<\/head>/.test(html)
  const hasBody = /<body[^>]*>/.test(html) && /<\/body>/.test(html)
  const recommendations: string[] = []

  if (!hasHead) {
    recommendations.push('إضافة وسم <head> لتحسين تحميل الخطوط')
  }

  if (!hasBody) {
    recommendations.push('إضافة وسم <body> للتأكد من ظهور الويدجت')
  }

  if (!html.includes('<!DOCTYPE html>') && !html.includes('<!doctype html>')) {
    recommendations.push('إضافة <!DOCTYPE html> في بداية الملف')
  }

  return {
    isValid: hasHead && hasBody,
    hasHead,
    hasBody,
    recommendations,
  }
}

// ============================================
// Export Default Options
// ============================================

export const DEFAULT_INJECTION_OPTIONS: InjectionOptions = {
  position: 'body-end',
  includeFontImport: true,
  deferScripts: true,
  conditionalLoad: false,
  showDelay: 0,
  pagePatterns: [],
}
